import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { poService } from "@/lib/services/api";
import { toast } from "sonner";
import type {
  POCreateRequest,
  POUpdateRequest,
  POFilterParams,
} from "@/lib/types/program-management";

// Định nghĩa query keys để quản lý cache
export const poKeys = {
  all: ["pos"] as const,
  lists: () => [...poKeys.all, "list"] as const,
  list: (filters: string) => [...poKeys.lists(), { filters }] as const,
  details: () => [...poKeys.all, "detail"] as const,
  detail: (id: number) => [...poKeys.details(), id] as const,
  byProgram: (programId: number) =>
    [...poKeys.all, "byProgram", programId] as const,
  plos: (poId: number) => [...poKeys.all, "plos", poId] as const,
};

// Hook để lấy danh sách POs (có phân trang và filter)
export function usePOs(params?: POFilterParams) {
  return useQuery({
    queryKey: poKeys.list(JSON.stringify(params || {})),
    queryFn: () => poService.getPOs(params),
  });
}

// Hook để lấy chi tiết một PO
export function usePO(poId: number) {
  return useQuery({
    queryKey: poKeys.detail(poId),
    queryFn: async () => {
      const response = await poService.getPOById(poId);
      // PO service luôn trả về { success: boolean, data: POWithRelations }
      if (response && response.success && response.data) {
        return response.data;
      }
      throw new Error("Không thể tải thông tin PO");
    },
    enabled: !!poId, // Chỉ chạy query khi poId có giá trị
  });
}

// Hook để lấy POs theo program
export function usePOsByProgram(
  programId: number,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    sort_by?: string;
    sort_order?: "ASC" | "DESC";
  }
) {
  return useQuery({
    queryKey: [...poKeys.byProgram(programId), params],
    queryFn: () => poService.getPOsByProgram(programId, params),
    enabled: !!programId,
  });
}

// Hook để lấy PLOs theo PO
export function usePOPLOs(poId: number) {
  return useQuery({
    queryKey: poKeys.plos(poId),
    queryFn: () => poService.getPOPLOs(poId),
    enabled: !!poId,
  });
}

// Hook để tạo một PO mới
export function useCreatePO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: POCreateRequest) => poService.createPO(data),
    onSuccess: () => {
      toast.success("Tạo Program Outcome thành công!");
      // Invalidate tất cả PO queries
      queryClient.invalidateQueries({
        queryKey: poKeys.all,
      });
      // Invalidate các queries liên quan khác
      queryClient.invalidateQueries({
        queryKey: ["programs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["plos"],
      });
    },
    onError: (error: any) => {
      toast.error(`Tạo thất bại: ${error.message || "Có lỗi xảy ra"}`);
    },
  });
}

// Hook để cập nhật một PO
export function useUpdatePO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ poId, data }: { poId: number; data: POUpdateRequest }) =>
      poService.updatePO(poId, data),
    onSuccess: (_, { poId }) => {
      toast.success("Cập nhật Program Outcome thành công!");
      // Invalidate tất cả PO queries
      queryClient.invalidateQueries({
        queryKey: poKeys.all,
      });
      // Invalidate các queries liên quan khác
      queryClient.invalidateQueries({
        queryKey: ["programs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["plos"],
      });
    },
    onError: (error: any) => {
      toast.error(`Cập nhật thất bại: ${error.message || "Có lỗi xảy ra"}`);
    },
  });
}

// Hook để xóa một PO
export function useDeletePO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (poId: number) => poService.deletePO(poId),
    onSuccess: () => {
      toast.success("Xóa Program Outcome thành công!");
      // Invalidate tất cả PO list queries
      queryClient.invalidateQueries({
        queryKey: poKeys.all,
        predicate: (query) => {
          return query.queryKey[0] === "pos" && query.queryKey[1] === "list";
        },
      });
    },
    onError: (error: any) => {
      toast.error(`Xóa thất bại: ${error.message || "Có lỗi xảy ra"}`);
    },
  });
}

// Hook để tạo nhiều POs cùng lúc
export function useCreateMultiplePOs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (posData: POCreateRequest[]) =>
      poService.createMultiplePOs(posData),
    onSuccess: () => {
      toast.success("Tạo nhiều Program Outcomes thành công!");
      // Invalidate tất cả PO list queries
      queryClient.invalidateQueries({
        queryKey: poKeys.all,
        predicate: (query) => {
          return query.queryKey[0] === "pos" && query.queryKey[1] === "list";
        },
      });
    },
    onError: (error: any) => {
      toast.error(`Tạo thất bại: ${error.message || "Có lỗi xảy ra"}`);
    },
  });
}

// Hook để xóa nhiều POs cùng lúc
export function useDeleteMultiplePOs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (poIds: number[]) => poService.deleteMultiplePOs(poIds),
    onSuccess: () => {
      toast.success("Xóa nhiều Program Outcomes thành công!");
      // Invalidate tất cả PO list queries
      queryClient.invalidateQueries({
        queryKey: poKeys.all,
        predicate: (query) => {
          return query.queryKey[0] === "pos" && query.queryKey[1] === "list";
        },
      });
    },
    onError: (error: any) => {
      toast.error(`Xóa thất bại: ${error.message || "Có lỗi xảy ra"}`);
    },
  });
}
