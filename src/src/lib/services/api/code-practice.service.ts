import api from "./client";

export interface CodePracticeQuestion {
  question_id: number;
  question_text: string;
  level?: {
    name: string;
    level_id: number;
  };
  question_type?: {
    name: string;
    question_type_id: number;
  };
  MediaFiles?: Array<{
    media_id: number;
    file_url: string;
    file_type: string;
    owner_type: "question" | "answer";
    owner_id: number;
  }>;
  validation_rules?: {
    language?: string;
    test_cases?: Array<{
      input: string;
      expected: string;
      description?: string;
    }>;
  };
  hints?: string[];
  tags?: string[];
  time_limit?: number;
  explanation?: string;
}

export interface CodePracticeQuiz {
  quiz_id: number;
  name: string;
  course_id: number;
  course_name?: string;
  subject_id?: number;
  subject_name?: string;
  duration: number;
  status: "active" | "pending" | "finished" | "draft" | "completed";
  quiz_mode: "code_practice";
  pin: string;
  start_time: string | null;
  end_time: string | null;
  update_time: string;
  question_count: number;
  code_config?: {
    allow_multiple_submissions?: boolean;
    show_test_results?: boolean;
    enable_ai_analysis?: boolean;
    time_limit_per_question?: number;
    allowed_languages?: string[];
    auto_save_interval?: number;
    show_hints_after_attempts?: number;
  };
  questions?: CodePracticeQuestion[];
}

export interface CodePracticeListResponse {
  message: string;
  quizzes: CodePracticeQuiz[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const codePracticeService = {
  // Lấy danh sách quiz luyện code
  getCodePracticeQuizzes: async (params?: {
    course_id?: number;
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
    sort_by?: string;
    sort_order?: "ASC" | "DESC";
  }): Promise<CodePracticeListResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.course_id)
      queryParams.append("course_id", params.course_id.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const url = `/quizzes/code-practice?${queryParams.toString()}`;

    const response = await api.get(url);

    console.log("🔍 [CodePracticeService] Raw response:", response.data);

    // Backend response format: { success: true, data: { message, quizzes, pagination } }
    if (response.data?.success && response.data?.data) {
      console.log("✅ [CodePracticeService] Using nested data format");
      return response.data.data;
    }

    // Fallback for direct data format
    if (response.data?.quizzes) {
      console.log("✅ [CodePracticeService] Using direct data format");
      return response.data;
    }

    console.error(
      "❌ [CodePracticeService] Invalid response format:",
      response.data
    );
    throw new Error("Invalid response format from server");
  },

  // Lấy chi tiết quiz luyện code
  getCodePracticeQuizDetail: async (quizId: number) => {
    const response = await api.get(`/quizzes/${quizId}`);

    // Handle nested response
    if (response.data?.quiz) {
      return response.data.quiz;
    }

    if (response.data?.data?.quiz) {
      return response.data.data.quiz;
    }

    return response.data;
  },
};

export default codePracticeService;
