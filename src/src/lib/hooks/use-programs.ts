import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { programService } from "@/lib/services/api";
import { toast } from "sonner";
import type {
  ProgramCreateRequest,
  ProgramUpdateRequest,
  ProgramFilterParams,
} from "@/lib/types/program-management";

// Định nghĩa query keys để quản lý cache
export const programKeys = {
  all: ["programs"] as const,
  lists: () => [...programKeys.all, "list"] as const,
  list: (filters: string) => [...programKeys.lists(), { filters }] as const,
  details: () => [...programKeys.all, "detail"] as const,
  detail: (id: number) => [...programKeys.details(), id] as const,
  pos: (programId: number) => [...programKeys.all, "pos", programId] as const,
  plos: (programId: number) => [...programKeys.all, "plos", programId] as const,
  subjects: (programId: number) =>
    [...programKeys.all, "subjects", programId] as const,
};

// Hook để lấy danh sách Programs (có phân trang và filter)
export function usePrograms(params?: ProgramFilterParams) {
  return useQuery({
    queryKey: programKeys.list(JSON.stringify(params || {})),
    queryFn: () => programService.getPrograms(params),
  });
}

// Hook để lấy chi tiết một Program
export function useProgram(programId: number) {
  return useQuery({
    queryKey: programKeys.detail(programId),
    queryFn: async () => {
      const response = await programService.getProgramById(programId);
      // Program service luôn trả về { success: boolean, data: ProgramWithRelations }
      if (response && response.success && response.data) {
        return response.data;
      }
      throw new Error("Không thể tải thông tin chương trình đào tạo");
    },
    enabled: !!programId, // Chỉ chạy query khi programId có giá trị
  });
}

// Hook để lấy POs theo program
export function useProgramPOs(programId: number) {
  return useQuery({
    queryKey: programKeys.pos(programId),
    queryFn: () => programService.getProgramPOs(programId),
    enabled: !!programId,
  });
}

// Hook để lấy PLOs theo program
export function useProgramPLOs(programId: number) {
  return useQuery({
    queryKey: programKeys.plos(programId),
    queryFn: () => programService.getProgramPLOs(programId),
    enabled: !!programId,
  });
}

// Hook để lấy Courses theo program
export function useProgramCourses(programId: number) {
  return useQuery({
    queryKey: programKeys.subjects(programId),
    queryFn: () => programService.getProgramCourses(programId),
    enabled: !!programId,
  });
}

// Hook để tạo một Program mới
export function useCreateProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProgramCreateRequest) =>
      programService.createProgram(data),
    onSuccess: () => {
      toast.success("Tạo chương trình đào tạo thành công!");
      // Invalidate tất cả program queries
      queryClient.invalidateQueries({
        queryKey: programKeys.all,
      });
      // Invalidate các queries liên quan khác
      queryClient.invalidateQueries({
        queryKey: ["pos"],
      });
      queryClient.invalidateQueries({
        queryKey: ["plos"],
      });
      queryClient.invalidateQueries({
        queryKey: ["courses"],
      });
    },
    onError: (error: any) => {
      toast.error(`Tạo thất bại: ${error.message || "Có lỗi xảy ra"}`);
    },
  });
}

// Hook để cập nhật một Program
export function useUpdateProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      programId,
      data,
    }: {
      programId: number;
      data: ProgramUpdateRequest;
    }) => programService.updateProgram(programId, data),
    onSuccess: (_, { programId }) => {
      toast.success("Cập nhật chương trình đào tạo thành công!");
      // Invalidate tất cả program queries
      queryClient.invalidateQueries({
        queryKey: programKeys.all,
      });
      // Invalidate các queries liên quan khác
      queryClient.invalidateQueries({
        queryKey: ["pos"],
      });
      queryClient.invalidateQueries({
        queryKey: ["plos"],
      });
      queryClient.invalidateQueries({
        queryKey: ["courses"],
      });
    },
    onError: (error: any) => {
      toast.error(`Cập nhật thất bại: ${error.message || "Có lỗi xảy ra"}`);
    },
  });
}

// Hook để xóa một Program
export function useDeleteProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (programId: number) =>
      programService.deleteProgramById(programId),
    onSuccess: () => {
      toast.success("Xóa chương trình đào tạo thành công!");
      // Invalidate tất cả program list queries
      queryClient.invalidateQueries({
        queryKey: programKeys.all,
        predicate: (query) => {
          return (
            query.queryKey[0] === "programs" && query.queryKey[1] === "list"
          );
        },
      });
    },
    onError: (error: any) => {
      toast.error(`Xóa thất bại: ${error.message || "Có lỗi xảy ra"}`);
    },
  });
}

// Hook để lấy thống kê Program
export function useProgramStatistics(programId: number) {
  return useQuery({
    queryKey: [...programKeys.detail(programId), "statistics"],
    queryFn: () => programService.getProgramStatistics(programId),
    enabled: !!programId,
  });
}
