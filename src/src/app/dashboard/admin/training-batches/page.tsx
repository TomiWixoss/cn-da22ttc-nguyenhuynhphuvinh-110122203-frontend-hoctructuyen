"use client";

import React from "react";
import { AdminOnly } from "@/components/features/auth/role-guard";
import { TrainingBatchesCardGrid } from "@/components/features/admin/training-batches";
import { PageHeader } from "@/components/ui/layout/page-header";

export default function TrainingBatchesPage() {
  return (
    <AdminOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <PageHeader
          title="Khóa đào tạo"
          description="Quản lý các khóa đào tạo trong hệ thống"
        />

        {/* Card Grid */}
        <TrainingBatchesCardGrid />
      </div>
    </AdminOnly>
  );
}
