"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RoleGuard } from "@/components/features/auth/role-guard";
import { Button } from "@/components/ui/forms";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/navigation/tabs";
import { Edit, GraduationCap, BarChart3, BookOpen } from "lucide-react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation";
import { useAssignmentContext } from "@/lib/contexts/assignment-context";
import { showErrorToast } from "@/lib/utils/toast-utils";
import { Skeleton } from "@/components/ui/feedback/skeleton";
import { CourseOverview } from "@/components/features/course/CourseOverview";
import { CourseGradeManagementTab } from "@/components/features/course/CourseGradeManagementTab";
import { GradeSetupWizard } from "@/components/features/course/GradeSetupWizard";
import { useCourseDetail } from "@/lib/hooks/use-teaching";

interface CourseDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createTeacherUrl } = useAssignmentContext();
  const [courseId, setCourseId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "overview"
  );
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState(false);

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

  // Use TanStack Query hook for course data
  const { data: course, isLoading, error } = useCourseDetail(courseId!);

  // Handle error
  useEffect(() => {
    if (error) {
      console.error("Error fetching course:", error);
      showErrorToast("Không thể tải thông tin khóa học");
      const url = createTeacherUrl("/dashboard/teaching/courses");
      router.push(url);
    }
  }, [error, router]);

  // Handle tab change with URL sync
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", value);
    router.replace(url.pathname + url.search, { scroll: false });
  };

  // Handle setup wizard
  const handleSetupWizard = () => {
    setIsSetupWizardOpen(true);
  };

  const handleSetupWizardSuccess = () => {
    // Refresh the page or trigger a re-fetch of grade columns
    window.location.reload();
  };

  if (isLoading || !courseId) {
    return (
      <RoleGuard
        roles={["teacher", "admin"]}
        fallback={<div>Bạn không có quyền truy cập trang này.</div>}
      >
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
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
          {/* Header with Breadcrumb */}
          <div className="flex items-center justify-between mb-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href={createTeacherUrl("/dashboard/teaching/courses")}
                    >
                      Khóa học
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Chi tiết khóa học</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

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
        {/* Header with Breadcrumb */}
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
              <BreadcrumbPage>{course.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Tabs Interface */}
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 gap-1 h-auto p-1">
            <TabsTrigger
              value="overview"
              className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-2 sm:py-2.5"
            >
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Tổng quan</span>
              <span className="sm:hidden">Tổng quan</span>
            </TabsTrigger>
            <TabsTrigger
              value="grade-management"
              className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-2 sm:py-2.5"
            >
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Quản lý điểm</span>
              <span className="sm:hidden">Điểm</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="overview" className="mt-6">
            <CourseOverview course={course} courseId={courseId!} />
          </TabsContent>

          <TabsContent value="grade-management" className="mt-6">
            <CourseGradeManagementTab courseId={courseId!} />
          </TabsContent>
        </Tabs>

        {/* Grade Setup Wizard */}
        {courseId && (
          <GradeSetupWizard
            isOpen={isSetupWizardOpen}
            onClose={() => setIsSetupWizardOpen(false)}
            courseId={courseId}
            onSuccess={handleSetupWizardSuccess}
          />
        )}
      </div>
    </RoleGuard>
  );
}
