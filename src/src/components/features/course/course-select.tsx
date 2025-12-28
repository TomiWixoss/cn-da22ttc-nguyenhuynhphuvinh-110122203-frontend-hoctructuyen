"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { courseService } from "@/lib/services/api";
import { Course } from "@/lib/types/course";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";

interface CourseSelectProps {
  onValueChange: (value: number) => void;
  value?: number;
  disabled?: boolean;
  teacherId?: number; // Optional filter by teacher
  programId?: number; // Optional filter by program
  autoRedirectToQuizList?: boolean; // Auto redirect to quiz list after selection
  placeholder?: string; // Custom placeholder text
  className?: string; // Additional CSS classes
}

export function CourseSelect({
  onValueChange,
  value,
  disabled = false,
  teacherId,
  programId,
  autoRedirectToQuizList = false,
  placeholder,
  className,
}: CourseSelectProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Lấy danh sách khóa học khi component được tạo
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);

        let response;
        if (teacherId) {
          // Lấy courses theo teacher
          response = await courseService.getCoursesByTeacher(teacherId);
        } else if (programId) {
          // Lấy courses theo program
          response = await courseService.getCoursesByProgram(programId);
        } else {
          // Lấy tất cả courses
          response = await courseService.getCourses();
        }

        // Xử lý response với wrapper success/data
        if (response?.success && response?.data) {
          // Kiểm tra xem data là array trực tiếp hay object chứa courses
          const courses = Array.isArray(response.data)
            ? response.data
            : response.data.courses || [];
          setCourses(courses);
        } else {
          console.warn("Unexpected courses response structure:", response);
          setCourses([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách khóa học:", error);
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [teacherId, programId]);

  // Xử lý sự kiện khi chọn khóa học
  const handleCourseChange = (valueStr: string) => {
    const courseId = parseInt(valueStr, 10);
    onValueChange(courseId);

    // Auto redirect to quiz list if enabled
    if (autoRedirectToQuizList) {
      router.push(`/quiz-list?courseId=${courseId}`);
    }
  };

  return (
    <Select
      disabled={isLoading || disabled}
      onValueChange={handleCourseChange}
      value={value?.toString()}
    >
      <SelectTrigger className={className}>
        <SelectValue
          placeholder={
            isLoading ? "Đang tải..." : placeholder || "Chọn khóa học"
          }
        />
      </SelectTrigger>
      <SelectContent>
        {courses.map((course) => (
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
        ))}
      </SelectContent>
    </Select>
  );
}
