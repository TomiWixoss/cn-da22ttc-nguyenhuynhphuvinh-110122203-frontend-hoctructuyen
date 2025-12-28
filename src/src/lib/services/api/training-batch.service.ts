import api from "./client";
import type {
  TrainingBatch,
  TrainingBatchWithRelations,
  TrainingBatchListResponse,
  TrainingBatchCreateRequest,
  TrainingBatchUpdateRequest,
  TrainingBatchFilterParams,
  TrainingBatchApiResponse,
  TrainingBatchWithRelationsApiResponse,
  TrainingBatchDeleteApiResponse,
} from "@/lib/types/training-batch";

export const trainingBatchService = {
  // Lấy danh sách khóa đào tạo với pagination và filter
  getTrainingBatches: async (params?: TrainingBatchFilterParams) => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.program_id)
      queryParams.append("program_id", params.program_id.toString());

    const response = await api.get<TrainingBatchListResponse>(
      `/training-batches${queryParams.toString() ? `?${queryParams}` : ""}`
    );
    return response.data;
  },

  // Lấy chi tiết khóa đào tạo theo ID với relations
  getTrainingBatchById: async (batchId: number) => {
    const response = await api.get<TrainingBatchWithRelationsApiResponse>(
      // Sử dụng endpoint full-details để lấy tất cả thông tin liên quan
      `/training-batches/${batchId}/full-details`
    );
    return response.data;
  },

  // Tạo khóa đào tạo mới
  createTrainingBatch: async (batchData: TrainingBatchCreateRequest) => {
    const response = await api.post<TrainingBatchApiResponse>(
      "/training-batches",
      batchData
    );
    return response.data;
  },

  // Cập nhật khóa đào tạo
  updateTrainingBatch: async (
    batchId: number,
    batchData: TrainingBatchUpdateRequest
  ) => {
    const response = await api.put<TrainingBatchApiResponse>(
      `/training-batches/${batchId}`,
      batchData
    );
    return response.data;
  },

  // Xóa khóa đào tạo
  deleteTrainingBatchById: async (batchId: number) => {
    const response = await api.delete<TrainingBatchDeleteApiResponse>(
      `/training-batches/${batchId}`
    );
    return response.data;
  },

  // Lấy các thực thể con
  getSemestersByBatch: async (batchId: number) => {
    const response = await api.get(`/training-batches/${batchId}/semesters`);
    return response.data;
  },
  getAssignmentsByBatch: async (batchId: number) => {
    const response = await api.get(`/training-batches/${batchId}/assignments`);
    return response.data;
  },
  getCoursesByBatch: async (batchId: number) => {
    const response = await api.get(`/training-batches/${batchId}/courses`);
    return response.data;
  },
};

export default trainingBatchService;
