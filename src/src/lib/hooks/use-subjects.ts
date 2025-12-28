import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  SubjectService,
  type Subject,
  type CreateSubjectRequest,
  type UpdateSubjectRequest,
} from "@/lib/services/api/subject.service";
import { toast } from "sonner";

// Query keys
export const subjectKeys = {
  all: ["subjects"] as const,
  lists: () => [...subjectKeys.all, "list"] as const,
  list: (filters: string) => [...subjectKeys.lists(), { filters }] as const,
  details: () => [...subjectKeys.all, "detail"] as const,
  detail: (id: number) => [...subjectKeys.details(), id] as const,
  formData: () => [...subjectKeys.all, "formData"] as const,
};

// Fetch all subjects
export function useSubjects() {
  return useQuery({
    queryKey: subjectKeys.lists(),
    queryFn: () => SubjectService.getAllSubjects(),
  });
}

// Fetch subject by ID
export function useSubject(subjectId: number) {
  return useQuery({
    queryKey: subjectKeys.detail(subjectId),
    queryFn: async () => {
      const response = await SubjectService.getSubjectById(subjectId);
      return response.success ? response.data : null;
    },
    enabled: !!subjectId,
  });
}

// Fetch form data for subject creation/editing
export function useSubjectFormData() {
  return useQuery({
    queryKey: subjectKeys.formData(),
    queryFn: () => SubjectService.getFormData(),
  });
}

// Create subject mutation
export function useCreateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubjectRequest) =>
      SubjectService.createSubject(data),
    onSuccess: (response) => {
      if (response && response.success && response.data?.subject_id) {
        toast.success("Tạo môn học thành công");
        // Invalidate tất cả subject list queries
        queryClient.invalidateQueries({
          queryKey: subjectKeys.all,
          predicate: (query) => {
            return (
              query.queryKey[0] === "subjects" && query.queryKey[1] === "list"
            );
          },
        });
      } else {
        toast.error("Không thể tạo môn học");
      }
    },
    onError: (error: any) => {
      console.error("Error creating subject:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi tạo môn học"
      );
    },
  });
}

// Update subject mutation
export function useUpdateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      subjectId,
      data,
    }: {
      subjectId: number;
      data: UpdateSubjectRequest;
    }) => SubjectService.updateSubject(subjectId, data),
    onSuccess: (response, { subjectId }) => {

      // Kiểm tra response format từ backend: {success: true, data: updatedSubject}
      if (response && response.success && response.data?.subject_id) {
        // Optimistic update - cập nhật cache ngay lập tức
        queryClient.setQueryData(subjectKeys.detail(subjectId), response.data);

        // Show toast ngay lập tức
        toast.success("Cập nhật môn học thành công");

        // Invalidate để refetch latest data
        queryClient.invalidateQueries({
          queryKey: subjectKeys.all,
          predicate: (query) => {
            return (
              query.queryKey[0] === "subjects" && query.queryKey[1] === "list"
            );
          },
        });
        queryClient.invalidateQueries({
          queryKey: subjectKeys.detail(subjectId),
        });
      } else {
        console.error("🚨 [DEBUG] Invalid update response format:", response);
        toast.error("Không thể cập nhật môn học - response không hợp lệ");
      }
    },
    onError: (error: any) => {
      console.error("Error updating subject:", error);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật môn học";
      toast.error(errorMessage);
    },
  });
}

// Delete subject mutation
export function useDeleteSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subjectId: number) => SubjectService.deleteSubject(subjectId),
    onSuccess: () => {
      toast.success("Xóa môn học thành công");
      // Invalidate tất cả subject list queries
      queryClient.invalidateQueries({
        queryKey: subjectKeys.all,
        predicate: (query) => {
          return (
            query.queryKey[0] === "subjects" && query.queryKey[1] === "list"
          );
        },
      });
    },
    onError: (error: any) => {
      console.error("Error deleting subject:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi xóa môn học"
      );
    },
  });
}

// Program-Subject relationship hooks
export function useSubjectsByProgram(programId: number) {
  return useQuery({
    queryKey: ["subjects", "byProgram", programId],
    queryFn: () => SubjectService.getSubjectsByProgram(programId),
    enabled: !!programId,
  });
}

export function useAddSubjectToProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ programId, data }: { programId: number; data: any }) => {
      if (data.subject_id) {
        return SubjectService.attachSubjectToProgram(programId, data);
      }
      return SubjectService.createAndAttachSubjectToProgram(programId, data);
    },
    onSuccess: (_, { programId }) => {
      toast.success("Thêm môn học vào chương trình thành công!");
      queryClient.invalidateQueries({
        queryKey: ["subjects", "byProgram", programId],
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Thêm môn học thất bại.");
    },
  });
}

export function useUpdateSubjectInProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      subjectId,
      data,
    }: {
      programId: number;
      subjectId: number;
      data: any;
    }) => SubjectService.updateSubjectInProgram(programId, subjectId, data),
    onSuccess: (_, { programId }) => {
      toast.success("Cập nhật thông tin thành công!");
      queryClient.invalidateQueries({
        queryKey: ["subjects", "byProgram", programId],
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Cập nhật thất bại.");
    },
  });
}

export function useRemoveSubjectFromProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      subjectId,
      force,
    }: {
      programId: number;
      subjectId: number;
      force?: boolean;
    }) => SubjectService.removeSubjectFromProgram(programId, subjectId, force),
    onSuccess: (_, { programId }) => {
      toast.success("Đã gỡ môn học khỏi chương trình.");
      queryClient.invalidateQueries({
        queryKey: ["subjects", "byProgram", programId],
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gỡ môn học thất bại.");
    },
  });
}

// ===== CÁC HOOK MỚI ĐỂ QUẢN LÝ LIÊN KẾT SUBJECT-PLO =====

// Hook để lấy danh sách PLO của một môn học
export function usePLOsBySubject(subjectId: number) {
  return useQuery({
    queryKey: ["subjects", subjectId, "plos"],
    queryFn: () => SubjectService.getPLOsBySubject(subjectId),
    enabled: !!subjectId,
  });
}

// Hook để thêm PLO vào môn học
export function useAddPLOsToSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      subjectId,
      ploIds,
      programId,
    }: {
      subjectId: number;
      ploIds: number[];
      programId: number;
    }) => SubjectService.addPLOsToSubject(subjectId, ploIds),
    onSuccess: (_, { programId }) => {
      // Invalidate query của subjects theo program để cập nhật lại ma trận
      queryClient.invalidateQueries({
        queryKey: ["subjects", "byProgram", programId],
      });
    },
    onError: (error: any) => {
      toast.error(
        `Thêm liên kết thất bại: ${error.message || "Có lỗi xảy ra"}`
      );
    },
  });
}

// Hook để xóa liên kết PLO khỏi môn học
export function useRemovePLOsFromSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      subjectId,
      ploIds,
      programId,
    }: {
      subjectId: number;
      ploIds: number[];
      programId: number;
    }) => SubjectService.removePLOsFromSubject(subjectId, ploIds),
    onSuccess: (_, { programId }) => {
      // Invalidate query của subjects theo program để cập nhật lại ma trận
      queryClient.invalidateQueries({
        queryKey: ["subjects", "byProgram", programId],
      });
    },
    onError: (error: any) => {
      toast.error(`Xóa liên kết thất bại: ${error.message || "Có lỗi xảy ra"}`);
    },
  });
}
