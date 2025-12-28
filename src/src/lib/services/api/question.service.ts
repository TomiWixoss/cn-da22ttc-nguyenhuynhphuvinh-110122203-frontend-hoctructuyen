import api from "./client";
import type {
  Question,
  QuestionWithRelations,
  QuestionListResponse,
  QuestionApiResponse,
  QuestionCreateRequest,
  QuestionUpdateRequest,
  QuestionFilterParams,
  QuestionByLOsRequest,
  QuestionBulkDeleteRequest,
  QuestionTypeListResponse,
  LevelListResponse,
  QuestionType,
  Level,
  QuestionTypeCreateRequest,
  QuestionTypeUpdateRequest,
  QuizQuestion,
  QuizQuestionCreateRequest,
  QuizQuestionDeleteRequest,
  QuizQuestionReorderRequest,
  QuestionStats,
} from "@/lib/types/question";

export const questionService = {
  // ===== ENHANCED QUESTION MANAGEMENT (WITH MEDIA) =====

  /**
   * Tạo câu hỏi mới với media
   * @param formData - FormData object chứa question_text, answers (JSON), media_files, ...
   */
  createEnhancedQuestion: async (formData: FormData) => {
    const response = await api.post<QuestionApiResponse>(
      "/questions/enhanced",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Cập nhật câu hỏi với media
   * @param questionId - ID của câu hỏi cần cập nhật
   * @param formData - FormData object chứa các trường cần cập nhật
   */
  updateEnhancedQuestion: async (questionId: number, formData: FormData) => {
    const response = await api.put<QuestionApiResponse>(
      `/questions/enhanced/${questionId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // ===== QUESTION MANAGEMENT =====

  // Lấy danh sách questions (đã cập nhật để dùng endpoint mới)
  getQuestions: async (params?: QuestionFilterParams) => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.lo_id) queryParams.append("lo_id", params.lo_id.toString());
    if (params?.level_id)
      queryParams.append("level_id", params.level_id.toString());
    if (params?.question_type_id)
      queryParams.append(
        "question_type_id",
        params.question_type_id.toString()
      );
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    const response = await api.get<QuestionListResponse>(
      `/questions/enhanced${queryParams.toString() ? `?${queryParams}` : ""}`
    );
    return response.data;
  },

  // Lấy chi tiết question theo ID (đã cập nhật để dùng endpoint mới)
  getQuestionById: async (questionId: number) => {
    const response = await api.get<QuestionApiResponse>(
      `/questions/enhanced/${questionId}`
    );
    return response.data;
  },

  // Tạo question mới
  createQuestion: async (questionData: QuestionCreateRequest) => {
    const response = await api.post<QuestionApiResponse>(
      "/questions",
      questionData
    );
    return response.data;
  },

  // Cập nhật question
  updateQuestion: async (
    questionId: number,
    questionData: QuestionUpdateRequest
  ) => {
    const response = await api.put<QuestionApiResponse>(
      `/questions/${questionId}`,
      questionData
    );
    return response.data;
  },

  // Xóa question (đã cập nhật để dùng endpoint mới)
  deleteQuestionById: async (questionId: number) => {
    const response = await api.delete<{
      success: boolean;
      message?: string;
    }>(`/questions/enhanced/${questionId}`);
    return response.data;
  },

  // ===== ANSWER MANAGEMENT =====

  // Tạo answer mới cho question
  createAnswer: async (answerData: {
    question_id: number;
    answer_text: string;
    iscorrect: boolean;
  }) => {
    const response = await api.post<{
      success: boolean;
      data: {
        answer_id: number;
        answer_text: string;
        iscorrect: boolean;
        question_id: number;
      };
      message?: string;
    }>("/answers", answerData);
    return response.data;
  },

  // Cập nhật answer
  updateAnswer: async (
    answerId: number,
    answerData: {
      answer_text: string;
      iscorrect: boolean;
    }
  ) => {
    const response = await api.put<{
      success: boolean;
      data: {
        answer_id: number;
        answer_text: string;
        iscorrect: boolean;
        question_id: number;
      };
      message?: string;
    }>(`/answers/${answerId}`, answerData);
    return response.data;
  },

  // Xóa answer
  deleteAnswer: async (answerId: number) => {
    const response = await api.delete<{
      success: boolean;
      message?: string;
    }>(`/answers/${answerId}`);
    return response.data;
  },

  // Lấy questions theo Learning Outcomes với phân bố độ khó
  getQuestionsByLOs: async (request: QuestionByLOsRequest) => {
    const response = await api.post<{
      success: boolean;
      data: QuestionWithRelations[];
      message?: string;
    }>("/questions/bylos", request);
    return response.data;
  },

  // Bulk delete questions
  deleteMultipleQuestions: async (request: QuestionBulkDeleteRequest) => {
    const response = await api.delete<{
      success: boolean;
      message?: string;
    }>("/questions/bulk", { data: request });
    return response.data;
  },

  // ===== QUESTION TYPE MANAGEMENT =====

  // Lấy danh sách question types
  getQuestionTypes: async (params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const response = await api.get<QuestionTypeListResponse>(
      `/question-types${queryParams.toString() ? `?${queryParams}` : ""}`
    );
    return response.data;
  },

  // Lấy question type theo ID
  getQuestionTypeById: async (questionTypeId: number) => {
    const response = await api.get<{
      success: boolean;
      data: QuestionType;
      message?: string;
    }>(`/question-types/${questionTypeId}`);
    return response.data;
  },

  // Tạo question type mới
  createQuestionType: async (questionTypeData: QuestionTypeCreateRequest) => {
    const response = await api.post<{
      success: boolean;
      data: QuestionType;
      message?: string;
    }>("/question-types", questionTypeData);
    return response.data;
  },

  // Cập nhật question type
  updateQuestionType: async (
    questionTypeId: number,
    questionTypeData: QuestionTypeUpdateRequest
  ) => {
    const response = await api.put<{
      success: boolean;
      data: QuestionType;
      message?: string;
    }>(`/question-types/${questionTypeId}`, questionTypeData);
    return response.data;
  },

  // Xóa question type
  deleteQuestionTypeById: async (questionTypeId: number) => {
    const response = await api.delete<{
      success: boolean;
      message?: string;
    }>(`/question-types/${questionTypeId}`);
    return response.data;
  },

  // ===== LEVEL MANAGEMENT =====

  // Lấy danh sách levels (difficulty levels)
  getLevels: async (params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const response = await api.get<LevelListResponse>(
      `/levels${queryParams.toString() ? `?${queryParams}` : ""}`
    );
    return response.data;
  },

  // ===== QUIZ-QUESTION ASSOCIATION =====

  // Lấy tất cả quiz-question associations
  getQuizQuestions: async () => {
    const response = await api.get<{
      success: boolean;
      data: QuizQuestion[];
      message?: string;
    }>("/quiz-questions");
    return response.data;
  },

  // Lấy quiz-question association cụ thể
  getQuizQuestion: async (quizId: number, questionId: number) => {
    const response = await api.get<{
      success: boolean;
      data: QuizQuestion;
      message?: string;
    }>(`/quiz-questions/${quizId}/${questionId}`);
    return response.data;
  },

  // Thêm questions vào quiz
  addQuestionsToQuiz: async (
    quizId: number,
    request: QuizQuestionCreateRequest
  ) => {
    const response = await api.post<{
      success: boolean;
      message?: string;
    }>(`/quizzes/${quizId}/questions`, request);
    return response.data;
  },

  // Xóa questions khỏi quiz
  removeQuestionsFromQuiz: async (
    quizId: number,
    request: QuizQuestionDeleteRequest
  ) => {
    const response = await api.delete<{
      success: boolean;
      message?: string;
    }>(`/quizzes/${quizId}/questions`, { data: request });
    return response.data;
  },

  // Sắp xếp lại questions trong quiz
  reorderQuestionsInQuiz: async (
    quizId: number,
    request: QuizQuestionReorderRequest
  ) => {
    const response = await api.put<{
      success: boolean;
      message?: string;
    }>(`/quizzes/${quizId}/questions/reorder`, request);
    return response.data;
  },

  // Lấy questions trong một quiz cụ thể
  getQuestionsInQuiz: async (quizId: number) => {
    const response = await api.get<{
      success: boolean;
      data: QuestionWithRelations[];
      message?: string;
    }>(`/quizzes/${quizId}/questions`);
    return response.data;
  },

  // ===== LEARNING OUTCOMES =====

  // Lấy questions theo Learning Outcome ID
  getQuestionsByLO: async (
    loId: number,
    params?: {
      page?: number;
      limit?: number;
    }
  ) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const response = await api.get<{
      success: boolean;
      data: QuestionWithRelations[];
      message?: string;
    }>(
      `/los/${loId}/questions${queryParams.toString() ? `?${queryParams}` : ""}`
    );
    return response.data;
  },

  // ===== TEACHER ANALYTICS =====

  // Lấy questions của quiz theo LO với thông tin học sinh
  getQuizLOQuestions: async (
    quizId: number,
    params: {
      lo_id: number;
      userId?: number;
    }
  ) => {
    const queryParams = new URLSearchParams();
    queryParams.append("lo_id", params.lo_id.toString());
    if (params.userId) queryParams.append("userId", params.userId.toString());

    const response = await api.get<{
      success: boolean;
      data: Array<{
        question_id: number;
        question_text: string;
        answers: Array<{
          answer_id: number;
          answer_text: string;
          iscorrect: boolean;
        }>;
        student_answer?: {
          selected_answer_id: number;
          selected_answer_text: string;
          is_correct: boolean;
          time_spent: number;
          attempt_date: string;
        };
      }>;
      message?: string;
    }>(`/teacher-analytics/quiz/${quizId}/lo-questions?${queryParams}`);
    return response.data;
  },

  // Lấy questions theo độ khó và LO
  getDifficultyLOQuestions: async (
    quizId: number,
    params: {
      lo_id?: number;
      level_id?: number;
    }
  ) => {
    const queryParams = new URLSearchParams();
    if (params.lo_id) queryParams.append("lo_id", params.lo_id.toString());
    if (params.level_id)
      queryParams.append("level_id", params.level_id.toString());

    const response = await api.get<{
      success: boolean;
      data: QuestionWithRelations[];
      message?: string;
    }>(
      `/teacher-analytics/quiz/${quizId}/difficulty-lo-questions?${queryParams}`
    );
    return response.data;
  },

  // ===== IMPORT/EXPORT =====

  // Import questions từ CSV
  importQuestionsFromCSV: async (file: File, subjectId: number) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("subject_id", subjectId.toString());

    const response = await api.post<{
      success: boolean;
      data: {
        totalImported: number;
        errors: Array<{
          row: number;
          message: string;
        }>;
      };
      message?: string;
    }>("/questions/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Import questions từ Excel
  importQuestionsFromExcel: async (file: File, subjectId: number) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("subject_id", subjectId.toString());

    const response = await api.post<{
      success: boolean;
      data: {
        totalImported: number;
        errors: Array<{
          row: number;
          message: string;
        }>;
      };
      message?: string;
    }>("/questions/import-excel", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Import questions từ ZIP (Excel + Media)
  importQuestionsFromZip: async (file: File, subjectId: number) => {
    const formData = new FormData();
    formData.append("zip_file", file);
    formData.append("subject_id", subjectId.toString());

    const response = await api.post<{
      success: boolean;
      data: {
        totalImported: number;
        totalMediaInZip: number;
        totalMediaLinked: number;
        linkedMedia?: Array<{
          questionId: number;
          answerId?: number;
          mediaFile: string;
          type: "question" | "answer";
        }>;
        mediaNotFound?: string[];
        loMapping?: Record<string, number>;
        errors?: Array<{
          row: number;
          error: string;
        }>;
      };
      message?: string;
    }>("/questions/import-from-zip", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // ===== STATISTICS =====

  // Lấy thống kê questions
  getQuestionStatistics: async () => {
    const response = await api.get<{
      success: boolean;
      data: QuestionStats;
      message?: string;
    }>("/questions/statistics");
    return response.data;
  },
};

export default questionService;
