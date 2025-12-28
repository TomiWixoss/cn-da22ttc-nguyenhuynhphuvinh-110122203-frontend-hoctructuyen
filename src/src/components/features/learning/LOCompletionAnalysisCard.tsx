"use client";

import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Badge } from "@/components/ui/feedback";
import { Button } from "@/components/ui/forms";
import {
  AlertTriangle,
  TrendingUp,
  Clock,
  Target,
  Award,
  CheckCircle,
  ArrowRight,
  BookOpen,
  BarChart3,
  Star,
  Zap,
  Brain,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LOCompletionAnalysisProps,
  LOAnalysisItem,
} from "@/lib/types/lo-completion-analysis";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function LOCompletionAnalysisCard({
  className,
  data,
  onViewDetails,
  onStartImprovement,
}: LOCompletionAnalysisProps) {
  const [selectedLO, setSelectedLO] = useState<LOAnalysisItem | null>(null);

  // Log data for debugging (can be removed in production)
  React.useEffect(() => {
    if (data) {
    }
  }, [data]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "needs_improvement":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800";
      case "mastered":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    }
  };

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90)
      return {
        level: "excellent",
        color: "text-green-600 dark:text-green-400",
        bg: "bg-green-50 dark:bg-green-950/30",
        icon: Trophy,
      };
    if (percentage >= 80)
      return {
        level: "good",
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-950/30",
        icon: Star,
      };
    if (percentage >= 60)
      return {
        level: "average",
        color: "text-yellow-600 dark:text-yellow-400",
        bg: "bg-yellow-50 dark:bg-yellow-950/30",
        icon: Target,
      };
    return {
      level: "weak",
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/30",
      icon: AlertTriangle,
    };
  };

  const allLOs = [
    ...data.lo_analysis.needs_improvement,
    ...data.lo_analysis.ready_for_advancement,
  ];

  // Calculate overall statistics
  const totalQuestions = allLOs.reduce(
    (sum, lo) => sum + lo.total_questions,
    0
  );
  const totalCorrect = allLOs.reduce((sum, lo) => sum + lo.correct_answers, 0);
  const overallPercentage =
    totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
  const averageTime =
    allLOs.reduce((sum, lo) => sum + lo.total_time_spent, 0) /
    allLOs.length /
    1000 /
    60;

  // Render LO Performance Chart
  const renderLOChart = () => {
    // Prepare data for Bar chart
    const chartData = {
      labels: allLOs.map((lo) => lo.lo_name),
      datasets: [
        {
          label: "Tỷ lệ hoàn thành (%)",
          data: allLOs.map((lo) => lo.completion_percentage),
          backgroundColor: allLOs.map((lo) => {
            if (lo.completion_percentage >= 90) return "rgba(34, 197, 94, 0.8)"; // green
            if (lo.completion_percentage >= 80)
              return "rgba(59, 130, 246, 0.8)"; // blue
            if (lo.completion_percentage >= 60)
              return "rgba(245, 158, 11, 0.8)"; // yellow
            return "rgba(239, 68, 68, 0.8)"; // red
          }),
          borderColor: allLOs.map((lo) => {
            if (lo.completion_percentage >= 90) return "rgba(34, 197, 94, 1)";
            if (lo.completion_percentage >= 80) return "rgba(59, 130, 246, 1)";
            if (lo.completion_percentage >= 60) return "rgba(245, 158, 11, 1)";
            return "rgba(239, 68, 68, 1)";
          }),
          borderWidth: 2,
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false, // Hide legend since we have our own
        },
        tooltip: {
          callbacks: {
            title: function (context: any) {
              const lo = allLOs[context[0].dataIndex];
              return `${lo.lo_name} - ${lo.lo_description}`;
            },
            label: function (context: any) {
              const lo = allLOs[context.dataIndex];
              return [
                `Tỷ lệ hoàn thành: ${context.parsed.y}%`,
                `Câu đúng: ${lo.correct_answers}/${lo.total_questions}`,
                `Thời gian: ${Math.round(
                  lo.total_time_spent / 1000 / 60
                )} phút`,
              ];
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function (value: any) {
              return value + "%";
            },
          },
          title: {
            display: true,
            text: "Tỷ lệ hoàn thành (%)",
          },
        },
        x: {
          title: {
            display: true,
            text: "Chuẩn đầu ra",
          },
        },
      },
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Biểu đồ tỷ lệ hoàn thành Chuẩn đầu ra
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render LO Details Panel
  const renderLODetails = () => {
    if (!selectedLO) return null;

    const performance = getPerformanceLevel(selectedLO.completion_percentage);
    const IconComponent = performance.icon;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className={cn("p-4 rounded-lg", performance.bg)}>
          <div className="flex items-center gap-3 mb-3">
            <IconComponent className={cn("h-6 w-6", performance.color)} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {selectedLO.lo_name}
              </h3>
              <Badge
                className={cn("text-xs", getStatusColor(selectedLO.status))}
              >
                {selectedLO.status === "needs_improvement"
                  ? "Cần cải thiện"
                  : "Đã thành thạo"}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {selectedLO.lo_description}
          </p>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <div className={cn("text-xl font-bold", performance.color)}>
              {selectedLO.completion_percentage.toFixed(1)}%
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-400">
              Tỷ lệ hoàn thành
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {selectedLO.total_questions}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Tổng câu hỏi
            </div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <div className="text-xl font-bold text-green-700 dark:text-green-400">
              {selectedLO.correct_answers}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">
              Câu đúng
            </div>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
            <div className="text-xl font-bold text-orange-700 dark:text-orange-400">
              {Math.round(selectedLO.total_time_spent / 1000 / 60)}
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400">
              Phút
            </div>
          </div>
        </div>

        {/* Gợi ý cho LO được chọn - Gộp với phần trên */}
        {((selectedLO.status === "mastered" &&
          selectedLO.next_level_suggestions &&
          selectedLO.next_level_suggestions.length > 0) ||
          (selectedLO.status === "mastered" &&
            selectedLO.alternative_paths &&
            selectedLO.alternative_paths.length > 0)) && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              Gợi ý bổ sung cho Chuẩn đầu ra này
            </h4>

            {/* Next Level Suggestions */}
            {selectedLO.status === "mastered" &&
              selectedLO.next_level_suggestions &&
              selectedLO.next_level_suggestions.length > 0 && (
                <div className="mb-4">
                  <h5 className="font-medium text-orange-700 mb-2 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Chuẩn đầu ra tiếp theo được đề xuất
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedLO.next_level_suggestions
                      .slice(0, 4)
                      .map((suggestion, index) => (
                        <div
                          key={index}
                          className="p-3 bg-orange-50 rounded-lg border border-orange-200"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-medium text-orange-800 text-sm">
                              {suggestion.lo_name}
                            </h5>
                            <Badge
                              variant="outline"
                              className="text-xs text-orange-700"
                            >
                              {suggestion.estimated_study_time}
                            </Badge>
                          </div>
                          <p className="text-xs text-orange-600">
                            {suggestion.description}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {/* Alternative Paths */}
            {selectedLO.status === "mastered" &&
              selectedLO.alternative_paths &&
              selectedLO.alternative_paths.length > 0 && (
                <div>
                  <h5 className="font-medium text-purple-700 mb-2 flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    Lộ trình chuyên ngành
                  </h5>
                  <div className="space-y-3">
                    {selectedLO.alternative_paths.map((path, index) => (
                      <div
                        key={index}
                        className="p-4 bg-purple-50 rounded-lg border border-purple-200"
                      >
                        <h5 className="font-medium text-purple-800 mb-1">
                          {path.path_name}
                        </h5>
                        <p className="text-sm text-purple-600 mb-2">
                          {path.description}
                        </p>
                        <div className="text-xs text-purple-500">
                          <strong>Môn học tiếp theo:</strong>{" "}
                          {path.next_subjects.join(", ")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {selectedLO.status === "needs_improvement" ? (
            <Button
              onClick={() => onStartImprovement?.(selectedLO.lo_id)}
              className="flex-1"
            >
              <Zap className="h-4 w-4 mr-2" />
              Bắt đầu cải thiện
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => onViewDetails?.(selectedLO.lo_id)}
              className="flex-1"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Khám phá cấp độ tiếp theo
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-blue-600" />
          Phân tích Chuẩn đầu ra theo % Hoàn thành
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {allLOs.length}
            </div>
            <div className="text-sm text-blue-800 dark:text-blue-300">
              Tổng Chuẩn đầu ra
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {overallPercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-green-800 dark:text-green-300">
              Tỷ lệ chung
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {totalCorrect}
            </div>
            <div className="text-sm text-purple-800 dark:text-purple-300">
              Câu đúng
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg border border-orange-200 dark:border-orange-800 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {Math.round(averageTime)}
            </div>
            <div className="text-sm text-orange-800 dark:text-orange-300">
              Phút TB
            </div>
          </div>
        </div>

        {/* LO Performance Chart */}
        {renderLOChart()}
      </CardContent>
    </Card>
  );
}
