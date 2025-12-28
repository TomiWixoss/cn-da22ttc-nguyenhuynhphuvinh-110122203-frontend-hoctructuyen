"use client";

import { useMemo } from "react";
import {
  Play,
  Send,
  MessageSquare,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/feedback";
import { useQuery } from "@tanstack/react-query";
import {
  codeAnalyticsService,
  TimelineEvent,
  FailedTestCaseDetail,
} from "@/lib/services/api/code-analytics.service";

interface ActivityTimelineProps {
  userId: number;
  questionId: number;
  quizId?: number;
  questionText?: string;
}

// Format duration in seconds to human readable
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

// Simple diff component to show code changes
function CodeDiff({ oldCode, newCode }: { oldCode: string; newCode: string }) {
  const oldLines = oldCode.split("\n");
  const newLines = newCode.split("\n");

  // Simple line-by-line diff
  const diffLines = useMemo(() => {
    const result: Array<{
      type: "same" | "added" | "removed";
      content: string;
      lineNum?: number;
    }> = [];

    let oldIdx = 0;
    let newIdx = 0;

    while (oldIdx < oldLines.length || newIdx < newLines.length) {
      const oldLine = oldLines[oldIdx];
      const newLine = newLines[newIdx];

      if (oldLine === newLine) {
        result.push({
          type: "same",
          content: oldLine || "",
          lineNum: newIdx + 1,
        });
        oldIdx++;
        newIdx++;
      } else if (
        oldIdx < oldLines.length &&
        !newLines.slice(newIdx).includes(oldLine)
      ) {
        result.push({ type: "removed", content: oldLine });
        oldIdx++;
      } else if (newIdx < newLines.length) {
        result.push({ type: "added", content: newLine, lineNum: newIdx + 1 });
        newIdx++;
      } else {
        oldIdx++;
        newIdx++;
      }

      if (result.length > 100) break; // Limit for performance
    }

    return result;
  }, [oldLines, newLines]);

  // Only show if there are actual changes
  const hasChanges = diffLines.some((l) => l.type !== "same");
  if (!hasChanges) return null;

  return (
    <div className="mt-2 rounded bg-slate-900 text-xs overflow-x-auto max-h-[200px]">
      <div className="p-2">
        {diffLines.slice(0, 50).map((line, idx) => (
          <div
            key={idx}
            className={`font-mono whitespace-pre ${
              line.type === "added"
                ? "bg-green-900/50 text-green-300"
                : line.type === "removed"
                ? "bg-red-900/50 text-red-300"
                : "text-slate-400"
            }`}
          >
            <span className="inline-block w-6 text-right mr-2 text-slate-600">
              {line.type === "removed" ? "-" : line.lineNum || ""}
            </span>
            <span className="mr-2">
              {line.type === "added"
                ? "+"
                : line.type === "removed"
                ? "-"
                : " "}
            </span>
            {line.content}
          </div>
        ))}
      </div>
    </div>
  );
}

// Single timeline event component
function TimelineEventItem({
  event,
  previousCode,
}: {
  event: TimelineEvent;
  previousCode: string;
}) {
  const getEventIcon = () => {
    switch (event.type) {
      case "RUN_TEST":
        return <Play className="h-3.5 w-3.5" />;
      case "SUBMIT":
        return <Send className="h-3.5 w-3.5" />;
      case "AI_CHAT":
        return <MessageSquare className="h-3.5 w-3.5" />;
    }
  };

  const getEventColor = () => {
    if (event.type === "AI_CHAT") {
      return "bg-blue-500"; // Chỉ hiển thị câu hỏi của sinh viên
    }
    if (event.type === "SUBMIT") {
      return event.data.status === "accepted"
        ? "bg-green-500"
        : "bg-orange-500";
    }
    // RUN_TEST
    switch (event.data.status) {
      case "passed":
        return "bg-green-500";
      case "compile_error":
        return "bg-orange-500";
      case "runtime_error":
        return "bg-purple-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getEventLabel = () => {
    switch (event.type) {
      case "RUN_TEST":
        return "Run Test";
      case "SUBMIT":
        return "Submit";
      case "AI_CHAT":
        return "Hỏi AI"; // Chỉ hiển thị câu hỏi của sinh viên
    }
  };

  const getStatusBadge = () => {
    if (event.type === "AI_CHAT") return null;

    const status = event.data.status;
    const statusConfig: Record<string, { label: string; className: string }> = {
      passed: {
        label: "Passed",
        className:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      },
      accepted: {
        label: "Accepted",
        className:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      },
      failed: {
        label: "Failed",
        className:
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      },
      wrong_answer: {
        label: "Wrong Answer",
        className:
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      },
      compile_error: {
        label: "Compile Error",
        className:
          "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      },
      runtime_error: {
        label: "Runtime Error",
        className:
          "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      },
    };

    const config = statusConfig[status || ""] || {
      label: status,
      className: "bg-gray-100 text-gray-700",
    };

    return (
      <Badge className={`text-[10px] ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  const hasCode = event.type !== "AI_CHAT" && event.data.code;
  const hasDiff =
    hasCode && previousCode.length > 0 && previousCode !== event.data.code;

  return (
    <div className="relative pl-8">
      {/* Timeline dot */}
      <div
        className={`absolute left-0 top-1.5 size-6 rounded-full flex items-center justify-center text-white shadow-sm ${getEventColor()}`}
      >
        {getEventIcon()}
      </div>

      {/* Content */}
      <div
        className={`p-2.5 rounded-lg border transition-colors ${
          event.type === "AI_CHAT"
            ? "bg-muted/30 border-muted"
            : event.data.status === "passed" || event.data.status === "accepted"
            ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
            : "bg-card border-border"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{getEventLabel()}</span>
            {getStatusBadge()}
            {event.type === "RUN_TEST" && (
              <span className="text-xs text-muted-foreground">
                {event.data.passed}/{event.data.total} TC
              </span>
            )}
            {event.type === "SUBMIT" && (
              <>
                {event.data.score !== undefined && (
                  <span className="text-xs">
                    Điểm:{" "}
                    <strong className="text-primary">{event.data.score}</strong>
                  </span>
                )}
                {event.data.total !== undefined && event.data.total > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {event.data.passed}/{event.data.total} TC
                  </span>
                )}
              </>
            )}
            {event.duration_since_last_action &&
              event.duration_since_last_action > 0 && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />+
                  {formatDuration(event.duration_since_last_action)}
                </span>
              )}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {new Date(event.timestamp).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>

        {/* Console error (compile/runtime error) */}
        {event.data.error && (
          <div className="mt-1.5 p-2 rounded bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
            <div className="flex items-start gap-2 text-xs text-orange-700 dark:text-orange-400">
              <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <pre className="whitespace-pre-wrap font-mono text-[11px] line-clamp-4">
                {event.data.error}
              </pre>
            </div>
          </div>
        )}

        {/* Failed test cases - hiển thị chi tiết input/expected/actual */}
        {event.type !== "AI_CHAT" &&
          !event.data.error &&
          event.data.failed_details &&
          event.data.failed_details.length > 0 && (
            <div className="mt-1.5 p-2 rounded bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-red-700 dark:text-red-400">
                <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                <span className="font-medium">
                  Test case lỗi ({event.data.failed_details.length})
                </span>
              </div>
              {(event.data.failed_details as FailedTestCaseDetail[])
                .slice(0, 3)
                .map((tc: FailedTestCaseDetail, idx: number) => (
                  <div
                    key={idx}
                    className="text-[11px] font-mono bg-white dark:bg-slate-900 rounded p-1.5 space-y-0.5"
                  >
                    <div className="text-muted-foreground">
                      <span className="text-slate-500">Input:</span>{" "}
                      <span className="text-slate-700 dark:text-slate-300">
                        {tc.input}
                      </span>
                    </div>
                    <div className="text-green-600 dark:text-green-400">
                      <span className="text-slate-500">Expected:</span>{" "}
                      {tc.expected}
                    </div>
                    <div className="text-red-600 dark:text-red-400">
                      <span className="text-slate-500">Actual:</span>{" "}
                      {tc.actual || tc.error || "(no output)"}
                    </div>
                  </div>
                ))}
              {event.data.failed_details.length > 3 && (
                <div className="text-[10px] text-muted-foreground">
                  +{event.data.failed_details.length - 3} test case khác
                </div>
              )}
            </div>
          )}

        {/* AI Chat message */}
        {event.type === "AI_CHAT" && (
          <p className="mt-1.5 text-sm whitespace-pre-wrap line-clamp-3">
            {event.data.message}
          </p>
        )}

        {/* Code: hiển thị diff nếu có code trước đó, hoặc code thuần nếu là lần đầu */}
        {hasCode &&
          (hasDiff ? (
            <CodeDiff oldCode={previousCode} newCode={event.data.code!} />
          ) : (
            <div className="mt-2">
              <pre className="p-2 rounded bg-slate-900 text-slate-100 text-xs overflow-x-auto max-h-[200px]">
                <code>{event.data.code}</code>
              </pre>
            </div>
          ))}
      </div>
    </div>
  );
}

export function ActivityTimeline({
  userId,
  questionId,
  quizId,
}: ActivityTimelineProps) {
  const {
    data: timeline,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["student-timeline", userId, questionId, quizId],
    queryFn: () =>
      codeAnalyticsService.getStudentTimeline(userId, questionId, quizId),
    enabled: !!userId && !!questionId,
  });

  // Get previous code for each event (for diff)
  const getPreviousCode = (index: number): string | undefined => {
    if (!timeline) return undefined;
    for (let i = index - 1; i >= 0; i--) {
      if (timeline[i].type !== "AI_CHAT" && timeline[i].data.code) {
        return timeline[i].data.code;
      }
    }
    return undefined;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
        <span className="text-sm text-muted-foreground">Đang tải...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 text-center text-muted-foreground">
        <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-orange-500" />
        <p className="text-sm">Không thể tải timeline</p>
      </div>
    );
  }

  if (!timeline || timeline.length === 0) {
    return (
      <div className="py-6 text-center text-muted-foreground">
        <Clock className="h-6 w-6 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Chưa có hoạt động</p>
      </div>
    );
  }

  return (
    <div className="relative pt-2">
      {/* Timeline line - căn giữa với dot (left-0 + size-6/2 = 12px = left-3) */}
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />

      <div className="space-y-2">
        {timeline.map((event, index) => (
          <TimelineEventItem
            key={index}
            event={event}
            previousCode={getPreviousCode(index) || ""}
          />
        ))}
      </div>
    </div>
  );
}
