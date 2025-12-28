import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ploService } from "@/lib/services/api";
import { toast } from "sonner";
import type {
  PLOCreateRequest,
  PLOUpdateRequest,
  PLOFilterParams,
} from "@/lib/types/program-management";

// Định nghĩa query keys để quản lý cache
export const ploKeys = {
  all: ["plos"] as const,
  lists: () => [...ploKeys.all, "list"] as const,
  list: (filters: string) => [...ploKeys.lists(), { filters }] as const,
  details: () => [...ploKeys.all, "detail"] as const,
  detail: (id: number) => [...ploKeys.details(), id] as const,
  byProgram: (programId: number) =>
    [...ploKeys.all, "byProgram", programId] as const,
  byPO: (poId: number) => [...ploKeys.all, "byPO", poId] as const,
  los: (ploId: number) => [...ploKeys.all, "los", ploId] as const,
};

// Hook để lấy danh sách PLOs (có phân trang và filter)
export function usePLOs(params?: PLOFilterParams) {
  return useQuery({
    queryKey: ploKeys.list(JSON.stringify(params || {})),
    queryFn: () => ploService.getPLOs(params),
  });
}

// Hook để lấy chi tiết một PLO
export function usePLO(ploId: number) {
  return useQuery({
    queryKey: ploKeys.detail(ploId),
    queryFn: async () => {
      const response = await ploService.getPLOById(ploId);
      // PLO service luôn trả về { success: boolean, data: PLOWithRelations }
      if (response && response.success && response.data) {
        return response.data;
      }
      throw new Error("Không thể tải thông tin PLO");
    },
    enabled: !!ploId, // Chỉ chạy query khi ploId có giá trị
  });
}

// Hook để lấy PLOs theo program
export function usePLOsByProgram(
  programId: number,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    sort_by?: string;
    sort_order?: "ASC" | "DESC";
    po_id?: number;
  }
) {
  return useQuery({
    queryKey: [...ploKeys.byProgram(programId), params],
    queryFn: () => ploService.getPLOsByProgram(programId, params),
    enabled: !!programId,
  });
}

// Hook để lấy PLOs theo PO
export function usePLOsByPO(
  poId: number,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    sort_by?: string;
    sort_order?: "ASC" | "DESC";
  }
) {
  return useQuery({
    queryKey: ploKeys.byPO(poId),
    queryFn: () => ploService.getPLOsByPO(poId, params),
    enabled: !!poId,
  });
}

// Hook để lấy LOs theo PLO
export function usePLOLOs(ploId: number) {
  return useQuery({
    queryKey: ploKeys.los(ploId),
    queryFn: () => ploService.getPLOLOs(ploId),
    enabled: !!ploId,
  });
}

// Hook để tạo một PLO mới
export function useCreatePLO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PLOCreateRequest) => ploService.createPLO(data),
    onSuccess: () => {
      toast.success("Tạo Program Learning Outcome thành công!");
      // Invalidate tất cả PLO queries
      queryClient.invalidateQueries({
        queryKey: ploKeys.all,
      });
      // Invalidate các queries liên quan khác
      queryClient.invalidateQueries({
        queryKey: ["programs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["pos"],
      });
      queryClient.invalidateQueries({
        queryKey: ["los"],
      });
    },
    onError: (error: any) => {
      toast.error(`Tạo thất bại: ${error.message || "Có lỗi xảy ra"}`);
    },
  });
}

// Hook để cập nhật một PLO
export function useUpdatePLO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ploId, data }: { ploId: number; data: PLOUpdateRequest }) =>
      ploService.updatePLO(ploId, data),
    onSuccess: (_, { ploId }) => {
      toast.success("Cập nhật Program Learning Outcome thành công!");
      // Invalidate tất cả PLO queries
      queryClient.invalidateQueries({
        queryKey: ploKeys.all,
      });
      // Invalidate các queries liên quan khác
      queryClient.invalidateQueries({
        queryKey: ["programs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["pos"],
      });
      queryClient.invalidateQueries({
        queryKey: ["los"],
      });
    },
    onError: (error: any) => {
      toast.error(`Cập nhật thất bại: ${error.message || "Có lỗi xảy ra"}`);
    },
  });
}

// Hook để xóa một PLO
export function useDeletePLO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ploId: number) => ploService.deletePLO(ploId),
    onSuccess: () => {
      toast.success("Xóa Program Learning Outcome thành công!");
      // Invalidate tất cả PLO list queries
      queryClient.invalidateQueries({
        queryKey: ploKeys.all,
        predicate: (query) => {
          return query.queryKey[0] === "plos" && query.queryKey[1] === "list";
        },
      });
    },
    onError: (error: any) => {
      toast.error(`Xóa thất bại: ${error.message || "Có lỗi xảy ra"}`);
    },
  });
}

// Hook để tạo nhiều PLOs cùng lúc
export function useCreateMultiplePLOs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (plosData: PLOCreateRequest[]) =>
      ploService.createMultiplePLOs(plosData),
    onSuccess: () => {
      toast.success("Tạo nhiều Program Learning Outcomes thành công!");
      // Invalidate tất cả PLO list queries
      queryClient.invalidateQueries({
        queryKey: ploKeys.all,
        predicate: (query) => {
          return query.queryKey[0] === "plos" && query.queryKey[1] === "list";
        },
      });
    },
    onError: (error: any) => {
      toast.error(`Tạo thất bại: ${error.message || "Có lỗi xảy ra"}`);
    },
  });
}

// Hook để xóa nhiều PLOs cùng lúc
export function useDeleteMultiplePLOs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ploIds: number[]) => ploService.deleteMultiplePLOs(ploIds),
    onSuccess: () => {
      toast.success("Xóa nhiều Program Learning Outcomes thành công!");
      // Invalidate tất cả PLO list queries
      queryClient.invalidateQueries({
        queryKey: ploKeys.all,
        predicate: (query) => {
          return query.queryKey[0] === "plos" && query.queryKey[1] === "list";
        },
      });
    },
    onError: (error: any) => {
      toast.error(`Xóa thất bại: ${error.message || "Có lỗi xảy ra"}`);
    },
  });
}

// Hook để liên kết PLO với LOs
export function useLinkPLOToLOs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ploId, loIds }: { ploId: number; loIds: number[] }) =>
      ploService.linkPLOToLOs(ploId, loIds),
    onSuccess: (_, { ploId }) => {
      toast.success("Liên kết PLO với LOs thành công!");
      queryClient.invalidateQueries({ queryKey: ploKeys.los(ploId) });
      queryClient.invalidateQueries({ queryKey: ploKeys.detail(ploId) });
    },
    onError: (error: any) => {
      toast.error(`Liên kết thất bại: ${error.message || "Có lỗi xảy ra"}`);
    },
  });
}

// Hook để hủy liên kết PLO với LOs
export function useUnlinkPLOFromLOs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ploId, loIds }: { ploId: number; loIds: number[] }) =>
      ploService.unlinkPLOFromLOs(ploId, loIds),
    onSuccess: (_, { ploId }) => {
      toast.success("Hủy liên kết PLO với LOs thành công!");
      queryClient.invalidateQueries({ queryKey: ploKeys.los(ploId) });
      queryClient.invalidateQueries({ queryKey: ploKeys.detail(ploId) });
    },
    onError: (error: any) => {
      toast.error(`Hủy liên kết thất bại: ${error.message || "Có lỗi xảy ra"}`);
    },
  });
}

// Hook để liên kết PLO với PO
export function useAssociatePLOWithPO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      programId,
      poId,
      ploId,
    }: {
      programId: number;
      poId: number;
      ploId: number;
    }) => ploService.associatePLOWithPO(programId, poId, ploId), // Gọi hàm service đã sửa
    onSuccess: (_, { programId }) => {
      // Invalidate query của PLOs theo program để cập nhật ma trận
      queryClient.invalidateQueries({
        queryKey: ploKeys.byProgram(programId),
      });
    },
    onError: (error: any) => {
      toast.error(`Liên kết thất bại: ${error.message || "Có lỗi xảy ra"}`);
    },
  });
}

// Hook để hủy liên kết PLO với PO
export function useDisassociatePLOFromPO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      programId,
      poId,
      ploId,
    }: {
      programId: number;
      poId: number;
      ploId: number;
    }) => ploService.disassociatePLOFromPO(programId, poId, ploId), // Gọi hàm service đã sửa
    onSuccess: (_, { programId }) => {
      // Invalidate query của PLOs theo program để cập nhật ma trận
      queryClient.invalidateQueries({
        queryKey: ploKeys.byProgram(programId),
      });
    },
    onError: (error: any) => {
      toast.error(`Hủy liên kết thất bại: ${error.message || "Có lỗi xảy ra"}`);
    },
  });
}
