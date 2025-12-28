"use client";

import React from "react";
import {
  StudentOnly,
  TeacherOnly,
  AdminOnly,
} from "@/components/features/auth/role-guard";
import {
  StudentDashboard,
  TeacherDashboard,
  AdminDashboard,
} from "@/components/features/dashboard";

export default function DashboardPage() {
  return (
    <div className="container mx-auto">
      {/* Student Dashboard */}
      <StudentOnly>
        <StudentDashboard />
      </StudentOnly>

      {/* Teacher Dashboard */}
      <TeacherOnly>
        <TeacherDashboard />
      </TeacherOnly>

      {/* Admin Dashboard */}
      <AdminOnly>
        <AdminDashboard />
      </AdminOnly>
    </div>
  );
}
