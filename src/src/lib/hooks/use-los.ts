import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loService } from "@/lib/services/api";
import { toast } from "sonner";
import type { LOCreateRequest, LOUpdateRequest } from "@/lib/types/lo";

// Định nghĩa query keys để quản lý cache
export const loKeys = {
  all: ["los"] as const,
  lists: () => [...loKeys.all, "list"] as const,
  list: (filters: string) => [...loKeys.lists(), { filters }] as const,
  details: () => [...loKeys.all, "detail"] as const,
  detail: (id: number) => [...loKeys.details(), id] as const,
  byCourse: (courseId: number) =>
    [...loKeys.all, "byCourse", courseId] as const,
  bySubject: (subjectId: number) =>
    [...loKeys.all, "bySubject", subjectId] as const,
  completionAnalysis: (courseId: number, userId: number) =>
    [...loKeys.all, "completionAnalysis", courseId, userId] as const,
};

// Hook để lấy danh sách LOs (có phân trang và filter)
export function useLOs(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    subject_id?: number;
  } = {}
) {
  const { page = 1, limit = 10, search = "", subject_id } = params;

  return useQuery({
    queryKey: loKeys.list(JSON.stringify({ page, limit, search, subject_id })),
    queryFn: () => loService.getAllLOs({ page, limit, search, subject_id }),
    staleTime: 30000, // 30 seconds - data is considered fresh for 30s
    gcTime: 5 * 60 * 1000, // 5 minutes - data stays in cache for 5 minutes
  });
}

// Hook để lấy chi tiết một LO
export function useLO(loId: number) {
  return useQuery({
    queryKey: loKeys.detail(loId),
    queryFn: async () => {
      const response = await loService.getLOById(loId);
      // Xử lý response có thể có cấu trúc success/data hoặc là object trực tiếp
      if (
        response &&
        typeof response === "object" &&
        "success" in response &&
        (response as any).success &&
        (response as any).data
      ) {
        return (response as any).data;
      }
      return response;
    },
    enabled: !!loId, // Chỉ chạy query khi loId có giá trị
  });
}

// Hook để lấy LOs theo course
export function useLOsByCourse(courseId: number) {
  return useQuery({
    queryKey: loKeys.byCourse(courseId),
    queryFn: () => loService.getLOsByCourse(courseId),
    enabled: !!courseId,
  });
}

// Hook để lấy LOs theo subject
export function useLOsBySubject(
  subjectId: number,
  includeQuestions: boolean = false
) {
  return useQuery({
    queryKey: loKeys.bySubject(subjectId),
    queryFn: () => loService.getLOsBySubject(subjectId, includeQuestions),
    enabled: !!subjectId,
  });
}

// Hook để lấy chi tiết LO với thông tin chương và sections
export function useLODetails(loId: number) {
  return useQuery({
    queryKey: [...loKeys.detail(loId), "details"],
    queryFn: () => loService.getLODetails(loId),
    enabled: !!loId,
  });
}

// Hook để lấy phân tích completion của LO
export function useLOCompletionAnalysis(
  courseId: number,
  userId: number,
  params?: {
    start_date?: string;
    end_date?: string;
  }
) {
  return useQuery({
    queryKey: loKeys.completionAnalysis(courseId, userId),
    queryFn: () =>
      loService.getCompletionAnalysis({
        course_id: courseId,
        user_id: userId,
        ...params,
      }),
    enabled: !!(courseId && userId),
  });
}

// Hook để tạo một LO mới
export function useCreateLO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LOCreateRequest) => {
      // Chuyển đổi null values thành undefined để match service interface
      const createData = {
        name: data.name,
        subject_id: data.subject_id ?? 0, // Sử dụng 0 làm default nếu null
        description: data.description || undefined, // Chuyển null thành undefined
        chapter_ids: data.chapter_ids || [], // Thêm chapter_ids
      };
      return loService.createLO(createData);
    },
    onSuccess: () => {
      toast.success("Tạo chuẩn đầu ra thành công!");
      // Invalidate tất cả LO queries
      queryClient.invalidateQueries({
        queryKey: loKeys.all,
      });
      // Invalidate các queries liên quan khác
      queryClient.invalidateQueries({
        queryKey: ["plos"],
      });
      queryClient.invalidateQueries({
        queryKey: ["subjects"],
      });
      queryClient.invalidateQueries({
        queryKey: ["courses"],
      });
      queryClient.invalidateQueries({
        queryKey: ["questions"],
      });
    },
    onError: (error: any) => {
      toast.error(`Tạo thất bại: ${error.message || "Có lỗi xảy ra"}`);
    },
  });
}

// Hook để cập nhật một LO
export function useUpdateLO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ loId, data }: { loId: number; data: LOUpdateRequest }) => {
      // Chuyển đổi null values thành undefined để match service interface
      const updateData = {
        ...data,
        subject_id: data.subject_id === null ? undefined : data.subject_id,
        description: data.description === null ? undefined : data.description,
        chapter_ids: data.chapter_ids, // Thêm chapter_ids để có thể update chapters
      };
      return loService.updateLO(loId, updateData);
    },
    onSuccess: (_, { loId }) => {
      toast.success("Cập nhật chuẩn đầu ra thành công!");
      // Invalidate tất cả LO queries
      queryClient.invalidateQueries({
        queryKey: loKeys.all,
      });
      // Invalidate các queries liên quan khác
      queryClient.invalidateQueries({
        queryKey: ["plos"],
      });
      queryClient.invalidateQueries({
        queryKey: ["subjects"],
      });
      queryClient.invalidateQueries({
        queryKey: ["courses"],
      });
      queryClient.invalidateQueries({
        queryKey: ["questions"],
      });
    },
    onError: (error: any) => {
      toast.error(`Cập nhật thất bại: ${error.message || "Có lỗi xảy ra"}`);
    },
  });
}

// Hook để xóa một LO
export function useDeleteLO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (loId: number) => loService.deleteLO(loId),
    onSuccess: () => {
      toast.success("Xóa chuẩn đầu ra thành công!");
      // Invalidate tất cả LO list queries
      queryClient.invalidateQueries({
        queryKey: loKeys.all,
        predicate: (query) => {
          return query.queryKey[0] === "los" && query.queryKey[1] === "list";
        },
      });
    },
    onError: (error: any) => {
      toast.error(`Xóa thất bại: ${error.message || "Có lỗi xảy ra"}`);
    },
  });
}

// Hook để gán PLO vào LO
export function useAddPLOsToLO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ loId, ploIds }: { loId: number; ploIds: number[] }) =>
      loService.addPLOsToLO(loId, ploIds),
    onSuccess: (_, { loId }) => {
      // Invalidate query chi tiết của LO đó để cập nhật
      queryClient.invalidateQueries({
        queryKey: loKeys.detail(loId),
      });
      // Invalidate tất cả các list để đảm bảo dữ liệu đồng bộ
      queryClient.invalidateQueries({
        queryKey: loKeys.lists(),
      });
    },
    onError: (error: any) => {
      toast.error(`Gán PLO thất bại: ${error.message || "Có lỗi xảy ra"}`);
    },
  });
}

// Hook để gỡ PLO khỏi LO
export function useRemovePLOsFromLO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ loId, ploIds }: { loId: number; ploIds: number[] }) =>
      loService.removePLOsFromLO(loId, ploIds),
    onSuccess: (_, { loId }) => {
      // Invalidate query chi tiết của LO đó để cập nhật
      queryClient.invalidateQueries({
        queryKey: loKeys.detail(loId),
      });
      // Invalidate tất cả các list
      queryClient.invalidateQueries({
        queryKey: loKeys.lists(),
      });
    },
    onError: (error: any) => {
      toast.error(`Gỡ PLO thất bại: ${error.message || "Có lỗi xảy ra"}`);
    },
  });
}
