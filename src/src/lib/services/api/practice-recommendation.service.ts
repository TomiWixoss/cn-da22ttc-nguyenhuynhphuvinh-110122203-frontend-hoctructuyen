import api from "./client";
import { API_ERROR_MESSAGES } from "@/lib/constants";

// Types cho Practice Recommendation API
export interface PracticeRecommendation {
  lo_id: number;
  lo_name: string;
  lo_description: string;
  subject_name: string;
  chapter_name: string;
  level_name: string;
  statistics: {
    accuracy_percentage: number;
    total_attempts: number;
    correct_attempts: number;
    average_time_spent: number;
    difficulty_score: number;
  };
  priority: "urgent" | "high" | "medium" | "low";
  recommendation_type: string;
  improvement_actions: string[];
  estimated_time_minutes: number;
}

export interface PracticeRecommendationSummary {
  urgent_count: number;
  high_priority_count: number;
  avg_accuracy: number;
  total_estimated_time: number;
}

export interface PracticeRecommendationsResponse {
  success: boolean;
  data: {
    course_id: string;
    total_los: number;
    recommendations: PracticeRecommendation[];
    summary: PracticeRecommendationSummary;
  };
  message?: string;
}

export interface PracticeQuestion {
  question_id: number;
  question_text: string;
  question_number: number;
  difficulty: "easy" | "medium" | "hard";
  is_review: boolean;
  answers: Array<{
    answer_id: number;
    answer_text: string;
    is_correct: boolean;
  }>;
}

export interface PracticeQuestionComposition {
  easy: number;
  medium: number;
  hard: number;
}

export interface GeneratePracticeRequest {
  user_id: number;
  course_id: number;
  lo_id?: number;
  difficulty?: "easy" | "medium" | "hard";
  total_questions?: number;
}

export interface GeneratePracticeResponse {
  success: boolean;
  data: {
    quiz_id: string;
    lo_id: number;
    lo_name: string;
    difficulty: "easy" | "medium" | "hard";
    level_name: string;
    total_questions: number;
    new_questions_count: number;
    review_questions_count: number;
    estimated_time_minutes: number;
    questions: PracticeQuestion[];
  };
  message?: string;
}

// MỚI: Interface cho request body của API submit với eggs
export interface SubmitSessionWithEggsRequest {
  quizInfo: {
    quiz_id: number;
    session_start_time: string;
    session_end_time: string;
  };
  performanceData: {
    total_questions: number;
    correct_answers: number;
    incorrect_answers: number;
    total_time_seconds: number;
    score: number;
  };
  baseRewards: {
    syncoin_collected: number;
  };
  eggsToOpen: Array<{
    egg_type: "BASIC" | "CAT" | "DRAGON" | "RAINBOW" | "LEGENDARY";
    is_golden: boolean;
  }>;
}

// DEPRECATED: Interface cũ cho request body của API submit
export interface PracticeSessionSubmission {
  quizInfo: {
    quiz_id: number;
    session_start_time: string;
    session_end_time: string;
  };
  performanceData: Array<{
    question_id: number;
    is_correct: boolean;
    response_time_ms: number;
    attempts: number;
  }>;
  rewardsSummary: {
    total_exp_earned: number;
    total_syncoin_earned: number;
  };
  itemsFromEggs: Array<{
    item_type: "AVATAR" | "FRAME" | "EMOJI";
    item_id: number;
  }>;
}

// MỚI: Interface cho response của API submit với eggs
export interface SubmitSessionWithEggsResponse {
  success: boolean;
  message: string;
  data: {
    session_id: number;
    rewards_summary: {
      total_exp_earned: number;
      total_syncoin_earned: number;
      syncoin_from_gameplay: number;
      syncoin_from_duplicates: number;
    };
    egg_opening_results: Array<{
      egg_type: "BASIC" | "CAT" | "DRAGON" | "RAINBOW" | "LEGENDARY";
      is_golden: boolean;
      reward_type: "item" | "currency";
      item?: {
        item_type: "AVATAR" | "EMOJI";
        item_id: number;
        item_name: string;
        item_code: string;
        image_path: string;
        rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";
        rarity_display: string;
        rarity_color: string;
        rarity_gradient: string;
      };
      syncoin_awarded?: number;
      duplicate_item_info?: {
        item_name: string;
        decomposition_value: number;
      };
    }>;
    level_up: {
      level_up: boolean;
      old_level: number;
      new_level: number;
      new_titles: Array<any>;
      new_badges: Array<any>;
      new_avatar_items: Array<any>;
    } | null;
  };
}

// DEPRECATED: Interface cũ cho response của API submit
export interface PracticeSessionSubmissionResponse {
  success: boolean;
  message: string;
  data: {
    updates_summary: {
      exp_added: number;
      syncoin_added: number;
      new_items_added: number;
      quiz_result_created: boolean;
    };
    new_gamification_state: any;
    new_currency_balances: any;
    new_inventory_items: any[];
    session_summary: any;
  };
}

// --- INTERFACE MỚI CHO API QUẢN LÝ PHIÊN LUYỆN TẬP ---
export interface StartSessionRequest {
  quiz_id: number;
  session_type: "individual";
}

export interface StartSessionResponse {
  success: boolean;
  message: string;
  data: {
    session_info: {
      session_id: number;
      quiz_id: number;
      quiz_name: string;
      status: string;
      session_type: string;
      start_time: string;
      total_questions: number;
    };
  };
}

export interface EndSessionRequest {
  session_id?: number;
  quiz_id?: number;
  reason: "user_terminated" | "user_quit" | "force_end" | "completed";
}

export interface EndSessionResponse {
  success: boolean;
  message: string;
  data: {
    session_info: {
      session_id: number;
      status: string;
      end_reason: string;
    };
  };
}

// --- INTERFACE MỚI CHO API PRACTICE RECOMMENDATIONS (BUG 8) ---
export interface WeakLO {
  lo_id: number;
  lo_name: string;
  accuracy: number;
  correct: number;
  total: number;
}

export interface RecommendedQuiz {
  quiz_id: number;
  quiz_name: string;
  covered_weak_los: number;
  total_weak_los: number;
  coverage_percentage: number;
  total_questions: number;
  relevant_questions: number;
}

export interface PracticeRecommendationByQuizResponse {
  success: boolean;
  message: string;
  data: {
    assessment_quiz_id: string;
    assessment_quiz_name: string;
    score: number;
    weak_los: WeakLO[];
    recommended_quizzes: RecommendedQuiz[];
  };
}

// --- INTERFACE MỚI CHO API AI ANALYSIS (BUG 9) ---
export interface RadarChartData {
  subject: string;
  score: number;
  fullMark: number;
}

export interface AIAnalysisRequest {
  quiz_ids: number[];
  user_id: number;
}

export interface AIAnalysisResponse {
  success: boolean;
  message: string;
  data: {
    radar_chart: RadarChartData[];
    analysis: string;
    summary: {
      total_questions: number;
      correct_answers: number;
      average_accuracy: number;
      strong_areas: string[];
      weak_areas: string[];
    };
  };
}

/**
 * Service quản lý Practice Recommendation & Generation API
 * Cung cấp đề xuất luyện tập cho sinh viên và sinh bộ câu hỏi luyện tập
 */
export const practiceRecommendationService = {
  /**
   * Lấy danh sách đề xuất luyện tập cho sinh viên
   * GET /api/practice/recommendations?courseId={cid}&userId={uid}
   */
  getRecommendations: async (params: {
    user_id: number;
    course_id: number;
  }): Promise<PracticeRecommendationsResponse> => {
    try {
      const { user_id, course_id } = params;

      const response = await api.get<PracticeRecommendationsResponse>(
        "/practice/recommendations",
        {
          params: {
            userId: user_id,
            courseId: course_id,
          },
        }
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Không thể lấy danh sách đề xuất luyện tập"
        );
      }

      return response.data;
    } catch (error) {
      console.error(
        "Practice Recommendation - Get Recommendations Error:",
        error
      );
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        API_ERROR_MESSAGES.SERVER_ERROR ||
          "Không thể lấy danh sách đề xuất luyện tập"
      );
    }
  },

  /**
   * Sinh bộ câu hỏi luyện tập
   * POST /api/practice/generate
   */
  generatePractice: async (
    request: GeneratePracticeRequest
  ): Promise<GeneratePracticeResponse> => {
    try {
      // Convert snake_case to camelCase for backend
      const backendRequest = {
        courseId: request.course_id,
        userId: request.user_id,
        loId: request.lo_id,
        difficulty: request.difficulty,
        totalQuestions: request.total_questions,
      };

      const response = await api.post<GeneratePracticeResponse>(
        "/practice/generate",
        backendRequest
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Không thể sinh bộ câu hỏi luyện tập"
        );
      }

      return response.data;
    } catch (error) {
      console.error(
        "Practice Recommendation - Generate Practice Error:",
        error
      );
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        API_ERROR_MESSAGES.SERVER_ERROR || "Không thể sinh bộ câu hỏi luyện tập"
      );
    }
  },

  /**
   * MỚI: Gửi kết quả phiên luyện tập kèm đập trứng
   * POST /api/practice/submit-with-eggs
   */
  submitSessionWithEggs: async (
    submissionData: SubmitSessionWithEggsRequest
  ): Promise<SubmitSessionWithEggsResponse> => {
    try {
      const response = await api.post<SubmitSessionWithEggsResponse>(
        "/practice/submit-with-eggs",
        submissionData
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Không thể gửi kết quả phiên luyện tập"
        );
      }

      return response.data;
    } catch (error) {
      console.error(
        "Practice Recommendation - Submit Session With Eggs Error:",
        error
      );
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        API_ERROR_MESSAGES.SERVER_ERROR ||
          "Không thể gửi kết quả phiên luyện tập"
      );
    }
  },

  /**
   * DEPRECATED: Gửi kết quả của toàn bộ phiên luyện tập
   * POST /api/practice/submit-session-results
   */
  submitSessionResults: async (
    submissionData: PracticeSessionSubmission
  ): Promise<PracticeSessionSubmissionResponse> => {
    try {
      const response = await api.post<PracticeSessionSubmissionResponse>(
        "/practice/submit-session-results",
        submissionData
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Không thể gửi kết quả phiên luyện tập"
        );
      }

      return response.data;
    } catch (error) {
      console.error(
        "Practice Recommendation - Submit Session Results Error:",
        error
      );
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        API_ERROR_MESSAGES.SERVER_ERROR ||
          "Không thể gửi kết quả phiên luyện tập"
      );
    }
  },

  // --- HÀM MỚI CHO QUẢN LÝ PHIÊN LUYỆN TẬP ---
  /**
   * Bắt đầu một phiên luyện tập cá nhân mới
   * POST /api/practice/start-session
   */
  startIndividualSession: async (
    request: StartSessionRequest
  ): Promise<StartSessionResponse> => {
    try {
      const response = await api.post<StartSessionResponse>(
        "/practice/start-session",
        request
      );
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Không thể bắt đầu phiên luyện tập."
        );
      }
      return response.data;
    } catch (error) {
      console.error("Practice Service - Start Session Error:", error);
      if (error instanceof Error) throw error;
      throw new Error(API_ERROR_MESSAGES.SERVER_ERROR);
    }
  },

  /**
   * Kết thúc một phiên luyện tập cá nhân
   * POST /api/practice/end-session
   */
  endIndividualSession: async (
    request: EndSessionRequest
  ): Promise<EndSessionResponse> => {
    try {
      const response = await api.post<EndSessionResponse>(
        "/practice/end-session",
        request
      );
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Không thể kết thúc phiên luyện tập."
        );
      }
      return response.data;
    } catch (error) {
      console.error("Practice Service - End Session Error:", error);
      if (error instanceof Error) throw error;
      throw new Error(API_ERROR_MESSAGES.SERVER_ERROR);
    }
  },

  // --- HÀM MỚI CHO BUG 8: PRACTICE RECOMMENDATIONS BY QUIZ ---
  /**
   * Lấy gợi ý practice quiz dựa trên LO yếu từ assessment quiz
   * GET /api/practice-recommendations/:quiz_id
   */
  getPracticeRecommendationsByQuiz: async (
    quizId: number
  ): Promise<PracticeRecommendationByQuizResponse> => {
    try {
      const response = await api.get<PracticeRecommendationByQuizResponse>(
        `/practice-recommendations/${quizId}`
      );
      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            "Không thể lấy gợi ý practice quiz từ assessment"
        );
      }
      return response.data;
    } catch (error) {
      console.error(
        "Practice Service - Get Recommendations By Quiz Error:",
        error
      );
      if (error instanceof Error) throw error;
      throw new Error(
        API_ERROR_MESSAGES.SERVER_ERROR ||
          "Không thể lấy gợi ý practice quiz từ assessment"
      );
    }
  },

  // --- HÀM MỚI CHO BUG 9: AI ANALYSIS ---
  /**
   * Lấy phân tích AI cho radar chart từ nhiều quiz
   * POST /api/practice-recommendations/ai-analysis
   */
  getAIAnalysis: async (
    request: AIAnalysisRequest
  ): Promise<AIAnalysisResponse> => {
    try {
      const response = await api.post<AIAnalysisResponse>(
        "/practice-recommendations/ai-analysis",
        request
      );
      if (!response.data.success) {
        throw new Error(response.data.message || "Không thể lấy phân tích AI");
      }
      return response.data;
    } catch (error) {
      console.error("Practice Service - Get AI Analysis Error:", error);
      if (error instanceof Error) throw error;
      throw new Error(
        API_ERROR_MESSAGES.SERVER_ERROR || "Không thể lấy phân tích AI"
      );
    }
  },
};

export default practiceRecommendationService;
