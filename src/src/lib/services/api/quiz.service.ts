import api from "./client";
import {
  CreateQuizFormData,
  JoinQuizData,
  QuizModeInfo,
  QuizMode,
} from "@/lib/types/quiz";
import {
  ChoiceStatsResponse,
  LiveChoiceStatsResponse,
  ChoiceStatsSummaryResponse,
} from "@/lib/types/answer-choice-stats";

export const quizService = {
  // Lấy danh sách bài kiểm tra
  getQuizzes: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    course_id?: number;
    search?: string;
    sort_by?: string;
    sort_order?: "ASC" | "DESC";
  }) => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.course_id)
      queryParams.append("course_id", params.course_id.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    const url = queryParams.toString()
      ? `/quizzes?${queryParams.toString()}`
      : "/quizzes";
    const response = await api.get(url);
    return response.data;
  },

  // Lấy chi tiết bài kiểm tra
  getQuizById: async (quizId: number) => {
    const response = await api.get(`/quizzes/${quizId}`);
    return response.data;
  },

  // Tạo bài kiểm tra mới
  createQuiz: async (quizData: CreateQuizFormData) => {
    const response = await api.post("/quizzes", quizData);
    return response.data;
  },

  // Cập nhật bài kiểm tra
  updateQuiz: async (quizId: number, quizData: Partial<CreateQuizFormData>) => {
    const response = await api.put(`/quizzes/${quizId}`, quizData);
    return response.data;
  },

  // Xóa bài kiểm tra
  deleteQuiz: async (quizId: number) => {
    try {
      const response = await api.delete(`/quizzes/${quizId}`);
      return response.data;
    } catch (error: any) {
      // Xử lý trường hợp đặc biệt: server trả về 404 nhưng quiz đã được xóa thành công
      if (
        error.response?.status === 404 &&
        error.response?.data?.message === "Quiz deleted successfully"
      ) {
        return {
          success: true,
          message: "Quiz deleted successfully",
          data: error.response.data,
        };
      }
      throw error;
    }
  },

  // Bắt đầu bài kiểm tra
  startQuiz: async (quizId: number) => {
    const response = await api.post(`/quizzes/${quizId}/start`);
    return response.data;
  },

  // Bắt đầu bài kiểm tra tự động chạy qua tất cả câu hỏi
  startAutoQuiz: async (quizId: number) => {
    const response = await api.post(`/quizzes/${quizId}/auto`);
    return response.data;
  },

  // Lấy danh sách câu hỏi của bài kiểm tra
  getQuizQuestions: async (quizId: number) => {
    const response = await api.get(`/quizzes/${quizId}/questions`);
    return response.data;
  },

  // Trộn lại câu hỏi của bài kiểm tra (sử dụng endpoint duplicate)
  reshuffleQuestions: async (quizId: number) => {
    const response = await api.post(`/quizzes/${quizId}/shuffle`);
    return response.data;
  },

  // Lấy danh sách người tham gia quiz
  getQuizParticipants: async (quizId: number) => {
    const response = await api.get(`/quizzes/${quizId}/participants`);
    return response.data;
  },

  // Lấy thống kê quiz realtime
  getQuizStatistics: async (quizId: number) => {
    const response = await api.get(`/quizzes/${quizId}/statistics`);
    return response.data;
  },

  // Lấy điểm số realtime
  getRealtimeScores: async (quizId: number) => {
    const response = await api.get(`/quizzes/${quizId}/realtime-scores`);
    return response.data;
  },

  // Lấy chi tiết học sinh realtime
  getStudentRealtimeData: async (quizId: number, userId: string) => {
    const response = await api.get(
      `/quizzes/${quizId}/students/${userId}/realtime`
    );
    return response.data;
  },

  // Lấy ID bài kiểm tra từ mã PIN
  getQuizIdByPin: async (pin: string) => {
    const response = await api.get(`/quizzes/pin/${pin}`);
    return response.data;
  },

  // Tham gia vào quiz
  joinQuiz: async (quizId: number, joinData: JoinQuizData) => {
    const response = await api.post(`/quizzes/${quizId}/join`, joinData);
    return response.data;
  },

  // Rời khỏi phòng chờ quiz
  leaveQuiz: async (quizId: number) => {
    const response = await api.post(`/quizzes/${quizId}/leave`);
    return response.data;
  },

  // Gửi đáp án realtime
  submitRealtimeAnswer: async (
    quizId: number,
    questionId: number,
    answerId: number,
    startTime: number,
    userId?: number | string,
    showLeaderboardImmediately?: boolean
  ) => {
    const response = await api.post("/quizzes/realtime/answer", {
      quizId,
      questionId,
      answerId,
      startTime,
      userId,
      showLeaderboardImmediately,
    });
    return response.data;
  },

  // Trigger câu hỏi tiếp theo
  triggerNextQuestion: async (quizId: number, currentQuestionIndex: number) => {
    const response = await api.post(`/quizzes/${quizId}/next`, {
      current_question_index: currentQuestionIndex,
    });
    return response.data;
  },

  // Lấy bảng xếp hạng
  getLeaderboard: async (quizId: number) => {
    const response = await api.get(`/quizzes/${quizId}/leaderboard`);
    return response.data;
  },

  // Trigger hiển thị bảng xếp hạng
  showLeaderboard: async (quizId: number) => {
    const response = await api.post(`/quizzes/${quizId}/leaderboard`);
    return response.data;
  },

  // Test trigger hiển thị bảng xếp hạng (không cần auth)
  testShowLeaderboard: async (quizId: number) => {
    const response = await api.post(`/quizzes/${quizId}/test-leaderboard`);
    return response.data;
  },

  // Lấy kết quả bài kiểm tra của người dùng hiện tại
  getCurrentUserQuizResults: async (userId: number) => {
    try {
      const response = await api.get(`/quiz-results/user/${userId}`);

      if (Array.isArray(response.data)) {
        response.data.forEach((result, index) => {});
      }

      return response.data;
    } catch (error) {
      console.error(
        `❌ [DEBUG] Error in getCurrentUserQuizResults for userId ${userId}:`,
        error
      );
      throw error;
    }
  },

  // Lấy chi tiết kết quả bài kiểm tra
  getQuizResultById: async (resultId: number) => {
    const response = await api.get(`/quiz-results/${resultId}`);
    return response.data;
  },

  // Lấy danh sách bài kiểm tra đã hoàn thành của người dùng
  getCompletedQuizzes: async (userId: number) => {
    const response = await api.get(`/quiz-results/user/${userId}/completed`);
    return response.data;
  },

  // Lấy kết quả quiz theo quiz_id (dành cho admin và giáo viên)
  getQuizResultsByQuizId: async (quizId: number) => {
    const response = await api.get(`/quiz-results/quiz/${quizId}`);
    return response.data;
  },

  // Radar Chart APIs
  // @deprecated - Use chapterAnalyticsService.getDetailedAnalysis instead
  // Lấy dữ liệu radar chart cho người dùng hiện tại
  getCurrentUserRadarData: async (quizId: number) => {
    console.warn(
      "⚠️ DEPRECATED: getCurrentUserRadarData is deprecated. " +
        "Please use chapterAnalyticsService.getDetailedAnalysis for chapter-based analytics. " +
        "Migration guide: docs/migration/radar-to-chapter-analytics.md"
    );
    const response = await api.get(
      `/quiz-results/quiz/${quizId}/radar/current-user`
    );
    return response.data;
  },

  // @deprecated - Use chapterAnalyticsService.getComprehensiveAnalysis instead
  // Lấy dữ liệu radar chart trung bình
  getAverageRadarData: async (quizId: number) => {
    console.warn(
      "⚠️ DEPRECATED: getAverageRadarData is deprecated. " +
        "Please use chapterAnalyticsService.getComprehensiveAnalysis for chapter-based analytics. " +
        "Migration guide: docs/migration/radar-to-chapter-analytics.md"
    );
    const response = await api.get(
      `/quiz-results/quiz/${quizId}/radar/average`
    );
    return response.data;
  },

  // @deprecated - Use chapterAnalyticsService.getTeacherAnalytics instead
  // Lấy dữ liệu radar chart của top performer
  getTopPerformerRadarData: async (quizId: number) => {
    console.warn(
      "⚠️ DEPRECATED: getTopPerformerRadarData is deprecated. " +
        "Please use chapterAnalyticsService.getTeacherAnalytics for comprehensive teacher analytics. " +
        "Migration guide: docs/migration/radar-to-chapter-analytics.md"
    );
    const response = await api.get(
      `/quiz-results/quiz/${quizId}/radar/top-performer`
    );
    return response.data;
  },

  // @deprecated - Use chapterAnalyticsService methods instead
  // Lấy tất cả dữ liệu radar chart (API tổng hợp)
  getAllRadarData: async (quizId: number) => {
    console.warn(
      "⚠️ DEPRECATED: getAllRadarData is deprecated. " +
        "Please use chapterAnalyticsService.getDetailedAnalysis, getComprehensiveAnalysis, or getTeacherAnalytics " +
        "for chapter-based analytics. Migration guide: docs/migration/radar-to-chapter-analytics.md"
    );
    const response = await api.get(`/quiz-results/quiz/${quizId}/radar/all`);
    return response.data;
  },

  // Lấy quiz result kèm chương và section theo từng LO
  getQuizResultWithChapters: async (resultId: number) => {
    const response = await api.get(`/quiz-results/${resultId}/chapters`);
    return response.data;
  },

  // Lấy quiz result theo quiz_id và user_id
  getQuizResultByQuizAndUser: async (quizId: number, userId: number) => {
    const response = await api.get(
      `/quiz-results/quiz-user?quiz_id=${quizId}&user_id=${userId}`
    );
    return response.data;
  },

  // Lấy quiz result chi tiết kèm chương/section theo quiz_id và user_id
  getQuizResultWithChaptersByQuizAndUser: async (
    quizId: number,
    userId: number
  ) => {
    const response = await api.get(
      `/quiz-results/quiz-user/chapters?quiz_id=${quizId}&user_id=${userId}`
    );
    return response.data;
  },

  // Đề xuất điểm yếu theo LO và hiển thị chương liên quan
  getWeakestLOWithChapters: async (quizId: number, userId: number) => {
    const response = await api.get(
      `/quiz-results/weakest-lo?quiz_id=${quizId}&user_id=${userId}`
    );
    return response.data;
  },

  // API phân tích cải thiện - lấy độ khó yếu nhất và gợi ý chapter
  getImprovementAnalysis: async (params: {
    quiz_id?: number;
    course_id?: number;
    user_id?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params.quiz_id)
      queryParams.append("quiz_id", params.quiz_id.toString());
    if (params.course_id)
      queryParams.append("course_id", params.course_id.toString());
    if (params.user_id)
      queryParams.append("user_id", params.user_id.toString());

    const response = await api.get(
      `/quiz-results/improvement-analysis?${queryParams}`
    );
    return response.data;
  },

  // API phân tích hiệu suất student cho 1 quiz cụ thể - trả về câu sai theo LO với thông tin chương
  getStudentQuizPerformance: async (params: {
    quiz_id: number;
    user_id: number;
  }) => {
    const queryParams = new URLSearchParams();
    queryParams.append("quiz_id", params.quiz_id.toString());
    queryParams.append("user_id", params.user_id.toString());

    const response = await api.get(
      `/advanced-analytics/quiz/student-performance?${queryParams}`
    );
    return response.data;
  },

  // === ENHANCED QUIZ ANALYSIS APIs ===

  // Phân tích chi tiết quiz với LO completion analysis
  getDetailedQuizAnalysis: async (params: {
    quiz_id: number;
    user_id: number;
  }) => {
    const { quiz_id, user_id } = params;
    const response = await api.get(
      `/quiz-results/detailed-analysis/${quiz_id}/${user_id}`
    );
    return response.data;
  },

  // Lấy thông tin quiz mode
  getQuizModeInfo: async (quizId: number): Promise<QuizModeInfo> => {
    const response = await api.get(`/quiz-modes/${quizId}/info`);
    return response.data.data;
  },

  // Đổi chế độ quiz
  switchQuizMode: async (quizId: number, newMode: QuizMode) => {
    const response = await api.put(`/quiz-modes/${quizId}/update`, {
      quiz_mode: newMode,
    });
    return response.data;
  },

  // Lấy chi tiết câu hỏi với đáp án
  getQuestionById: async (questionId: number) => {
    const response = await api.get(`/questions/${questionId}`);
    return response.data;
  },

  // Clone bài kiểm tra
  cloneQuiz: async (
    quizId: number,
    cloneOptions?: {
      new_name?: string;
      new_course_id?: number;
      clone_questions?: boolean;
      clone_settings?: boolean;
      clone_mode_config?: boolean;
      reset_pin?: boolean;
      reset_status?: boolean;
    }
  ) => {
    const response = await api.post(
      `/quizzes/${quizId}/clone`,
      cloneOptions || {}
    );
    return response.data;
  },

  // === QUIZ MODE FILTER APIs ===

  // Lấy danh sách quiz theo mode (assessment hoặc practice)
  getQuizzesByMode: async (
    mode: "assessment" | "practice",
    params?: {
      page?: number;
      limit?: number;
      course_id?: number;
      status?: string;
      search?: string;
      sort_by?: string;
      sort_order?: "ASC" | "DESC";
    }
  ) => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.course_id)
      queryParams.append("course_id", params.course_id.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    const url = queryParams.toString()
      ? `/quizzes/mode/${mode}?${queryParams.toString()}`
      : `/quizzes/mode/${mode}`;

    const response = await api.get(url);
    return response.data;
  },

  // Lấy danh sách quiz theo course và mode
  getQuizzesByCourseAndMode: async (
    courseId: number,
    mode: "assessment" | "practice",
    params?: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
      sort_by?: string;
      sort_order?: "ASC" | "DESC";
    }
  ) => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    const url = queryParams.toString()
      ? `/quizzes/course/${courseId}/mode/${mode}?${queryParams.toString()}`
      : `/quizzes/course/${courseId}/mode/${mode}`;

    const response = await api.get(url);
    return response.data;
  },

  // === ANSWER CHOICE STATISTICS APIs ===

  // Lấy thống kê lựa chọn đáp án cho 1 câu hỏi cụ thể
  getQuestionChoiceStats: async (
    quizId: number,
    questionId: number
  ): Promise<ChoiceStatsResponse> => {
    const response = await api.get(
      `/quizzes/${quizId}/question/${questionId}/choice-stats`
    );
    return response.data;
  },

  // Lấy tóm tắt thống kê lựa chọn đáp án cho toàn bộ quiz
  getQuizChoiceStatsSummary: async (
    quizId: number
  ): Promise<ChoiceStatsSummaryResponse> => {
    const response = await api.get(`/quizzes/${quizId}/choice-stats-summary`);
    return response.data;
  },

  // Lấy thống kê lựa chọn đáp án real-time cho tất cả câu hỏi trong quiz
  getLiveChoiceStats: async (
    quizId: number
  ): Promise<LiveChoiceStatsResponse> => {
    const response = await api.get(`/quizzes/${quizId}/live-choice-stats`);
    return response.data;
  },

  // Xóa thống kê lựa chọn đáp án cho 1 câu hỏi (chỉ teacher)
  clearQuestionChoiceStats: async (quizId: number, questionId: number) => {
    const response = await api.delete(
      `/quizzes/${quizId}/question/${questionId}/choice-stats`
    );
    return response.data;
  },

  // Xóa tất cả thống kê lựa chọn đáp án của quiz (chỉ teacher)
  clearQuizChoiceStats: async (quizId: number) => {
    const response = await api.delete(`/quizzes/${quizId}/choice-stats`);
    return response.data;
  },

  // Nộp bài cho chế độ đánh giá (assessment)
  submitQuiz: async (quizId: number) => {
    const response = await api.post(`/quizzes/${quizId}/submit`);
    return response.data;
  },

  // === TEACHER DASHBOARD APIs (Phase 1) ===

  // Lấy toàn bộ dữ liệu dashboard cho giáo viên
  getTeacherDashboard: async (quizId: number) => {
    const response = await api.get(`/quizzes/${quizId}/teacher/dashboard`);
    return response.data;
  },
};

export default quizService;
