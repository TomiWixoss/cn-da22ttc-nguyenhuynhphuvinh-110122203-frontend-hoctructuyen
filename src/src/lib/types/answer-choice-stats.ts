export interface ChoiceStatistic {
  count: number;
  percentage: number;
  correct_count: number;
  incorrect_count: number;
}

export interface ChoiceStatsData {
  quiz_id: number;
  question_id: number;
  choice_stats: Record<string, ChoiceStatistic>;
  total_responses: number;
  last_updated: string;
}

export interface ChoiceStatsResponse {
  success: boolean;
  message: string;
  data: ChoiceStatsData;
}

export interface AnswerStats {
  answer_id: number;
  answer_text: string;
  is_correct: boolean;
  stats: {
    count: number;
    percentage: number;
  };
}

export interface QuestionStats {
  question_id: number;
  question_text: string;
  total_responses: number;
  answers: AnswerStats[];
}

export interface LiveChoiceStatsData {
  quiz_id: number;
  quiz_name: string;
  total_questions: number;
  question_stats: QuestionStats[];
}

export interface LiveChoiceStatsResponse {
  success: boolean;
  message: string;
  data: LiveChoiceStatsData;
}

export interface ChoiceStatsSummaryData {
  quiz_id: number;
  quiz_name: string;
  total_questions: number;
  total_responses: number;
  completion_rate: number;
  average_correct_rate: number;
  question_summary: Array<{
    question_id: number;
    question_text: string;
    response_count: number;
    correct_rate: number;
    most_chosen_answer: {
      answer_id: number;
      answer_text: string;
      count: number;
      percentage: number;
    };
  }>;
}

export interface ChoiceStatsSummaryResponse {
  success: boolean;
  message: string;
  data: ChoiceStatsSummaryData;
}

// Socket.IO Event Types
export interface SocketChoiceStatsUpdate {
  quiz_id: number;
  question_id: number;
  choice_stats: Record<string, ChoiceStatistic>;
  timestamp: string;
}

export interface SocketRealtimeUpdate {
  type: 'answer_submitted' | 'quiz_started' | 'quiz_ended' | 'question_changed';
  quiz_id: number;
  question_id?: number;
  data?: any;
  timestamp: string;
}

export interface JoinQuizRoomData {
  quiz_id: number;
  user_id: number;
  role: 'teacher' | 'student';
}
