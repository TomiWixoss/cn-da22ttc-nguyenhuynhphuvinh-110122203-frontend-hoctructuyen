import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AssignmentService,
  type TeacherAssignment,
  type SubjectsAndTeachersData,
  type CreateAssignmentRequest,
} from "@/lib/services/api/assignment.service";
import { SubjectService } from "@/lib/services/api/subject.service";
import { toast } from "sonner";

// Query keys
export const assignmentKeys = {
  all: ["assignments"] as const,
  lists: () => [...assignmentKeys.all, "list"] as const,
  list: (filters: string) => [...assignmentKeys.lists(), { filters }] as const,
  bySemester: (semesterId: number) =>
    [...assignmentKeys.all, "semester", semesterId] as const,
  byTeacher: (teacherId: number) =>
    [...assignmentKeys.all, "teacher", teacherId] as const,
  details: () => [...assignmentKeys.all, "detail"] as const,
  detail: (id: number) => [...assignmentKeys.details(), id] as const,
  teachers: () => [...assignmentKeys.all, "teachers"] as const,
  subjects: () => [...assignmentKeys.all, "subjects"] as const,
  subjectsByProgram: (programId: number) =>
    [...assignmentKeys.all, "subjects", "byProgram", programId] as const,
  subjectsAndTeachers: (batchId: number, semesterId: number) =>
    [
      ...assignmentKeys.all,
      "subjectsAndTeachers",
      batchId,
      semesterId,
    ] as const,
};

// Fetch assignments by semester
export function useAssignmentsBySemester(semesterId: number) {
  return useQuery({
    queryKey: assignmentKeys.bySemester(semesterId),
    queryFn: () => AssignmentService.getAssignmentsBySemester(semesterId),
    enabled: !!semesterId,
  });
}

// Fetch assignments by teacher (removed - method doesn't exist in service)
// export function useAssignmentsByTeacher(teacherId: number) {
//   return useQuery({
//     queryKey: assignmentKeys.byTeacher(teacherId),
//     queryFn: () => AssignmentService.getAssignmentsByTeacher(teacherId),
//     enabled: !!teacherId,
//   });
// }

// Fetch available teachers
export function useAvailableTeachers() {
  return useQuery({
    queryKey: assignmentKeys.teachers(),
    queryFn: () => AssignmentService.getAvailableTeachers(),
  });
}

// Fetch available subjects
export function useAvailableSubjects() {
  return useQuery({
    queryKey: assignmentKeys.subjects(),
    queryFn: () => AssignmentService.getAvailableSubjects(),
  });
}

// Fetch subjects by program
export function useSubjectsByProgram(programId: number | null) {
  return useQuery({
    queryKey: ["subjects", "byProgram", programId],
    queryFn: () => SubjectService.getSubjectsByProgram(programId!),
    enabled: !!programId,
  });
}

// Create assignment mutation
export function useCreateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAssignmentRequest) =>
      AssignmentService.createAssignment(data),
    onSuccess: (response, variables) => {
      toast.success("Tạo phân công thành công");
      // Invalidate tất cả assignment queries
      queryClient.invalidateQueries({
        queryKey: assignmentKeys.all,
      });
      // Invalidate các queries liên quan khác
      queryClient.invalidateQueries({
        queryKey: ["courses"],
      });
      queryClient.invalidateQueries({
        queryKey: ["subjects"],
      });
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
    onError: (error: any) => {
      console.error("Error creating assignment:", error);

      // Extract error message from API response
      let errorMessage = "Có lỗi xảy ra khi tạo phân công";

      if (error.cause?.response?.data?.message) {
        errorMessage = error.cause.response.data.message;
      } else if (error.originalError?.response?.data?.message) {
        errorMessage = error.originalError.response.data.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (
        error.message &&
        error.message.includes("Giáo viên đã được phân công")
      ) {
        errorMessage = "Giáo viên đã được phân công môn học này trong học kỳ";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    },
  });
}

// Update assignment mutation
export function useUpdateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assignmentId,
      data,
    }: {
      assignmentId: number;
      data: CreateAssignmentRequest;
    }) => AssignmentService.updateAssignment(assignmentId, data),
    onSuccess: (response, { data }) => {
      toast.success("Cập nhật phân công thành công");
      // Invalidate tất cả assignment queries
      queryClient.invalidateQueries({
        queryKey: assignmentKeys.all,
      });
      // Invalidate các queries liên quan khác
      queryClient.invalidateQueries({
        queryKey: ["courses"],
      });
      queryClient.invalidateQueries({
        queryKey: ["subjects"],
      });
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
    onError: (error: any) => {
      console.error("Error updating assignment:", error);

      // Extract error message from API response
      let errorMessage = "Có lỗi xảy ra khi cập nhật phân công";

      if (error.cause?.response?.data?.message) {
        errorMessage = error.cause.response.data.message;
      } else if (error.originalError?.response?.data?.message) {
        errorMessage = error.originalError.response.data.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (
        error.message &&
        error.message.includes("Giáo viên đã được phân công")
      ) {
        errorMessage = "Giáo viên đã được phân công môn học này trong học kỳ";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    },
  });
}

// Delete assignment mutation
export function useDeleteAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentId: number) =>
      AssignmentService.deleteAssignment(assignmentId),
    onSuccess: () => {
      toast.success("Xóa phân công thành công");
      // Invalidate all assignment queries
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
    },
    onError: (error: any) => {
      console.error("Error deleting assignment:", error);
      toast.error("Có lỗi xảy ra khi xóa phân công");
    },
  });
}

// Hook to fetch subjects and teachers for the assignment matrix
export function useSubjectsAndTeachersForAssignment(
  batchId: number,
  semesterId: number
) {
  return useQuery({
    queryKey: assignmentKeys.subjectsAndTeachers(batchId, semesterId),
    queryFn: () =>
      AssignmentService.getSubjectsAndTeachersForAssignment(
        batchId,
        semesterId
      ),
    enabled: !!batchId && !!semesterId,
  });
}

// Hook for bulk assigning teachers
export function useBulkAssignTeachers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AssignmentService.bulkAssignTeachers,
    onSuccess: (response, variables) => {
      toast.success(response.message || "Lưu phân công thành công!");
      // Invalidate the matrix data to refetch
      queryClient.invalidateQueries({
        queryKey: assignmentKeys.subjectsAndTeachers(
          variables.batch_id,
          variables.semester_id
        ),
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Lỗi khi lưu phân công");
    },
  });
}
