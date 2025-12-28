"use client";

import React, { useEffect } from "react";
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
import { TrainingBatchForm } from "@/components/features/admin/training-batches";
import { useTrainingBatch } from "@/lib/hooks/use-training-batches";

interface EditTrainingBatchPageProps {
  params: Promise<{
    batchId: string;
  }>;
}

export default function EditTrainingBatchPage({
  params,
}: EditTrainingBatchPageProps) {
  const resolvedParams = React.use(params);
  const batchId = parseInt(resolvedParams.batchId);
  const router = useRouter();

  const { data: batch, isLoading, isError } = useTrainingBatch(batchId);

  const handleSuccess = () => {
    router.push(`/dashboard/admin/training-batches/${batchId}`);
  };

  const handleCancel = () => {
    router.push(`/dashboard/admin/training-batches/${batchId}`);
  };

  if (isLoading) {
    return (
      <AdminOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
        <div className="container mx-auto p-6 space-y-6">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AdminOnly>
    );
  }

  if (isError || !batch) {
    return (
      <AdminOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
        <div className="container mx-auto p-6">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard/admin/training-batches">
                    Khóa đào tạo
                  </Link>
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
              Không tìm thấy khóa đào tạo
            </h2>
            <p className="text-muted-foreground mb-4">
              Khóa đào tạo này không tồn tại hoặc bạn không có quyền truy cập.
            </p>
          </div>
        </div>
      </AdminOnly>
    );
  }

  return (
    <AdminOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
      <div className="container mx-auto p-6 space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/admin/training-batches">
                  Khóa đào tạo
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/dashboard/admin/training-batches/${batchId}`}>
                  {batch.name}
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
        <TrainingBatchForm
          mode="edit"
          initialData={batch}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </AdminOnly>
  );
}
