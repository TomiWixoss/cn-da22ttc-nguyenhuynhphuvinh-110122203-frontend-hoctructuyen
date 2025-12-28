import api from "./client";
import type { User } from "@/lib/types/auth";

// Types cho Student Management
export interface Student {
  id: number;
  username: string;
  email: string;
  fullName: string;
  studentId: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  studentId: string;
}

export interface UpdateStudentRequest {
  username?: string;
  email?: string;
  fullName?: string;
  studentId?: string;
  password?: string;
}

export interface StudentEnrollmentRequest {
  studentId: number;
  courseId: number;
}

export interface BulkEnrollmentRequest {
  studentIds: number[];
  courseId: number;
}

export interface ImportStudentsRequest {
  courseId?: number;
  autoEnroll?: boolean;
}

export interface StudentListResponse {
  success: boolean;
  data: {
    students: Student[];
    pagination: {
      current_page: number;
      per_page: number;
      total_items: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
  message?: string;
}

export interface CourseStudent {
  user_id: number;
  student_code: string;
  student_name: string;
  email: string;
  role?: string;
  enrollment_date: string;
  enrollment_id?: number;
}

export interface CourseStudentsResponse {
  success: boolean;
  data: CourseStudent[];
  message?: string;
}

// Service quản lý sinh viên cho teacher
export const studentManagementService = {
  // === QUẢN LÝ NGƯỜI DÙNG ===

  // Lấy tất cả users (admin only)
  getAllUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }) => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.role) queryParams.append("role", params.role);

    const response = await api.get<StudentListResponse>(
      `/users${queryParams.toString() ? `?${queryParams}` : ""}`
    );
    return response.data;
  },

  // Lấy user theo ID
  getUserById: async (id: number) => {
    const response = await api.get<{
      success: boolean;
      data: Student;
      message?: string;
    }>(`/users/${id}`);
    return response.data;
  },

  // Tạo admin mới (admin only)
  createAdmin: async (userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
  }) => {
    const response = await api.post<{
      success: boolean;
      data: Student;
      message?: string;
    }>("/users/createAdmin", userData);
    return response.data;
  },

  // Tạo teacher mới (admin only)
  createTeacher: async (userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
  }) => {
    const response = await api.post<{
      success: boolean;
      data: Student;
      message?: string;
    }>("/users/createTeacher", userData);
    return response.data;
  },

  // Tạo student mới (admin, teacher)
  createStudent: async (userData: CreateStudentRequest) => {
    // Map frontend data to backend expected format
    const backendData = {
      name: userData.fullName, // Backend expects 'name' not 'fullName'
      email: userData.email,
      password: userData.password,
      // Note: backend doesn't use username and studentId for createStudent
    };

    const response = await api.post<{
      message: string;
      user: {
        user_id: number;
        name: string;
        email: string;
        role: string;
      };
    }>("/users/createStudent", backendData);

    // Transform backend response to match frontend interface
    return {
      success: true,
      data: {
        id: response.data.user.user_id,
        username: userData.username, // Keep original username from form
        email: response.data.user.email,
        fullName: response.data.user.name,
        studentId: userData.studentId, // Keep original studentId from form
        role: response.data.user.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      message: response.data.message,
    };
  },

  // Import students từ Excel/CSV
  importStudents: async (file: File, params?: ImportStudentsRequest) => {
    const formData = new FormData();
    formData.append("file", file);

    if (params?.courseId) {
      formData.append("courseId", params.courseId.toString());
    }
    if (params?.autoEnroll) {
      formData.append("autoEnroll", params.autoEnroll.toString());
    }

    const response = await api.post<{
      success: boolean;
      data: {
        imported: number;
        enrolled?: number;
        errors?: string[];
      };
      message?: string;
    }>("/users/importStudents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Import và enroll students từ Excel/CSV
  importAndEnrollStudents: async (file: File, courseId: number) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<{
      success: boolean;
      data: {
        imported: number;
        enrolled: number;
        errors?: string[];
      };
      message?: string;
    }>(`/users/importAndEnrollStudents?course_id=${courseId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Smart import & enroll students từ Excel/CSV
  smartImportAndEnrollStudents: async (file: File, courseId: number) => {

    const formData = new FormData();
    formData.append("file", file);


    const response = await api.post<{
      message: string;
      processing_summary: {
        existing_users_enrolled: number;
        new_users_created: number;
        skipped_rows: number;
        total_processed: number;
      };
      existing_students: any[];
      new_students: any[];
      skipped_students: any[];
      enrollment_result: {
        course_id: number;
        course_name: string;
        successful_enrollments?: number;
        already_enrolled?: number;
        existing_students_processed?: number;
        new_students_created?: number;
        message?: string;
      };
    }>(`/users/smartImportAndEnrollStudents?course_id=${courseId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });


    // Transform backend response to match frontend interface
    return {
      success: true, // Backend luôn trả về thành công nếu không có lỗi
      data: {
        created: response.data.processing_summary.new_users_created,
        enrolled: response.data.enrollment_result.successful_enrollments || 0,
        skipped: response.data.processing_summary.skipped_rows,
        errors: response.data.skipped_students.map(
          (s: any) => s.reason || "Unknown error"
        ),
      },
      message: response.data.message,
    };
  }, // Cập nhật user
  updateUser: async (id: number, userData: UpdateStudentRequest) => {
    const response = await api.put<{
      success: boolean;
      data: Student;
      message?: string;
    }>(`/users/${id}`, userData);
    return response.data;
  },

  // Xóa user (admin only)
  deleteUser: async (id: number) => {
    const response = await api.delete<{
      success: boolean;
      message?: string;
    }>(`/users/${id}`);
    return response.data;
  },

  // === QUẢN LÝ GIAO VIỆC SINH VIÊN-KHÓA HỌC ===

  // Enroll sinh viên vào course
  enrollStudent: async (enrollment: StudentEnrollmentRequest) => {
    const response = await api.post<{
      success: boolean;
      message?: string;
    }>(`/student-courses/courses/${enrollment.courseId}/enroll`, {
      user_id: enrollment.studentId,
    });
    return response.data;
  },

  // Enroll nhiều sinh viên
  enrollMultipleStudents: async (enrollment: BulkEnrollmentRequest) => {
    const response = await api.post<{
      success: boolean;
      data?: {
        enrolled: number;
        failed: number;
        errors?: string[];
      };
      message?: string;
    }>(`/student-courses/courses/${enrollment.courseId}/enroll-multiple`, {
      student_ids: enrollment.studentIds,
    });
    return response.data;
  },

  // Lấy danh sách sinh viên trong course
  getCourseStudents: async (
    courseId: number,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
    }
  ) => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);

    const response = await api.get<{
      success: boolean;
      data: {
        course_info: {
          course_id: number;
          course_name: string;
          description?: string;
        };
        students: Array<{
          user_id: number;
          student_code: string;
          student_name: string;
          email: string;
          role?: string;
          enrollment_date: string;
          enrollment_id?: number;
        }>;
        pagination: {
          current_page: number;
          per_page: number;
          total_items: number;
          total_pages: number;
          has_next: boolean;
          has_prev: boolean;
        };
      };
      message?: string;
    }>(
      `/student-courses/courses/${courseId}/students${
        queryParams.toString() ? `?${queryParams}` : ""
      }`
    );
    return response.data;
  },

  // Lấy danh sách course của sinh viên
  getStudentCourses: async (
    studentId: number,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
    }
  ) => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);

    const response = await api.get(
      `/student-courses/student/${studentId}/courses${
        queryParams.toString() ? `?${queryParams}` : ""
      }`
    );
    return response.data;
  },

  // Unenroll sinh viên
  unenrollStudent: async (studentId: number, courseId: number) => {
    const response = await api.delete<{
      success: boolean;
      message?: string;
    }>(`/student-courses/courses/${courseId}/students/${studentId}`);
    return response.data;
  },

  // === TIỆN ÍCH ===

  // Tìm kiếm sinh viên
  searchStudents: async (
    query: string,
    params?: {
      limit?: number;
      excludeCourseId?: number;
    }
  ) => {
    const queryParams = new URLSearchParams();
    queryParams.append("search", query);

    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.excludeCourseId)
      queryParams.append("excludeCourseId", params.excludeCourseId.toString());

    const response = await api.get<{
      success: boolean;
      data: Student[];
      message?: string;
    }>(`/users/search?${queryParams}`);
    return response.data;
  },

  // Lấy template Excel cho import
  downloadImportTemplate: async () => {
    const response = await api.get("/users/import-template", {
      responseType: "blob",
    });

    // Tạo URL để download file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "student_import_template.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Lấy template CSV cho import
  downloadImportTemplateCSV: async () => {
    const response = await api.get("/users/import-template-csv", {
      responseType: "blob",
    });

    // Tạo URL để download file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "student_import_template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default studentManagementService;
