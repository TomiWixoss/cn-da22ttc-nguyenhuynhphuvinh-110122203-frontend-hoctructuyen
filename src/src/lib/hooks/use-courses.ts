import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseGradeService } from "@/lib/services/api/course-grade.service";
import { courseService } from "@/lib/services/api/course.service";
import { courseAssignmentService } from "@/lib/services/api/course-assignment.service";
import { toast } from "sonner";
import type {
  CourseWithGradeColumnsRequest,
  CourseWithGradeColumnsResponse,
} from "@/lib/types/course-grade";
import type {
  CreateCourseFromAssignmentRequest,
  CreateCourseFromAssignmentResponse,
} from "@/lib/services/api/course-assignment.service";
import { teachingKeys } from "./use-teaching";

// Định nghĩa query keys để quản lý cache
export const courseKeys = {
  all: ["courses"] as const,
  lists: () => [...courseKeys.all, "list"] as const,
  list: (filters: string) => [...courseKeys.lists(), { filters }] as const,
  details: () => [...courseKeys.all, "detail"] as const,
  detail: (id: number) => [...courseKeys.details(), id] as const,
  students: (courseId: number) =>
    [...courseKeys.all, "students", courseId] as const,
  gradeColumns: (courseId: number) =>
    [...courseKeys.all, "gradeColumns", courseId] as const,
  analytics: (courseId: number) =>
    [...courseKeys.all, "analytics", courseId] as const,
};

// Hook để tạo Course với Grade Columns
export function useCreateCourseWithGradeColumns() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CourseWithGradeColumnsRequest) =>
      courseGradeService.createCourseWithGradeColumns(data),
    onSuccess: () => {
      toast.success("Tạo khóa học với cột điểm thành công!");
      // Invalidate tất cả course queries
      queryClient.invalidateQueries({
        queryKey: courseKeys.all,
      });
      // Invalidate teaching courses (quan trọng!)
      queryClient.invalidateQueries({
        queryKey: ["teaching", "courses"],
      });
      // Invalidate các queries liên quan khác
      queryClient.invalidateQueries({
        queryKey: ["assignments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["subjects"],
      });
      queryClient.invalidateQueries({
        queryKey: ["programs"],
      });
    },
    onError: (error: any) => {
      toast.error(`Tạo khóa học thất bại: ${error.message || "Có lỗi xảy ra"}`);
    },
  });
}

// Hook để tạo Course từ Assignment
export function useCreateCourseFromAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      assignmentId,
      courseData,
    }: {
      assignmentId: number;
      courseData: CreateCourseFromAssignmentRequest;
    }) =>
      courseAssignmentService.createCourseFromAssignment(
        assignmentId,
        courseData
      ),
    onSuccess: () => {
      toast.success("Tạo khóa học từ phân công thành công!");
      // Invalidate tất cả course queries
      queryClient.invalidateQueries({
        queryKey: courseKeys.all,
      });
      // Invalidate teaching courses (quan trọng!)
      queryClient.invalidateQueries({
        queryKey: ["teaching", "courses"],
      });
      // Invalidate các queries liên quan khác
      queryClient.invalidateQueries({
        queryKey: ["assignments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["subjects"],
      });
      queryClient.invalidateQueries({
        queryKey: ["programs"],
      });
    },
    onError: (error: any) => {
      toast.error(`Tạo khóa học thất bại: ${error.message || "Có lỗi xảy ra"}`);
    },
  });
}

// Hook để cập nhật Course
export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      courseData,
    }: {
      courseId: number;
      courseData: any;
    }) => courseAssignmentService.updateCourse(courseId, courseData),
    onSuccess: (_, { courseId }) => {
      toast.success("Cập nhật khóa học thành công!");
      // Invalidate tất cả course queries
      queryClient.invalidateQueries({
        queryKey: courseKeys.all,
      });
      // Invalidate teaching courses (quan trọng!)
      queryClient.invalidateQueries({
        queryKey: ["teaching", "courses"],
      });
      // Invalidate các queries liên quan khác
      queryClient.invalidateQueries({
        queryKey: ["assignments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["subjects"],
      });
      queryClient.invalidateQueries({
        queryKey: ["programs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["questions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["quizzes"],
      });
    },
    onError: (error: any) => {
      toast.error(
        `Cập nhật khóa học thất bại: ${error.message || "Có lỗi xảy ra"}`
      );
    },
  });
}

// Hook để xóa Course
export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: number) => courseService.deleteCourseById(courseId),
    onSuccess: () => {
      toast.success("Xóa khóa học thành công!");
      // Invalidate teaching courses queries (quan trọng!)
      queryClient.invalidateQueries({
        queryKey: teachingKeys.courses(),
      });
      // Invalidate các queries liên quan khác
      queryClient.invalidateQueries({
        queryKey: ["assignments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["subjects"],
      });
      queryClient.invalidateQueries({
        queryKey: ["programs"],
      });
    },
    onError: (error: any) => {
      toast.error(`Xóa khóa học thất bại: ${error.message || "Có lỗi xảy ra"}`);
    },
  });
}
