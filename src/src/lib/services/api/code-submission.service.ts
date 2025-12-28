import api from "./client";

// Types for AI models
export interface AIModel {
  id: string;
  name: string;
  provider: "Google" | "OpenRouter";
}

// Types for code submission
export interface RunTestRequest {
  question_id: number;
  quiz_id: number; // REQUIRED: Backend bắt buộc phải có quiz_id
  code: string;
  language: string;
}

export interface TestCaseResult {
  test_case_id: number;
  input: string;
  expected: any;
  actual_serialized: string;
  passed: boolean;
  error: string | null;
  description?: string;
  executionTime?: number; // ms
}

// AI Feedback từ Run Test (API mới - Cerebras GPT-OSS-120B)
export interface AIFeedback {
  enabled: boolean;
  error_type?: "compile_error" | "runtime_error" | "logic_error" | "timeout";
  error_summary?: string;
  hints?: string[];
  common_mistake?: string;
  next_step?: string;
  pattern_detected?: string;
  encouragement?: string;
}

// Inline error cho compile errors
export interface InlineError {
  line: number;
  column: number;
  end_column?: number;
  severity: "error" | "warning" | "note";
  message: string;
  message_raw: string;
  suggestion?: string;
}

export interface RunTestResponse {
  user_id?: number;
  question_id: number;
  language: string;
  test_case_count: number;
  passed: number;
  failed?: number;
  can_submit: boolean;
  hint?: string;
  has_main_warning?: boolean; // true nếu code sinh viên có hàm main()
  results: TestCaseResult[];
  compile_error?: string | null;
  compile_error_vi?: string | null; // Dịch tiếng Việt
  runtime_error?: string | null;
  runtime_error_vi?: string | null; // Dịch tiếng Việt
  console_output?: string | null;
  console_output_truncated?: boolean;
  // Inline errors cho CodeMirror
  inline_errors?: InlineError[];
  has_inline_errors?: boolean;
  total_errors?: number;
  total_warnings?: number;
  // AI Feedback (API mới - có AI trong run test)
  ai_feedback?: AIFeedback;
}

export interface SubmitCodeRequest {
  question_id: number;
  quiz_id?: number;
  code: string;
  language: string;
  model?: string; // Optional AI model selection
  force_submit?: boolean; // Force submit even if not all tests passed
}

export interface SubmitCodeResponse {
  submission_id: number;
  user_id?: number;
  question_id?: number;
  quiz_id?: number;
  status: string;
  score?: number; // Điểm tính theo test cases (không AI)
  submitted_at: string;
  test_results?: {
    passed: number;
    total: number;
    pass_rate: number;
  };
  is_best_submission?: boolean;
}

export interface AIAnalysis {
  overall_score: number;
  correctness: {
    score: number;
    comments: string;
    errors: string[];
    suggestions?: string[];
    total_cases: number;
    passed_cases: number;
    execution_errors: string | null;
    logic_errors?: string[];
    edge_cases_handled?: boolean;
    edge_cases_missing?: string[];
    failed_cases_root_cause?: string[];
  };
  code_quality: {
    score: number;
    naming: number;
    readability: number;
    structure?: number;
    comments: string;
  };
  performance: {
    score: number;
    time_complexity: string;
    space_complexity: string;
    comments: string;
  };
  best_practices: {
    score: number;
    violations: string[];
    recommendations: string[];
    security_issues?: string[];
  };
  strengths: string[];
  weaknesses: string[];
  explanation: string;
  improved_code?: string;
  feedback: string;
  confidence?: number;
  next_improvements?: string[];
}

export interface SubmissionResult {
  submission_id: number;
  question_id: number;
  code: string;
  language: string;
  status: string;
  score: string;
  test_results: {
    passed: number;
    total: number;
    details: TestCaseResult[];
  } | null;
  ai_analysis: AIAnalysis | null;
  feedback: string;
  submitted_at: string;
  analyzed_at: string | null;
}

// Types for Student Tracking
export interface TestCaseStatus {
  test_case_id: number;
  status: "passed" | "failed" | "not_attempted";
  attempts: number;
  pass_rate: number;
}

export interface StudentTrackingProgress {
  passed_test_cases: number;
  total_test_cases: number;
  pass_rate: number;
  mastery_level: "beginner" | "intermediate" | "expert";
}

export interface StudentTrackingData {
  question_id: number;
  progress: StudentTrackingProgress;
  test_cases: TestCaseStatus[];
  test_run_history: {
    total_test_runs: number;
    average_before_submit: number;
  };
}

// Types for User Analytics
export interface MasteryDistribution {
  beginner: number;
  intermediate: number;
  expert: number;
}

export interface UserAnalyticsData {
  total_questions_attempted: number;
  total_submissions: number;
  average_pass_rate: number;
  mastery_distribution: MasteryDistribution;
}

export const codeSubmissionService = {
  // Get available AI models
  getAvailableModels: async (): Promise<AIModel[]> => {
    const response = await api.get("/code-submissions/available-models");

    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || "Failed to get available models");
  },

  // Run code with test cases
  runTest: async (data: RunTestRequest): Promise<RunTestResponse> => {
    const response = await api.post("/code-submissions/run-test", data);

    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || "Failed to run test");
  },

  // Submit code (NO AI - just save test results and calculate score)
  // Flow mới: Run Test có AI → Submit Final chỉ lưu kết quả
  submitCode: async (data: SubmitCodeRequest): Promise<SubmitCodeResponse> => {
    const response = await api.post("/code-submissions/submit-final", data);

    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || "Failed to submit code");
  },

  // Get submission result (for polling)
  getSubmissionResult: async (
    submissionId: number
  ): Promise<SubmissionResult> => {
    const response = await api.get(`/code-submissions/${submissionId}/result`);

    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || "Failed to get result");
  },

  // Get student tracking for a specific question
  getStudentTracking: async (
    questionId: number
  ): Promise<StudentTrackingData> => {
    const response = await api.get(`/code-submissions/tracking/${questionId}`);

    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || "Failed to get tracking data");
  },

  // Get user analytics overview
  getUserAnalytics: async (): Promise<UserAnalyticsData> => {
    const response = await api.get("/code-submissions/analytics");

    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || "Failed to get analytics");
  },
};

export default codeSubmissionService;
