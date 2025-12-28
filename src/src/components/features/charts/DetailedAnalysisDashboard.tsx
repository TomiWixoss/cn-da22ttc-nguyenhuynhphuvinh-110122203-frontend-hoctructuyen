"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import { Progress } from "@/components/ui/feedback";
import {
  Loader2,
  Target,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Users,
  Award,
  Clock,
  FileText,
  PlayCircle,
  PenTool,
} from "lucide-react";
import { chapterAnalyticsService } from "@/lib/services/api/chapter-analytics.service";
import { ComprehensiveAnalysisData } from "@/lib/types/chapter-analytics";
import { showErrorToast } from "@/lib/utils/toast-utils";
import { useAuthStatus } from "@/lib/hooks/use-auth";

interface DetailedAnalysisDashboardProps {
  className?: string;
  data: ComprehensiveAnalysisData;
}

export default function DetailedAnalysisDashboard({
  className = "",
  data,
}: DetailedAnalysisDashboardProps) {
  // Helper function to calculate performance level based on accuracy
  const getPerformanceLevel = (
    accuracy: number
  ): "excellent" | "good" | "average" | "weak" => {
    if (accuracy >= 80) return "excellent";
    if (accuracy >= 60) return "good";
    if (accuracy >= 40) return "average";
    return "weak";
  };

  const performanceLevel = getPerformanceLevel(
    data.overall_performance.accuracy_percentage
  );

  // Get content type icon
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <FileText className="h-4 w-4" />;
      case "video":
        return <PlayCircle className="h-4 w-4" />;
      case "exercise":
        return <PenTool className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} phút`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Chi tiết theo chương - Gộp thành thạo + tiến độ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Chi tiết theo Chương - Thành thạo & Tiến độ
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Kết hợp mức độ thành thạo (từ kết quả quiz) và tiến độ hoàn thành
            (so với mục tiêu)
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Safe guard: Check if chapter_analysis exists and has data */}
            {data.chapter_analysis?.strengths?.length > 0 ||
            data.chapter_analysis?.weaknesses?.length > 0 ? (
              // Combine all chapters from strengths and weaknesses
              [
                ...(data.chapter_analysis.strengths || []),
                ...(data.chapter_analysis.weaknesses || []),
              ].map((chapter) => {
                // Get chapter status based on category
                const getChapterStatus = (chapterItem: any) => {
                  if (
                    data.chapter_analysis.strengths?.some(
                      (s) => s.chapter_id === chapterItem.chapter_id
                    )
                  ) {
                    return "achieved";
                  } else if (
                    data.chapter_analysis.weaknesses?.some(
                      (w) => w.chapter_id === chapterItem.chapter_id
                    )
                  ) {
                    return "needs_attention";
                  } else {
                    return "in_progress";
                  }
                };

                const status = getChapterStatus(chapter);
                // Calculate completion percentage (using accuracy as proxy)
                const completionPercentage = chapter.accuracy_percentage || 0;
                // Mock target line (you may want to make this configurable)
                const targetLine = 75;
                const gapToTarget = targetLine - completionPercentage;

                return (
                  <div
                    key={chapter.chapter_id}
                    className="border rounded-lg p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        {chapter.chapter_name}
                      </h3>
                      <Badge
                        className={
                          status === "achieved"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800"
                            : status === "in_progress"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                            : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800"
                        }
                      >
                        {status === "achieved"
                          ? "Đạt mục tiêu"
                          : status === "in_progress"
                          ? "Đang tiến bộ"
                          : "Cần chú ý"}
                      </Badge>
                    </div>

                    {/* Progress Section */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-blue-700 dark:text-blue-400">
                          Mức độ thành thạo (so với mục tiêu {targetLine}%)
                        </span>
                        <span className="font-medium">
                          {completionPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={completionPercentage} className="h-3" />
                      <div className="text-xs text-muted-foreground">
                        {gapToTarget > 0 ? (
                          <span className="text-red-600 dark:text-red-400">
                            Còn thiếu {gapToTarget.toFixed(1)}% để đạt mục tiêu
                          </span>
                        ) : (
                          <span className="text-green-600 dark:text-green-400">
                            Đã vượt mục tiêu {Math.abs(gapToTarget).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Chapter Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Chapter Statistics */}
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                        <div className="text-sm font-medium mb-2">
                          Thống kê chương:
                        </div>
                        <div className="space-y-1 text-xs">
                          <div>
                            Câu đúng: {chapter.correct_answers}/
                            {chapter.total_questions}
                          </div>
                          <div>
                            Độ chính xác:{" "}
                            {chapter.accuracy_percentage?.toFixed(1)}%
                          </div>
                          <div>
                            Thời gian TB:{" "}
                            {Math.round(
                              (chapter.average_time_per_question || 0) / 1000
                            )}
                            s
                          </div>
                        </div>
                      </div>

                      {/* Learning Outcomes */}
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                        <div className="text-sm font-medium mb-2">
                          Chuẩn đầu ra liên quan:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(chapter.related_los || []).map((lo, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {lo}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Chưa có dữ liệu phân tích chương
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
