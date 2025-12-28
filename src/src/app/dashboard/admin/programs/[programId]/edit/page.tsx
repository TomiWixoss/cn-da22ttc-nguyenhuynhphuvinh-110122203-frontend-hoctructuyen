"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { AdminOnly } from "@/components/features/auth/role-guard";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation";
import { Skeleton } from "@/components/ui/feedback";
import { ProgramForm } from "@/components/features/admin/programs";
import { useProgram } from "@/lib/hooks/use-programs";

interface EditProgramPageProps {
  params: Promise<{
    programId: string;
  }>;
}

export default function EditProgramPage({ params }: EditProgramPageProps) {
  const resolvedParams = use(params);
  const programId = parseInt(resolvedParams.programId);
  const router = useRouter();

  const { data: program, isLoading, isError } = useProgram(programId);

  const handleSuccess = () => {
    router.push(`/dashboard/admin/programs/${programId}`);
  };

  const handleCancel = () => {
    router.push(`/dashboard/admin/programs/${programId}`);
  };

  if (isLoading) {
    return (
      <AdminOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
        <div className="container mx-auto p-6 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </AdminOnly>
    );
  }

  if (isError || !program) {
    return (
      <AdminOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
        <div className="container mx-auto p-6">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard/admin/programs">Chương trình ĐT</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Chỉnh sửa</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">
              Không tìm thấy chương trình
            </h2>
            <p className="text-muted-foreground mb-4">
              Chương trình này không tồn tại hoặc bạn không có quyền truy cập.
            </p>
          </div>
        </div>
      </AdminOnly>
    );
  }

  return (
    <AdminOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Breadcrumb Navigation */}
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
                <Link href={`/dashboard/admin/programs/${programId}`}>
                  {program.name}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Chỉnh sửa</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Edit Form */}
        <ProgramForm
          mode="edit"
          initialData={program}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </AdminOnly>
  );
}
