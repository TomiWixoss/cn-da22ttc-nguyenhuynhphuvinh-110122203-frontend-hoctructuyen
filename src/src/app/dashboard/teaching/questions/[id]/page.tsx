"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TeacherOnly } from "@/components/features/auth/role-guard";
import { Button } from "@/components/ui/forms/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/layout/card";
import { Badge } from "@/components/ui/feedback/badge";
import {
  HelpCircle,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BarChart3,
  Target,
  Edit,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation";
import { QuestionWithRelations } from "@/lib/types/question";
import { showErrorToast } from "@/lib/utils/toast-utils";
import { Skeleton } from "@/components/ui/feedback/skeleton";
import { useQuestion } from "@/lib/hooks/use-questions";
import { useAssignmentContext } from "@/lib/contexts/assignment-context";
import { MediaViewer } from "@/components/shared/MediaViewer";
import { CodeExerciseDisplay } from "@/components/features/teaching/questions/CodeExerciseDisplay";

interface QuestionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function QuestionDetailPage({
  params,
}: QuestionDetailPageProps) {
  const router = useRouter();
  const { createTeacherUrl } = useAssignmentContext();
  const [questionId, setQuestionId] = useState<number | null>(null);

  // Helper function for difficulty colors
  const getDifficultyColor = (levelName: string) => {
    switch (levelName?.toLowerCase()) {
      case "dễ":
      case "easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "trung bình":
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "khó":
      case "hard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Initialize question ID
  useEffect(() => {
    const initializeQuestionId = async () => {
      const resolvedParams = await params;
      const id = parseInt(resolvedParams.id);
      if (!isNaN(id)) {
        setQuestionId(id);
      } else {
        showErrorToast("ID câu hỏi không hợp lệ");
        const url = createTeacherUrl("/dashboard/teaching/questions");
        router.push(url);
      }
    };
    initializeQuestionId();
  }, [params, router]);

  // Use TanStack Query hook
  const { data: question, isLoading, error } = useQuestion(questionId!);

  // Handle error from query
  useEffect(() => {
    if (error) {
      console.error("Error fetching question:", error);
      showErrorToast("Không thể tải thông tin câu hỏi");
      const url = createTeacherUrl("/dashboard/teaching/questions");
      router.push(url);
    }
  }, [error, router]);

  if (isLoading) {
    return (
      <TeacherOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </TeacherOnly>
    );
  }

  if (!question) {
    return (
      <TeacherOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
        <div className="container mx-auto p-6">
          {/* Header with Breadcrumb */}
          <div className="flex items-center justify-between mb-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href={createTeacherUrl("/dashboard/teaching/questions")}
                    >
                      Quản lý câu hỏi
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Chi tiết câu hỏi</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="text-center py-12">
            <HelpCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">
              Không tìm thấy câu hỏi
            </h2>
            <p className="text-muted-foreground mb-4">
              Câu hỏi này không tồn tại hoặc bạn không có quyền truy cập.
            </p>
            <Button asChild>
              <Link href={createTeacherUrl("/dashboard/teaching/questions")}>
                Quay lại danh sách câu hỏi
              </Link>
            </Button>
          </div>
        </div>
      </TeacherOnly>
    );
  }

  return (
    <TeacherOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header with Breadcrumb and Edit Button */}
        <div className="flex items-center justify-between">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href={createTeacherUrl("/dashboard/teaching/questions")}
                  >
                    Quản lý câu hỏi
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {question.question_text.length > 50
                    ? `${question.question_text.substring(0, 50)}...`
                    : question.question_text}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Edit Button */}
          <Button asChild>
            <Link
              href={createTeacherUrl(
                `/dashboard/teaching/questions/${questionId}/edit`
              )}
            >
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Link>
          </Button>
        </div>

        {/* Question Content */}
        <div className="space-y-6">
          {/* Check if this is a code_exercise question */}
          {question.QuestionType?.name === "code_exercise" ? (
            <>
              {/* Code Exercise Display */}
              <CodeExerciseDisplay
                questionText={question.question_text}
                validationRules={question.validation_rules}
                timeLimit={question.time_limit}
                tags={question.tags}
                hints={question.hints}
                questionType={question.QuestionType}
                level={question.Level}
                lo={question.LO}
                explanation={question.explanation}
                getDifficultyColor={getDifficultyColor}
              />
            </>
          ) : (
            <>
              {/* Regular Question Display */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Thông tin câu hỏi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Question Content */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Nội dung câu hỏi
                        </label>
                        <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">
                            {question.question_text}
                          </p>
                        </div>
                      </div>

                      {question.explanation && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Giải thích
                          </label>
                          <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm whitespace-pre-wrap">
                              {question.explanation}
                            </p>
                          </div>
                        </div>
                      )}

                      <MediaViewer
                        mediaFiles={question.MediaFiles}
                        ownerType="question"
                        ownerId={question.question_id}
                      />
                    </div>

                    {/* Question Metadata */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Loại câu hỏi
                        </label>
                        <div className="mt-1">
                          {question.QuestionType ? (
                            <Badge
                              variant="outline"
                              className="bg-blue-100 text-blue-800 border-blue-200"
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {question.QuestionType.name}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Chưa xác định
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Độ khó
                        </label>
                        <div className="mt-1">
                          {question.Level ? (
                            <Badge
                              variant="outline"
                              className={getDifficultyColor(
                                question.Level.name
                              )}
                            >
                              <BarChart3 className="h-3 w-3 mr-1" />
                              {question.Level.name}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Chưa xác định
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Chuẩn đầu ra (LO)
                        </label>
                        <div className="mt-1">
                          {question.LO ? (
                            <Badge
                              variant="outline"
                              className="bg-indigo-100 text-indigo-800 border-indigo-200"
                            >
                              <Target className="h-3 w-3 mr-1" />
                              {question.LO.name}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Chưa liên kết
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Answers Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Câu trả lời
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {question.Answers && question.Answers.length > 0 ? (
                    <div className="space-y-3">
                      {/* Validation Warnings */}
                      {question.Answers.filter(
                        (a) => a.iscorrect === true || a.iscorrect === 1
                      ).length === 0 && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900/50 rounded-lg mb-4">
                          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              Cảnh báo: Chưa có đáp án đúng
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Answer List */}
                      <div className="space-y-2">
                        {question.Answers.map((answer, index) => {
                          const isCorrect =
                            answer.iscorrect === true || answer.iscorrect === 1;
                          return (
                            <div
                              key={answer.answer_id}
                              className={`p-3 rounded-lg border transition-colors ${
                                isCorrect
                                  ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/50"
                                  : "bg-muted/50 border-border"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                      isCorrect
                                        ? "bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-300"
                                        : "bg-muted text-muted-foreground"
                                    }`}
                                  >
                                    {String.fromCharCode(65 + index)}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm whitespace-pre-wrap break-words">
                                    {answer.answer_text}
                                  </p>
                                </div>
                                <div className="flex-shrink-0">
                                  {isCorrect ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-gray-400" />
                                  )}
                                </div>
                              </div>
                              <MediaViewer
                                mediaFiles={question.MediaFiles}
                                ownerType="answer"
                                ownerId={answer.answer_id}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Chưa có câu trả lời nào</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </TeacherOnly>
  );
}
