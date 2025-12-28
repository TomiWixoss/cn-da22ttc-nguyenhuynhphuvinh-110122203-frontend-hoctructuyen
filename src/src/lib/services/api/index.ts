import api from "./client";
import authService from "./auth.service";
export * from "./user.service";
export * from "./semester.service";
export * from "./assignment.service";
import roleService from "./role.service";
import quizService from "./quiz.service";
import loService from "./lo.service";
import { SubjectService } from "./subject.service";
import gamificationService from "./gamification.service";
import advancedAnalyticsService from "./advanced-analytics.service";
import chapterAnalyticsService from "./chapter-analytics.service";
import avatarService from "./avatar.service";
import emojiService from "./emoji.service";
import currencyService from "./currency.service";
import shopService from "./shop.service";
import programService from "./program.service";
import poService from "./po.service";
import ploService from "./plo.service";
import courseService from "./course.service";
import racingService from "./racing.service";
import trainingBatchService from "./training-batch.service";
import courseGradeService from "./course-grade.service";
import practiceRecommendationService from "./practice-recommendation.service";
import questionService from "./question.service";
import codeSubmissionService from "./code-submission.service";
import codeAnalyticsService from "./code-analytics.service";
import aiTutorService from "./ai-tutor.service";
import featureToggleService from "./feature-toggle.service";
import { userService } from "./user.service";

export {
  api,
  authService,
  userService,
  roleService,
  quizService,
  loService,
  SubjectService,
  gamificationService,
  advancedAnalyticsService,
  chapterAnalyticsService,
  avatarService,
  emojiService,
  currencyService,
  shopService,
  programService,
  poService,
  ploService,
  courseService,
  racingService,
  trainingBatchService,
  courseGradeService,
  practiceRecommendationService,
  questionService,
  codeSubmissionService,
  codeAnalyticsService,
  aiTutorService,
  featureToggleService,
};

export default api;

// Re-export types from services
export type {
  TimeSeriesParams,
  ScoreDistributionParams,
  LearningOutcomesParams,
  DifficultyHeatmapParams,
  ActivityTimelineParams,
  StudentScoreAnalysisParams,
} from "./advanced-analytics.service";

export type {
  UserGamificationInfo,
  LeaderboardEntry,
  GamificationStats,
  AddPointsRequest,
} from "@/lib/types/gamification";

// Chapter Analytics types
export type {
  ChapterAnalysisData,
  ComprehensiveAnalysisData,
  TeacherAnalyticsData,
  ChapterAnalyticsResponse,
  DetailedAnalysisParams,
  ComprehensiveAnalysisParams,
  TeacherAnalyticsParams,
  SectionRecommendation,
} from "@/lib/types/chapter-analytics";

// Currency types
export type {
  CurrencyBalance,
  CurrencyData,
  UserCurrencies,
  CurrencyApiResponse,
  CurrencyError,
  CurrencyDisplayConfig,
  CurrencyUpdateEvent,
} from "@/lib/types/currency";

// LO Completion Analysis types
export type {
  LOResponse,
  LOPaginatedResponse,
  LOsByCourseResponse,
  LOsByCourseApiResponse,
  LOCompletionAnalysisParams,
  LOAnalysisItem,
  PersonalizedRecommendations,
  LOCompletionAnalysisResponse,
  LODetailsResponse,
} from "./lo.service";

// Additional LO types from dedicated types file
export type {
  LOImprovementPlan,
  LONextLevelSuggestion,
  LOCompletionAnalysisData,
  ActualNextPhaseItem,
  ActualStudySchedule,
} from "@/lib/types/lo-completion-analysis";

// Program Management types
export type {
  Program,
  ProgramWithRelations,
  ProgramListResponse,
  ProgramCreateRequest,
  ProgramUpdateRequest,
  ProgramApiResponse,
  ProgramWithRelationsApiResponse,
  ProgramPOsApiResponse,
  ProgramPLOsApiResponse,
  ProgramCoursesApiResponse,
  ProgramStatisticsApiResponse,
  ProgramDeleteApiResponse,
  PO,
  POWithRelations,
  POListResponse,
  POCreateRequest,
  POUpdateRequest,
  POApiResponse,
  POWithRelationsApiResponse,
  POsByProgramApiResponse,
  POPLOsApiResponse,
  POStatisticsApiResponse,
  PODeleteApiResponse,
  POBulkApiResponse,
  PLO,
  PLOWithRelations,
  PLOListResponse,
  PLOCreateRequest,
  PLOUpdateRequest,
  PaginationParams,
  ProgramFilterParams,
  POFilterParams,
  PLOFilterParams,
} from "@/lib/types/program-management";

// Course Management types
export type {
  Course,
  CourseWithRelations,
  CourseListResponse,
  CourseCreateRequest,
  CourseUpdateRequest,
  CourseFilterParams,
  CourseStats,
  CourseStudent,
  CourseEnrollment,
} from "@/lib/types/course";

// Validation types
export type {
  ProgramCreateFormData,
  ProgramUpdateFormData,
  POCreateFormData,
  POUpdateFormData,
  PLOCreateFormData,
  PLOUpdateFormData,
  CourseCreateFormData,
  CourseUpdateFormData,
  PaginationFormData,
  ProgramFilterFormData,
  POFilterFormData,
  PLOFilterFormData,
  CourseFilterFormData,
} from "@/lib/validations/program-management";

// Course Grade Management types
export type {
  ApiResponse,
  GradeColumn,
  GradeColumnWithRelations,
  CourseGradeResult,
  CourseGradeResultWithRelations,
  GradeQuiz,
  AvailableQuiz,
  QuizAssignment,
  ExportMetadata,
  ExportResult,
  GradeColumnCreateRequest,
  GradeColumnUpdateRequest,
  QuizAssignmentRequest,
  GradeCalculationRequest,
  FinalExamScoreUpdateRequest,
  CourseWithGradeColumnsRequest,
  ExportRequest,
  GradeColumnsListResponse,
  AvailableQuizzesResponse,
  GradeCalculationResponse,
  CourseWithGradeColumnsResponse,
  GradeColumnFilterParams,
  AvailableQuizFilterParams,
  GradeColumnFormData,
  QuizAssignmentFormData,
  FinalExamScoreFormData,
  CourseWithGradeColumnsFormData,
  ExportFormData,
} from "@/lib/types/course-grade";

// Question Management types
export type {
  Question,
  QuestionWithRelations,
  Answer,
  QuestionType,
  Level,
  LearningOutcome,
  QuestionListResponse,
  QuestionApiResponse,
  QuestionTypeListResponse,
  LevelListResponse,
  QuestionCreateRequest,
  QuestionUpdateRequest,
  QuestionTypeCreateRequest,
  QuestionTypeUpdateRequest,
  QuestionFilterParams,
  QuestionByLOsRequest,
  QuestionBulkDeleteRequest,
  QuestionImportRequest,
  QuestionCreateFormData,
  QuestionUpdateFormData,
  QuestionFilterFormData,
  QuizQuestion,
  QuizQuestionCreateRequest,
  QuizQuestionDeleteRequest,
  QuizQuestionReorderRequest,
  QuestionApiError,
  QuestionStats,
} from "@/lib/types/question";

// Code Submission types
export type {
  RunTestRequest,
  RunTestResponse,
  SubmitCodeRequest,
  SubmitCodeResponse,
  TestCaseResult,
  AIAnalysis,
  SubmissionResult,
  StudentTrackingData,
  StudentTrackingProgress,
  TestCaseStatus,
  UserAnalyticsData,
  MasteryDistribution,
} from "./code-submission.service";

// Code Analytics types
export type {
  TestCaseAnalytics,
  QuestionDifficultyData,
  Recommendation,
  CourseOverviewParams,
  CourseOverviewData,
  TopPerformer,
  StudentNeedingHelp,
  StudentAnalysisData,
  StudentStrength,
  StudentWeakness,
  StuckQuestion,
  CompareStudentsRequest,
  CompareStudentsResponse,
  StudentComparison,
  StudentComparisonMetrics,
} from "./code-analytics.service";

// AI Tutor types
export type {
  ChatMessage,
  ChatResponse,
  QuickHelpResponse,
  ExplainResponse,
  HintResponse,
  ReviewResult,
  ReviewResponse,
  MySummary,
  FAQItem,
  ChatRequest,
  QuickHelpRequest,
  ExplainRequest,
  HintRequest,
  ReviewRequest,
} from "./ai-tutor.service";
