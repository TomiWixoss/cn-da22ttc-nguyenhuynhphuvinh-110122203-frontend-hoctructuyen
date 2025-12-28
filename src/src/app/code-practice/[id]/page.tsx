"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowLeft,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  MessageCircle,
  FileText,
  AlertCircle,
  Target,
  Award,
  Search,
  ArrowRight,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import { Card, CardContent, CardHeader } from "@/components/ui/layout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/feedback";
import {
  CodeEditor,
  EditorSettings,
  ModelSelector,
} from "@/components/features/editor";
import codePracticeService, {
  CodePracticeQuiz,
} from "@/lib/services/api/code-practice.service";
import codeSubmissionService, {
  TestCaseResult,
  AIAnalysis,
  AIFeedback,
  InlineError,
} from "@/lib/services/api/code-submission.service";
import { toast } from "sonner";
import { MediaViewer } from "@/components/shared/MediaViewer";
import { getLanguageExtensionByName } from "@/lib/utils/codemirror-languages";
import {
  getLanguageDisplayName,
  getLanguageBadgeColor,
} from "@/lib/utils/language-display";
import { AITutorChat } from "@/components/features/ai-tutor";

export default function CodePracticePage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id ? parseInt(params.id as string) : null;

  const [quiz, setQuiz] = useState<CodePracticeQuiz | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Track completed questions (question_id -> status)
  const [completedQuestions, setCompletedQuestions] = useState<
    Record<number, "accepted" | "pending">
  >(() => {
    // Load from localStorage if available
    if (typeof window !== "undefined" && quizId) {
      const stored = localStorage.getItem(`quiz_${quizId}_completed`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Error parsing completed questions:", e);
        }
      }
    }
    return {};
  });

  // Editor state
  const [code, setCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestCaseResult[] | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null); // AI feedback từ run test
  const [inlineErrors, setInlineErrors] = useState<InlineError[]>([]); // Inline errors cho editor
  const [processingStage, setProcessingStage] = useState<
    "idle" | "running" | "testing" | "analyzing" | "submitting" | "complete"
  >("idle");

  // AI Model selection
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    // Load from localStorage if available
    if (typeof window !== "undefined") {
      return localStorage.getItem("preferred_ai_model") || "";
    }
    return "";
  });

  // Editor settings
  const [fontSize, setFontSize] = useState(16);
  const [lineNumbers, setLineNumbers] = useState(true);
  const [wordWrap, setWordWrap] = useState(false);
  const [tabSize, setTabSize] = useState(4);
  const [autoCloseBrackets, setAutoCloseBrackets] = useState(true);

  // AI Tutor panel
  const [showAITutor, setShowAITutor] = useState(true);

  // Submit confirmation modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitModalInfo, setSubmitModalInfo] = useState<{
    passedCount: number;
    totalCount: number;
  } | null>(null);

  // Save model preference to localStorage
  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred_ai_model", model);
    }
  };

  useEffect(() => {
    const fetchQuizDetail = async () => {
      if (!quizId) {
        toast.error("ID quiz không hợp lệ");
        setIsLoadingQuiz(false);
        return;
      }

      try {
        const quizData = await codePracticeService.getCodePracticeQuizDetail(
          quizId
        );
        setQuiz(quizData);
      } catch (error) {
        console.error("Error fetching quiz:", error);
        toast.error("Không thể tải thông tin bài tập");
      } finally {
        setIsLoadingQuiz(false);
      }
    };

    fetchQuizDetail();
  }, [quizId]);

  // Reset state when changing questions
  useEffect(() => {
    setCode("");
    setTestResults(null);
    setAiAnalysis(null);
    setAiFeedback(null);
    setInlineErrors([]);
    setProcessingStage("idle");
  }, [currentQuestionIndex]);

  const handleNextQuestion = () => {
    if (quiz?.questions && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleRunTest = async () => {
    const currentQuestion = quiz?.questions?.[currentQuestionIndex];
    if (!currentQuestion || !code.trim()) {
      toast.error("Vui lòng nhập code");
      return;
    }

    const language = currentQuestion.validation_rules?.language;
    if (!language) {
      toast.error("Không xác định được ngôn ngữ");
      return;
    }

    if (!quizId) {
      toast.error("Không xác định được quiz ID");
      return;
    }

    setIsRunning(true);
    setProcessingStage("testing");
    setTestResults(null);
    setAiFeedback(null);
    setInlineErrors([]);

    try {
      // Run test with backend API - MUST include quiz_id (backend requirement)
      // API mới: Run test có AI phân tích lỗi
      const result = await codeSubmissionService.runTest({
        question_id: currentQuestion.question_id,
        quiz_id: quizId, // REQUIRED: Backend bắt buộc phải có quiz_id
        code,
        language,
      });

      setTestResults(result.results);
      setProcessingStage("complete");

      // Set inline errors nếu có (cho CodeMirror highlight)
      if (result.inline_errors && result.inline_errors.length > 0) {
        setInlineErrors(result.inline_errors);
      }

      // Set AI feedback nếu có (API mới)
      if (result.ai_feedback) {
        setAiFeedback(result.ai_feedback);
      }

      // Show compile error if any
      if (result.compile_error) {
        // Ưu tiên hiển thị bản dịch tiếng Việt
        const errorMsg = result.compile_error_vi || result.compile_error;
        toast.error(`Lỗi biên dịch: ${errorMsg}`);
        return;
      }

      // Show runtime error if any
      if (result.runtime_error) {
        const errorMsg = result.runtime_error_vi || result.runtime_error;
        toast.error(`Lỗi runtime: ${errorMsg}`);
      }

      // Show warning if code has main() function
      if (result.has_main_warning) {
        toast.warning(
          "Code của bạn có hàm main() có thể ảnh hưởng đến kết quả test"
        );
      }

      if (result.passed === result.test_case_count) {
        toast.success(
          `Pass ${result.passed}/${result.test_case_count} test cases!`
        );
      } else {
        toast.warning(
          `Pass ${result.passed}/${result.test_case_count} test cases`
        );
      }
    } catch (error: any) {
      console.error("Error running test:", error);
      toast.error(error?.message || "Lỗi khi chạy test");
      setProcessingStage("idle");
    } finally {
      setIsRunning(false);
    }
  };

  // Submit bài - API mới: KHÔNG có AI, chỉ lưu kết quả và tính điểm theo test cases
  const handleSubmit = async () => {
    const currentQuestion = quiz?.questions?.[currentQuestionIndex];
    if (!currentQuestion || !code.trim()) {
      toast.error("Vui lòng nhập code");
      return;
    }

    const language = currentQuestion.validation_rules?.language;
    if (!language) {
      toast.error("Không xác định được ngôn ngữ");
      return;
    }

    // Bắt buộc phải chạy test trước khi submit
    if (!testResults || testResults.length === 0) {
      toast.warning("Vui lòng chạy test trước khi nộp bài");
      return;
    }

    // Hiển thị modal xác nhận nếu chưa pass hết test
    const passedCount = testResults.filter((r) => r.passed).length;
    const totalCount = testResults.length;
    if (passedCount < totalCount) {
      setSubmitModalInfo({ passedCount, totalCount });
      setShowSubmitModal(true);
      return;
    }

    // Đã pass hết -> submit luôn
    await executeSubmit();
  };

  // Thực hiện submit sau khi xác nhận
  const executeSubmit = async () => {
    const currentQuestion = quiz?.questions?.[currentQuestionIndex];
    const language = currentQuestion?.validation_rules?.language;
    if (!currentQuestion || !language) return;

    setShowSubmitModal(false);
    setIsRunning(true);
    setProcessingStage("submitting");

    try {
      // Submit code - API mới không có AI
      // force_submit=true vì user đã xác nhận qua modal (hoặc đã pass hết test)
      const submitData: any = {
        question_id: currentQuestion.question_id,
        quiz_id: quizId || undefined,
        code,
        language,
        force_submit: true, // Luôn force vì đã qua bước xác nhận
      };

      const submitResult = await codeSubmissionService.submitCode(submitData);

      setProcessingStage("complete");

      // Mark question as completed if status is "accepted"
      if (submitResult.status === "accepted") {
        setCompletedQuestions((prev) => {
          const updated: Record<number, "accepted" | "pending"> = {
            ...prev,
            [currentQuestion.question_id]: "accepted" as const,
          };
          // Save to localStorage
          if (typeof window !== "undefined" && quizId) {
            localStorage.setItem(
              `quiz_${quizId}_completed`,
              JSON.stringify(updated)
            );
          }
          return updated;
        });
        toast.success(
          `Nộp bài thành công! Điểm: ${submitResult.score || 100}/100`
        );
      } else {
        // Nộp bài nhưng chưa pass hết
        const score = submitResult.score || 0;
        toast.info(`Đã nộp bài. Điểm: ${score}/100`);
      }
    } catch (error: any) {
      console.error("Error submitting code:", error);
      toast.error(error?.message || "Lỗi khi nộp bài");
      setProcessingStage("idle");
    } finally {
      setIsRunning(false);
    }
  };

  // Get CodeMirror extensions based on language
  const currentQuestion = quiz?.questions?.[currentQuestionIndex];
  const language = currentQuestion?.validation_rules?.language || "javascript";
  const codeMirrorExtensions = getLanguageExtensionByName(language);

  const getDifficultyConfig = (levelName: string) => {
    const lowerLevelName = levelName?.toLowerCase() || "";
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

  if (isLoadingQuiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang tải bài tập...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy bài tập</h2>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const totalQuestions = quiz.questions?.length || 0;

  return (
    <div className="h-screen bg-background flex flex-col lg:flex-row overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden flex-shrink-0 bg-background border-b p-4">
        <div className="flex items-center gap-3 mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold line-clamp-1">{quiz.name}</h1>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {quiz.course_name}
            </p>
          </div>
        </div>

        {/* Mobile Question Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className="rounded-lg"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 text-center py-1.5 px-3 rounded-lg bg-primary/10 text-primary text-sm font-medium">
            Câu {currentQuestionIndex + 1} / {totalQuestions}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextQuestion}
            disabled={currentQuestionIndex === totalQuestions - 1}
            className="rounded-lg"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Sidebar - Question List (Desktop only) */}
      <div className="hidden lg:flex w-72 flex-shrink-0 bg-muted/30 border-r flex-col">
        <div className="p-4 border-b bg-background/50">
          <div className="flex items-center gap-2 mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-semibold line-clamp-1">
                {quiz.name}
              </h1>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {quiz.course_name}
              </p>
            </div>
          </div>
          <div className="text-center py-1.5 px-3 rounded-lg bg-primary/10 text-primary text-sm font-medium">
            {totalQuestions} câu hỏi
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {quiz.questions?.map((question, index) => {
            const isCompleted =
              completedQuestions[question.question_id] === "accepted";
            const isCurrent = currentQuestionIndex === index;

            return (
              <button
                key={question.question_id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  isCurrent
                    ? isCompleted
                      ? "bg-green-50 dark:bg-green-950/20 border-green-500 shadow-sm"
                      : "bg-primary/10 border-primary shadow-sm"
                    : isCompleted
                    ? "bg-green-50/50 dark:bg-green-950/10 border-green-500/50 hover:border-green-500"
                    : "bg-background border-border hover:border-primary"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`size-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 relative ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrent
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium line-clamp-2 mb-1.5 leading-relaxed ${
                        isCompleted ? "text-green-700 dark:text-green-400" : ""
                      }`}
                    >
                      {question.question_text}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {question.level && (
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded ${getDifficultyConfig(
                            question.level.name
                          )}`}
                        >
                          {question.level.name}
                        </span>
                      )}
                      {question.validation_rules?.language && (
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded border ${getLanguageBadgeColor(
                            question.validation_rules.language
                          )}`}
                        >
                          {getLanguageDisplayName(
                            question.validation_rules.language
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content + AI Tutor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div
          className={`flex-1 overflow-y-auto overflow-x-hidden ${
            showAITutor ? "xl:mr-0" : ""
          }`}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6 pb-12">
            {currentQuestion && (
              <>
                {/* Question Card */}
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {currentQuestionIndex + 1}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="outline"
                              className="bg-blue-500/15 text-blue-600 border-blue-500/30 text-xs"
                            >
                              {currentQuestion.question_type?.name || "Code"}
                            </Badge>
                            {currentQuestion.level && (
                              <span
                                className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${getDifficultyConfig(
                                  currentQuestion.level.name
                                )}`}
                              >
                                {currentQuestion.level.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold mb-3 whitespace-pre-line break-words overflow-wrap-anywhere">
                          {currentQuestion.question_text}
                        </h2>

                        {currentQuestion.MediaFiles &&
                          currentQuestion.MediaFiles.length > 0 && (
                            <MediaViewer
                              mediaFiles={currentQuestion.MediaFiles}
                              ownerType="question"
                              ownerId={currentQuestion.question_id}
                              className="flex flex-wrap gap-3 mb-4"
                              imageClassName="w-32 h-32"
                            />
                          )}

                        {currentQuestion.validation_rules?.test_cases && (
                          <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-950/20 border mb-4">
                            <div className="flex items-center gap-2 mb-3">
                              <p className="text-sm font-semibold">
                                Test Cases (
                                {
                                  currentQuestion.validation_rules.test_cases
                                    .length
                                }
                                ):
                              </p>
                              {(currentQuestion.validation_rules as any)
                                .mode === "stdio" && (
                                <span className="text-xs px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                  STDIO Mode
                                </span>
                              )}
                            </div>
                            <div className="space-y-3">
                              {currentQuestion.validation_rules.test_cases.map(
                                (tc: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="p-3 rounded-lg bg-white dark:bg-slate-900 border"
                                  >
                                    {tc.description && (
                                      <p className="font-medium mb-2 text-sm">
                                        {tc.description}
                                      </p>
                                    )}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">
                                          Input:
                                        </span>
                                        <pre className="ml-2 text-blue-600 font-mono break-all whitespace-pre-wrap">
                                          {tc.input}
                                        </pre>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">
                                          {(
                                            currentQuestion.validation_rules as any
                                          ).mode === "stdio"
                                            ? "Output:"
                                            : "Expected:"}
                                        </span>
                                        <pre className="ml-2 text-green-600 font-mono break-all whitespace-pre-wrap">
                                          {(
                                            currentQuestion.validation_rules as any
                                          ).mode === "stdio"
                                            ? tc.output
                                            : String(tc.expected)}
                                        </pre>
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {currentQuestion.hints &&
                          currentQuestion.hints.length > 0 && (
                            <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Lightbulb className="h-4 w-4 text-yellow-700 dark:text-yellow-400" />
                                <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                                  Gợi ý:
                                </p>
                              </div>
                              <ul className="space-y-1.5 list-disc list-inside text-sm">
                                {currentQuestion.hints.map((hint, idx) => (
                                  <li key={idx}>{hint}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                        {currentQuestion.tags &&
                          currentQuestion.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {currentQuestion.tags.map((tag, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Editor Controls */}
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 overflow-hidden">
                      {/* Model Selector */}
                      <div className="min-w-0 flex-1 lg:flex-initial lg:max-w-[50%] overflow-hidden">
                        <ModelSelector
                          selectedModel={selectedModel}
                          onModelChange={handleModelChange}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap flex-shrink-0">
                        <EditorSettings
                          fontSize={fontSize}
                          onFontSizeChange={setFontSize}
                          lineNumbers={lineNumbers}
                          onLineNumbersChange={setLineNumbers}
                          wordWrap={wordWrap}
                          onWordWrapChange={setWordWrap}
                          tabSize={tabSize}
                          onTabSizeChange={setTabSize}
                          autoCloseBrackets={autoCloseBrackets}
                          onAutoCloseBracketsChange={setAutoCloseBrackets}
                        />
                        <Button
                          onClick={handleRunTest}
                          disabled={isRunning}
                          variant="outline"
                          className="rounded-lg flex-1 sm:flex-none"
                          size="sm"
                        >
                          {processingStage === "testing" ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              <span className="hidden sm:inline">
                                Đang test...
                              </span>
                              <span className="sm:hidden">Test...</span>
                            </>
                          ) : (
                            <>
                              <span className="hidden sm:inline">
                                Chạy Test
                              </span>
                              <span className="sm:hidden">Test</span>
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleSubmit}
                          disabled={isRunning}
                          className="rounded-lg flex-1 sm:flex-none"
                          size="sm"
                        >
                          {processingStage === "submitting" ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              <span className="hidden sm:inline">
                                Đang nộp bài...
                              </span>
                              <span className="sm:hidden">Nộp...</span>
                            </>
                          ) : (
                            <>
                              <span className="hidden lg:inline">Nộp bài</span>
                              <span className="lg:hidden">Nộp</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Code Editor */}
                <div className="w-full">
                  <CodeEditor
                    extensions={codeMirrorExtensions}
                    value={code}
                    onChange={setCode}
                    fontSize={fontSize}
                    height="400px"
                    lineNumbers={lineNumbers}
                    wordWrap={wordWrap}
                    tabSize={tabSize}
                    autoCloseBrackets={autoCloseBrackets}
                    inlineErrors={inlineErrors}
                  />
                </div>

                {/* Inline Errors - Hiển thị đầu tiên nếu có lỗi */}
                {inlineErrors && inlineErrors.length > 0 && (
                  <Card className="border-red-200 dark:border-red-800">
                    <CardHeader className="p-4 sm:p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border-2 border-red-500/20">
                          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-red-700 dark:text-red-400">
                            Lỗi cú pháp ({inlineErrors.length})
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Cần sửa trước khi chạy test
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                      <div className="space-y-2">
                        {inlineErrors.map((error, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg border ${
                              error.severity === "error"
                                ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                                : "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span
                                className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                                  error.severity === "error"
                                    ? "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200"
                                    : "bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200"
                                }`}
                              >
                                Dòng {error.line}
                              </span>
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {error.message}
                                </p>
                                {error.suggestion && (
                                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    <Lightbulb className="h-3 w-3" />
                                    {error.suggestion}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Test Results */}
                {testResults && testResults.length > 0 && (
                  <Card>
                    <CardHeader className="p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold">
                        Kết quả Test Cases
                      </h3>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                      <div className="space-y-3">
                        {testResults.map((result, idx) => (
                          <div
                            key={idx}
                            className={`p-3 sm:p-4 rounded-lg border-2 ${
                              result.passed
                                ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                                : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {result.passed ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                                )}
                                <span className="font-medium text-sm sm:text-base">
                                  Test Case {idx + 1}
                                </span>
                              </div>
                              {result.executionTime !== undefined && (
                                <span className="text-xs text-muted-foreground">
                                  {result.executionTime}ms
                                </span>
                              )}
                            </div>
                            {result.description && (
                              <p className="text-sm mb-2">
                                {result.description}
                              </p>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50">
                                <div className="text-xs text-muted-foreground mb-1 font-medium">
                                  Input
                                </div>
                                <pre className="text-blue-600 dark:text-blue-400 font-mono text-xs whitespace-pre-wrap break-all">
                                  {result.input || "-"}
                                </pre>
                              </div>
                              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50">
                                <div className="text-xs text-muted-foreground mb-1 font-medium">
                                  Expected
                                </div>
                                <pre className="text-green-600 dark:text-green-400 font-mono text-xs whitespace-pre-wrap break-all">
                                  {String(result.expected)}
                                </pre>
                              </div>
                              <div
                                className={`p-3 rounded-lg ${
                                  result.passed
                                    ? "bg-green-100 dark:bg-green-900/30"
                                    : "bg-red-100 dark:bg-red-900/30"
                                }`}
                              >
                                <div
                                  className={`text-xs mb-1 font-medium ${
                                    result.passed
                                      ? "text-green-700 dark:text-green-400"
                                      : "text-red-700 dark:text-red-400"
                                  }`}
                                >
                                  Output
                                </div>
                                <pre
                                  className={`font-mono text-xs whitespace-pre-wrap break-all ${
                                    result.passed
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-red-600 dark:text-red-400"
                                  }`}
                                >
                                  {result.actual_serialized || "(empty)"}
                                </pre>
                              </div>
                            </div>
                            {result.error && (
                              <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 rounded text-sm text-red-700 dark:text-red-400 break-words">
                                Error: {result.error}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* AI Feedback từ Run Test (API mới - Cerebras GPT-OSS-120B) */}
                {aiFeedback?.enabled && aiFeedback?.error_summary && (
                  <Card className="gap-0 py-4">
                    <CardHeader className="p-4 sm:p-6 pb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border-2 border-amber-500/20">
                          <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold">
                            Gợi ý từ AI
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {aiFeedback.error_type === "compile_error"
                              ? "Lỗi biên dịch"
                              : aiFeedback.error_type === "runtime_error"
                              ? "Lỗi runtime"
                              : aiFeedback.error_type === "logic_error"
                              ? "Lỗi logic"
                              : "Timeout"}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                      <div className="space-y-4">
                        {/* Error Summary */}
                        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                          <p className="font-medium text-amber-800 dark:text-amber-300">
                            {aiFeedback.error_summary}
                          </p>
                        </div>
                        {/* Hints */}
                        {aiFeedback.hints && aiFeedback.hints.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2">
                              <Lightbulb className="h-4 w-4 text-amber-600" />
                              Gợi ý
                            </h4>
                            <ul className="space-y-2">
                              {aiFeedback.hints.map((hint, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 text-sm"
                                >
                                  <span className="text-amber-600 font-bold">
                                    {idx + 1}.
                                  </span>
                                  <span>{hint}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Common Mistake */}
                        {aiFeedback.common_mistake && (
                          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                            <p className="text-sm flex items-start gap-2">
                              <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                              <span>
                                <span className="font-medium text-blue-700 dark:text-blue-400">
                                  Lỗi phổ biến:{" "}
                                </span>
                                {aiFeedback.common_mistake}
                              </span>
                            </p>
                          </div>
                        )}

                        {/* Encouragement */}
                        {aiFeedback.encouragement && (
                          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                            <p className="text-sm flex items-start gap-2">
                              <Heart className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                              <span>
                                <span className="font-medium text-emerald-700 dark:text-emerald-400">
                                  Lời khuyên:{" "}
                                </span>
                                {aiFeedback.encouragement}
                              </span>
                            </p>
                          </div>
                        )}

                        {/* Next Step */}
                        {aiFeedback.next_step && (
                          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                            <p className="text-sm flex items-start gap-2">
                              <ArrowRight className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                              <span>
                                <span className="font-medium text-green-700 dark:text-green-400">
                                  Bước tiếp theo:{" "}
                                </span>
                                {aiFeedback.next_step}
                              </span>
                            </p>
                          </div>
                        )}

                        {/* Pattern Detected */}
                        {aiFeedback.pattern_detected && (
                          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                            <p className="text-sm flex items-start gap-2">
                              <Search className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
                              <span>
                                <span className="font-medium text-purple-700 dark:text-purple-400">
                                  Phát hiện:{" "}
                                </span>
                                {aiFeedback.pattern_detected}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* AI Analysis (giữ lại cho backward compatibility) */}
                {aiAnalysis && (
                  <Card>
                    <CardHeader className="p-4 sm:p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border-2 border-purple-500/20">
                          <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold">
                          Phân Tích AI
                        </h3>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                      <div className="space-y-4 sm:space-y-6">
                        {/* Overall Score */}
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 bg-primary/5 border-primary/20">
                            <div>
                              <div className="text-4xl sm:text-5xl font-bold text-primary">
                                {aiAnalysis.overall_score}
                              </div>
                              <div className="text-xs sm:text-sm text-muted-foreground">
                                / 100
                              </div>
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                            Điểm Tổng Thể
                          </p>
                        </div>

                        {/* Check if system error */}
                        {aiAnalysis.correctness?.errors?.includes(
                          "Lỗi hệ thống"
                        ) ? (
                          <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-5 w-5 text-yellow-700 dark:text-yellow-400" />
                              <h4 className="font-semibold text-yellow-700 dark:text-yellow-400">
                                Thông báo
                              </h4>
                            </div>
                            <p className="text-sm">
                              Hệ thống gặp lỗi khi phân tích code. Vui lòng thử
                              lại sau.
                            </p>
                          </div>
                        ) : (
                          <>
                            {/* Detailed Scores */}
                            {(aiAnalysis.correctness?.score > 0 ||
                              aiAnalysis.code_quality?.score > 0 ||
                              aiAnalysis.performance?.score > 0) && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {aiAnalysis.correctness?.score > 0 && (
                                  <div className="p-4 rounded-lg border">
                                    <h4 className="font-semibold mb-2">
                                      Tính đúng đắn
                                    </h4>
                                    <div className="text-2xl font-bold text-green-600">
                                      {aiAnalysis.correctness.score}
                                    </div>
                                    {aiAnalysis.correctness.comments && (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {aiAnalysis.correctness.comments}
                                      </p>
                                    )}
                                  </div>
                                )}
                                {aiAnalysis.code_quality?.score > 0 && (
                                  <div className="p-4 rounded-lg border">
                                    <h4 className="font-semibold mb-2">
                                      Chất lượng code
                                    </h4>
                                    <div className="text-2xl font-bold text-blue-600">
                                      {aiAnalysis.code_quality.score}
                                    </div>
                                    {aiAnalysis.code_quality.comments && (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {aiAnalysis.code_quality.comments}
                                      </p>
                                    )}
                                  </div>
                                )}
                                {aiAnalysis.performance?.score > 0 && (
                                  <div className="p-4 rounded-lg border">
                                    <h4 className="font-semibold mb-2">
                                      Hiệu suất
                                    </h4>
                                    <div className="text-2xl font-bold text-purple-600">
                                      {aiAnalysis.performance.score}
                                    </div>
                                    {aiAnalysis.performance.time_complexity && (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {aiAnalysis.performance.time_complexity}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Strengths & Weaknesses */}
                            {(aiAnalysis.strengths?.length > 0 ||
                              aiAnalysis.weaknesses?.length > 0) && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {aiAnalysis.strengths?.length > 0 && (
                                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                                    <div className="flex items-center gap-2 mb-2">
                                      <TrendingUp className="h-5 w-5 text-green-700 dark:text-green-400" />
                                      <h4 className="font-semibold text-green-700 dark:text-green-400">
                                        Điểm mạnh
                                      </h4>
                                    </div>
                                    <ul className="space-y-1 text-sm">
                                      {aiAnalysis.strengths.map(
                                        (s: string, i: number) => (
                                          <li key={i}>• {s}</li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                                {aiAnalysis.weaknesses?.length > 0 && (
                                  <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                                    <div className="flex items-center gap-2 mb-2">
                                      <TrendingDown className="h-5 w-5 text-orange-700 dark:text-orange-400" />
                                      <h4 className="font-semibold text-orange-700 dark:text-orange-400">
                                        Cần cải thiện
                                      </h4>
                                    </div>
                                    <ul className="space-y-1 text-sm">
                                      {aiAnalysis.weaknesses.map(
                                        (w: string, i: number) => (
                                          <li key={i}>• {w}</li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Feedback */}
                            {aiAnalysis.feedback && (
                              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-2 mb-2">
                                  <MessageCircle className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                                  <h4 className="font-semibold text-blue-700 dark:text-blue-400">
                                    Nhận xét chung
                                  </h4>
                                </div>
                                <p className="text-sm">{aiAnalysis.feedback}</p>
                              </div>
                            )}

                            {/* Explanation */}
                            {aiAnalysis.explanation && (
                              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/20 border">
                                <div className="flex items-center gap-2 mb-2">
                                  <FileText className="h-5 w-5" />
                                  <h4 className="font-semibold">Giải thích</h4>
                                </div>
                                <p className="text-sm">
                                  {aiAnalysis.explanation}
                                </p>
                              </div>
                            )}

                            {/* Correctness Errors */}
                            {aiAnalysis.correctness?.errors?.length > 0 && (
                              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertCircle className="h-5 w-5 text-red-700 dark:text-red-400" />
                                  <h4 className="font-semibold text-red-700 dark:text-red-400">
                                    Lỗi phát hiện
                                  </h4>
                                </div>
                                <ul className="space-y-1 text-sm">
                                  {aiAnalysis.correctness.errors.map(
                                    (e: string, i: number) => (
                                      <li key={i}>• {e}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                            {/* Correctness Suggestions */}
                            {aiAnalysis.correctness?.suggestions &&
                              aiAnalysis.correctness.suggestions.length > 0 && (
                                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Lightbulb className="h-5 w-5 text-purple-700 dark:text-purple-400" />
                                    <h4 className="font-semibold text-purple-700 dark:text-purple-400">
                                      Gợi ý sửa lỗi
                                    </h4>
                                  </div>
                                  <ul className="space-y-1 text-sm">
                                    {aiAnalysis.correctness.suggestions.map(
                                      (s: string, i: number) => (
                                        <li key={i}>• {s}</li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}

                            {/* Best Practices Recommendations */}
                            {aiAnalysis.best_practices?.recommendations
                              ?.length > 0 && (
                              <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800">
                                <div className="flex items-center gap-2 mb-2">
                                  <Award className="h-5 w-5 text-indigo-700 dark:text-indigo-400" />
                                  <h4 className="font-semibold text-indigo-700 dark:text-indigo-400">
                                    Best Practices
                                  </h4>
                                </div>
                                <ul className="space-y-1 text-sm">
                                  {aiAnalysis.best_practices.recommendations.map(
                                    (s: string, i: number) => (
                                      <li key={i}>• {s}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                            {/* Next Improvements */}
                            {aiAnalysis.next_improvements &&
                              aiAnalysis.next_improvements.length > 0 && (
                                <div className="p-4 rounded-lg bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Target className="h-5 w-5 text-cyan-700 dark:text-cyan-400" />
                                    <h4 className="font-semibold text-cyan-700 dark:text-cyan-400">
                                      Bước tiếp theo
                                    </h4>
                                  </div>
                                  <ul className="space-y-1 text-sm">
                                    {aiAnalysis.next_improvements.map(
                                      (s: string, i: number) => (
                                        <li key={i}>• {s}</li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>

        {/* AI Tutor Panel - Desktop */}
        {showAITutor && currentQuestion && (
          <div className="hidden xl:block w-96 flex-shrink-0 border-l overflow-hidden">
            <AITutorChat
              questionId={currentQuestion.question_id}
              code={code}
              error={testResults?.find((r) => !r.passed)?.error || undefined}
              className="h-full"
            />
          </div>
        )}
      </div>

      {/* AI Tutor Toggle Button - Mobile/Tablet */}
      {currentQuestion && (
        <div className="xl:hidden fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => setShowAITutor(!showAITutor)}
            className="h-14 w-14 rounded-full shadow-lg"
            size="icon"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* AI Tutor Modal - Mobile/Tablet */}
      {showAITutor && currentQuestion && (
        <div className="xl:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
          <div className="absolute bottom-0 left-0 right-0 h-[70vh] bg-background border-t rounded-t-2xl shadow-2xl">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-3 border-b">
                <span className="font-semibold">AI Tutor</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAITutor(false)}
                >
                  Đóng
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <AITutorChat
                  questionId={currentQuestion.question_id}
                  code={code}
                  error={
                    testResults?.find((r) => !r.passed)?.error || undefined
                  }
                  className="h-full rounded-none border-0"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Xác nhận nộp bài
            </DialogTitle>
            <DialogDescription className="pt-2">
              {submitModalInfo && (
                <span>
                  Bạn mới pass{" "}
                  <span className="font-semibold text-amber-600">
                    {submitModalInfo.passedCount}/{submitModalInfo.totalCount}
                  </span>{" "}
                  test cases. Bạn có chắc muốn nộp bài không?
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowSubmitModal(false)}>
              Hủy
            </Button>
            <Button
              onClick={executeSubmit}
              className="bg-amber-500 hover:bg-amber-600"
            >
              Vẫn nộp bài
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
