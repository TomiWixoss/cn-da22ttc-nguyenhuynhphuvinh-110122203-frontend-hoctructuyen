import api from "./client";

export interface AssignmentDetail {
  assignment_id: number;
  teacher_id: number;
  subject_id: number;
  semester_id: number;
  batch_id?: number; // Thêm batch_id vào response của assignment
  program_id?: number; // Thêm program_id từ backend
  Teacher: {
    user_id: number;
    name: string;
    email: string;
  };
  Subject: {
    subject_id: number;
    name: string;
    description?: string;
    Program?: {
      program_id: number;
      name: string;
      description?: string;
    };
  };
  Semester: {
    semester_id: number;
    name: string;
    start_date: string;
    end_date: string;
  };
  Courses: Array<{
    course_id: number;
    name: string;
    description?: string;
    Teacher: {
      user_id: number;
      name: string;
    };
  }>;
}

export interface CreateCourseFromAssignmentRequest {
  name: string;
  description?: string;
  batch_id: number; // Thay đổi từ program_id sang batch_id
  start_date?: string;
  end_date?: string;
  clone_from_course_id?: number;
}

export interface CreateCourseFromAssignmentResponse {
  success: boolean;
  message: string;
  data: {
    cloned_course: {
      course_id: number;
      name: string;
      user_id: number;
      subject_id: number;
      semester_id: number;
      assignment_id: number;
      [key: string]: any;
    };
    cloning_summary?: {
      original_course_id?: number;
      original_course_name?: string;
      cloned_quizzes?: number;
      total_questions?: number;
    };
  };
}

export const courseAssignmentService = {
  /**
   * Lấy danh sách khóa học thuộc một phân công
   * API: GET /api/assignments/:id
   */
  getCoursesByAssignment: async (
    assignmentId: number
  ): Promise<{
    success: boolean;
    data: AssignmentDetail;
    message?: string;
  }> => {
    const response = await api.get<{
      success: boolean;
      data: AssignmentDetail;
      message?: string;
    }>(`/assignments/${assignmentId}`);
    return response.data;
  },

  /**
   * Tạo khóa học từ phân công
   * API: POST /api/courses/from-assignment/:assignment_id
   */
  createCourseFromAssignment: async (
    assignmentId: number,
    courseData: CreateCourseFromAssignmentRequest
  ): Promise<CreateCourseFromAssignmentResponse> => {
    const response = await api.post<CreateCourseFromAssignmentResponse>(
      `/courses/from-assignment/${assignmentId}`,
      courseData
    );
    return response.data;
  },

  /**
   * Chỉnh sửa khóa học (API tiêu chuẩn)
   * API: PUT /api/courses/:id
   */
  updateCourse: async (
    courseId: number,
    courseData: {
      name?: string;
      description?: string;
      start_date?: string;
      end_date?: string;
    }
  ): Promise<{
    success: boolean;
    data: any;
    message?: string;
  }> => {
    const response = await api.put<{
      success: boolean;
      data: any;
      message?: string;
    }>(`/courses/${courseId}`, courseData);
    return response.data;
  },
};

export default courseAssignmentService;
