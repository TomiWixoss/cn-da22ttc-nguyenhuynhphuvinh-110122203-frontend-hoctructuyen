"use client";

import { useState, useMemo } from "react";
import {
  Code2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Users,
  BarChart3,
  FileQuestion,
  Target,
  BarChart,
  CheckCircle,
  X,
} from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import { codeAnalyticsService } from "@/lib/services/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Badge } from "@/components/ui/feedback";
import { Button } from "@/components/ui/forms";
import { useCodeAnalytics } from "@/lib/hooks/use-code-analytics";
import {
  Chart as ChartJS,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { TestCaseAnalytics } from "@/lib/services/api/code-analytics.service";

ChartJS.register(
  ChartTooltip,
  ChartLegend,
  BarElement,
  CategoryScale,
  LinearScale
);

interface QuestionDeepDiveProps {
  questions: any[];
}

// Test Case List Component with Input/Output
function TestCaseList({
  testCases,
  questionTestCases,
}: {
  testCases: TestCaseAnalytics[];
  questionTestCases?: Array<{
    input: string;
    expected?: string;
    output?: string;
    expected_output?: string;
    description?: string;
  }>;
}) {
  if (!testCases || testCases.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Code2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Chưa có dữ liệu test cases</p>
      </div>
    );
  }

  const getProgressColor = (passRate: number) => {
    if (passRate >= 70) return "bg-green-500";
    if (passRate >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-3">
      {testCases.map((tc, idx) => {
        const originalTC = questionTestCases?.[idx];
        return (
          <div
            key={tc.test_case_id || idx}
            className="p-4 rounded-lg border bg-card"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-bold text-primary">
                Test Case #{idx + 1}
              </span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getProgressColor(
                    tc.pass_rate
                  )}`}
                  style={{ width: `${tc.pass_rate}%` }}
                />
              </div>
              <span
                className={`text-sm font-bold ${
                  tc.pass_rate >= 70
                    ? "text-green-600"
                    : tc.pass_rate >= 40
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {tc.pass_rate}%
              </span>
            </div>
            {originalTC && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded bg-muted/50">
                  <span className="text-xs text-muted-foreground block mb-1">
                    Input:
                  </span>
                  <code className="block font-mono text-sm text-foreground break-all">
                    {originalTC.input || "(trống)"}
                  </code>
                </div>
                <div className="p-3 rounded bg-muted/50">
                  <span className="text-xs text-muted-foreground block mb-1">
                    Expected Output:
                  </span>
                  <code className="block font-mono text-sm text-foreground break-all">
                    {originalTC.expected ||
                      originalTC.output ||
                      originalTC.expected_output ||
                      "(trống)"}
                  </code>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Common Error Clusters Component
function CommonErrorClusters({
  testCases,
}: {
  testCases: TestCaseAnalytics[];
}) {
  const errorClusters = useMemo(() => {
    const errorMap = new Map<string, { count: number; testCases: number[] }>();
    testCases.forEach((tc, idx) => {
      if (tc.common_errors && Array.isArray(tc.common_errors)) {
        tc.common_errors.forEach((err) => {
          const existing = errorMap.get(err.error) || {
            count: 0,
            testCases: [],
          };
          existing.count += err.count;
          existing.testCases.push(idx + 1);
          errorMap.set(err.error, existing);
        });
      } else if (tc.common_error) {
        const existing = errorMap.get(tc.common_error) || {
          count: 0,
          testCases: [],
        };
        existing.count += 1;
        existing.testCases.push(idx + 1);
        errorMap.set(tc.common_error, existing);
      }
    });
    return Array.from(errorMap.entries())
      .map(([error, data]) => ({ error, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [testCases]);

  if (errorClusters.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
        <p className="text-sm">Không có lỗi phổ biến được phát hiện</p>
      </div>
    );
  }

  // Tính tổng số lần lỗi để hiển thị phần trăm
  const totalErrors = errorClusters.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="space-y-2">
      {errorClusters.map((cluster, idx) => {
        const percentage = Math.round((cluster.count / totalErrors) * 100);
        return (
          <div
            key={idx}
            className="group relative p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
          >
            {/* Progress bar background */}
            <div
              className="absolute inset-0 rounded-lg bg-red-500/5 transition-all"
              style={{ width: `${percentage}%` }}
            />

            <div className="relative flex items-center gap-3">
              {/* Rank number */}
              <div className="flex-shrink-0 size-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                {idx + 1}
              </div>

              {/* Error message */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono truncate" title={cluster.error}>
                  {cluster.error}
                </p>
              </div>

              {/* Count badge */}
              <div className="flex-shrink-0 flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">
                  {cluster.count} lần
                </span>
                <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded">
                  {percentage}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Question Detail Panel - hiển thị khi click vào biểu đồ
function QuestionDetailPanel({
  question,
  questionIndex,
  onClose,
}: {
  question: any;
  questionIndex: number;
  onClose: () => void;
}) {
  const { data: analytics, isLoading } = useCodeAnalytics(question.question_id);

  const testCases =
    analytics?.test_cases_analytics || analytics?.test_cases || [];
  const passRate =
    testCases.length > 0
      ? testCases.reduce(
          (sum: number, tc: TestCaseAnalytics) => sum + (tc.pass_rate || 0),
          0
        ) / testCases.length
      : (analytics?.overall?.avg_pass_rate || 0) * 100;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary">
              <FileQuestion className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">
                Câu {questionIndex + 1}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {question.validation_rules?.language && (
                  <Badge variant="outline" className="text-xs">
                    {question.validation_rules.language.toUpperCase()}
                  </Badge>
                )}
                {analytics?.difficulty_rating && (
                  <Badge
                    className={`text-xs ${
                      analytics.difficulty_rating === "easy"
                        ? "bg-green-100 text-green-700"
                        : analytics.difficulty_rating === "medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {analytics.difficulty_rating === "easy"
                      ? "Dễ"
                      : analytics.difficulty_rating === "medium"
                      ? "Trung bình"
                      : "Khó"}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          {question.question_text || "Câu hỏi code"}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
            <span className="text-sm text-muted-foreground">Đang tải...</span>
          </div>
        ) : testCases.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Code2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Chưa có dữ liệu phân tích</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <Users className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                <p className="text-xl font-bold">
                  {analytics?.overall?.total_students_attempted || 0}
                </p>
                <p className="text-xs text-muted-foreground">Sinh viên</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-green-600" />
                <p className="text-xl font-bold text-green-600">
                  {passRate.toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Tỷ lệ đúng</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                <BarChart3 className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                <p className="text-xl font-bold">
                  {analytics?.overall?.avg_attempts?.toFixed(1) || 0}
                </p>
                <p className="text-xs text-muted-foreground">Lần thử TB</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                <Code2 className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                <p className="text-xl font-bold">{testCases.length}</p>
                <p className="text-xs text-muted-foreground">Test cases</p>
              </div>
            </div>

            {/* Test Cases */}
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Code2 className="h-4 w-4 text-primary" />
                Test Cases
              </p>
              <TestCaseList
                testCases={testCases}
                questionTestCases={question.validation_rules?.test_cases}
              />
            </div>

            {/* Common Errors */}
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Lỗi phổ biến
              </p>
              <CommonErrorClusters testCases={testCases} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function QuestionDeepDive({ questions }: QuestionDeepDiveProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(
    null
  );

  const questionQueries = useQueries({
    queries: questions.map((q) => ({
      queryKey: ["code-analytics", "question", q.question_id, "summary"],
      queryFn: () => codeAnalyticsService.getQuestionDifficulty(q.question_id),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const isLoading = questionQueries.some((q) => q.isLoading);

  const selectedQuestion = useMemo(() => {
    return questions.find((q) => q.question_id === selectedQuestionId);
  }, [questions, selectedQuestionId]);

  const selectedQuestionIndex = useMemo(() => {
    return questions.findIndex((q) => q.question_id === selectedQuestionId);
  }, [questions, selectedQuestionId]);

  if (!questions || questions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-12">
          <Code2 className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground">
            Không có câu hỏi code trong quiz này
          </p>
        </CardContent>
      </Card>
    );
  }

  // Tính pass rate cho mỗi câu hỏi
  const questionPassRates = useMemo(() => {
    return questionQueries.map((q, i) => {
      if (!q.data)
        return { questionId: questions[i].question_id, rate: 0, index: i };
      const tc = q.data.test_cases_analytics || q.data.test_cases || [];
      const rate =
        tc.length > 0
          ? tc.reduce((sum, t) => sum + (t.pass_rate || 0), 0) / tc.length
          : (q.data.overall?.avg_pass_rate || 0) * 100;
      return { questionId: questions[i].question_id, rate, index: i };
    });
  }, [questionQueries, questions]);

  // Tạo các nhóm câu hỏi theo mức độ
  const questionGroups = useMemo(() => {
    const good = questionPassRates.filter((q) => q.rate >= 70);
    const medium = questionPassRates.filter((q) => q.rate >= 40 && q.rate < 70);
    const hard = questionPassRates.filter((q) => q.rate < 40);
    return [
      {
        key: "good",
        label: "Tốt (≥70%)",
        count: good.length,
        color: "#22C55E",
        questions: good,
      },
      {
        key: "medium",
        label: "Trung bình (40-69%)",
        count: medium.length,
        color: "#EAB308",
        questions: medium,
      },
      {
        key: "hard",
        label: "Khó (<40%)",
        count: hard.length,
        color: "#EF4444",
        questions: hard,
      },
    ].filter((g) => g.count > 0);
  }, [questionPassRates]);

  const chartData = {
    labels: questions.map((_, i) => `Câu ${i + 1}`),
    datasets: [
      {
        label: "Tỷ lệ đúng (%)",
        data: questionPassRates.map((q) => q.rate),
        backgroundColor: questionPassRates.map((q) => {
          if (q.rate >= 70) return "#22C55E"; // green-500
          if (q.rate >= 40) return "#EAB308"; // yellow-500
          return "#EF4444"; // red-500
        }),
        borderColor: questionPassRates.map((q) => {
          if (q.rate >= 70) return "#22C55E";
          if (q.rate >= 40) return "#EAB308";
          return "#EF4444";
        }),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const handleQuestionClick = (questionId: number) => {
    setSelectedQuestionId(
      selectedQuestionId === questionId ? null : questionId
    );
    setTimeout(() => {
      document
        .getElementById("question-detail-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BarChart className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Hiệu suất theo câu hỏi
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Click vào cột hoặc nhóm bên dưới để xem chi tiết câu hỏi
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-48 sm:h-64">
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      padding: 10,
                      cornerRadius: 6,
                      callbacks: {
                        label: (ctx) =>
                          `Tỷ lệ đúng: ${(ctx.parsed.y ?? 0).toFixed(1)}%`,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: { callback: (v) => `${v}%`, font: { size: 10 } },
                      title: { display: true, text: "Tỷ lệ đúng (%)" },
                    },
                    x: {
                      ticks: { font: { size: 10 } },
                      title: { display: true, text: "Câu hỏi" },
                    },
                  },
                  onClick: (_, elements) => {
                    if (elements.length > 0) {
                      const idx = elements[0].index;
                      handleQuestionClick(questions[idx].question_id);
                    }
                  },
                }}
              />
            </div>

            {/* Legend with Selection Indicator - giống tab Sinh viên */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 pt-4 border-t">
              {questionGroups.map((group) => (
                <div
                  key={group.key}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all cursor-pointer ${
                    group.questions.some(
                      (q) => q.questionId === selectedQuestionId
                    )
                      ? "bg-primary/10 ring-2 ring-primary/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => {
                    // Click vào nhóm sẽ chọn câu đầu tiên trong nhóm đó
                    if (group.questions.length > 0) {
                      const firstQ = group.questions[0];
                      handleQuestionClick(firstQ.questionId);
                    }
                  }}
                >
                  <div
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded shrink-0"
                    style={{ backgroundColor: group.color }}
                  />
                  <span
                    className={`text-xs sm:text-sm ${
                      group.questions.some(
                        (q) => q.questionId === selectedQuestionId
                      )
                        ? "font-medium text-primary"
                        : ""
                    }`}
                  >
                    {group.label} ({group.count})
                  </span>
                  {group.questions.some(
                    (q) => q.questionId === selectedQuestionId
                  ) && (
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Detail */}
      {selectedQuestion ? (
        <div id="question-detail-section">
          <QuestionDetailPanel
            question={selectedQuestion}
            questionIndex={selectedQuestionIndex}
            onClose={() => setSelectedQuestionId(null)}
          />
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-12 text-muted-foreground">
            <Target className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-sm italic">
              Chọn một câu hỏi từ biểu đồ phía trên để xem chi tiết
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
