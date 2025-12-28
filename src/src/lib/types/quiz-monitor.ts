// Types cho Teacher Dashboard API mới

export interface QuizInfo {
  quiz_id: number;
  name: string;
  status: string;
  total_questions: number;
  course: string;
  created_at: string;
}

export interface ParticipantsSummary {
  total: number;
  active: number;
  completed: number;
}

export interface ClassMetrics {
  total_participants: number;
  avg_score: number;
  median_score: number;
  avg_accuracy: number;
  avg_response_time: number;
  completion_rate: number;
}

export interface RedFlag {
  type: string;
  severity: string;
  description: string;
  value?: number;
  threshold?: number;
  length?: number;
  class_avg?: number;
}

export interface SuggestedAction {
  priority: number;
  action: string;
  description: string;
  reason: string;
}

export interface CurrentStats {
  score: number;
  accuracy: number;
  questions_answered: number;
  correct_answers: number;
  avg_response_time: number;
}

export interface StrugglingStudent {
  user_id: string;
  user_name: string;
  risk_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
  current_stats: CurrentStats;
  red_flags: RedFlag[];
  suggested_actions: SuggestedAction[];
  percentile: number;
}

export interface StrugglingStudents {
  count: number;
  critical_count: number;
  high_count: number;
  students: StrugglingStudent[];
}

export interface AnswerChoiceBreakdown {
  answer_id: number;
  answer_text?: string;
  percentage: number;
  is_correct: boolean;
}

export interface LiveStats {
  answered_count: number;
  current_correct_rate: number;
  avg_response_time: number;
  answer_choice_breakdown: AnswerChoiceBreakdown[];
}

export interface CommonMisconception {
  detected: boolean;
  description?: string;
}

export interface QuestionInsights {
  difficulty_assessment: string;
  common_misconception: CommonMisconception;
  teaching_suggestion: string;
}

export interface StudentSegment {
  segment_name: string;
  count: number;
  percentage: number;
}

export interface CurrentQuestionAnalytics {
  question_id: number;
  question_text: string;
  live_stats: LiveStats;
  insights: QuestionInsights;
  student_segments?: StudentSegment[];
}

export interface PassRatePrediction {
  predicted_pass_rate: number;
  current_pass_rate: number;
  trend: "improving" | "declining" | "stable";
  confidence: number;
}

export interface CompletionEstimate {
  estimated_completion_minutes: number;
  confidence: number;
}

export interface ScoreDistributionSegment {
  count: number;
  percentage: number;
}

export interface ScoreDistributionPrediction {
  excellent: ScoreDistributionSegment;
  good: ScoreDistributionSegment;
  average: ScoreDistributionSegment;
  poor: ScoreDistributionSegment;
}

export interface Predictions {
  pass_rate_prediction: PassRatePrediction;
  completion_estimate: CompletionEstimate;
  score_distribution_prediction: ScoreDistributionPrediction;
}

export interface Alert {
  type: "info" | "warning" | "critical";
  category: string;
  title: string;
  message: string;
  priority: number;
}

export interface TeacherDashboardData {
  quiz_info: QuizInfo;
  participants_summary: ParticipantsSummary;
  class_metrics: ClassMetrics | null;
  struggling_students: StrugglingStudents | null;
  current_question_analytics: CurrentQuestionAnalytics | null;
  predictions: Predictions | null;
  alerts: Alert[];
  timestamp: number;
}

export interface TeacherDashboardResponse {
  success: boolean;
  message: string;
  data: TeacherDashboardData;
}

// Types cho Socket Event progressTrackingUpdate (nâng cấp)
export interface ParticipantProgress {
  user_id: number;
  user_name: string;
  current_score: number;
  progress_percentage: number;
  status: string;
}

export interface OverallMetrics {
  total_participants: number;
  active_participants: number;
  average_score: number;
}

export interface ProgressData {
  participants_summary: ParticipantProgress[];
  overall_metrics: OverallMetrics;
}

export interface PerformanceMetrics {
  calculation_time_ms: number;
  data_freshness: "realtime" | "cached";
}

export interface ProgressTrackingUpdate {
  quiz_id: number;
  timestamp: number;
  // Dữ liệu cũ (tương thích ngược)
  progress_data: ProgressData;
  // Dữ liệu mới
  class_metrics: ClassMetrics;
  struggling_students: {
    count: number;
    students: StrugglingStudent[];
    total_at_risk: number;
  };
  current_question_analytics: CurrentQuestionAnalytics | null;
  predictions: Predictions;
  alerts: Alert[];
  performance: PerformanceMetrics;
}
