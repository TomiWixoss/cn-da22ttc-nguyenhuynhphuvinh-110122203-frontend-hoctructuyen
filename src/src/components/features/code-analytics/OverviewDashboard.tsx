"use client";

import { useMemo } from "react";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Target,
  Award,
  Code2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Badge } from "@/components/ui/feedback";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  ArcElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  CourseOverviewData,
  ScoreDistribution,
} from "@/lib/services/api/code-analytics.service";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  ChartLegend
);

interface OverviewDashboardProps {
  overview: CourseOverviewData | undefined;
  onNavigateToQuestion?: (questionId: number) => void;
  onNavigateToStudent?: (userId: number) => void;
}

export function OverviewDashboard({
  overview,
  onNavigateToStudent,
}: OverviewDashboardProps) {
  const totalStudents =
    overview?.quiz_info?.total_students ||
    overview?.overview?.total_students ||
    0;
  const avgPassRate = overview?.overview?.avg_pass_rate || 0;
  const studentsNeedingHelp = overview?.students_needing_help || [];
  const topPerformers = overview?.top_performers || [];
  const allStudents = overview?.all_students || [];

  // Sinh viên đã hoàn thành
  const completedStudents = useMemo(() => {
    return allStudents.filter((s) => s.progress_status === "completed");
  }, [allStudents]);

  const completionRate =
    totalStudents > 0 ? (completedStudents.length / totalStudents) * 100 : 0;

  const scoreData = useMemo(() => {
    return overview?.charts?.score_distribution || [];
  }, [overview]);

  const passRatePercent = Math.round(avgPassRate * 100);

  // Lấy thống kê từ overview
  const stats = useMemo(() => {
    const overviewData = overview?.overview;
    return {
      totalRuns: overviewData?.total_test_runs || 0,
    };
  }, [overview]);

  return (
    <div className="space-y-6">
      {/* Row 1: Tổng quan nhanh - 4 cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Pass Rate TB */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {passRatePercent}
                  <span className="text-base font-normal text-muted-foreground">
                    %
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">Pass Rate TB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hoàn thành */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {completionRate.toFixed(0)}
                  <span className="text-base font-normal text-muted-foreground">
                    %
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Hoàn thành ({completedStudents.length}/{totalStudents})
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tổng lần chạy */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Code2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalRuns}</p>
                <p className="text-sm text-muted-foreground">Lần chạy code</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cần hỗ trợ */}
        <Card
          className={studentsNeedingHelp.length > 0 ? "border-red-300" : ""}
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  studentsNeedingHelp.length > 0
                    ? "bg-red-100 dark:bg-red-900/30"
                    : "bg-muted"
                }`}
              >
                <AlertTriangle
                  className={`h-5 w-5 ${
                    studentsNeedingHelp.length > 0
                      ? "text-red-600"
                      : "text-muted-foreground"
                  }`}
                />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {studentsNeedingHelp.length}
                </p>
                <p className="text-sm text-muted-foreground">Cần hỗ trợ</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Phân bố điểm - full width */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Phân bố điểm số
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scoreData.length > 0 ? (
            <div className="h-[160px]">
              <Bar
                data={{
                  labels: scoreData.map((d: ScoreDistribution) => d.range),
                  datasets: [
                    {
                      label: "Số SV",
                      data: scoreData.map((d: ScoreDistribution) => d.count),
                      backgroundColor: scoreData.map((d: ScoreDistribution) => {
                        const score = parseInt(d.range?.split("-")[0] || "0");
                        if (score >= 80) return "rgba(34, 197, 94, 0.7)";
                        if (score >= 60) return "rgba(59, 130, 246, 0.7)";
                        if (score >= 40) return "rgba(234, 179, 8, 0.7)";
                        return "rgba(239, 68, 68, 0.7)";
                      }),
                      borderRadius: 4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: { font: { size: 11 } },
                    },
                    y: {
                      beginAtZero: true,
                      ticks: { precision: 0, font: { size: 11 } },
                    },
                  },
                }}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Chưa có dữ liệu điểm số
            </p>
          )}
        </CardContent>
      </Card>

      {/* Row 3: Danh sách quan trọng */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Sinh viên cần hỗ trợ */}
        <Card
          className={studentsNeedingHelp.length > 0 ? "border-red-200" : ""}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle
                className={`h-4 w-4 ${
                  studentsNeedingHelp.length > 0 ? "text-red-600" : ""
                }`}
              />
              Cần hỗ trợ ({studentsNeedingHelp.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {studentsNeedingHelp.length === 0 ? (
              <div className="flex items-center gap-2 text-green-600 py-4">
                <CheckCircle2 className="h-5 w-5" />
                <p className="text-sm">Không có cảnh báo!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {studentsNeedingHelp.slice(0, 5).map((student, idx) => {
                  const score = (student.avg_pass_rate || 0) * 10;
                  return (
                    <div
                      key={student.user_id || idx}
                      className="p-2 rounded border cursor-pointer hover:bg-muted/50"
                      onClick={() => onNavigateToStudent?.(student.user_id)}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {student.name || student.user?.name}
                        </p>
                        <Badge
                          variant="outline"
                          className="text-red-600 text-xs"
                        >
                          {student.status === "critical"
                            ? "Khẩn cấp"
                            : "Cảnh báo"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>
                          Điểm:{" "}
                          <span
                            className={`font-medium ${
                              score >= 5 ? "text-yellow-600" : "text-red-600"
                            }`}
                          >
                            {score.toFixed(1)}
                          </span>
                        </span>
                        {student.total_test_runs !== undefined && (
                          <span>
                            Run:{" "}
                            <span className="font-medium">
                              {student.total_test_runs}
                            </span>
                          </span>
                        )}
                        {(student.total_compile_errors ?? 0) > 0 && (
                          <span className="text-orange-600">
                            Lỗi biên dịch: {student.total_compile_errors}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {studentsNeedingHelp.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    và {studentsNeedingHelp.length - 5} sinh viên khác
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top sinh viên xuất sắc */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-600" />
              Top xuất sắc
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topPerformers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Chưa có dữ liệu
              </p>
            ) : (
              <div className="space-y-2">
                {topPerformers.slice(0, 5).map((student, idx) => {
                  const score = (student.avg_pass_rate || 0) * 10;
                  return (
                    <div
                      key={student.user?.user_id || idx}
                      className="flex items-center gap-2 p-2 rounded border"
                    >
                      <div className="size-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-700 font-bold text-xs">
                        {idx + 1}
                      </div>
                      <span className="text-sm flex-1 truncate">
                        {student.user?.name}
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          score >= 8
                            ? "text-green-600"
                            : score >= 6.5
                            ? "text-blue-600"
                            : score >= 5
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {score.toFixed(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
