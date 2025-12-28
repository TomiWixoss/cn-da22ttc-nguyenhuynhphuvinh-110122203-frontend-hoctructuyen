import api from "./client";

// Types for Code Analytics

// ============ Question Difficulty Types ============
export interface TestCaseAnalytics {
  test_case_id: number;
  description: string;
  pass_rate: number; // Percentage 0-100
  status: "good" | "moderate" | "problematic";
  common_error: string | null;
  common_errors: Array<{
    error: string;
    count: number;
  }>;
}

export interface QuestionDifficultyData {
  question_id: number;
  question_text: string;
  difficulty_rating: "easy" | "medium" | "hard";
  test_cases_analytics: TestCaseAnalytics[];
  teacher_action_item: string;
  // Legacy fields
  overall?: {
    total_students_attempted: number;
    avg_pass_rate: number;
    avg_attempts: number;
    difficulty_rating: "easy" | "medium" | "hard";
  };
  test_cases?: TestCaseAnalytics[];
  recommendations?: Recommendation[];
}

export interface Recommendation {
  priority: "high" | "medium" | "low";
  message: string;
  category?: string;
  action:
    | "add_hints"
    | "review_code_config"
    | "adjust_difficulty"
    | "add_test_case";
  test_case_id?: number;
}

// ============ Course Overview Types ============
export interface CourseOverviewParams {
  id: number;
  type?: "quiz" | "course" | "subject";
}

export interface QuizInfo {
  quiz_id: number;
  name: string;
  course_id: number;
  total_students: number;
}

export interface StudentNeedingHelp {
  user_id: number;
  name: string;
  email: string;
  avg_pass_rate: number;
  total_submissions: number;
  total_test_runs?: number; // [NEW] Tổng số lần run test
  total_compile_errors?: number; // [NEW] Tổng số lần compile error
  efficiency?: number; // [NEW] Hiệu quả làm bài (submissions/test_runs)
  struggle_score?: number; // [NEW] Điểm struggle (0-100)
  status: "critical" | "warning";
  last_active: string;
  // Legacy format
  user?: {
    user_id: number;
    name: string;
    email: string;
  };
  questions_attempted?: number;
}

export interface MasteryDistribution {
  beginner: number;
  intermediate: number;
  advanced: number;
  expert: number;
}

export interface ScoreDistribution {
  range: string;
  count: number;
}

export interface AllStudent {
  user_id: number;
  name: string;
  email: string;
  progress_status: "completed" | "in_progress" | "not_started";
  score: number;
  total_attempts: number;
  time_spent: string;
}

export interface TopPerformer {
  user: {
    user_id: number;
    name: string;
    email: string;
  };
  avg_pass_rate: number;
  questions_attempted: number;
  total_submissions: number;
}

export interface CourseOverviewData {
  quiz_info?: QuizInfo;
  students_needing_help: StudentNeedingHelp[];
  charts?: {
    mastery_distribution: MasteryDistribution;
    score_distribution: ScoreDistribution[];
  };
  all_students?: AllStudent[];
  // Legacy fields
  overview: {
    total_students: number;
    total_questions: number;
    total_submissions: number;
    total_test_runs: number;
    avg_pass_rate: number;
    avg_submissions_per_student: number;
    avg_test_runs_per_student: number;
  };
  mastery_distribution: MasteryDistribution;
  top_performers: TopPerformer[];
}

// ============ Student Analysis Types ============
export interface StudentInfo {
  user_id: number;
  name: string;
  email: string;
  final_score: number;
  status: "stuck" | "in_progress" | "completed";
}

export interface SubmissionHistory {
  submission_id: number;
  question_id: number;
  attempt_number: number;
  submitted_at: string;
  status:
    | "accepted"
    | "wrong_answer"
    | "compile_error"
    | "runtime_error"
    | "time_limit_exceeded";
  score: number;
  passed_test_cases: number;
  total_test_cases: number;
  failed_test_cases: number[];
  error_detail?: string;
}

export interface BehaviorAnalysis {
  total_test_runs: number;
  average_time_between_submissions: string;
  most_common_error: string;
  recommendation_for_teacher: string;
}

export interface StudentStrength {
  question_id: number;
  question_text: string;
  pass_rate: number;
}

export interface StudentWeakness {
  question_id: number;
  question_text: string;
  pass_rate: number;
}

export interface StuckQuestion {
  question_id: number;
  question_text?: string;
  attempts: number;
  recommendation: string;
}

export interface StudentAnalysisData {
  student_info?: StudentInfo;
  submission_history?: SubmissionHistory[];
  behavior_analysis?: BehaviorAnalysis;
  // Legacy fields
  user_id: number;
  overall_metrics: {
    avg_pass_rate: number;
    total_test_runs: number;
    total_submissions?: number;
  };
  strengths: StudentStrength[];
  weaknesses: StudentWeakness[];
  stuck_questions: StuckQuestion[];
  recommendations?: Recommendation[];
}

// ============ Compare Students Types ============
export interface StudentComparisonMetrics {
  avg_pass_rate: number;
  total_submissions?: number;
  total_test_runs?: number;
}

export interface StudentComparison {
  user_id: number;
  user?: {
    name: string;
    email: string;
  };
  metrics: StudentComparisonMetrics;
  strengths_count: number;
  weaknesses_count?: number;
}

export interface CompareStudentsRequest {
  user_ids: number[];
  subject_id?: number;
  quiz_id?: number;
}

export interface CompareStudentsResponse {
  comparison: StudentComparison[];
}

// ============ Activity Timeline Types ============
export interface FailedTestCaseDetail {
  id: number;
  input: string;
  expected: string;
  actual: string;
  error?: string | null;
}

export interface TimelineEvent {
  type: "RUN_TEST" | "SUBMIT" | "AI_CHAT";
  timestamp: string;
  duration_since_last_action?: number; // seconds
  data: {
    // RUN_TEST
    code?: string;
    language?: string;
    status?: string;
    passed?: number;
    total?: number;
    error?: string | null;
    failed_cases?: number[]; // Legacy - chỉ ID
    failed_details?: FailedTestCaseDetail[]; // New - chi tiết input/expected/actual
    // SUBMIT
    submission_id?: number;
    score?: number;
    ai_feedback?: string | null;
    // AI_CHAT
    sender?: string;
    message?: string;
  };
}

// ============ Service ============
export const codeAnalyticsService = {
  /**
   * Lấy phân tích độ khó của câu hỏi code
   * Endpoint: GET /api/teacher/code-analytics/question/:questionId/difficulty
   */
  getQuestionDifficulty: async (
    questionId: number
  ): Promise<QuestionDifficultyData> => {
    const response = await api.get(
      `/teacher/code-analytics/question/${questionId}/difficulty`
    );

    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    throw new Error(
      response.data?.message || "Failed to get code analytics data"
    );
  },

  /**
   * Lấy tổng quan phân tích code cho khóa học/quiz/môn học
   * Endpoint: GET /api/teacher/code-analytics/course/:id/overview?type=quiz
   */
  getCourseOverview: async (
    params: CourseOverviewParams
  ): Promise<CourseOverviewData> => {
    const { id, type = "quiz" } = params;

    const queryParams = new URLSearchParams();
    queryParams.append("type", type);

    const response = await api.get(
      `/teacher/code-analytics/course/${id}/overview?${queryParams.toString()}`
    );

    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || "Failed to get course overview");
  },

  /**
   * Lấy chi tiết phân tích của một sinh viên
   * Endpoint: GET /api/teacher/code-analytics/student/:userId?quiz_id=xxx
   */
  getStudentAnalysis: async (
    userId: number,
    quizId?: number
  ): Promise<StudentAnalysisData> => {
    const queryParams = new URLSearchParams();
    if (quizId) {
      queryParams.append("quiz_id", quizId.toString());
    }

    const url = quizId
      ? `/teacher/code-analytics/student/${userId}?${queryParams.toString()}`
      : `/teacher/code-analytics/student/${userId}`;

    const response = await api.get(url);

    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || "Failed to get student analysis");
  },

  /**
   * So sánh hiệu suất giữa nhiều sinh viên
   * Endpoint: POST /api/teacher/code-analytics/compare-students
   */
  compareStudents: async (
    data: CompareStudentsRequest
  ): Promise<CompareStudentsResponse> => {
    const response = await api.post(
      "/teacher/code-analytics/compare-students",
      data
    );

    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || "Failed to compare students");
  },

  /**
   * Lấy timeline truy vết chi tiết của sinh viên cho một câu hỏi
   * Endpoint: GET /api/teacher/code-analytics/student/:userId/question/:questionId/timeline
   */
  getStudentTimeline: async (
    userId: number,
    questionId: number,
    quizId?: number
  ): Promise<TimelineEvent[]> => {
    const queryParams = new URLSearchParams();
    if (quizId) {
      queryParams.append("quiz_id", quizId.toString());
    }

    const url = `/teacher/code-analytics/student/${userId}/question/${questionId}/timeline${
      quizId ? `?${queryParams.toString()}` : ""
    }`;

    const response = await api.get(url);

    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || "Failed to get student timeline");
  },
};

export default codeAnalyticsService;
