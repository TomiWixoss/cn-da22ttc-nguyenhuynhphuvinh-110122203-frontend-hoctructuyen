"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RoleGuard } from "@/components/features/auth/role-guard";
import { GraduationCap } from "lucide-react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation";
import { useCourseDetail } from "@/lib/hooks/use-teaching";
import { useAssignmentContext } from "@/lib/contexts/assignment-context";
import { showErrorToast } from "@/lib/utils/toast-utils";
import { Skeleton } from "@/components/ui/feedback/skeleton";
import { EditCourseForm } from "@/components/features/course/EditCourseForm";

interface CourseEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CourseEditPage({ params }: CourseEditPageProps) {
  const router = useRouter();
  const { createTeacherUrl } = useAssignmentContext();
  const [courseId, setCourseId] = useState<number | null>(null);

  // Initialize course ID
  useEffect(() => {
    const initializeCourseId = async () => {
      const resolvedParams = await params;
      const id = parseInt(resolvedParams.id);
      if (!isNaN(id)) {
        setCourseId(id);
      } else {
        showErrorToast("ID khóa học không hợp lệ");
        const url = createTeacherUrl("/dashboard/teaching/courses");
        router.push(url);
      }
    };
    initializeCourseId();
  }, [params, router]);

  // Use TanStack Query hook to fetch course data
  const { data: course, isLoading, error } = useCourseDetail(courseId || 0);

  // Handle error
  useEffect(() => {
    if (error && courseId) {
      console.error("Error fetching course:", error);
      showErrorToast("Không thể tải thông tin khóa học");
      const url = createTeacherUrl("/dashboard/teaching/courses");
      router.push(url);
    }
  }, [error, courseId, router]);

  // Handle successful course update
  const handleCourseUpdateSuccess = () => {
    const url = createTeacherUrl(`/dashboard/teaching/courses/${courseId}`);
    router.push(url);
  };

  // Handle cancel
  const handleCancel = () => {
    const url = createTeacherUrl(`/dashboard/teaching/courses/${courseId}`);
    router.push(url);
  };

  if (isLoading) {
    return (
      <RoleGuard
        roles={["teacher", "admin"]}
        fallback={<div>Bạn không có quyền truy cập trang này.</div>}
      >
        <div className="container mx-auto p-6 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </RoleGuard>
    );
  }

  if (!course) {
    return (
      <RoleGuard
        roles={["teacher", "admin"]}
        fallback={<div>Bạn không có quyền truy cập trang này.</div>}
      >
        <div className="container mx-auto p-6">
          {/* Breadcrumb Navigation */}
          <Breadcrumb className="mb-4">
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
                <BreadcrumbLink asChild>
                  <Link
                    href={createTeacherUrl(
                      `/dashboard/teaching/courses/${courseId}`
                    )}
                  >
                    Chi tiết khóa học
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
            <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">
              Không tìm thấy khóa học
            </h2>
            <p className="text-muted-foreground mb-4">
              Khóa học này không tồn tại hoặc bạn không có quyền truy cập.
            </p>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard
      roles={["teacher", "admin"]}
      fallback={<div>Bạn không có quyền truy cập trang này.</div>}
    >
      <div className="container mx-auto p-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-4">
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
              <BreadcrumbLink asChild>
                <Link
                  href={createTeacherUrl(
                    `/dashboard/teaching/courses/${courseId}`
                  )}
                >
                  {course.name}
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
        <EditCourseForm
          initialData={course}
          onSuccess={handleCourseUpdateSuccess}
          onCancel={handleCancel}
        />
      </div>
    </RoleGuard>
  );
}
