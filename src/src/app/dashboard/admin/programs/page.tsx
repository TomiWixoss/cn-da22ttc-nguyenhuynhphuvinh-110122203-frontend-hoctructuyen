"use client";

import React from "react";
import { AdminOnly } from "@/components/features/auth/role-guard";
import { ProgramsCardGrid } from "@/components/features/admin/programs";
import { PageHeader } from "@/components/ui/layout/page-header";

export default function ProgramsListPage() {
  return (
    <AdminOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <PageHeader
          title="Chương trình đào tạo"
          description="Quản lý các chương trình đào tạo trong hệ thống"
        />

        {/* Card Grid */}
        <ProgramsCardGrid />
      </div>
    </AdminOnly>
  );
}
