"use client";

import { useState, useMemo } from "react";
import {
  Bot,
  MessageCircle,
  Users,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  HelpCircle,
  BarChart3,
  Loader2,
  Cloud,
  Brain,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Badge } from "@/components/ui/feedback";
import { Button } from "@/components/ui/forms";
import { useQuery } from "@tanstack/react-query";
import aiTutorService from "@/lib/services/api/ai-tutor.service";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  TopicItem,
  StudentChatInfo,
  StudentNeedHelp,
} from "@/lib/services/api/ai-tutor.service";

interface AITutorInsightsProps {
  questions: any[]; // Consider using Question interface if available
}

// Word Cloud Component (simplified visual representation)
function TopicWordCloud({ topics }: { topics: TopicItem[] }) {
  if (!topics || topics.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Cloud className="h-10 w-10 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Chưa có dữ liệu chủ đề</p>
      </div>
    );
  }

  const maxFreq = Math.max(
    ...topics.map((t) => t.percentage || t.frequency || 1)
  );

  const getSize = (percentage: number) => {
    const ratio = percentage / maxFreq;
    if (ratio > 0.7) return "text-2xl font-bold";
    if (ratio > 0.4) return "text-lg font-semibold";
    if (ratio > 0.2) return "text-base font-medium";
    return "text-sm";
  };

  const colors = [
    "text-blue-600 hover:bg-blue-100",
    "text-purple-600 hover:bg-purple-100",
    "text-green-600 hover:bg-green-100",
    "text-orange-600 hover:bg-orange-100",
    "text-pink-600 hover:bg-pink-100",
    "text-teal-600 hover:bg-teal-100",
    "text-indigo-600 hover:bg-indigo-100",
    "text-red-600 hover:bg-red-100",
  ];

  return (
    <div className="flex flex-wrap gap-3 justify-center items-center py-4">
      {topics.map((topic, idx) => (
        <span
          key={idx}
          className={`px-3 py-1.5 rounded-full cursor-default transition-colors ${getSize(
            topic.percentage || topic.frequency || 1
          )} ${colors[idx % colors.length]}`}
          title={`${
            topic.percentage || topic.frequency
          }% sinh viên hỏi về chủ đề này`}
        >
          {topic.topic}
        </span>
      ))}
    </div>
  );
}

// Misconception Alert Component
function MisconceptionAlert({ insight }: { insight: string }) {
  if (!insight) return null;

  return (
    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
          <Brain className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <p className="font-medium text-amber-800 dark:text-amber-300 mb-1">
            Phát hiện hiểu lầm phổ biến
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-400">
            {insight}
          </p>
        </div>
      </div>
    </div>
  );
}

// Question Stats Card
function QuestionStatsCard({
  questionId,
  questionIndex,
  isSelected,
  onClick,
}: {
  questionId: number;
  questionIndex: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { data: stats } = useQuery({
    queryKey: ["ai-tutor-stats-preview", questionId],
    queryFn: () => aiTutorService.getQuestionStats(questionId),
    enabled: !!questionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className="relative"
    >
      Câu {questionIndex + 1}
    </Button>
  );
}

// Difficulty Gauge
function DifficultyGauge({
  difficulty,
  score,
}: {
  difficulty: string;
  score: number;
}) {
  const getColor = () => {
    if (score >= 70) return { bg: "bg-red-500", text: "text-red-600" };
    if (score >= 40) return { bg: "bg-yellow-500", text: "text-yellow-600" };
    return { bg: "bg-green-500", text: "text-green-600" };
  };

  const getLabel = () => {
    switch (difficulty) {
      case "easy":
        return "Dễ";
      case "medium":
        return "Trung bình";
      case "hard":
        return "Khó";
      default:
        return difficulty;
    }
  };

  const colors = getColor();

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">Độ khó</span>
          <span className={`text-sm font-bold ${colors.text}`}>
            {getLabel()}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full ${colors.bg} transition-all duration-500`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
      <span className="text-lg font-bold">{score}/100</span>
    </div>
  );
}

export function AITutorInsights({ questions }: AITutorInsightsProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(
    questions?.[0]?.question_id || null
  );

  // Fetch all data for selected question
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
          <p className="text-muted-foreground">Không có câu hỏi để phân tích</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Question Selector with Preview Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Chọn câu hỏi để xem AI Tutor Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => (
              <QuestionStatsCard
                key={q.question_id}
                questionId={q.question_id}
                questionIndex={idx}
                isSelected={selectedQuestionId === q.question_id}
                onClick={() => setSelectedQuestionId(q.question_id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
          <span className="text-muted-foreground">
            Đang tải AI Tutor Insights...
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
                  <div className="p-2.5 rounded-xl bg-blue-500/20">
                    <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
                  <div className="p-2.5 rounded-xl bg-purple-500/20">
                    <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
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
                  <div className="p-2.5 rounded-xl bg-green-500/20">
                    <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {stats?.avg_messages_per_student?.toFixed(1) || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      TB/Sinh viên
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-orange-500/20">
                    <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
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

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: Word Cloud + Difficulty */}
            <div className="space-y-6">
              {/* Topic Word Cloud */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Cloud className="h-5 w-5" />
                    Chủ đề sinh viên hay hỏi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TopicWordCloud topics={topics?.topics || []} />
                </CardContent>
              </Card>

              {/* Difficulty Assessment */}
              {difficulty && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Đánh giá độ khó (dựa trên AI Tutor)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <DifficultyGauge
                      difficulty={difficulty.difficulty}
                      score={difficulty.difficulty_score}
                    />
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
            </div>

            {/* Right: Misconception + Students Need Help */}
            <div className="space-y-6">
              {/* Misconception Alert */}
              {topics?.ai_insight && (
                <MisconceptionAlert insight={topics.ai_insight} />
              )}

              {/* Topic Breakdown */}
              {topics?.topics && topics.topics.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <HelpCircle className="h-5 w-5" />
                      Chi tiết chủ đề thắc mắc
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {topics.topics.map((topic: TopicItem, idx: number) => (
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
                  </CardContent>
                </Card>
              )}

              {/* Students Need Help */}
              {needHelp?.students_needing_help &&
                needHelp.students_needing_help.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Sinh viên cần hỗ trợ (hỏi AI &gt; {
                          needHelp.threshold
                        }{" "}
                        lần)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {needHelp.students_needing_help
                        .slice(0, 5)
                        .map((student: StudentNeedHelp) => (
                          <div
                            key={student.user_id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800"
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
                              <p className="font-medium truncate">
                                {student.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {student.email}
                              </p>
                              {student.main_struggles &&
                                student.main_struggles.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {student.main_struggles
                                      .slice(0, 2)
                                      .map((struggle: string, idx: number) => (
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
                            </div>
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                )}
            </div>
          </div>

          {/* All Students Using AI Tutor */}
          {stats?.students && stats.students.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Tất cả sinh viên sử dụng AI Tutor ({stats.students.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {stats.students.map((student: StudentChatInfo) => (
                    <div
                      key={student.user_id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        student.needs_attention
                          ? "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800"
                          : "bg-muted/30 hover:bg-muted/50"
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 size-9 rounded-full ${getAvatarColor(
                          student.name
                        )} flex items-center justify-center`}
                      >
                        <span className="text-xs font-bold text-white">
                          {student.name?.charAt(0).toUpperCase() || "?"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-medium truncate">
                            {student.name}
                          </p>
                          {student.needs_attention && (
                            <AlertTriangle className="h-3 w-3 text-orange-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {student.message_count} tin • {student.session_count}{" "}
                          session
                        </p>
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
