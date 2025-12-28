"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { PageHeader } from "@/components/ui/layout/page-header";
import { Button } from "@/components/ui/forms";
import {
  BookOpen,
  BarChart3,
  Users,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { studentCourseService } from "@/lib/services/api/student-course.service";
import { showErrorToast } from "@/lib/utils/toast-utils";
import { useAuthStatus } from "@/lib/hooks/use-auth";
import { StudentDashboardSkeleton } from "./DashboardSkeleton";

import type { StudentCourse } from "@/lib/services/api/student-course.service";

export default function StudentDashboard() {
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { getUser } = useAuthStatus();
  const user = getUser();

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user?.user_id) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }

      const response = await studentCourseService.getCoursesOfStudent(
        user.user_id
      );

      if (response?.success && response?.data?.courses) {
        setCourses(response.data.courses);
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách khóa học";
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Chỉ fetch khi user đã được load
    if (user?.user_id) {
      fetchCourses();
    }
  }, [user?.user_id]);

  const handleCourseClick = (courseId: number) => {
    router.push(`/dashboard/student/learning-results?courseId=${courseId}`);
  };

  if (isLoading) {
    return <StudentDashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <BookOpen className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-lg font-semibold text-red-600 mb-2">
          Lỗi tải dữ liệu
        </h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button
          onClick={fetchCourses}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Chưa có khóa học nào</h3>
          <p className="text-muted-foreground text-center">
            Hiện tại bạn chưa tham gia khóa học nào. Hãy liên hệ với giảng viên
            để được thêm vào khóa học.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header sử dụng PageHeader component */}
      <PageHeader
        title="Tổng Quan Khóa Học"
        description="Chọn khóa học để xem phân tích kết quả học tập chi tiết"
      />

      {/* Courses Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          return (
            <Card
              key={course.course_id}
              className="border-2 hover:border-primary transition-all cursor-pointer group"
              onClick={() => handleCourseClick(course.course_id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-2">
                      {course.course_name}
                    </CardTitle>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Course Info */}
                <div className="space-y-2">
                  {course.program_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="h-4 w-4 text-blue-600" />
                      <span className="text-muted-foreground">
                        Chương trình:
                      </span>
                      <span className="font-medium">{course.program_name}</span>
                    </div>
                  )}

                  {course.teacher_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="text-muted-foreground">Giảng viên:</span>
                      <span className="font-medium">{course.teacher_name}</span>
                    </div>
                  )}
                </div>

                {/* Action hint */}
                <div className="pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm text-blue-600 group-hover:text-blue-700 transition-colors">
                    <BarChart3 className="h-4 w-4" />
                    <span className="font-medium">
                      Nhấn để xem phân tích kết quả
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
