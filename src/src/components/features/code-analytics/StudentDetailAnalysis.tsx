"use client";

import { Badge } from "@/components/ui/feedback";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Play,
  Send,
  Clock,
  User,
  History,
  Brain,
} from "lucide-react";
import { StudentAnalysisData } from "@/lib/services/api/code-analytics.service";

interface StudentDetailAnalysisProps {
  data: StudentAnalysisData;
  userName?: string;
  hideStudentInfo?: boolean; // Ẩn phần thông tin sinh viên khi đã hiển thị ở row
}

export function StudentDetailAnalysis({ data, hideStudentInfo = false }: StudentDetailAnalysisProps) {
  const formatPercent = (value: number) => `${(value * 100).toFixed(0)}%`;

  // Helper to get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "wrong_answer":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "compile_error":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "runtime_error":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "time_limit_exceeded":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "accepted":
        return "Accepted";
      case "wrong_answer":
        return "Wrong Answer";
      case "compile_error":
        return "Compile Error";
      case "runtime_error":
        return "Runtime Error";
      case "time_limit_exceeded":
        return "Time Limit";
      default:
        return status;
    }
  };

  const getStudentStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "in_progress":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "stuck":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStudentStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "in_progress":
        return "Đang làm";
      case "stuck":
        return "Cần hỗ trợ";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-5">
      {/* Student Info (New API) - Only show if not hidden */}
      {!hideStudentInfo && data.student_info && (
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{data.student_info.name}</p>
                <p className="text-sm text-muted-foreground">{data.student_info.email}</p>
              </div>
            </div>
            <Badge className={getStudentStatusBadge(data.student_info.status)}>
              {getStudentStatusLabel(data.student_info.status)}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span>Điểm: <strong>{data.student_info.final_score}</strong></span>
            </div>
          </div>
        </div>
      )}


      {/* Overall Metrics (Legacy + New) */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Pass TB</span>
          </div>
          <p className="text-2xl font-bold">{formatPercent(data.overall_metrics?.avg_pass_rate || 0)}</p>
        </div>
        <div className="text-center border-x">
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
            <Play className="h-4 w-4" />
            <span className="text-sm">Test runs</span>
          </div>
          <p className="text-2xl font-bold">
            {data.behavior_analysis?.total_test_runs || data.overall_metrics?.total_test_runs || 0}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
            <Send className="h-4 w-4" />
            <span className="text-sm">Nộp bài</span>
          </div>
          <p className="text-2xl font-bold">
            {data.submission_history?.length || data.overall_metrics?.total_submissions || 0}
          </p>
        </div>
      </div>

      {/* Behavior Analysis (New API) */}
      {data.behavior_analysis && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-800 dark:text-blue-300">Phân tích hành vi</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Thời gian TB giữa các lần nộp: </span>
              <strong>{data.behavior_analysis.average_time_between_submissions}</strong>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span>Lỗi phổ biến: </span>
              <strong>{data.behavior_analysis.most_common_error || "Không có"}</strong>
            </div>
          </div>
          {data.behavior_analysis.recommendation_for_teacher && (
            <div className="flex items-start gap-2 p-3 bg-white dark:bg-slate-900 rounded-lg">
              <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{data.behavior_analysis.recommendation_for_teacher}</p>
            </div>
          )}
        </div>
      )}

      {/* Submission History (New API) - Timeline Style */}
      {data.submission_history && data.submission_history.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <span className="font-medium">Lịch sử nộp bài</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {data.submission_history.length} lần nộp
            </span>
          </div>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-muted to-transparent" />
            
            <div className="space-y-4">
              {data.submission_history.map((submission, index) => {
                const isAccepted = submission.status === "accepted";
                const passPercent = submission.total_test_cases > 0 
                  ? Math.round((submission.passed_test_cases / submission.total_test_cases) * 100) 
                  : 0;
                
                return (
                  <div key={submission.submission_id} className="relative pl-10">
                    {/* Timeline dot - use index for display order */}
                    <div
                      className={`absolute left-0 top-1 size-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${
                        isAccepted
                          ? "bg-green-500"
                          : submission.status === "compile_error"
                            ? "bg-orange-500"
                            : submission.status === "runtime_error"
                              ? "bg-purple-500"
                              : submission.status === "time_limit_exceeded"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    
                    {/* Content */}
                    <div className={`p-3 rounded-lg border transition-colors ${
                      isAccepted 
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
                        : 'bg-card border-border hover:border-muted-foreground/30'
                    }`}>
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={`text-xs ${getStatusBadge(submission.status)}`}>
                          {getStatusLabel(submission.status)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(submission.submitted_at).toLocaleString("vi-VN", {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      {/* Stats */}
                      <div className="flex items-center gap-4">
                        {/* Test cases progress */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Test cases</span>
                            <span className="font-medium">
                              <span className={isAccepted ? 'text-green-600' : ''}>{submission.passed_test_cases}</span>
                              <span className="text-muted-foreground">/{submission.total_test_cases}</span>
                            </span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                passPercent === 100 ? 'bg-green-500' :
                                passPercent >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${passPercent}%` }}
                            />
                          </div>
                        </div>
                        
                        {/* Score */}
                        <div className="text-center px-3 border-l">
                          <p className={`text-lg font-bold ${isAccepted ? 'text-green-600' : ''}`}>
                            {submission.score}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase">Điểm</p>
                        </div>
                      </div>
                      
                      {/* Error detail */}
                      {submission.error_detail && (
                        <div className="mt-2 p-2 rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                          <p className="text-xs text-red-700 dark:text-red-400 font-mono">
                            {submission.error_detail}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}


      {/* Strengths & Weaknesses - Side by side (Legacy) */}
      {(data.strengths?.length > 0 || data.weaknesses?.length > 0) && (
        <div className="grid grid-cols-2 gap-4">
          {/* Strengths */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="font-medium">Điểm mạnh</span>
            </div>
            {!data.strengths || data.strengths.length === 0 ? (
              <p className="text-sm text-muted-foreground py-3">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-2">
                {data.strengths.slice(0, 4).map((item) => (
                  <div
                    key={item.question_id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-green-50 dark:bg-green-950/20 text-sm"
                  >
                    <span className="truncate flex-1">{item.question_text}</span>
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      {formatPercent(item.pass_rate)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weaknesses */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="font-medium">Điểm yếu</span>
            </div>
            {!data.weaknesses || data.weaknesses.length === 0 ? (
              <p className="text-sm text-muted-foreground py-3">Không có</p>
            ) : (
              <div className="space-y-2">
                {data.weaknesses.slice(0, 4).map((item) => (
                  <div
                    key={item.question_id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 text-sm"
                  >
                    <span className="truncate flex-1">{item.question_text}</span>
                    <Badge className="bg-red-100 text-red-700 text-xs">
                      {formatPercent(item.pass_rate)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stuck Questions (Legacy) */}
      {data.stuck_questions && data.stuck_questions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <span className="font-medium">Cần hỗ trợ</span>
          </div>
          <div className="space-y-2">
            {data.stuck_questions.slice(0, 3).map((item) => (
              <div
                key={item.question_id}
                className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-medium text-sm truncate">
                    {item.question_text || `Câu #${item.question_id}`}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {item.attempts} lần thử
                  </Badge>
                </div>
                <div className="flex items-start gap-2 text-sm text-orange-700 dark:text-orange-400">
                  <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{item.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
