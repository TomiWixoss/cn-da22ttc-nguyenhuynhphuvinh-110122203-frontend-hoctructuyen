"use client";

import React from "react";
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
  BarChart3,
  Award,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Target,
  ArrowRight,
  Clock,
} from "lucide-react";
import { ComprehensiveAnalysisData } from "@/lib/types/chapter-analytics";

interface LearningOverviewDashboardProps {
  className?: string;
  data: ComprehensiveAnalysisData;
  onViewFullRoadmap?: () => void;
}

export default function LearningOverviewDashboard({
  className = "",
  data,
  onViewFullRoadmap,
}: LearningOverviewDashboardProps) {
  // Get performance level color
  const getPerformanceLevelColor = (level: string) => {
    switch (level) {
      case "excellent":
        return "text-green-600";
      case "good":
        return "text-blue-600";
      case "average":
        return "text-yellow-600";
      case "weak":
        return "text-red-600";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  // Get performance level text
  const getPerformanceLevelText = (level: string) => {
    switch (level) {
      case "excellent":
        return "Xuất sắc";
      case "good":
        return "Tốt";
      case "average":
        return "Trung bình";
      case "weak":
        return "Yếu";
      default:
        return "Chưa xác định";
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
      {/* Chỉ số hiệu suất tổng thể */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {data.overall_performance?.accuracy_percentage?.toFixed(1) ?? 0}%
            </div>
            <div className="text-sm text-muted-foreground">Độ chính xác</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {data.overall_performance?.average_score?.toFixed(1) ?? 0}
            </div>
            <div className="text-sm text-muted-foreground">Điểm TB</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {data.overall_performance?.total_quizzes_taken ?? 0}
            </div>
            <div className="text-sm text-muted-foreground">Quiz đã làm</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">
              {formatTime(
                data.overall_performance?.total_time_spent_seconds ?? 0
              )}
            </div>
            <div className="text-sm text-muted-foreground">Thời gian học</div>
          </CardContent>
        </Card>
      </div>

      {/* Biểu đồ cột so sánh mức độ thành thạo các chương */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            So sánh Mức độ Thành thạo theo Chương
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Hiển thị chương điểm mạnh */}
            {(data.chapter_analysis?.strengths ?? []).map((chapter) => (
              <div key={chapter.chapter_id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{chapter.chapter_name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {chapter.accuracy_percentage.toFixed(1)}%
                    </span>
                    <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800">
                      Điểm mạnh
                    </Badge>
                  </div>
                </div>
                <div className="relative">
                  <Progress
                    value={chapter.accuracy_percentage}
                    className="h-3"
                  />
                  {/* Target line - 80% */}
                  <div
                    className="absolute top-0 w-1 h-3 bg-yellow-500 dark:bg-yellow-600 border-l-2 border-yellow-600 dark:border-yellow-500"
                    style={{ left: "80%" }}
                  />
                </div>
              </div>
            ))}

            {/* Hiển thị chương điểm yếu */}
            {(data.chapter_analysis?.weaknesses ?? []).map((chapter) => (
              <div key={chapter.chapter_id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{chapter.chapter_name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {chapter.accuracy_percentage.toFixed(1)}%
                    </span>
                    <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800">
                      Cần cải thiện
                    </Badge>
                  </div>
                </div>
                <div className="relative">
                  <Progress
                    value={chapter.accuracy_percentage}
                    className="h-3"
                  />
                  {/* Target line - 80% */}
                  <div
                    className="absolute top-0 w-1 h-3 bg-yellow-500 dark:bg-yellow-600 border-l-2 border-yellow-600 dark:border-yellow-500"
                    style={{ left: "80%" }}
                  />
                </div>
              </div>
            ))}

            {/* Hiển thị thông báo nếu không có chương nào */}
            {(data.chapter_analysis?.strengths?.length ?? 0) === 0 &&
              (data.chapter_analysis?.weaknesses?.length ?? 0) === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Chưa có dữ liệu phân tích chương
                </div>
              )}
          </div>
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-300">
                <div className="w-4 h-1 bg-yellow-500 dark:bg-yellow-600 border-l-2 border-yellow-600 dark:border-yellow-500"></div>
                <span className="font-medium">Đường mục tiêu: 80%</span>
              </div>
              <div className="text-xs text-yellow-700">
                Chương đạt hoặc vượt mức này được coi là hoàn thành tốt
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Điểm mạnh & Điểm yếu nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Điểm mạnh */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Điểm mạnh ({data.lo_analysis?.strengths?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(data.lo_analysis?.strengths?.length ?? 0) > 0 ? (
              <div className="space-y-3">
                {(data.lo_analysis?.strengths ?? []).slice(0, 3).map((lo) => (
                  <div
                    key={lo.lo_id}
                    className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-green-800">
                        {lo.lo_name}
                      </div>
                      <div className="text-sm text-green-600">
                        {lo.lo_description}
                      </div>
                    </div>
                    <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800">
                      {(lo.accuracy_percentage ?? 0).toFixed(1)}%
                    </Badge>
                  </div>
                ))}
                {(data.lo_analysis?.strengths?.length ?? 0) > 3 && (
                  <div className="text-center text-sm text-muted-foreground">
                    +{(data.lo_analysis?.strengths?.length ?? 0) - 3} điểm mạnh
                    khác
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Chưa có điểm mạnh nổi bật
              </p>
            )}
          </CardContent>
        </Card>

        {/* Điểm yếu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              Cần cải thiện ({data.lo_analysis?.weaknesses?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(data.lo_analysis?.weaknesses?.length ?? 0) > 0 ? (
              <div className="space-y-3">
                {(data.lo_analysis?.weaknesses ?? []).slice(0, 3).map((lo) => (
                  <div
                    key={lo.lo_id}
                    className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/30 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-red-800">
                        {lo.lo_name}
                      </div>
                      <div className="text-sm text-red-600">
                        {lo.lo_description}
                      </div>
                    </div>
                    <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800">
                      {(lo.accuracy_percentage ?? 0).toFixed(1)}%
                    </Badge>
                  </div>
                ))}
                {(data.lo_analysis?.weaknesses?.length ?? 0) > 3 && (
                  <div className="text-center text-sm text-muted-foreground">
                    +{(data.lo_analysis?.weaknesses?.length ?? 0) - 3} điểm yếu
                    khác
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Không có điểm yếu đáng kể
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
