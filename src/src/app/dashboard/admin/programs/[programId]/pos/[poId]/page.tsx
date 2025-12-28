"use client";

import React from "react";
import { useParams } from "next/navigation";
import { AdminOnly } from "@/components/features/auth/role-guard";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation";
import { Button } from "@/components/ui/forms";
import { Edit, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useProgram } from "@/lib/hooks/use-programs";
import { usePO } from "@/lib/hooks/use-pos";
import { POActions } from "@/components/features/admin/pos";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/feedback";

export default function PODetailPage() {
  const params = useParams();
  const programId = parseInt(params.programId as string);
  const poId = parseInt(params.poId as string);

  const { data: program } = useProgram(programId);
  const { data: po, isLoading } = usePO(poId);

  if (isLoading) {
    return (
      <AdminOnly fallback={<div>Bạn không có quyền truy cập.</div>}>
        <div className="container mx-auto p-6 space-y-6">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AdminOnly>
    );
  }

  if (!po) {
    return (
      <AdminOnly fallback={<div>Bạn không có quyền truy cập.</div>}>
        <div className="container mx-auto p-6 space-y-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">Không tìm thấy PO</h2>
            <p className="text-muted-foreground mb-4">
              Program Outcome với ID {poId} không tồn tại.
            </p>
            <Link href={`/dashboard/admin/programs/${programId}?tab=pos`}>
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại danh sách
              </Button>
            </Link>
          </div>
        </div>
      </AdminOnly>
    );
  }

  return (
    <AdminOnly fallback={<div>Bạn không có quyền truy cập.</div>}>
      <div className="container mx-auto p-6 space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/admin/programs">Chương trình ĐT</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/dashboard/admin/programs/${programId}?tab=pos`}>
                  {program?.name || `Program #${programId}`}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{po.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{po.name}</h1>
            <p className="text-muted-foreground">
              Chi tiết Mục tiêu đào tạo (PO)
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/admin/programs/${programId}?tab=pos`}>
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Button>
            </Link>
            <POActions po={po} programId={programId} variant="buttons" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin chi tiết</CardTitle>
            <CardDescription>
              Thông tin chi tiết về Mục tiêu đào tạo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Tên PO
              </label>
              <p className="text-lg font-semibold">{po.name}</p>
            </div>

            {po.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Mô tả
                </label>
                <p className="text-sm leading-relaxed">{po.description}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                ID
              </label>
              <p className="font-medium">#{po.po_id}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Chương trình
              </label>
              <p className="font-medium">{program?.name || "N/A"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminOnly>
  );
}
