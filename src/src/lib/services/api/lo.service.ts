import api from "./client";
import type {
  LOCompletionAnalysisData,
  LOCompletionAnalysisResponse,
  LOCompletionAnalysisParams,
  PersonalizedRecommendations,
  LOAnalysisItem,
} from "@/lib/types/lo-completion-analysis";

// Interface cho tham số phân trang
interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  subject_id?: number;
}

// Cấu trúc dữ liệu LO từ API
export interface LOResponse {
  lo_id: number;
  name: string;
  description?: string;
  subject_id: number;
  created_at: string;
  updated_at: string;
  Subject?: {
    subject_id: number;
    name: string;
  };
  Chapters?: Array<{
    chapter_id: number;
    name: string;
  }>;
  Questions?: Array<{
    question_id: number;
    question_text: string;
  }>;
  _count?: {
    Chapters: number;
    Questions: number;
  };
}

// Response từ API getAllLOs
export interface LOPaginatedResponse {
  success: boolean;
  data: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    los: LOResponse[];
  };
  message?: string;
}

// Response từ API getLOsByCourse (cấu trúc cũ)
export interface LOsByCourseResponse {
  totalItems: number;
  los: LOResponse[];
}

// Response từ API getLOsByCourse với wrapper
export interface LOsByCourseApiResponse {
  success: boolean;
  data: {
    course_id: number;
    learning_outcomes: LOResponse[];
  };
  message?: string;
}

// Import types from the dedicated types file
export type {
  LOCompletionAnalysisParams,
  LOAnalysisItem,
  PersonalizedRecommendations,
} from "@/lib/types/lo-completion-analysis";

// Use the imported type instead of redefining
export type { LOCompletionAnalysisResponse } from "@/lib/types/lo-completion-analysis";

export interface LODetailsResponse {
  success: boolean;
  data: {
    lo_id: number;
    lo_name: string;
    description: string;
    course_id: number;
    chapters: Array<{
      chapter_id: number;
      chapter_name: string;
      sections: Array<{
        section_id: number;
        title: string;
        content_type: "text" | "video" | "exercise";
        has_content: boolean;
        estimated_time: number;
        difficulty_level: "beginner" | "intermediate" | "advanced";
      }>;
    }>;
    prerequisites: Array<{
      lo_id: number;
      lo_name: string;
      completion_required: boolean;
    }>;
    learning_path: Array<{
      step: number;
      description: string;
      estimated_time: number;
    }>;
  };
}

// Service quản lý mục tiêu học tập (Learning Objectives)
export const loService = {
  // Lấy danh sách tất cả mục tiêu học tập (có phân trang)
  getAllLOs: async (
    params: PaginationParams = {}
  ): Promise<LOPaginatedResponse> => {
    const { page = 1, limit = 10, search = "", subject_id } = params;

    // Nếu có subject_id, dùng endpoint chuyên dụng (nhanh hơn 30-70%)
    if (subject_id) {
      try {
        const response = await api.get(`/los/by-subject/${subject_id}`, {
          params: { page, limit, search, include_questions: false },
        });
        return response.data;
      } catch (error) {
        console.error("❌ [LO API] Error getting LOs by subject:", error);
        throw error;
      }
    }

    // Nếu không có subject_id, dùng endpoint tổng quát
    const queryParams: any = { page, limit, search };
    try {
      const response = await api.get("/los", {
        params: queryParams,
      });
      return response.data;
    } catch (error) {
      console.error("❌ [LO API] Error getting all LOs:", error);
      throw error;
    }
  },

  // Lấy mục tiêu học tập theo ID
  getLOById: async (
    loId: number
  ): Promise<{ success: boolean; data: LOResponse } | LOResponse> => {
    try {
      const response = await api.get(`/los/${loId}`);
      return response.data;
    } catch (error) {
      console.error("❌ [LO API] Error getting LO by ID:", error);
      throw error;
    }
  },

  // Lấy danh sách mục tiêu học tập theo khóa học
  getLOsByCourse: async (courseId: number): Promise<LOsByCourseApiResponse> => {
    try {
      const response = await api.get(`/learning-outcomes/course/${courseId}`);
      return response.data;
    } catch (error) {
      console.error("❌ [LO API] Error getting LOs by course:", error);
      throw error;
    }
  },

  // Tạo mục tiêu học tập mới
  createLO: async (data: {
    subject_id: number;
    name: string;
    description?: string;
    chapter_ids?: number[];
  }): Promise<LOResponse> => {
    const response = await api.post("/los", data);
    return response.data;
  },

  // Cập nhật mục tiêu học tập
  updateLO: async (
    loId: number,
    data: {
      subject_id?: number;
      name?: string;
      description?: string;
      chapter_ids?: number[];
    }
  ): Promise<LOResponse> => {
    const response = await api.put(`/los/${loId}`, data);
    return response.data;
  },

  // Xóa mục tiêu học tập
  deleteLO: async (loId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/los/${loId}`);
    return response.data;
  },

  /**
   * Gán một hoặc nhiều PLO cho một LO
   * API: POST /api/los/:id/plos
   */
  addPLOsToLO: async (loId: number, ploIds: number[]) => {
    const response = await api.post(`/los/${loId}/plos`, {
      plo_ids: ploIds,
    });
    return response.data;
  },

  /**
   * Gỡ một hoặc nhiều PLO khỏi một LO
   * API: DELETE /api/los/:id/plos
   */
  removePLOsFromLO: async (loId: number, ploIds: number[]) => {
    const response = await api.delete(`/los/${loId}/plos`, {
      data: {
        plo_ids: ploIds,
      },
    });
    return response.data;
  },

  // === LO COMPLETION ANALYSIS APIs ===

  // Phân tích LO theo % hoàn thành
  getCompletionAnalysis: async (
    params: LOCompletionAnalysisParams
  ): Promise<LOCompletionAnalysisResponse> => {
    const { course_id, user_id, start_date, end_date } = params;
    const queryParams = new URLSearchParams();

    if (start_date) queryParams.append("start_date", start_date);
    if (end_date) queryParams.append("end_date", end_date);

    const url = queryParams.toString()
      ? `/learning-outcomes/completion-analysis/${course_id}/${user_id}?${queryParams.toString()}`
      : `/learning-outcomes/completion-analysis/${course_id}/${user_id}`;

    const response = await api.get(url);
    return response.data;
  },

  // Lấy chi tiết LO với thông tin chương và sections
  getLODetails: async (loId: number): Promise<LODetailsResponse> => {
    const response = await api.get(`/learning-outcomes/${loId}/details`);
    return response.data;
  },

  // Lấy danh sách LOs theo course (enhanced version)
  getLOsByCourseEnhanced: async (
    courseId: number
  ): Promise<{
    success: boolean;
    data: {
      course_info: {
        course_id: number;
        course_name: string;
        description: string;
      };
      los: Array<{
        lo_id: number;
        lo_name: string;
        description: string;
        chapters: Array<{
          chapter_id: number;
          chapter_name: string;
          section_count: number;
        }>;
        difficulty_level: "beginner" | "intermediate" | "advanced";
        estimated_hours: number;
      }>;
    };
  }> => {
    try {
      const response = await api.get(`/learning-outcomes/course/${courseId}`);
      return response.data;
    } catch (error) {
      console.error(
        "❌ [LO API] Error getting LOs by course (enhanced):",
        error
      );
      throw error;
    }
  },

  // Lấy danh sách LOs theo subject với option include questions
  getLOsBySubject: async (
    subjectId: number,
    includeQuestions: boolean = false,
    page: number = 1,
    limit: number = 9999 // Default lấy tất cả
  ): Promise<{
    success: boolean;
    message?: string;
    method?: string;
    performance?: {
      query_time_ms: number;
      query_method: string;
      optimized: boolean;
    };
    data: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      subject: {
        subject_id: number;
        name: string;
        description?: string;
      };
      statistics?: any;
      los: Array<
        LOResponse & {
          question_count: number;
          chapter_count: number;
          has_direct_subject_relation: boolean;
          Questions?: Array<{
            question_id: number;
            question_text: string;
            level_id?: number;
            question_type_id?: number;
            explanation?: string;
            QuestionType?: {
              question_type_id: number;
              name: string;
            };
            Level?: {
              level_id: number;
              name: string;
            };
            Answers?: Array<{
              answer_id: number;
              answer_text: string;
              is_correct: boolean;
            }>;
          }>;
        }
      >;
    };
  }> => {
    const queryParams = new URLSearchParams();
    if (includeQuestions) {
      queryParams.append("include_questions", "true");
    }
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());

    const url = `/los/by-subject/${subjectId}?${queryParams.toString()}`;

    try {
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("❌ [LO API] Error getting LOs by subject:", error);
      throw error;
    }
  },
};

export default loService;
