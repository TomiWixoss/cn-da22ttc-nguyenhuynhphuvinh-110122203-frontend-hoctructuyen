"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { RoleGuard } from "@/components/features/auth/role-guard";
import { Button } from "@/components/ui/forms";
import { Plus } from "lucide-react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation";
import { CreateCourseWithGradesForm } from "@/components/features/course/CreateCourseWithGradesForm";
import { useAssignmentContext } from "@/lib/contexts/assignment-context";

export default function CreateCoursePage() {
  const router = useRouter();
  const { createTeacherUrl } = useAssignmentContext();

  const handleSuccess = (courseData: any) => {
    // Redirect to course detail page or courses list
    const targetUrl = createTeacherUrl("/dashboard/teaching/courses");
    router.push(targetUrl);
  };

  const handleCancel = () => {
    const targetUrl = createTeacherUrl("/dashboard/teaching/courses");
    router.push(targetUrl);
  };

  return (
    <RoleGuard
      roles={["teacher", "admin"]}
      fallback={<div>Bạn không có quyền truy cập trang này.</div>}
    >
      <div className="container mx-auto p-6 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={createTeacherUrl("/dashboard/teaching/courses")}>
                  Khóa học
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Tạo mới</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Form Content */}
        <CreateCourseWithGradesForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </RoleGuard>
  );
}
