"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminOnly } from "@/components/features/auth/role-guard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Edit, Loader2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation";
import { useLO } from "@/lib/hooks/use-los";
import { useProgram } from "@/lib/hooks/use-programs";
import { useSubject } from "@/lib/hooks/use-subjects";

interface LODetailPageProps {
  params: Promise<{
    programId: string;
    subjectId: string;
    loId: string;
  }>;
}

export default function LODetailPage({ params }: LODetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  const programId = parseInt(resolvedParams.programId);
  const subjectId = parseInt(resolvedParams.subjectId);
  const loId = parseInt(resolvedParams.loId);

  const { data: program } = useProgram(programId);
  const { data: subject } = useSubject(subjectId);
  const { data: lo, isLoading } = useLO(loId);

  if (isLoading || !lo) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
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
                <Link
                  href={`/dashboard/admin/programs/${programId}?tab=subjects`}
                >
                  {program?.name || "..."}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={`/dashboard/admin/programs/${programId}/subjects/${subjectId}?tab=los`}
                >
                  {subject?.name || "..."}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{lo.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{lo.name}</h1>
          <Button
            onClick={() =>
              router.push(
                `/dashboard/admin/programs/${programId}/subjects/${subjectId}/los/${loId}/edit`
              )
            }
          >
            <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chi tiết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tên chuẩn đầu ra
                </label>
                <p className="mt-1">{lo.name}</p>
              </div>

              {lo.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Mô tả
                  </label>
                  <p className="mt-1 whitespace-pre-wrap">{lo.description}</p>
                </div>
              )}

              {lo.level && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Cấp độ
                  </label>
                  <p className="mt-1">{lo.level}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Môn học
                </label>
                <p className="mt-1">{subject?.name || "Đang tải..."}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Chương trình đào tạo
                </label>
                <p className="mt-1">{program?.name || "Đang tải..."}</p>
              </div>

              {lo.created_at && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Ngày tạo
                  </label>
                  <p className="mt-1">
                    {new Date(lo.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              )}

              {lo.updated_at && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Cập nhật lần cuối
                  </label>
                  <p className="mt-1">
                    {new Date(lo.updated_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminOnly>
  );
}
