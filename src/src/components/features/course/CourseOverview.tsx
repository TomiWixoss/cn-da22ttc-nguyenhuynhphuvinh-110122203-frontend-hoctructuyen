"use client";

import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { BookOpen, GraduationCap, User, Edit, BarChart3 } from "lucide-react";
import { CourseWithRelations } from "@/lib/types/course";
import { useAssignmentContext } from "@/lib/contexts/assignment-context";

interface CourseOverviewProps {
  course: CourseWithRelations;
  courseId: number;
}

export function CourseOverview({ course, courseId }: CourseOverviewProps) {
  const { createTeacherUrl } = useAssignmentContext();
  // No need for additional API calls since course data is already loaded
  const isLoading = false;

  return (
    <div className="space-y-6">
      {/* Course Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Thông tin khóa học
            </CardTitle>
            <Button asChild size="sm">
              <Link
                href={createTeacherUrl(
                  `/dashboard/teaching/courses/${courseId}/edit`
                )}
              >
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tên khóa học
                </label>
                <p className="text-lg font-semibold">{course.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Mô tả
                </label>
                <p className="text-sm">
                  {course.description || "Chưa có mô tả"}
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Giảng viên
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {course.Teacher?.name || "Chưa phân công"}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Môn học
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {course.Subject?.name || "Chưa xác định"}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Khóa đào tạo
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {course.TrainingBatch?.name || "Chưa xác định"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
