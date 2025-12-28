import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trainingBatchService } from "@/lib/services/api/training-batch.service";
import { toast } from "sonner";
import type {
  TrainingBatchCreateRequest,
  TrainingBatchUpdateRequest,
  TrainingBatchFilterParams,
} from "@/lib/types/training-batch";

// Định nghĩa query keys để quản lý cache
export const trainingBatchKeys = {
  all: ["training-batches"] as const,
  lists: () => [...trainingBatchKeys.all, "list"] as const,
  list: (filters: string) =>
    [...trainingBatchKeys.lists(), { filters }] as const,
  details: () => [...trainingBatchKeys.all, "detail"] as const,
  detail: (id: number) => [...trainingBatchKeys.details(), id] as const,
};

// Hook để lấy danh sách Training Batches (có phân trang và filter)
export function useTrainingBatches(params?: TrainingBatchFilterParams) {
  return useQuery({
    queryKey: trainingBatchKeys.list(JSON.stringify(params || {})),
    queryFn: () => trainingBatchService.getTrainingBatches(params),
  });
}

// Hook để lấy chi tiết một Training Batch
export function useTrainingBatch(batchId: number) {
  return useQuery({
    queryKey: trainingBatchKeys.detail(batchId),
    queryFn: async () => {
      const response = await trainingBatchService.getTrainingBatchById(batchId);
      if (response && response.success && response.data) {
        return response.data;
      }
      throw new Error("Không thể tải thông tin khóa đào tạo");
    },
    enabled: !!batchId,
  });
}

// Hook để tạo một Training Batch mới
export function useCreateTrainingBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TrainingBatchCreateRequest) =>
      trainingBatchService.createTrainingBatch(data),
    onSuccess: () => {
      toast.success("Tạo khóa đào tạo thành công!");
      queryClient.invalidateQueries({
        queryKey: trainingBatchKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: ["programs"],
      });
    },
    onError: (error: any) => {
      toast.error(`Tạo thất bại: ${error.message || "Có lỗi xảy ra"}`);
    },
  });
}

// Hook để cập nhật một Training Batch
export function useUpdateTrainingBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      batchId,
      data,
    }: {
      batchId: number;
      data: TrainingBatchUpdateRequest;
    }) => trainingBatchService.updateTrainingBatch(batchId, data),
    onSuccess: (_, { batchId }) => {
      toast.success("Cập nhật khóa đào tạo thành công!");
      queryClient.invalidateQueries({
        queryKey: trainingBatchKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: trainingBatchKeys.detail(batchId),
      });
      queryClient.invalidateQueries({
        queryKey: ["programs"],
      });
    },
    onError: (error: any) => {
      toast.error(`Cập nhật thất bại: ${error.message || "Có lỗi xảy ra"}`);
    },
  });
}

// Hook để xóa một Training Batch
export function useDeleteTrainingBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (batchId: number) =>
      trainingBatchService.deleteTrainingBatchById(batchId),
    onSuccess: () => {
      toast.success("Xóa khóa đào tạo thành công!");
      queryClient.invalidateQueries({
        queryKey: trainingBatchKeys.lists(),
      });
    },
    onError: (error: any) => {
      toast.error(`Xóa thất bại: ${error.message || "Có lỗi xảy ra"}`);
    },
  });
}
