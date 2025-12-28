// Định nghĩa các kiểu dữ liệu cho Quiz

// Định nghĩa quiz modes
export type QuizMode = "assessment" | "practice" | "code_practice";

// Định nghĩa thông tin quiz mode từ API
export interface QuizModeInfo {
  success: boolean;
  quiz_mode: QuizMode;
  gamification_enabled: boolean;
  skill_system_enabled: boolean;
  avatar_system_enabled: boolean;
  level_progression_enabled: boolean;
  real_time_leaderboard_enabled: boolean;
}

// Định nghĩa loại câu hỏi
export interface QuestionType {
  question_type_id: number;
  name: string;
}

// Định nghĩa mức độ khó
export interface Level {
  level_id: number;
  name: string;
}

// Định nghĩa media file
export interface MediaFile {
  media_id: number;
  file_type: "image" | "audio" | "video" | string;
  file_name: string;
  file_url: string;
  owner_type: "question" | "answer";
  owner_id: number;
  alt_text?: string;
  description?: string;
}

// Định nghĩa đáp án
export interface Answer {
  answer_id: number;
  answer_text: string;
  iscorrect: boolean;
}

// Định nghĩa test case cho code exercise
export interface TestCase {
  input: string;
  expected: string | number | boolean;
  description?: string;
}

// Định nghĩa validation rules cho code exercise
export interface ValidationRules {
  language: string;
  test_cases: TestCase[];
  allowed_libraries?: string[];
  max_execution_time?: number;
}

// Định nghĩa câu hỏi
export interface Question {
  question_id: number;
  question_type: QuestionType;
  level: Level;
  question_text: string;
  lo_id?: number;
  lo_name?: string;
  lo?: {
    lo_id: number;
    name: string;
  };
  explanation?: string;
  answers: Answer[];
  MediaFiles?: MediaFile[];
  // Code exercise specific fields
  validation_rules?: ValidationRules;
  hints?: string[];
  tags?: string[];
  time_limit?: number;
  question_data?: any;
}

// Định nghĩa khóa học (Course) - Thay thế cho Subject
export interface Course {
  course_id: number;
  name: string;
  description?: string;
}

// Định nghĩa mục tiêu học tập (Learning Objective)
export interface LO {
  lo_id: number;
  name: string;
  description?: string;
  course_id?: number;
  related_chapters?: Array<{
    chapter_id: number;
    chapter_name: string;
  }>;
  Chapters?: Array<{
    chapter_id: number;
    name: string;
  }>;
}

// Định nghĩa tỷ lệ độ khó của câu hỏi
export interface DifficultyRatio {
  easy: number;
  medium: number;
  hard: number;
}

// Định nghĩa tiêu chí câu hỏi
export interface QuestionCriteria {
  loIds: number[];
  totalQuestions: number;
  difficultyRatio: DifficultyRatio;
  type?: number;
}

// Định nghĩa cấu hình cho code_practice mode
export interface CodeConfig {
  allow_multiple_submissions: boolean;
  show_test_results: boolean;
  enable_ai_analysis: boolean;
  time_limit_per_question: number; // seconds
  allowed_languages?: string[];
  auto_save_interval?: number;
  show_hints_after_attempts?: number;
}

// Định nghĩa phương thức chọn câu hỏi cho code_practice
export type QuestionSelectionMethod = "existing" | "auto_generate";

// Định nghĩa bài kiểm tra
export interface Quiz {
  quiz_id: number;
  course_id: number;
  name: string;
  duration: number;
  status: "pending" | "active" | "finished";
  start_time?: string;
  end_time?: string;
  pin?: string;
  update_time: string;
  quiz_mode?: QuizMode;
  Course?: Course;
}

// Định nghĩa form tạo bài kiểm tra
export interface CreateQuizFormData {
  course_id: number;
  name: string;
  duration: number;
  quiz_mode: QuizMode;
  question_criteria?: QuestionCriteria;
  code_config?: CodeConfig;
  question_ids?: number[];
  question_selection_method?: QuestionSelectionMethod;
}

// Định nghĩa người tham gia quiz
export interface QuizParticipant {
  user_id: number;
  name: string;
  email: string;
  student_id?: string;
  avatar_url?: string; // Avatar từ UserCustomization
  score: number;
  status: "in_progress" | "completed" | "pending";
  last_accessed: string | Date;
  // Các trường mới từ backend realtime
  current_question_id?: number | null;
  correct_answers?: number | null;
  total_answers?: number | null;
  progress?: number | null; // Phần trăm tiến độ hoàn thành
}

// Định nghĩa kết quả bài thi
export interface QuizResult {
  result_id: number;
  student: {
    user_id: number;
    name: string;
    email: string;
  };
  score: number;
  status: string;
  update_time: string;
  completion_time: string;
  Quiz: {
    quiz_id: number;
    name: string;
    quiz_mode?: QuizMode; // Thêm quiz_mode từ backend
  };
}

export interface QuizResultStudent {
  result_id: number;
  quiz_id: number;
  user_id: number;
  score: number;
  status: string;
  completion_time: number | null;
  update_time: string;
  Quiz: {
    quiz_id: number;
    name: string;
    quiz_mode?: QuizMode; // Thêm quiz_mode từ backend
  };
  Student: {
    user_id: number;
    name: string;
  };
}

// Định nghĩa chi tiết kết quả bài thi
export interface QuizResultDetail {
  result_id: number;
  user_id: number;
  quiz_id: number;
  score: number;
  status: string;
  update_time: string;
  completion_time: number;
  Quiz: {
    quiz_id: number;
    name: string;
    duration: number;
    course_id: number;
    Course: {
      course_id: number;
      name: string;
    };
  };
  Student: {
    user_id: number;
    name: string;
    email: string;
  };
  answers?: Array<{
    question_id: number;
    question_text: string;
    selected_answer_id: number;
    is_correct: boolean;
    explanation?: string;
  }>;
}

// Định nghĩa bài kiểm tra đã hoàn thành
export interface CompletedQuiz {
  result_id: number;
  quiz_id: number;
  quiz_name: string;
  quiz_mode?: QuizMode; // Thêm quiz_mode từ backend
  course_name: string;
  score: number;
  status: string;
  completion_time: number;
  update_time: string;
}

// Định nghĩa Chapter Section
export interface ChapterSection {
  section_id: number;
  title: string;
  content: string;
  order: number;
}

// Định nghĩa Chapter
export interface Chapter {
  chapter_id: number;
  chapter_name: string;
  description?: string;
  sections: ChapterSection[];
}

// Định nghĩa LO với chapters
export interface LOWithChapters {
  lo_id: number;
  lo_name: string;
  accuracy?: number;
  chapters: Chapter[];
}

// Định nghĩa Quiz Result với lo_chapters
export interface QuizResultWithChapters {
  result_id: number;
  user_id: number;
  quiz_id: number;
  score: number;
  status: string;
  update_time: string;
  completion_time: number;
  Student?: {
    user_id: number;
    name: string;
    email?: string;
  };
  Quiz?: {
    quiz_id: number;
    name: string;
  };
  lo_chapters: LOWithChapters[];
}

// Định nghĩa thông tin phân trang
export interface PaginationInfo {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Định nghĩa response cho danh sách quiz với phân trang (cấu trúc cũ)
export interface QuizListResponse {
  message: string;
  quizzes: Quiz[];
  pagination: PaginationInfo;
}

// Định nghĩa response mới với wrapper success/data
export interface QuizListApiResponse {
  success: boolean;
  data: {
    quizzes: Quiz[];
    pagination: PaginationInfo;
  };
  message?: string;
}

// Định nghĩa parameters cho filter quiz
export interface QuizFilterParams {
  page?: number;
  limit?: number;
  status?: string;
  course_id?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
  quiz_mode?: QuizMode;
}

// Định nghĩa chi tiết bài kiểm tra
export interface QuizDetail {
  quiz_id: number;
  course_id: number;
  course_name: string;
  name: string;
  duration: number;
  start_time?: string;
  end_time?: string;
  update_time: string;
  status: "pending" | "active" | "finished";
  pin?: string;
  quiz_mode?: QuizMode;
  code_config?: CodeConfig;
  questions: Question[];
  results: QuizResult[];
}

// Định nghĩa danh sách câu hỏi của bài kiểm tra
export interface QuizQuestions {
  quiz_id: number;
  quiz_name: string;
  status: string;
  questions: Question[];
}

// Định nghĩa dữ liệu tham gia quiz
export interface JoinQuizData {
  pin: string;
}

// Định nghĩa kết quả sau khi tham gia quiz
export interface JoinQuizResponse {
  message: string;
  quiz: {
    quiz_id: number;
    name: string;
    current_question_index: number;
    total_questions: number;
  };
}

// Định nghĩa Clone Quiz request
export interface CloneQuizRequest {
  new_name?: string;
  new_course_id?: number;
  clone_questions: boolean;
  clone_settings: boolean;
  clone_mode_config: boolean;
  reset_pin: boolean;
  reset_status: boolean;
}

// Định nghĩa Clone Quiz response
export interface CloneQuizResponse {
  message: string;
  original_quiz: {
    quiz_id: number;
    name: string;
    course_id: number;
    questions_count: number;
  };
  cloned_quiz: {
    quiz_id: number;
    name: string;
    course_id: number;
    course_name: string;
    subject_id?: number;
    subject_name?: string;
    duration: number;
    status: "pending" | "active" | "finished";
    pin: string;
    quiz_mode: QuizMode;
    gamification_enabled: boolean;
    update_time: string;
    questions_cloned: number;
    settings_cloned: boolean;
    mode_config_cloned: boolean;
  };
  clone_summary: {
    questions_cloned: number;
    settings_cloned: boolean;
    mode_config_cloned: boolean;
    new_pin_generated: boolean;
    status_reset: boolean;
  };
}

// Định nghĩa sự kiện realtime cho học viên mới tham gia
export interface NewParticipantEvent {
  quiz_id: number;
  participant: QuizParticipant;
}

// Định nghĩa sự kiện cập nhật danh sách người tham gia
export interface ParticipantsUpdateEvent {
  quiz_id: number;
  participants: QuizParticipant[];
}

// Định nghĩa trạng thái vòng quiz
export interface QuizRound {
  round: number;
  name: string;
  description: string;
  allowBackNavigation: boolean;
  trackIncorrectAnswers: boolean;
}

// Định nghĩa trạng thái câu hỏi trong vòng
export interface QuestionRoundState {
  questionIndex: number;
  isAnswered: boolean;
  isCorrect: boolean | null;
  selectedAnswer: number | null;
  roundAnswered: number; // Vòng nào câu này được trả lời
}

// Interface để theo dõi lịch sử lựa chọn sai của từng câu hỏi
export interface QuestionWrongHistory {
  questionIndex: number;
  wrongAnswers: Set<number>; // Set các đáp án đã từng chọn sai
  lastWrongRound: number; // Vòng cuối cùng chọn sai
}

// Định nghĩa trạng thái quiz với hệ thống vòng
export interface QuizRoundState {
  currentRound: number;
  totalRounds: number;
  questionsInCurrentRound: number[];
  questionStates: Record<number, QuestionRoundState>;
  questionWrongHistory: Record<number, QuestionWrongHistory>; // Lịch sử lựa chọn sai
  roundHistory: Array<{
    round: number;
    questionsAttempted: number[];
    correctAnswers: number;
    incorrectAnswers: number;
  }>;
}

// Định nghĩa kết quả vòng
export interface RoundResult {
  round: number;
  questionsAttempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
}
