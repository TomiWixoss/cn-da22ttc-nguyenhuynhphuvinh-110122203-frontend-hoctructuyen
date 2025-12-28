"use client";

import React from "react";
import { AdminOnly } from "@/components/features/auth/role-guard";
import { Plus } from "lucide-react";
import Link from "next/link";
import { TrainingBatchForm } from "@/components/features/admin/training-batches";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation";

export default function CreateTrainingBatchPage() {
  return (
    <AdminOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Breadcrumb Navigation */}
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
              <BreadcrumbPage>Thêm khóa đào tạo mới</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Training Batch Form */}
        <TrainingBatchForm mode="create" />
      </div>
    </AdminOnly>
  );
}
