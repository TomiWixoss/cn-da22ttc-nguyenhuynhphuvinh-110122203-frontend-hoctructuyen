import api from "./client";

const apiClient = {
  get: (url: string) => api.get(url).then((res) => res.data),
  post: (url: string, data?: any) =>
    api.post(url, data).then((res) => res.data),
  put: (url: string, data?: any) => api.put(url, data).then((res) => res.data),
  delete: (url: string) => api.delete(url).then((res) => res.data),
};

export interface Semester {
  semester_id: number;
  id?: number; // Alias for backward compatibility
  name: string;
  academic_year: string;
  semester_number: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  description?: string;
  batch_id: number; // Thêm batch_id
  createdAt: string;
  updatedAt: string;
  created_at?: string; // Alias for backward compatibility
  updated_at?: string; // Alias for backward compatibility
  TeacherAssignments?: any[];
  Courses?: any[];
  display_name?: string;
  duration_days?: number;
  is_current?: boolean;
  assignment_count?: number;
  course_count?: number;
}

export interface CreateSemesterRequest {
  name: string;
  academic_year: string;
  semester_number: number;
  description?: string;
  start_date: string;
  end_date: string;
  batch_id: number;
}

export interface SemesterStatistics {
  total_assignments: number;
  total_courses: number;
  active_teachers: number;
}

export class SemesterService {
  private static readonly BASE_URL = "/semesters";

  /**
   * Lấy danh sách tất cả học kỳ
   */
  static async getAllSemesters(params?: {
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: Semester[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const url = queryParams.toString()
      ? `${this.BASE_URL}?${queryParams.toString()}`
      : this.BASE_URL;

    const response = await apiClient.get(url);
    return {
      success: true,
      data: response.data?.semesters || [],
      pagination: {
        page: response.data?.currentPage || 1,
        limit: params?.limit || 10,
        total: response.data?.totalItems || 0,
        totalPages: response.data?.totalPages || 1,
      },
    };
  }

  /**
   * Lấy học kỳ hiện tại đang hoạt động
   */
  static async getActiveSemester(): Promise<{
    success: boolean;
    data: Semester | null;
  }> {
    const response = await apiClient.get(`${this.BASE_URL}/active`);
    return {
      success: true,
      data: response.data || null,
    };
  }

  /**
   * Lấy danh sách học kỳ theo Khóa đào tạo
   */
  static async getSemestersByBatch(batchId: number): Promise<{
    success: boolean;
    data: Semester[];
  }> {
    // Dùng endpoint full-details để lấy đầy đủ thông tin bao gồm is_active
    const response = await apiClient.get(
      `/training-batches/${batchId}/full-details`
    );
    // API trả về { success: true, data: { Semesters: [...] } }
    return {
      success: true,
      data: response.data?.Semesters || [],
    };
  }

  /**
   * Tạo học kỳ mới
   */
  static async createSemester(data: CreateSemesterRequest): Promise<{
    success: boolean;
    data: Semester;
  }> {
    const response = await apiClient.post("/semesters", data);
    return {
      success: true,
      data: response.data,
    };
  }

  /**
   * Kích hoạt học kỳ (chỉ 1 học kỳ active cùng lúc)
   */
  static async activateSemester(id: number): Promise<{
    success: boolean;
    data: Semester;
  }> {
    const response = await apiClient.post(`/semesters/${id}/activate`);
    return {
      success: true,
      data: response.data,
    };
  }

  /**
   * Lấy thống kê học kỳ
   */
  static async getSemesterStatistics(id: number): Promise<SemesterStatistics> {
    const response = await apiClient.get(`/semesters/${id}/statistics`);
    return response.data;
  }

  /**
   * Cập nhật thông tin học kỳ
   */
  static async updateSemester(
    id: number,
    data: Partial<CreateSemesterRequest>
  ): Promise<{
    success: boolean;
    data: Semester;
  }> {
    const response = await apiClient.put(`/semesters/${id}`, data);
    return {
      success: true,
      data: response.data,
    };
  }

  /**
   * Xóa học kỳ
   */
  static async deleteSemester(id: number): Promise<{
    success: boolean;
  }> {
    await apiClient.delete(`/semesters/${id}`);
    return {
      success: true,
    };
  }
}
