"use client";

import React from "react";
import { TeacherOnly } from "@/components/features/auth/role-guard";
import { HelpCircle } from "lucide-react";
import { QuestionsDataTable } from "@/components/features/teaching/questions/questions-data-table";
import { PageHeader } from "@/components/ui/layout/page-header";

export default function QuestionsListPage() {
  return (
    <TeacherOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Quản lý câu hỏi"
          description="Tạo và quản lý các câu hỏi cho bài kiểm tra và quiz"
          variant="default"
        />

        {/* Data Table */}
        <QuestionsDataTable />
      </div>
    </TeacherOnly>
  );
}
