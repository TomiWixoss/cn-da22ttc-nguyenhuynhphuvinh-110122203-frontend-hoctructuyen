"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout";
import { Badge } from "@/components/ui/feedback";
import { Progress } from "@/components/ui/feedback";
import { Skeleton } from "@/components/ui/feedback";
import {
  Code2,
  Target,
  TrendingUp,
  FileCode,
  Send,
  AlertCircle,
} from "lucide-react";
import { useStudentCodeAnalytics } from "@/lib/hooks/use-student-code-analytics";

export function CodeAnalyticsSection() {
  const { analytics, isLoading, isError } = useStudentCodeAnalytics();

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Thống kê Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Thống kê Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">Chưa có dữ liệu thống kê code</p>
            <p className="text-xs mt-1">Hãy làm bài tập code để xem thống kê</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalMastery =
    analytics.mastery_distribution.beginner +
    analytics.mastery_distribution.intermediate +
    analytics.mastery_distribution.expert;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code2 className="h-5 w-5" />
          Thống kê Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <FileCode className="h-4 w-4" />
              <span className="text-sm font-medium">Câu hỏi đã làm</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">
              {analytics.total_questions_attempted}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <Send className="h-4 w-4" />
              <span className="text-sm font-medium">Lần nộp bài</span>
            </div>
            <p className="text-2xl font-bold text-green-700">
              {analytics.total_submissions}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Tỷ lệ pass TB</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-purple-700">
                {formatPercent(analytics.average_pass_rate)}
              </p>
            </div>
            <Progress
              value={analytics.average_pass_rate * 100}
              className="mt-2 h-2"
            />
          </div>
        </div>

        {/* Mastery Distribution */}
        {totalMastery > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Phân bố trình độ</span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="flex items-center justify-between p-3 rounded-lg border-2 border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
                <div>
                  <Badge className="bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400">
                    Cơ bản
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((analytics.mastery_distribution.beginner / totalMastery) * 100).toFixed(0)}%
                  </p>
                </div>
                <span className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                  {analytics.mastery_distribution.beginner}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800">
                <div>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400">
                    Trung cấp
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((analytics.mastery_distribution.intermediate / totalMastery) * 100).toFixed(0)}%
                  </p>
                </div>
                <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                  {analytics.mastery_distribution.intermediate}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border-2 border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800">
                <div>
                  <Badge className="bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400">
                    Nâng cao
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((analytics.mastery_distribution.expert / totalMastery) * 100).toFixed(0)}%
                  </p>
                </div>
                <span className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                  {analytics.mastery_distribution.expert}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
