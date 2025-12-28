"use client";

import React from "react";
import { RoleGuard } from "@/components/features/auth/role-guard";
import { GraduationCap } from "lucide-react";
import { CoursesDataTable } from "@/components/features/course/courses-data-table";
import { PageHeader } from "@/components/ui/layout/page-header";

export default function CoursesListPage() {
  return (
    <RoleGuard
      roles={["teacher", "admin"]}
      fallback={<div>Bạn không có quyền truy cập trang này.</div>}
    >
      <div className="container mx-auto p-6 space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Khóa học của tôi"
          description="Quản lý các khóa học bạn đang giảng dạy"
          variant="default"
        />

        {/* Data Table */}
        <CoursesDataTable />
      </div>
    </RoleGuard>
  );
}
