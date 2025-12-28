// Question Management TypeScript types and interfaces

// ===== MEDIA TYPES =====

export interface MediaFile {
  media_id: number;
  file_type: "image" | "audio" | "video";
  file_name: string;
  file_url: string;
  owner_type: "question" | "answer";
  owner_id: number;
  alt_text?: string;
  description?: string;
}

// ===== QUESTION TYPES =====

export interface Question {
  question_id: number;
  question_type_id: number;
  level_id: number;
  question_text: string;
  lo_id: number;
  explanation?: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionWithRelations extends Question {
  QuestionType?: {
    question_type_id: number;
    name: string;
  };
  Level?: {
    level_id: number;
    name: string;
  };
  LO?: {
    lo_id: number;
    name: string;
    description?: string;
    course_id?: number;
  };
  Answers?: Answer[];
  MediaFiles?: MediaFile[]; // THÊM MỚI: Media cho câu hỏi
  validation_rules?: CodeExerciseValidationRules; // THÊM MỚI: Validation rules cho code_exercise
  time_limit?: number; // THÊM MỚI: Thời gian giới hạn (giây)
  tags?: string[]; // THÊM MỚI: Tags cho câu hỏi
  hints?: string[]; // THÊM MỚI: Gợi ý cho câu hỏi
  _count?: {
    Answers: number;
  };
}

// ===== CODE EXERCISE TYPES =====

export interface TestCase {
  input: string;
  expected: any;
  description?: string;
}

export interface CodeExerciseValidationRules {
  language: string;
  max_execution_time: number;
  test_cases?: TestCase[]; // Có thể rỗng nếu là sinh viên
  test_case_count?: number; // Số lượng test case (luôn có)
}

// ===== ANSWER TYPES =====

export interface Answer {
  answer_id: number;
  answer_text: string;
  iscorrect: boolean | number; // API might return 0/1 instead of boolean
  question_id: number;
  created_at?: string;
  updated_at?: string;
  MediaFile?: MediaFile; // THÊM MỚI: Media cho câu trả lời
}

// ===== QUESTION TYPE TYPES =====

export interface QuestionType {
  question_type_id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

// ===== LEVEL TYPES =====

export interface Level {
  level_id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

// ===== LEARNING OUTCOME TYPES =====

export interface LearningOutcome {
  lo_id: number;
  name: string;
  description?: string;
  course_id?: number;
  plo_id?: number;
  created_at?: string;
  updated_at?: string;
}

// ===== API RESPONSE TYPES =====

export interface QuestionListResponse {
  success: boolean;
  data: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    questions: QuestionWithRelations[];
  };
  message?: string;
}

export interface QuestionApiResponse {
  success: boolean;
  data: QuestionWithRelations;
  message?: string;
}

export interface QuestionTypeListResponse {
  success: boolean;
  data: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    questionTypes: QuestionType[];
  };
  message?: string;
}

export interface LevelListResponse {
  success: boolean;
  data: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    levels: Level[];
  };
  message?: string;
}

// ===== REQUEST TYPES =====

export interface QuestionCreateRequest {
  question_type_id: number;
  level_id: number;
  question_text: string;
  lo_id: number;
  explanation?: string;
}

export interface QuestionUpdateRequest extends Partial<QuestionCreateRequest> {}

export interface QuestionTypeCreateRequest {
  name: string;
}

export interface QuestionTypeUpdateRequest
  extends Partial<QuestionTypeCreateRequest> {}

// ===== FILTER AND PAGINATION TYPES =====

export interface QuestionFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  lo_id?: number;
  level_id?: number;
  question_type_id?: number;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
}

export interface QuestionByLOsRequest {
  loIds: number[];
  totalQuestions: number;
  difficultyRatio: {
    easy: number;
    medium: number;
    hard: number;
  };
}

// ===== BULK OPERATIONS =====

export interface QuestionBulkDeleteRequest {
  question_ids: number[];
}

export interface QuestionImportRequest {
  file: File;
  type: "csv" | "excel";
}

// ===== VALIDATION FORM DATA =====

export interface QuestionCreateFormData extends QuestionCreateRequest {}
export interface QuestionUpdateFormData extends QuestionUpdateRequest {}
export interface QuestionFilterFormData extends QuestionFilterParams {}

// ===== QUIZ-QUESTION ASSOCIATION =====

export interface QuizQuestion {
  quiz_id: number;
  question_id: number;
  order_index?: number;
  Quiz?: {
    quiz_id: number;
    name: string;
  };
  Question?: {
    question_id: number;
    question_text: string;
  };
}

export interface QuizQuestionCreateRequest {
  questions: Array<{
    question_id: number;
    order_index: number;
  }>;
}

export interface QuizQuestionDeleteRequest {
  question_ids: number[];
}

export interface QuizQuestionReorderRequest {
  questions: Array<{
    question_id: number;
    order_index: number;
  }>;
}

// ===== ERROR TYPES =====

export interface QuestionApiError {
  success: false;
  error: string;
  code?: string;
  message?: string;
}

// ===== STATISTICS TYPES =====

export interface QuestionStats {
  total_questions: number;
  by_type: Array<{
    question_type_id: number;
    type_name: string;
    count: number;
  }>;
  by_level: Array<{
    level_id: number;
    level_name: string;
    count: number;
  }>;
  by_lo: Array<{
    lo_id: number;
    lo_name: string;
    count: number;
  }>;
}
