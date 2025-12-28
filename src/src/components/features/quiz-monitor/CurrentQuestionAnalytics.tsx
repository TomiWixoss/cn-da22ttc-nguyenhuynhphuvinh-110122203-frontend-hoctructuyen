import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Progress } from "@/components/ui/feedback";
import { HelpCircle, CheckCircle, Lightbulb, Users } from "lucide-react";
import type { CurrentQuestionAnalytics as CurrentQuestionAnalyticsType } from "@/lib/types/quiz-monitor";

interface CurrentQuestionAnalyticsProps {
  analytics: CurrentQuestionAnalyticsType | null;
}

export const CurrentQuestionAnalytics: React.FC<
  CurrentQuestionAnalyticsProps
> = ({ analytics }) => {
  if (!analytics) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Phân tích câu hỏi hiện tại
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Chưa có dữ liệu phân tích
          </p>
        </CardContent>
      </Card>
    );
  }

  const { live_stats, insights } = analytics;

  return (
    <Card className="border-2 hover:border-primary transition-all">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <HelpCircle className="h-5 w-5" />
          Câu hỏi #{analytics.question_id}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Question Text */}
        <div className="bg-muted/30 border border-border rounded-lg p-4">
          <p className="text-base font-medium leading-relaxed">
            {analytics.question_text}
          </p>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                Đã trả lời
              </p>
            </div>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {live_stats.answered_count}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <p className="text-xs font-medium text-green-600 dark:text-green-400">
                Tỷ lệ đúng
              </p>
            </div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {Math.round(live_stats.current_correct_rate)}%
            </p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <HelpCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <p className="text-xs font-medium text-orange-600 dark:text-orange-400">
                Thời gian TB
              </p>
            </div>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {live_stats.avg_response_time.toFixed(1)}s
            </p>
          </div>
        </div>

        {/* Answer Choices */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
            Phân bố đáp án
          </h4>
          <div className="space-y-2.5">
            {live_stats.answer_choice_breakdown.map((choice, index) => {
              const answerLetter = String.fromCharCode(65 + index);
              const isCorrect = choice.is_correct;
              const percentage = Math.round(choice.percentage);

              return (
                <div
                  key={choice.answer_id}
                  className={`flex items-start gap-3 p-3.5 rounded-lg transition-all ${
                    isCorrect
                      ? "bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800"
                      : "bg-muted/20 border border-border"
                  }`}
                >
                  {/* Answer Letter Circle */}
                  <div
                    className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs ${
                      isCorrect
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span>{answerLetter}</span>
                    )}
                  </div>

                  {/* Answer Content */}
                  <div className="flex-1 min-w-0">
                    {/* Answer Text */}
                    {choice.answer_text && (
                      <p className="text-sm leading-relaxed mb-2">
                        {choice.answer_text}
                      </p>
                    )}

                    {/* Progress Bar with Percentage */}
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1">
                        <Progress
                          value={choice.percentage}
                          className={`h-2 ${
                            isCorrect
                              ? "[&>div]:bg-green-500"
                              : "[&>div]:bg-gray-400"
                          }`}
                        />
                      </div>
                      <span className="text-xs font-bold text-foreground min-w-[2.5rem] text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights */}
        <div className="space-y-3 pt-3 border-t">
          <h4 className="font-semibold flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            Phân tích & Đề xuất
          </h4>

          <div className="space-y-2">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded p-3">
              <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">
                Đánh giá độ khó:
              </p>
              <p className="text-sm text-blue-900 dark:text-blue-200">
                {insights.difficulty_assessment}
              </p>
            </div>

            {insights.common_misconception.detected && (
              <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded p-3">
                <p className="text-xs font-medium text-orange-800 dark:text-orange-300 mb-1">
                  Hiểu lầm phổ biến:
                </p>
                <p className="text-sm text-orange-900 dark:text-orange-200">
                  {insights.common_misconception.description}
                </p>
              </div>
            )}

            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded p-3">
              <p className="text-xs font-medium text-green-800 dark:text-green-300 mb-1">
                Đề xuất giảng dạy:
              </p>
              <p className="text-sm text-green-900 dark:text-green-200">
                {insights.teaching_suggestion}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
