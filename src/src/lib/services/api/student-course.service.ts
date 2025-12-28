import api from "./client";

export interface StudentCourse {
  enrollment_id: number;
  course_id: number;
  course_name: string;
  description?: string;
  start_date: string;
  end_date: string;
  teacher_name?: string;
  teacher_email?: string;
  program_name?: string;
  enrollment_date: string;
}

export interface StudentInfo {
  user_id: number;
  student_name: string;
  email: string;
  student_code: string;
}

export interface StudentCoursesResponse {
  success: boolean;
  message: string;
  data: {
    student_info: StudentInfo;
    courses: StudentCourse[];
    pagination: {
      current_page: number;
      per_page: number;
      total_items: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
}

export const studentCourseService = {
  // Lấy danh sách khóa học của sinh viên
  getCoursesOfStudent: async (
    userId: number,
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

    const response = await api.get<StudentCoursesResponse>(
      `/student-courses/students/${userId}/courses${
        queryParams.toString() ? `?${queryParams}` : ""
      }`
    );
    return response.data;
  },
};

export default studentCourseService;
