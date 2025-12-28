"use client";

import React, { useState, useMemo } from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Bubble } from "react-chartjs-2";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
// import { Badge } from "@/components/ui/feedback";
import { BarChart3, Filter, HelpCircle } from "lucide-react";
import { ChapterAnalysisData } from "@/lib/types/chapter-analytics";

// Register Chart.js components
ChartJS.register(LinearScale, PointElement, Tooltip, Legend, Title);

interface LearningOutcomeBubbleChartProps {
  analysisData: ChapterAnalysisData;
  className?: string;
}

interface BubbleDataPoint {
  id: string;
  type: "learning_outcome" | "difficulty" | "chapter";
  name: string;
  full_name?: string;
  x: number; // Accuracy percentage
  y: number; // LO index or category index
  r: number; // Question count (bubble size)
  accuracy: number;
  total_questions: number;
  correct_answers: number;
  performance_level: string;
  difficulty_level?: string;
  chapter_name?: string;
  related_info?: any;
}

const LearningOutcomeBubbleChart = React.memo(
  function LearningOutcomeBubbleChart({
    analysisData,
    className = "",
  }: LearningOutcomeBubbleChartProps) {
    const [filterType, setFilterType] = useState<
      "all" | "learning_outcome" | "difficulty" | "chapter"
    >("all");
    const [showTooltip, setShowTooltip] = useState(false);

    // Helper to detect if we have NEW API data
    const hasNewAPIData = useMemo(() => {
      return !!(
        analysisData.learning_outcome_analysis?.strengths?.length ||
        analysisData.learning_outcome_analysis?.weaknesses?.length
      );
    }, [analysisData.learning_outcome_analysis]);

    // Prepare bubble data
    const bubbleData = useMemo(() => {
      const bubbles: BubbleDataPoint[] = [];
      const seenItems = new Set<string>(); // Track seen items to avoid duplicates

      // Add Learning Outcomes
      if (hasNewAPIData && analysisData.learning_outcome_analysis) {
        const allLOs = [
          ...(analysisData.learning_outcome_analysis.strengths || []),
          ...(analysisData.learning_outcome_analysis.weaknesses || []),
        ];

        allLOs.forEach((lo) => {
          const itemKey = `lo_${lo.lo_id}`;
          if (!seenItems.has(itemKey)) {
            seenItems.add(itemKey);
            bubbles.push({
              id: itemKey,
              type: "learning_outcome",
              name: lo.lo_name || `LO${lo.lo_id}`,
              full_name: `${lo.lo_name || `LO${lo.lo_id}`} - ${
                lo.lo_description || lo.lo_name || "Chuẩn đầu ra"
              }`,
              x: lo.accuracy_percentage,
              y: bubbles.length, // Use bubbles.length for consistent Y positioning
              r: Math.max(8, Math.min(35, Math.sqrt(lo.total_questions) * 4)), // Better scaling
              accuracy: lo.accuracy_percentage,
              total_questions: lo.total_questions,
              correct_answers: lo.correct_answers,
              performance_level: lo.performance_level,
              related_info: lo,
            });
          }
        });
      }

      // Add Difficulty Levels
      if (hasNewAPIData && analysisData.difficulty_analysis) {
        const allDifficulties = [
          ...(analysisData.difficulty_analysis.strengths || []),
          ...(analysisData.difficulty_analysis.weaknesses || []),
        ];

        allDifficulties.forEach((diff) => {
          const itemKey = `diff_${diff.level_id}`;
          if (!seenItems.has(itemKey)) {
            seenItems.add(itemKey);
            bubbles.push({
              id: itemKey,
              type: "difficulty",
              name: `Độ khó: ${diff.level_name}`,
              x: diff.accuracy_percentage,
              y: bubbles.length, // Use bubbles.length for consistent Y positioning
              r: Math.max(8, Math.min(35, Math.sqrt(diff.total_questions) * 4)),
              accuracy: diff.accuracy_percentage,
              total_questions: diff.total_questions,
              correct_answers: diff.correct_answers,
              performance_level: diff.performance_level,
              difficulty_level: diff.level_name,
              related_info: diff,
            });
          }
        });
      }

      // Add Chapters
      if (analysisData.chapter_analysis) {
        const allChapters = [
          ...(analysisData.chapter_analysis.strengths || []),
          ...(analysisData.chapter_analysis.weaknesses || []),
        ];

        allChapters.forEach((chapter) => {
          const itemKey = `chapter_${chapter.chapter_id}`;
          if (!seenItems.has(itemKey)) {
            seenItems.add(itemKey);
            bubbles.push({
              id: itemKey,
              type: "chapter",
              name: `Chương: ${chapter.chapter_name}`,
              x: chapter.accuracy_percentage,
              y: bubbles.length, // Use bubbles.length for consistent Y positioning
              r: Math.max(
                8,
                Math.min(35, Math.sqrt(chapter.total_questions) * 4)
              ),
              accuracy: chapter.accuracy_percentage,
              total_questions: chapter.total_questions,
              correct_answers: chapter.correct_answers,
              performance_level: chapter.performance_level || "average",
              chapter_name: chapter.chapter_name,
              related_info: chapter,
            });
          }
        });
      }

      return bubbles;
    }, [hasNewAPIData, analysisData]);

    // Filter bubbles based on selected filter
    const filteredBubbles = useMemo(() => {
      if (filterType === "all") return bubbleData;
      return bubbleData.filter((bubble) => bubble.type === filterType);
    }, [bubbleData, filterType]);

    // Prepare Chart.js data
    const chartData = useMemo(() => {
      const datasets = [];

      // Re-assign Y positions for filtered bubbles to avoid gaps and duplicates
      const bubblesWithNewY = filteredBubbles.map((bubble, index) => ({
        ...bubble,
        y: index, // Sequential Y positions starting from 0
      }));

      // Group bubbles by type for different colors
      const loData = bubblesWithNewY.filter(
        (b) => b.type === "learning_outcome"
      );
      const diffData = bubblesWithNewY.filter((b) => b.type === "difficulty");
      const chapterData = bubblesWithNewY.filter((b) => b.type === "chapter");

      if (loData.length > 0) {
        datasets.push({
          label: "Chuẩn đầu ra",
          data: loData.map((bubble) => ({
            x: bubble.x,
            y: bubble.y,
            r: bubble.r,
            bubble: bubble,
          })),
          backgroundColor: "rgba(33, 150, 243, 0.6)",
          borderColor: "rgba(33, 150, 243, 1)",
          borderWidth: 2,
        });
      }

      if (diffData.length > 0) {
        datasets.push({
          label: "Độ khó",
          data: diffData.map((bubble) => ({
            x: bubble.x,
            y: bubble.y,
            r: bubble.r,
            bubble: bubble,
          })),
          backgroundColor: "rgba(255, 152, 0, 0.6)",
          borderColor: "rgba(255, 152, 0, 1)",
          borderWidth: 2,
        });
      }

      if (chapterData.length > 0) {
        datasets.push({
          label: "Chương",
          data: chapterData.map((bubble) => ({
            x: bubble.x,
            y: bubble.y,
            r: bubble.r,
            bubble: bubble,
          })),
          backgroundColor: "rgba(76, 175, 80, 0.6)",
          borderColor: "rgba(76, 175, 80, 1)",
          borderWidth: 2,
        });
      }

      return { datasets, bubblesWithNewY };
    }, [filteredBubbles]);

    // Chart options
    const chartOptions = useMemo(
      () => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: false,
          },
          legend: {
            display: true,
            position: "top" as const,
          },
          tooltip: {
            callbacks: {
              label: function (context: any) {
                const bubble = context.raw.bubble;
                const performanceText =
                  bubble.performance_level === "excellent"
                    ? "Xuất sắc"
                    : bubble.performance_level === "good"
                    ? "Tốt"
                    : bubble.performance_level === "average"
                    ? "Trung bình"
                    : bubble.performance_level === "poor"
                    ? "Kém"
                    : "Cần cải thiện";

                return [
                  `${bubble.full_name || bubble.name}`,
                  `Độ chính xác: ${bubble.accuracy.toFixed(1)}%`,
                  `Câu hỏi: ${bubble.total_questions}`,
                  `Câu đúng: ${bubble.correct_answers}`,
                  `Hiệu suất: ${performanceText}`,
                ];
              },
            },
          },
        },
        scales: {
          x: {
            type: "linear" as const,
            position: "bottom" as const,
            min: 0,
            max: 100,
            title: {
              display: true,
              text: "Độ chính xác (%)",
              font: {
                size: 14,
                weight: "bold" as const,
              },
            },
            grid: {
              color: "rgba(0, 0, 0, 0.1)",
            },
            ticks: {
              callback: function (value: any) {
                return value + "%";
              },
            },
          },
          y: {
            type: "linear" as const,
            min: 0,
            max: Math.max(2, filteredBubbles.length),
            title: {
              display: true,
              text: "Các khía cạnh học tập",
              font: {
                size: 14,
                weight: "bold" as const,
              },
            },
            ticks: {
              stepSize: 1,
              callback: function (value: any) {
                // Hiển thị labels ở các vị trí integer (0, 1, 2...) nhưng offset để ở giữa
                const index = Math.round(value);
                if (index >= 0 && index < filteredBubbles.length) {
                  const bubble = chartData.bubblesWithNewY?.[index];
                  return bubble ? bubble.name : "";
                }
                return "";
              },
            },
            grid: {
              color: "rgba(0, 0, 0, 0.1)",
              offset: true, // Đỉnh dịch grid để labels ở giữa
            },
          },
        },
      }),
      [chartData, filteredBubbles]
    );

    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                Biểu đồ Bong bóng - Phân tích Toàn diện
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Trực quan hóa 4 chiều: Độ chính xác (X), Khía cạnh (Y), Số câu
                hỏi (Kích thước), Loại (Màu sắc)
              </p>
            </div>
            <div className="relative">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Hướng dẫn sử dụng"
              >
                <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </button>

              {/* Tooltip nhỏ gọn */}
              {showTooltip && (
                <div className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded px-3 py-2 z-10 whitespace-nowrap">
                  <div className="space-y-1">
                    <div>
                      📊 <strong>X:</strong> Độ chính xác | <strong>Y:</strong>{" "}
                      Khía cạnh
                    </div>
                    <div>🔵 LO 🟠 Độ khó 🟢 Chương | Lớn = nhiều câu</div>
                    <div className="text-yellow-300">
                      💡 Ưu tiên bong bóng lớn bên trái!
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="w-full space-y-6">
            {/* Filter Controls */}
            <div className="flex flex-wrap gap-2 items-center">
              <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Lọc theo:
              </span>
              {[
                { key: "all", label: "Tất cả" },
                { key: "learning_outcome", label: "Chuẩn đầu ra" },
                { key: "difficulty", label: "Độ khó" },
                { key: "chapter", label: "Chương" },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setFilterType(filter.key as any)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    filterType === filter.key
                      ? "bg-blue-500 dark:bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Bubble Chart */}
            {filteredBubbles.length > 0 && (
              <div>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div
                    className="min-h-96"
                    style={{
                      height: `${Math.max(
                        384,
                        filteredBubbles.length * 60 + 100
                      )}px`,
                    }}
                  >
                    <Bubble
                      data={{ datasets: chartData.datasets }}
                      options={chartOptions}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* No data message */}
            {filteredBubbles.length === 0 && (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Không có dữ liệu phân tích
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Chưa có dữ liệu Chuẩn đầu ra, Độ khó hoặc Chương để hiển thị
                  trong biểu đồ bong bóng.
                </p>
              </div>
            )}
          </div>

          {/* Help Popup */}
        </CardContent>
      </Card>
    );
  }
);

export default LearningOutcomeBubbleChart;
