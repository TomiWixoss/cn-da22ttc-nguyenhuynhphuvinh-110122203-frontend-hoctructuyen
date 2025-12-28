import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/layout/card";
import { Badge } from "@/components/ui/feedback/badge";
import {
  Code,
  Clock,
  Tag,
  Lightbulb,
  CheckCircle2,
  MessageSquare,
  BarChart3,
  Target,
} from "lucide-react";
import { CodeExerciseValidationRules } from "@/lib/types/question";
import ReactMarkdown from "react-markdown";

interface CodeExerciseDisplayProps {
  questionText: string;
  validationRules?: CodeExerciseValidationRules;
  timeLimit?: number;
  tags?: string[];
  hints?: string[];
  questionType?: {
    question_type_id: number;
    name: string;
  };
  level?: {
    level_id: number;
    name: string;
  };
  lo?: {
    lo_id: number;
    name: string;
    description?: string;
    course_id?: number;
  };
  explanation?: string;
  getDifficultyColor?: (levelName: string) => string;
}

export function CodeExerciseDisplay({
  questionText,
  validationRules,
  timeLimit,
  tags,
  hints,
  questionType,
  level,
  lo,
  explanation,
  getDifficultyColor,
}: CodeExerciseDisplayProps) {
  const hasTestCases =
    validationRules?.test_cases && validationRules.test_cases.length > 0;
  const testCaseCount = validationRules?.test_case_count || 0;

  const defaultGetDifficultyColor = (levelName: string) => {
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

  const difficultyColorFn = getDifficultyColor || defaultGetDifficultyColor;

  return (
    <div className="space-y-6">
      {/* Question Text (Markdown) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Đề bài
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{questionText}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Thông tin bài tập
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Language */}
            {validationRules?.language && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Ngôn ngữ lập trình
                </label>
                <div className="mt-1">
                  <Badge
                    variant="outline"
                    className="bg-purple-100 text-purple-800 border-purple-200"
                  >
                    <Code className="h-3 w-3 mr-1" />
                    {validationRules.language.toUpperCase()}
                  </Badge>
                </div>
              </div>
            )}

            {/* Mode */}
            {validationRules && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Chế độ Test Case
                </label>
                <div className="mt-1">
                  <Badge
                    variant="outline"
                    className={(validationRules as any).mode === "stdio" 
                      ? "bg-indigo-100 text-indigo-800 border-indigo-200"
                      : "bg-teal-100 text-teal-800 border-teal-200"
                    }
                  >
                    <Code className="h-3 w-3 mr-1" />
                    {(validationRules as any).mode === "stdio" 
                      ? "STDIN/STDOUT Mode" 
                      : "Function Mode"}
                  </Badge>
                </div>
              </div>
            )}

            {/* Time Limit */}
            {timeLimit && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Thời gian giới hạn
                </label>
                <div className="mt-1">
                  <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-800 border-blue-200"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {Math.floor(timeLimit / 60)} phút
                  </Badge>
                </div>
              </div>
            )}

            {/* Max Execution Time */}
            {validationRules?.max_execution_time && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Thời gian thực thi tối đa
                </label>
                <div className="mt-1">
                  <Badge
                    variant="outline"
                    className="bg-orange-100 text-orange-800 border-orange-200"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {validationRules.max_execution_time}ms
                  </Badge>
                </div>
              </div>
            )}

            {/* Test Case Count */}
            {testCaseCount > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Số lượng test case
                </label>
                <div className="mt-1">
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800 border-green-200"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {testCaseCount} test case{testCaseCount > 1 ? "s" : ""}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1 mb-2">
                <Tag className="h-3 w-3" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-gray-100 text-gray-800 border-gray-200"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          {(questionType || level || lo || explanation) && (
            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-semibold mb-3">Thông tin bổ sung</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Question Type */}
                {questionType && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Loại câu hỏi
                    </label>
                    <div className="mt-1">
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-800 border-blue-200"
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {questionType.name}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Difficulty Level */}
                {level && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Độ khó
                    </label>
                    <div className="mt-1">
                      <Badge
                        variant="outline"
                        className={difficultyColorFn(level.name)}
                      >
                        <BarChart3 className="h-3 w-3 mr-1" />
                        {level.name}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Learning Outcome */}
                {lo && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Chuẩn đầu ra (LO)
                    </label>
                    <div className="mt-1">
                      <Badge
                        variant="outline"
                        className="bg-indigo-100 text-indigo-800 border-indigo-200"
                      >
                        <Target className="h-3 w-3 mr-1" />
                        {lo.name}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* Explanation */}
              {explanation && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-muted-foreground">
                    Giải thích
                  </label>
                  <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{explanation}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hints */}
      {hints && hints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Gợi ý
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {hints.map((hint, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg"
                >
                  <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                    {index + 1}.
                  </span>
                  <span className="text-yellow-800 dark:text-yellow-300">
                    {hint}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Test Cases */}
      {hasTestCases && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Test Cases
              {(validationRules as any)?.mode === "stdio" && (
                <Badge
                  variant="outline"
                  className="bg-purple-100 text-purple-800 border-purple-200 ml-2"
                >
                  STDIO Mode
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {validationRules.test_cases!.map((testCase: any, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-muted/50 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className="bg-blue-100 text-blue-800 border-blue-200"
                    >
                      Test Case {index + 1}
                    </Badge>
                    {testCase.description && (
                      <span className="text-sm text-muted-foreground">
                        {testCase.description}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        {(validationRules as any)?.mode === "stdio" ? "Input (STDIN):" : "Input:"}
                      </label>
                      <pre className="mt-1 p-2 bg-background rounded text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                        {testCase.input}
                      </pre>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        {(validationRules as any)?.mode === "stdio" ? "Output (STDOUT):" : "Expected Output:"}
                      </label>
                      <pre className="mt-1 p-2 bg-background rounded text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                        {(validationRules as any)?.mode === "stdio"
                          ? testCase.output
                          : typeof testCase.expected === "object"
                            ? JSON.stringify(testCase.expected, null, 2)
                            : String(testCase.expected)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
