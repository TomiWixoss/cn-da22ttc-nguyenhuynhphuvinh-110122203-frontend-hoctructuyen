"use client";

import { useState } from "react";
import {
  Code2,
  Users,
  TrendingUp,
  Loader2,
  BarChart3,
  AlertTriangle,
  MessageCircle,
  Bot,
  Lightbulb,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/forms";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Badge } from "@/components/ui/feedback";
import { useQuery } from "@tanstack/react-query";
import aiTutorService from "@/lib/services/api/ai-tutor.service";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface AITutorAnalyticsTabProps {
  questions: any[];
}

export function AITutorAnalyticsTab({ questions }: AITutorAnalyticsTabProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(
    questions?.[0]?.question_id || null
  );

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["ai-tutor-stats", selectedQuestionId],
    queryFn: () => aiTutorService.getQuestionStats(selectedQuestionId!),
    enabled: !!selectedQuestionId,
  });

  const { data: topics, isLoading: loadingTopics } = useQuery({
    queryKey: ["ai-tutor-topics", selectedQuestionId],
    queryFn: () => aiTutorService.getQuestionTopics(selectedQuestionId!),
    enabled: !!selectedQuestionId,
  });

  const { data: needHelp, isLoading: loadingNeedHelp } = useQuery({
    queryKey: ["ai-tutor-need-help", selectedQuestionId],
    queryFn: () => aiTutorService.getStudentsNeedHelp(selectedQuestionId!),
    enabled: !!selectedQuestionId,
  });

  const { data: difficulty, isLoading: loadingDifficulty } = useQuery({
    queryKey: ["ai-tutor-difficulty", selectedQuestionId],
    queryFn: () => aiTutorService.getQuestionDifficulty(selectedQuestionId!),
    enabled: !!selectedQuestionId,
  });

  const isLoading =
    loadingStats || loadingTopics || loadingNeedHelp || loadingDifficulty;

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "easy":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "hard":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case "easy":
        return "Dễ";
      case "medium":
        return "Trung bình";
      case "hard":
        return "Khó";
      default:
        return level;
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-orange-500",
      "bg-cyan-500",
    ];
    return colors[name ? name.charCodeAt(0) % colors.length : 0];
  };

  if (!questions?.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-12">
          <Bot className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground">
            Không có câu hỏi code để phân tích
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Question Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Chọn câu hỏi để xem phân tích AI Tutor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => (
              <Button
                key={q.question_id}
                variant={
                  selectedQuestionId === q.question_id ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedQuestionId(q.question_id)}
                className="text-xs"
              >
                Câu {idx + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
          <span className="text-muted-foreground">
            Đang tải phân tích AI Tutor...
          </span>
        </div>
      ) : !stats?.total_messages ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">
              Chưa có sinh viên nào sử dụng AI Tutor cho câu hỏi này
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {stats?.total_messages || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Tin nhắn</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {stats?.unique_students || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Sinh viên</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {stats?.avg_messages_per_student?.toFixed(1) || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">TB/SV</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/20">
                    <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {needHelp?.students_needing_help?.length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Cần hỗ trợ</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Difficulty Assessment */}
          {difficulty && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Đánh giá độ khó
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Badge
                    className={`text-sm px-3 py-1 ${getDifficultyColor(
                      difficulty.difficulty
                    )}`}
                  >
                    {getDifficultyLabel(difficulty.difficulty)}
                  </Badge>
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          difficulty.difficulty_score >= 70
                            ? "bg-red-500"
                            : difficulty.difficulty_score >= 40
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${difficulty.difficulty_score}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium">
                    {difficulty.difficulty_score}/100
                  </span>
                </div>
                {difficulty.recommendation && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        {difficulty.recommendation}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Topics Analysis */}
          {topics?.topics && topics.topics.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Chủ đề sinh viên hay thắc mắc
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {topics.topics.map((topic, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{topic.topic}</span>
                        <span className="text-muted-foreground">
                          {topic.percentage}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${topic.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {topics.ai_insight && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        {topics.ai_insight}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Students Need Help */}
          {needHelp?.students_needing_help &&
            needHelp.students_needing_help.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Sinh viên cần hỗ trợ (hỏi AI &gt; {needHelp.threshold} lần)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {needHelp.students_needing_help.map((student) => (
                      <div
                        key={student.user_id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800"
                      >
                        <div
                          className={`flex-shrink-0 size-10 rounded-full ${getAvatarColor(
                            student.name
                          )} flex items-center justify-center`}
                        >
                          <span className="text-sm font-bold text-white">
                            {student.name?.charAt(0).toUpperCase() || "?"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{student.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {student.email}
                          </p>
                          {student.main_struggles &&
                            student.main_struggles.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {student.main_struggles.map((struggle, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-[10px] bg-red-50 text-red-600 border-red-200"
                                  >
                                    {struggle}
                                  </Badge>
                                ))}
                              </div>
                            )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-orange-600">
                            {student.message_count}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            tin nhắn
                          </p>
                          {student.last_active && (
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {formatDistanceToNow(
                                new Date(student.last_active),
                                { addSuffix: true, locale: vi }
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* All Students Using AI Tutor */}
          {stats?.students && stats.students.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Danh sách sinh viên sử dụng AI Tutor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.students.map((student) => (
                    <div
                      key={student.user_id}
                      className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                        student.needs_attention
                          ? "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800"
                          : "bg-muted/30 hover:bg-muted/50"
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 size-10 rounded-full ${getAvatarColor(
                          student.name
                        )} flex items-center justify-center`}
                      >
                        <span className="text-sm font-bold text-white">
                          {student.name?.charAt(0).toUpperCase() || "?"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{student.name}</p>
                          {student.needs_attention && (
                            <Badge className="text-[10px] px-1.5 py-0 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                              Cần chú ý
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {student.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-center">
                          <p className="text-lg font-bold text-primary">
                            {student.message_count}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Tin nhắn
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">
                            {student.session_count}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Session
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
