import React, { useState } from "react";
import { Question } from "@/lib/types/quiz";
import { Card, CardHeader, CardContent } from "@/components/ui/layout";
import { Badge } from "@/components/ui/feedback";
import { Button } from "@/components/ui/forms";
import {
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Shuffle,
  Loader2,
} from "lucide-react";
import { EmptyState } from "@/components/ui/feedback";
import { MediaViewer } from "@/components/shared/MediaViewer";
import {
  getLanguageDisplayName,
  getLanguageBadgeColor,
} from "@/lib/utils/language-display";

interface QuestionListProps {
  questions: Question[];
  onReshuffle: () => void;
  isReshuffleLoading?: boolean;
  quizMode?: string;
}

export function QuestionList({
  questions,
  onReshuffle,
  isReshuffleLoading = false,
  quizMode,
}: QuestionListProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);

  // Màu sắc đồng nhất cho badge độ khó
  const getDifficultyConfig = (levelName: string) => {
    const lowerLevelName = levelName.toLowerCase();
    switch (lowerLevelName) {
      case "easy":
      case "dễ":
        return "bg-green-500/15 text-green-600 border border-green-500/30";
      case "medium":
      case "trung bình":
        return "bg-orange-500/15 text-orange-600 border border-orange-500/30";
      case "hard":
      case "khó":
        return "bg-red-500/15 text-red-600 border border-red-500/30";
      default:
        return "bg-blue-500/15 text-blue-600 border border-blue-500/30";
    }
  };

  // Toggle mở rộng câu hỏi
  const toggleExpand = (questionId: number) => {
    setExpandedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  // Kiểm tra nếu câu hỏi đang mở rộng
  const isExpanded = (questionId: number) => {
    return expandedQuestions.includes(questionId);
  };

  if (!questions.length) {
    return (
      <EmptyState
        title="Không có câu hỏi"
        description="Chưa có câu hỏi nào trong bài kiểm tra này."
        icon="ClipboardList"
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg md:text-xl font-bold">
          Danh sách câu hỏi ({questions.length})
        </h3>
        {quizMode !== "practice" && quizMode !== "code_practice" && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReshuffle}
            disabled={isReshuffleLoading}
            title="Trộn lại câu hỏi"
            className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm cursor-pointer w-full sm:w-auto"
          >
            {isReshuffleLoading ? (
              <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin mr-1.5" />
            ) : (
              <Shuffle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
            )}
            Trộn lại câu hỏi
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:gap-4 md:gap-6">
        {questions.map((question, index) => (
          <Card
            key={question.question_id}
            onClick={() => toggleExpand(question.question_id)}
            className="overflow-hidden cursor-pointer border-2 bg-card hover:border-green-500/50 transition-all duration-200"
          >
            <CardHeader className="flex flex-row items-start gap-2 sm:gap-3 md:gap-4 justify-between">
              <div className="space-y-1.5 sm:space-y-2 md:space-y-3 flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <div className="flex-shrink-0 size-6 sm:size-7 md:size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs sm:text-sm">
                    {index + 1}
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className="text-[10px] sm:text-xs px-1.5 sm:px-2 md:px-2.5 py-0 sm:py-0.5 bg-blue-500/15 text-blue-600 border border-blue-500/30"
                    >
                      {question.question_type.name}
                    </Badge>
                    <span
                      className={`inline-flex items-center px-1.5 sm:px-2 md:px-2.5 py-0 sm:py-0.5 text-[10px] sm:text-xs font-medium rounded-full ${getDifficultyConfig(
                        question.level.name
                      )}`}
                    >
                      {question.level.name}
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm md:text-base font-medium whitespace-pre-line break-words">
                  {question.question_text}
                </p>
                <MediaViewer
                  mediaFiles={question.MediaFiles}
                  ownerType="question"
                  ownerId={question.question_id}
                  className="flex flex-wrap gap-1.5 sm:gap-2 mt-1.5 sm:mt-2"
                  imageClassName="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
                />
              </div>
              <div className="pt-0.5 sm:pt-1 flex-shrink-0">
                <div className="size-6 sm:size-7 md:size-8 flex items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
                  {isExpanded(question.question_id) ? (
                    <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  )}
                </div>
              </div>
            </CardHeader>

            {isExpanded(question.question_id) && (
              <CardContent className="border-t bg-muted/5">
                <div className="space-y-3 sm:space-y-4 md:space-y-5">
                  {/* Code Exercise Information */}
                  {question.question_type.name === "code_exercise" &&
                    question.validation_rules && (
                      <div className="space-y-3 sm:space-y-4">
                        {/* Language & Time Limit */}
                        <div className="flex flex-wrap gap-2 sm:gap-3 pt-2">
                          <span
                            className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded border ${getLanguageBadgeColor(
                              question.validation_rules.language
                            )}`}
                          >
                            Ngôn ngữ:{" "}
                            {getLanguageDisplayName(
                              question.validation_rules.language
                            )}
                          </span>
                          {question.time_limit && (
                            <Badge className="bg-amber-500/15 text-amber-600 border border-amber-500/30 px-3 py-1">
                              Thời gian: {question.time_limit}s
                            </Badge>
                          )}
                        </div>

                        {/* Test Cases */}
                        {question.validation_rules.test_cases &&
                          question.validation_rules.test_cases.length > 0 && (
                            <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-400">
                                  Test Cases (
                                  {question.validation_rules.test_cases.length}):
                                </p>
                                {(question.validation_rules as any).mode === "stdio" && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                    STDIO Mode
                                  </span>
                                )}
                              </div>
                              <div className="space-y-2">
                                {question.validation_rules.test_cases.map(
                                  (testCase: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                                    >
                                      <div className="text-xs space-y-1">
                                        {testCase.description && (
                                          <p className="font-medium text-slate-600 dark:text-slate-300">
                                            {testCase.description}
                                          </p>
                                        )}
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <span className="text-slate-500 dark:text-slate-400">
                                              Input:
                                            </span>
                                            <pre className="ml-1 text-blue-600 dark:text-blue-400 whitespace-pre-wrap font-mono">
                                              {testCase.input}
                                            </pre>
                                          </div>
                                          <div>
                                            <span className="text-slate-500 dark:text-slate-400">
                                              {(question.validation_rules as any).mode === "stdio" ? "Output:" : "Expected:"}
                                            </span>
                                            <pre className="ml-1 text-green-600 dark:text-green-400 whitespace-pre-wrap font-mono">
                                              {(question.validation_rules as any).mode === "stdio" 
                                                ? testCase.output 
                                                : String(testCase.expected)}
                                            </pre>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Hints */}
                        {question.hints && question.hints.length > 0 && (
                          <div className="p-3 rounded-md bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                            <p className="text-xs sm:text-sm font-medium mb-2 text-yellow-700 dark:text-yellow-400">
                              Gợi ý:
                            </p>
                            <ul className="space-y-1 list-disc list-inside">
                              {question.hints.map((hint, idx) => (
                                <li
                                  key={idx}
                                  className="text-xs sm:text-sm text-yellow-700/80 dark:text-yellow-400/80"
                                >
                                  {hint}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Tags */}
                        {question.tags && question.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {question.tags.map((tag, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs bg-indigo-500/10 text-indigo-600 border-indigo-500/30 px-2.5 py-0.5"
                              >
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                  {/* Regular Question Answers */}
                  {question.answers && question.answers.length > 0 && (
                    <div className="grid gap-2 sm:gap-3 md:gap-4">
                      {question.answers.map((answer) => (
                        <div
                          key={answer.answer_id}
                          className={`flex items-start gap-2 sm:gap-2.5 md:gap-3 p-2.5 sm:p-3 md:p-4 rounded-md ${
                            answer.iscorrect
                              ? "bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800"
                              : "bg-muted/20 border border-border"
                          }`}
                        >
                          <div
                            className={`size-5 sm:size-5 md:size-6 rounded-full flex-shrink-0 flex items-center justify-center ${
                              answer.iscorrect
                                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                : "bg-muted/30 text-muted-foreground"
                            }`}
                          >
                            {answer.iscorrect ? (
                              <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                            ) : (
                              <X className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs sm:text-sm leading-relaxed break-words">
                              {answer.answer_text}
                            </div>
                            <MediaViewer
                              mediaFiles={question.MediaFiles}
                              ownerType="answer"
                              ownerId={answer.answer_id}
                              className="flex flex-wrap gap-1 sm:gap-1.5 mt-1 sm:mt-1.5"
                              imageClassName="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.explanation && (
                    <div className="p-2.5 sm:p-3 md:p-4 rounded-md bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800">
                      <p className="text-xs sm:text-sm font-medium mb-1 text-blue-700 dark:text-blue-400">
                        Giải thích:
                      </p>
                      <p className="text-xs sm:text-sm text-blue-700/80 dark:text-blue-400/80 leading-relaxed break-words">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
