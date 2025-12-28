import api from "./client";

// Types
export interface ChatMessage {
  id: number;
  role: "user" | "model";
  message: string;
  created_at: string;
}

export interface ChatResponse {
  message: string;
  session_id: string;
  history_length?: number;
}

export interface QuickHelpResponse {
  message: string;
}

export interface ExplainResponse {
  explanation: string;
  related_concepts: string[];
}

export interface HintResponse {
  hint: string;
  hint_level: number;
  max_hints: number;
}

export interface ReviewResult {
  overall: string;
  strengths: string[];
  improvements: string[];
  score: number;
}

export interface ReviewResponse {
  review: ReviewResult;
}

export interface MySummary {
  concepts_learned: string[];
  concepts_struggling: string[];
  progress_summary: string;
  next_steps: string[];
  encouragement: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  frequency: number;
}

export interface ChatRequest {
  message: string;
  question_id: number;
  code?: string;
  error?: string;
}

export interface QuickHelpRequest {
  question: string;
  question_id?: number;
  code?: string;
  language?: string;
}

export interface ExplainRequest {
  concept: string;
  question_id: number;
}

export interface HintRequest {
  question_id: number;
  code: string;
  hint_level?: number;
}

export interface ReviewRequest {
  question_id: number;
  code: string;
}

// Service
const aiTutorService = {
  // ==================== Chat APIs ====================

  /**
   * Chat tự do với AI Tutor
   */
  chat: async (data: ChatRequest): Promise<ChatResponse> => {
    const response = await api.post("/ai-tutor/chat", data);
    return response.data.data;
  },

  /**
   * Trợ giúp nhanh - phân tích code và lỗi
   */
  quickHelp: async (data: QuickHelpRequest): Promise<QuickHelpResponse> => {
    const response = await api.post("/ai-tutor/quick-help", data);
    return response.data.data;
  },

  /**
   * Giải thích khái niệm
   */
  explain: async (data: ExplainRequest): Promise<ExplainResponse> => {
    const response = await api.post("/ai-tutor/explain", data);
    return response.data.data;
  },

  /**
   * Lấy gợi ý từng bước
   */
  hint: async (data: HintRequest): Promise<HintResponse> => {
    const response = await api.post("/ai-tutor/hint", data);
    return response.data.data;
  },

  /**
   * Review code
   */
  review: async (data: ReviewRequest): Promise<ReviewResponse> => {
    const response = await api.post("/ai-tutor/review", data);
    return response.data.data;
  },

  /**
   * Lấy lịch sử chat
   */
  getHistory: async (
    questionId: number,
    limit = 50
  ): Promise<{ history: ChatMessage[]; total: number }> => {
    const response = await api.get(
      `/ai-tutor/history?question_id=${questionId}&limit=${limit}`
    );
    // API trả về { messages, count }, map sang { history, total }
    const data = response.data.data;
    return {
      history: data.messages || [],
      total: data.count || 0,
    };
  },

  /**
   * Xóa lịch sử chat
   */
  clearHistory: async (questionId?: number): Promise<void> => {
    await api.post("/ai-tutor/clear-history", {
      question_id: questionId,
    });
  },

  // ==================== Student Analytics ====================

  /**
   * Lấy tóm tắt học tập của sinh viên
   */
  getMySummary: async (
    questionId?: number
  ): Promise<{ summary: MySummary }> => {
    const url = questionId
      ? `/ai-tutor/analytics/my-summary?question_id=${questionId}`
      : "/ai-tutor/analytics/my-summary";
    const response = await api.get(url);
    return response.data.data;
  },

  /**
   * Lấy gợi ý ôn tập
   */
  getMyReview: async () => {
    const response = await api.get("/ai-tutor/analytics/my-review");
    return response.data.data;
  },

  /**
   * Lấy thống kê hoạt động
   */
  getMyActivity: async (days = 30) => {
    const response = await api.get(
      `/ai-tutor/analytics/my-activity?days=${days}`
    );
    return response.data.data;
  },

  // ==================== FAQ (All users) ====================

  /**
   * Lấy FAQ cho câu hỏi
   */
  getFAQ: async (
    questionId: number,
    limit = 5
  ): Promise<{ faq: FAQItem[] }> => {
    const response = await api.get(
      `/ai-tutor/analytics/question/${questionId}/faq?limit=${limit}`
    );
    return response.data.data;
  },

  // ==================== Teacher Analytics ====================

  /**
   * Thống kê chat theo câu hỏi (Teacher only)
   */
  getQuestionStats: async (questionId: number): Promise<QuestionStats> => {
    const response = await api.get(
      `/ai-tutor/analytics/question/${questionId}/stats`
    );
    return response.data.data;
  },

  /**
   * Phân tích chủ đề hay thắc mắc (Teacher only)
   */
  getQuestionTopics: async (
    questionId: number,
    limit = 10
  ): Promise<QuestionTopics> => {
    const response = await api.get(
      `/ai-tutor/analytics/question/${questionId}/topics?limit=${limit}`
    );
    return response.data.data;
  },

  /**
   * Sinh viên cần hỗ trợ (Teacher only)
   */
  getStudentsNeedHelp: async (
    questionId: number,
    threshold = 8
  ): Promise<StudentsNeedHelp> => {
    const response = await api.get(
      `/ai-tutor/analytics/question/${questionId}/need-help?threshold=${threshold}`
    );
    return response.data.data;
  },

  /**
   * Đánh giá độ khó bài tập (Teacher only)
   */
  getQuestionDifficulty: async (
    questionId: number
  ): Promise<QuestionDifficulty> => {
    const response = await api.get(
      `/ai-tutor/analytics/question/${questionId}/difficulty`
    );
    return response.data.data;
  },
};

// ==================== Teacher Analytics Types ====================

export interface StudentChatInfo {
  user_id: number;
  name: string;
  email: string;
  message_count: number;
  session_count: number;
  first_chat: string;
  last_chat: string;
  needs_attention: boolean;
}

export interface QuestionStats {
  question_id: number;
  total_messages: number;
  unique_students: number;
  avg_messages_per_student: number;
  students: StudentChatInfo[];
}

export interface TopicItem {
  topic: string;
  frequency: number;
  percentage: number;
}

export interface QuestionTopics {
  question_id: number;
  topics: TopicItem[];
  ai_insight: string;
}

export interface StudentNeedHelp {
  user_id: number;
  name: string;
  email: string;
  message_count: number;
  main_struggles: string[];
  last_active: string;
}

export interface StudentsNeedHelp {
  question_id: number;
  threshold: number;
  students_needing_help: StudentNeedHelp[];
}

export interface DifficultyMetrics {
  total_students: number;
  avg_messages_per_student: number;
  students_needing_help: number;
  help_rate: number;
}

export interface QuestionDifficulty {
  question_id: number;
  difficulty: "easy" | "medium" | "hard";
  difficulty_score: number;
  metrics: DifficultyMetrics;
  recommendation: string;
}

export default aiTutorService;
