"use client";

import { TeacherAssignmentList } from "@/components/features/assignments";
import { PageHeader } from "@/components/ui/layout/page-header";

export default function TeacherDashboard() {
  return (
    <>
      <PageHeader
        title="Môn học phân công"
        description="Quản lý và theo dõi các môn học được phân công của bạn"
        variant="default"
      />
      <TeacherAssignmentList />
    </>
  );
}
