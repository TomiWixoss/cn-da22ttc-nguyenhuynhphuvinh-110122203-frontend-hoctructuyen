"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Search,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  Target,
  ChevronLeft,
  CheckCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/display";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitleComp,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Badge } from "@/components/ui/feedback";
import { Button, Input } from "@/components/ui/forms";
import { useQuery } from "@tanstack/react-query";
import { codeAnalyticsService } from "@/lib/services/api";
import { ActivityTimeline } from "./ActivityTimeline";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitleComp,
  ChartTooltip,
  ChartLegend
);

interface StudentInsightProps {
  students: any[];
  quizId: number;
}

export function StudentInsight({ students, quizId }: StudentInsightProps) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null
  );

  const statusCounts = useMemo(() => {
    const counts = {
      completed: 0,
      in_progress: 0,
      needs_help: 0,
    };
    students.forEach((s) => {
      const status = s.status || s.progress_status;
      const passRate =
        s.avg_pass_rate ?? (s.score !== undefined ? s.score / 100 : 0);
      const totalAttempts = s.total_attempts ?? 0;

      // Chỉ tính sinh viên đã làm bài
      if (totalAttempts > 0) {
        if (status === "completed") {
          counts.completed++;
        } else if (status === "in_progress") {
          counts.in_progress++;
        }

        // Cần hỗ trợ (có thể overlap với các nhóm khác)
        if (
          status === "critical" ||
          status === "stuck" ||
          status === "warning" ||
          passRate < 0.5
        ) {
          counts.needs_help++;
        }
      }
    });
    return counts;
  }, [students]);

  const filteredStudents = useMemo(() => {
    if (!filterStatus) return [];
    return students.filter((s) => {
      const name = (s.name || s.user?.name || "").toLowerCase();
      const email = (s.email || s.user?.email || "").toLowerCase();
      const matchesSearch =
        !search ||
        name.includes(search.toLowerCase()) ||
        email.includes(search.toLowerCase());
      if (!matchesSearch) return false;
      const status = s.status || s.progress_status;
      const passRate =
        s.avg_pass_rate ?? (s.score !== undefined ? s.score / 100 : 0);
      const totalAttempts = s.total_attempts ?? 0;

      if (filterStatus === "needs_help") {
        return (
          status === "critical" ||
          status === "stuck" ||
          status === "warning" ||
          (passRate < 0.5 && totalAttempts > 0)
        );
      }
      return status === filterStatus;
    });
  }, [students, search, filterStatus]);

  const selectedStudent = useMemo(() => {
    return students.find(
      (s) => (s.user_id || s.user?.user_id) === selectedStudentId
    );
  }, [students, selectedStudentId]);

  const allGroups = [
    {
      key: "in_progress",
      label: "Đang làm",
      count: statusCounts.in_progress,
      color: "#3B82F6", // blue
    },
    {
      key: "completed",
      label: "Hoàn thành",
      count: statusCounts.completed,
      color: "#10B981", // green
    },
    {
      key: "needs_help",
      label: "Cần hỗ trợ",
      count: statusCounts.needs_help,
      color: "#EF4444", // red
    },
  ];

  // Chỉ hiển thị nhóm có sinh viên để biểu đồ không bị lệch
  const groups = allGroups.filter((g) => g.count > 0);

  const chartData = {
    labels: groups.map((g) => g.label),
    datasets: [
      {
        label: "Số lượng sinh viên",
        data: groups.map((g) => g.count),
        backgroundColor: groups.map((g) => g.color),
        borderColor: groups.map((g) => g.color),
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const getFilterLabel = () => {
    const group = allGroups.find((g) => g.key === filterStatus);
    return group?.label || "";
  };

  // Extract MSSV from email
  const getMSSVFromEmail = (email: string): string => {
    if (!email) return "N/A";
    const mssv = email.split("@")[0];
    return mssv || "N/A";
  };

  const handleBarClick = (groupKey: string) => {
    setFilterStatus(filterStatus === groupKey ? null : groupKey);
    setSelectedStudentId(null);
    setTimeout(() => {
      document
        .getElementById("student-list-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Phân bố trạng thái sinh viên
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Click vào cột để xem danh sách sinh viên theo nhóm
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
                      callbacks: {
                        label: function (context: any) {
                          const total = students.length;
                          const percentage =
                            total > 0
                              ? ((context.parsed.y / total) * 100).toFixed(1)
                              : "0";
                          return `Số lượng: ${context.parsed.y} (${percentage}%)`;
                        },
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { stepSize: 1 },
                      title: {
                        display: true,
                        text: "Số lượng sinh viên",
                      },
                    },
                    x: {
                      title: {
                        display: true,
                        text: "Nhóm sinh viên",
                      },
                    },
                  },
                  onClick: (_, elements) => {
                    if (elements.length > 0) {
                      const idx = elements[0].index;
                      handleBarClick(groups[idx].key);
                    }
                  },
                }}
              />
            </div>

            {/* Legend with Selection Indicator */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 pt-4 border-t">
              {groups.map((group) => (
                <div
                  key={group.key}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all cursor-pointer ${
                    filterStatus === group.key
                      ? "bg-primary/10 ring-2 ring-primary/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => handleBarClick(group.key)}
                >
                  <div
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded shrink-0"
                    style={{ backgroundColor: group.color }}
                  />
                  <span
                    className={`text-xs sm:text-sm ${
                      filterStatus === group.key
                        ? "font-medium text-primary"
                        : ""
                    }`}
                  >
                    {group.label} ({group.count})
                  </span>
                  {filterStatus === group.key && (
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Group Details */}
      {filterStatus && (
        <Card id="student-list-section">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  <span className="line-clamp-2">
                    Danh sách sinh viên nhóm {getFilterLabel()}
                  </span>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Danh sách chi tiết các sinh viên trong nhóm xếp loại
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Show student detail if selected */}
            {selectedStudentId && selectedStudent ? (
              <div className="space-y-4">
                {/* Back button */}
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedStudentId(null)}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Quay lại danh sách
                  </Button>
                </div>

                {/* Student info header */}
                <div className="p-4 bg-muted/20 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">
                    Chi tiết phân tích -{" "}
                    {selectedStudent.name || selectedStudent.user?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    MSSV:{" "}
                    {getMSSVFromEmail(
                      selectedStudent.email || selectedStudent.user?.email || ""
                    )}
                  </p>
                </div>

                <StudentDetailContainer
                  student={selectedStudent}
                  quizId={quizId}
                />
              </div>
            ) : (
              /* Show table when no student selected */
              <>
                <div className="relative max-w-md mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm sinh viên..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {filteredStudents.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-100 dark:bg-muted/50 hover:bg-slate-100 dark:hover:bg-muted/50">
                          <TableHead className="w-16">STT</TableHead>
                          <TableHead className="w-24">MSSV</TableHead>
                          <TableHead className="w-48">Họ và tên</TableHead>
                          <TableHead className="w-20">Điểm</TableHead>
                          <TableHead className="w-32">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((s, index) => {
                          const userId = s.user_id || s.user?.user_id;
                          const name = s.name || s.user?.name;
                          const email = s.email || s.user?.email;
                          return (
                            <TableRow key={userId}>
                              <TableCell className="font-medium">
                                {index + 1}
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {getMSSVFromEmail(email || "")}
                              </TableCell>
                              <TableCell
                                className="font-medium max-w-48 truncate"
                                title={name || "Không có tên"}
                              >
                                {name || "Không có tên"}
                              </TableCell>
                              <TableCell>
                                {(() => {
                                  // score có thể là 0-10 hoặc 0-100, chuẩn hóa về 0-10
                                  const rawScore = s.score ?? 0;
                                  const score =
                                    rawScore > 10 ? rawScore / 10 : rawScore;
                                  return (
                                    <span
                                      className={`font-bold ${
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
                                  );
                                })()}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => setSelectedStudentId(userId)}
                                >
                                  <History className="h-3 w-3 mr-1" />
                                  Truy vết
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">
                      Không có sinh viên trong nhóm này
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Placeholder when no group selected */}
      {!filterStatus && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-12 text-muted-foreground">
            <Target className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-sm italic">
              Chọn một nhóm từ biểu đồ phía trên để xem danh sách sinh viên
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StudentDetailContainer({
  student,
  quizId,
}: {
  student: any;
  quizId: number;
}) {
  const userId = student.user_id || student.user?.user_id;
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(
    new Set()
  );

  const { data: studentDetail, isLoading } = useQuery({
    queryKey: ["student-analysis", userId, quizId],
    queryFn: () => codeAnalyticsService.getStudentAnalysis(userId, quizId),
    enabled: !!userId,
  });

  // Tổng hợp thông tin theo từng câu hỏi
  const questionsData = useMemo(() => {
    if (!studentDetail?.submission_history) return [];
    const questionMap = new Map<
      number,
      {
        question_id: number;
        submissions: number;
        best_score: number;
        best_pass_rate: number;
        last_status: string;
        total_test_cases: number;
        passed_test_cases: number;
      }
    >();

    studentDetail.submission_history.forEach((sub) => {
      const existing = questionMap.get(sub.question_id);
      const passRate =
        sub.total_test_cases > 0
          ? sub.passed_test_cases / sub.total_test_cases
          : 0;

      if (existing) {
        existing.submissions++;
        existing.best_score = Math.max(existing.best_score, sub.score || 0);
        existing.best_pass_rate = Math.max(existing.best_pass_rate, passRate);
        existing.last_status = sub.status;
        existing.passed_test_cases = Math.max(
          existing.passed_test_cases,
          sub.passed_test_cases
        );
      } else {
        questionMap.set(sub.question_id, {
          question_id: sub.question_id,
          submissions: 1,
          best_score: sub.score || 0,
          best_pass_rate: passRate,
          last_status: sub.status,
          total_test_cases: sub.total_test_cases,
          passed_test_cases: sub.passed_test_cases,
        });
      }
    });
    return Array.from(questionMap.values()).sort(
      (a, b) => a.question_id - b.question_id
    );
  }, [studentDetail?.submission_history]);

  const toggleQuestion = (questionId: number) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">
            Đang tải phân tích chuyên sâu...
          </span>
        </CardContent>
      </Card>
    );
  }

  if (!studentDetail) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "wrong_answer":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "compile_error":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "runtime_error":
        return <AlertTriangle className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "accepted":
        return "Hoàn thành";
      case "wrong_answer":
        return "Sai đáp án";
      case "compile_error":
        return "Lỗi biên dịch";
      case "runtime_error":
        return "Lỗi runtime";
      default:
        return "Đang làm";
    }
  };

  // Tính tổng số lần nộp và tổng test cases
  const totalSubmissions = questionsData.reduce(
    (sum, q) => sum + q.submissions,
    0
  );
  const completedQuestions = questionsData.filter(
    (q) => q.last_status === "accepted"
  ).length;

  if (questionsData.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <History className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>Sinh viên chưa nộp bài nào</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Tổng quan */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <span className="font-medium">Truy vết chi tiết theo câu hỏi</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            <strong className="text-green-600">{completedQuestions}</strong>/
            {questionsData.length} câu hoàn thành
          </span>
          <span className="text-muted-foreground">
            <strong className="text-primary">{totalSubmissions}</strong> lần nộp
          </span>
        </div>
      </div>

      {/* Danh sách câu hỏi - có thể mở rộng/thu hẹp */}
      {questionsData.map((q, index) => (
        <QuestionItem
          key={q.question_id}
          question={q}
          questionNumber={index + 1}
          userId={userId}
          quizId={quizId}
          isExpanded={expandedQuestions.has(q.question_id)}
          onToggle={() => toggleQuestion(q.question_id)}
          getStatusIcon={getStatusIcon}
          getStatusLabel={getStatusLabel}
        />
      ))}
    </div>
  );
}

// Component riêng cho mỗi câu hỏi để fetch timeline và tính thời gian
function QuestionItem({
  question,
  questionNumber,
  userId,
  quizId,
  isExpanded,
  onToggle,
  getStatusIcon,
  getStatusLabel,
}: {
  question: {
    question_id: number;
    submissions: number;
    best_pass_rate: number;
    last_status: string;
    total_test_cases: number;
    passed_test_cases: number;
  };
  questionNumber: number;
  userId: number;
  quizId: number;
  isExpanded: boolean;
  onToggle: () => void;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusLabel: (status: string) => string;
}) {
  const q = question;
  const isAccepted = q.last_status === "accepted";

  // Fetch timeline để tính thời gian tổng
  const { data: timeline } = useQuery({
    queryKey: ["student-timeline", userId, q.question_id, quizId],
    queryFn: () =>
      codeAnalyticsService.getStudentTimeline(userId, q.question_id, quizId),
    enabled: !!userId && !!q.question_id,
  });

  // Tính thời gian tổng từ timeline
  const totalTime = useMemo(() => {
    if (!timeline || timeline.length === 0) return 0;
    return timeline.reduce(
      (sum, e) => sum + (e.duration_since_last_action || 0),
      0
    );
  }, [timeline]);

  // Format duration
  const formatDuration = (seconds: number): string => {
    if (seconds === 0) return "";
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div
      className={`border rounded-lg overflow-hidden ${
        isAccepted ? "border-green-200 dark:border-green-800" : "border-border"
      }`}
    >
      {/* Header câu hỏi - click để mở rộng/thu hẹp */}
      <div
        className={`p-3 cursor-pointer transition-colors ${
          isAccepted
            ? "bg-green-50/50 dark:bg-green-950/20 hover:bg-green-50 dark:hover:bg-green-950/30"
            : "bg-card hover:bg-muted/30"
        }`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          {/* Expand/Collapse icon */}
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          {/* Status icon */}
          <div
            className={`flex-shrink-0 size-8 rounded-full flex items-center justify-center ${
              isAccepted ? "bg-green-100 dark:bg-green-900/30" : "bg-muted"
            }`}
          >
            {getStatusIcon(q.last_status)}
          </div>

          {/* Question info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium">Câu {questionNumber}</span>
              <Badge
                variant="outline"
                className={`text-[10px] ${
                  isAccepted
                    ? "border-green-300 text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-400"
                    : ""
                }`}
              >
                {getStatusLabel(q.last_status)}
              </Badge>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{q.submissions} lần nộp</span>
            <span>
              {q.passed_test_cases}/{q.total_test_cases} TC
            </span>
            <span
              className={`font-medium ${
                q.best_pass_rate === 1
                  ? "text-green-600"
                  : q.best_pass_rate >= 0.5
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {Math.round(q.best_pass_rate * 100)}%
            </span>
            {totalTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(totalTime)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Timeline chi tiết - chỉ hiển thị khi mở rộng */}
      {isExpanded && (
        <div className="p-3 pt-0 border-t bg-muted/10">
          <ActivityTimeline
            userId={userId}
            questionId={q.question_id}
            quizId={quizId}
          />
        </div>
      )}
    </div>
  );
}
