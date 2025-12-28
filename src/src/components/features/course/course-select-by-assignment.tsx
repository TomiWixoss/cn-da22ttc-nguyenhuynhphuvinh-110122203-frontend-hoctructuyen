"use client";

import React, { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";
import { Skeleton } from "@/components/ui/feedback";
import { Alert, AlertDescription } from "@/components/ui/feedback";
import { AlertCircle } from "lucide-react";
import { useAssignmentContext } from "@/lib/contexts/assignment-context";
import { useAuthStatus } from "@/lib/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { courseAssignmentService } from "@/lib/services/api/course-assignment.service";

interface Course {
  course_id: number;
  name: string;
  code?: string;
  description?: string;
  Teacher?: {
    user_id: number;
    name: string;
  };
}

interface CourseSelectByAssignmentProps {
  value?: number;
  onValueChange: (courseId: number | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showEmptyOption?: boolean;
  emptyOptionText?: string;
  autoSelectFirst?: boolean; // Tự động chọn khóa học đầu tiên
}

export function CourseSelectByAssignment({
  value,
  onValueChange,
  placeholder = "Chọn khóa học",
  disabled = false,
  className,
  showEmptyOption = true,
  emptyOptionText = "Tất cả khóa học",
  autoSelectFirst = false,
}: CourseSelectByAssignmentProps) {
  const { currentAssignmentId } = useAssignmentContext();
  const { user } = useAuthStatus();

  // Chỉ load courses khi user là teacher
  const isTeacher = user?.role === "teacher";

  // Use TanStack Query for data fetching
  const {
    data: coursesResponse,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['coursesByAssignment', currentAssignmentId],
    queryFn: () => courseAssignmentService.getCoursesByAssignment(Number(currentAssignmentId!)),
    enabled: isTeacher && !!currentAssignmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const courses = coursesResponse?.success ? (coursesResponse.data?.Courses || []) : [];

  // Auto-select first course if needed
  useEffect(() => {
    if (autoSelectFirst && !value && courses.length > 0) {
      onValueChange(courses[0].course_id);
    }
  }, [autoSelectFirst, value, courses.length]); // Remove onValueChange from deps

  // Reset selected value khi courses thay đổi
  useEffect(() => {
    if (value && courses.length > 0) {
      const courseExists = courses.some((course: Course) => course.course_id === value);
      if (!courseExists) {
        onValueChange(undefined);
      }
    }
  }, [courses.length, value]); // Remove onValueChange from deps

  if (!isTeacher) {
    return (
      <div className={className}>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Tính năng này chỉ dành cho giáo viên.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!currentAssignmentId) {
    return (
      <div className={className}>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vui lòng chọn một phân công từ thanh bên để xem khóa học.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return <Skeleton className={`h-10 w-full ${className}`} />;
  }

  if (error) {
    return (
      <div className={className}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : "Có lỗi xảy ra khi tải danh sách khóa học"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Select
      value={value?.toString() || ""}
      onValueChange={(val) => {
        if (val === "" || val === "all") {
          onValueChange(undefined);
        } else {
          onValueChange(Number(val));
        }
      }}
      disabled={disabled || courses.length === 0}
    >
      <SelectTrigger className={className}>
        <SelectValue
          placeholder={
            courses.length === 0 ? "Chưa có khóa học nào" : placeholder
          }
        />
      </SelectTrigger>
      <SelectContent>
        {showEmptyOption && (
          <SelectItem value="all">{emptyOptionText}</SelectItem>
        )}

        {courses.length === 0 ? (
          <SelectItem value="no-courses" disabled>
            Chưa có khóa học nào trong phân công này
          </SelectItem>
        ) : (
          courses.map((course: Course) => (
            <SelectItem
              key={course.course_id}
              value={course.course_id.toString()}
            >
              <div className="flex flex-col">
                <span>{course.name}</span>
                {course.code && (
                  <span className="text-xs text-gray-500">{course.code}</span>
                )}
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}

export default CourseSelectByAssignment;
