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
import { usePLO } from "@/lib/hooks/use-plos";
import { PLOActions } from "@/components/features/admin/plos";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/feedback";

export default function PLODetailPage() {
  const params = useParams();
  const programId = parseInt(params.programId as string);
  const ploId = parseInt(params.ploId as string);

  const { data: program } = useProgram(programId);
  const { data: plo, isLoading } = usePLO(ploId);

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

  if (!plo) {
    return (
      <AdminOnly fallback={<div>Bạn không có quyền truy cập.</div>}>
        <div className="container mx-auto p-6 space-y-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">Không tìm thấy PLO</h2>
            <p className="text-muted-foreground mb-4">
              Chuẩn đầu ra chương trình với ID {ploId} không tồn tại.
            </p>
            <Link href={`/dashboard/admin/programs/${programId}?tab=plos`}>
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
                <Link href={`/dashboard/admin/programs/${programId}?tab=plos`}>
                  {program?.name || `Program #${programId}`}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{plo.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{plo.name}</h1>
            <p className="text-muted-foreground">
              Chi tiết Chuẩn đầu ra Chương trình (PLO)
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/admin/programs/${programId}?tab=plos`}>
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Button>
            </Link>
            <PLOActions plo={plo} programId={programId} variant="buttons" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin chi tiết</CardTitle>
            <CardDescription>
              Thông tin chi tiết về Chuẩn đầu ra Chương trình
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Tên PLO
              </label>
              <p className="text-lg font-semibold">{plo.name}</p>
            </div>

            {plo.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Mô tả
                </label>
                <p className="text-sm leading-relaxed">{plo.description}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                ID
              </label>
              <p className="font-medium">#{plo.plo_id}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Chương trình
              </label>
              <p className="font-medium">{program?.name || "N/A"}</p>
            </div>

            {plo.POs && plo.POs.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Liên kết với Mục tiêu đào tạo
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {plo.POs.map((po: any) => (
                    <Link
                      key={po.po_id}
                      href={`/dashboard/admin/programs/${programId}/pos/${po.po_id}`}
                    >
                      <Button variant="outline" size="sm">
                        {po.name}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminOnly>
  );
}
