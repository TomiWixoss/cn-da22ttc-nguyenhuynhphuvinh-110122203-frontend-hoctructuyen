import api from "./client";

const apiClient = {
  get: (url: string) => api.get(url).then((res) => res.data),
  post: (url: string, data?: any) =>
    api.post(url, data).then((res) => res.data),
  put: (url: string, data?: any) => api.put(url, data).then((res) => res.data),
  delete: (url: string) => api.delete(url).then((res) => res.data),
};

export interface Teacher {
  user_id: number;
  id?: number; // Alias for backward compatibility
  name: string;
  fullName?: string;
  email: string;
}

export interface Subject {
  subject_id: number;
  id?: number; // Alias for backward compatibility
  name: string;
  code?: string;
  description?: string;
  credits?: number;
}

export interface SubjectForAssignment extends Subject {
  recommended_semester: number;
  is_mandatory: boolean;
  assigned_teacher_id: number | null;
}

export interface SubjectsAndTeachersData {
  batch: {
    batch_id: number;
    name: string;
    program: {
      program_id: number;
      name: string;
    };
  };
  semester: {
    semester_id: number;
    name: string;
    academic_year: string;
  };
  subjects: SubjectForAssignment[];
  teachers: Teacher[];
}

export interface BulkAssignRequest {
  batch_id: number;
  semester_id: number;
  assignments: Array<{
    subject_id: number;
    teacher_id: number;
    note?: string;
    workload_hours?: number;
  }>;
}

export interface BulkAssignResponse {
  success: boolean;
  message: string;
  data: {
    successful: any[];
    failed: any[];
  };
}

export interface TeacherAssignment {
  assignment_id: number;
  teacher_id: number;
  subject_id: number;
  semester_id?: number;
  assigned_by?: number;
  assigned_at?: string;
  is_active?: boolean;
  batch_id?: number; // Thêm batch_id vào đây
  note?: string;
  workload_hours?: number;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
  Teacher?: {
    user_id: number;
    name: string;
    email: string;
  };
  Subject?: {
    subject_id: number;
    name: string;
  };
}

export interface CreateAssignmentRequest {
  teacher_id: number;
  subject_id: number;
  semester_id?: number; // Nếu không có sẽ dùng active semester
  batch_id: number; // Thêm batch_id
  workload_hours?: number;
  note?: string;
}

export interface AssignmentStatistics {
  total_assignments: number;
  total_teachers: number;
  total_subjects: number;
  assignments_by_subject: Array<{
    subject_name: string;
    assignment_count: number;
  }>;
}

export class AssignmentService {
  private static readonly BASE_URL = "/assignments";

  /**
   * Lấy danh sách giáo viên có thể phân công
   */
  static async getAvailableTeachers(): Promise<{
    success: boolean;
    data: Teacher[];
  }> {
    const response = await apiClient.get("/assignments/available/teachers");
    return {
      success: true,
      data: response.data?.teachers || [],
    };
  }

  /**
   * Lấy danh sách môn học có thể phân công
   */
  static async getAvailableSubjects(): Promise<{
    success: boolean;
    data: Subject[];
  }> {
    const response = await apiClient.get("/assignments/available/subjects");
    return {
      success: true,
      data: response.data?.subjects || [],
    };
  }

  /**
   * Tạo phân công mới
   */
  static async createAssignment(data: CreateAssignmentRequest): Promise<{
    success: boolean;
    data: TeacherAssignment;
  }> {
    const response = await apiClient.post("/assignments", data);
    return {
      success: true,
      data: response.data,
    };
  }

  /**
   * Lấy phân công theo học kỳ (admin)
   */
  static async getAssignmentsBySemester(
    semesterId: number,
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<{
    success: boolean;
    data: TeacherAssignment[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    // Lấy data từ /semesters/:id
    const response = await apiClient.get(`/semesters/${semesterId}`);

    // Extract TeacherAssignments từ semester data
    const semester = response.data?.data || response.data;
    let assignments: TeacherAssignment[] = [];
    if (semester && semester.TeacherAssignments) {
      assignments = semester.TeacherAssignments;
    }

    return {
      success: true,
      data: assignments,
      pagination: {
        page: 1,
        limit: assignments.length,
        total: assignments.length,
        totalPages: 1,
      },
    };
  }

  /**
   * Lấy phân công của giáo viên hiện tại
   */
  static async getMyAssignments(): Promise<{
    success: boolean;
    data: TeacherAssignment[];
  }> {
    const response = await apiClient.get("/assignments/my-assignments");
    return {
      success: true,
      data: response.data || [],
    };
  }

  /**
   * Lấy tất cả phân công (Admin only)
   */
  static async getAllAssignments(params?: {
    semester_id?: number;
    teacher_id?: number;
    subject_id?: number;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: TeacherAssignment[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.semester_id)
      queryParams.append("semester_id", params.semester_id.toString());
    if (params?.teacher_id)
      queryParams.append("teacher_id", params.teacher_id.toString());
    if (params?.subject_id)
      queryParams.append("subject_id", params.subject_id.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const url = queryParams.toString()
      ? `${this.BASE_URL}?${queryParams.toString()}`
      : this.BASE_URL;

    return apiClient.get(url);
  }

  /**
   * Lấy thống kê phân công theo học kỳ
   */
  static async getAssignmentStatistics(
    semesterId: number
  ): Promise<AssignmentStatistics> {
    const response = await apiClient.get(
      `/assignments/statistics/semester/${semesterId}`
    );
    return response.data;
  }

  /**
   * Cập nhật phân công
   */
  static async updateAssignment(
    id: number,
    data: Partial<CreateAssignmentRequest>
  ): Promise<{
    success: boolean;
    data: TeacherAssignment;
  }> {
    const response = await apiClient.put(`/assignments/${id}`, data);
    return {
      success: true,
      data: response.data,
    };
  }

  /**
   * Lấy phân công theo id
   */
  static async getAssignmentById(id: number): Promise<{
    success: boolean;
    data: TeacherAssignment;
  }> {
    const response = await apiClient.get(`/assignments/${id}`);
    return {
      success: true,
      data: response.data,
    };
  }

  /**
   * Xóa phân công
   */
  static async deleteAssignment(id: number): Promise<{
    success: boolean;
  }> {
    await apiClient.delete(`/assignments/${id}`);
    return {
      success: true,
    };
  }

  /**
   * Tạo khóa học từ phân công
   */
  static async createCourseFromAssignment(
    assignmentId: number,
    courseData: {
      name?: string;
      description?: string;
    }
  ): Promise<{
    success: boolean;
    data: any; // Course object
    message: string;
  }> {
    return apiClient.post(
      `/courses/from-assignment/${assignmentId}`,
      courseData
    );
  }

  /**
   * Lấy dữ liệu môn học và giáo viên cho ma trận phân công
   */
  static async getSubjectsAndTeachersForAssignment(
    batchId: number,
    semesterId: number
  ): Promise<{ success: boolean; data: SubjectsAndTeachersData }> {
    const response = await apiClient.get(
      `/training-batches/${batchId}/semesters/${semesterId}/subjects-teachers`
    );
    return response;
  }

  /**
   * Gửi dữ liệu phân công hàng loạt
   */
  static async bulkAssignTeachers(
    data: BulkAssignRequest
  ): Promise<BulkAssignResponse> {
    const response = await apiClient.post("/assignments/bulk-assign", data);
    return response;
  }
}
