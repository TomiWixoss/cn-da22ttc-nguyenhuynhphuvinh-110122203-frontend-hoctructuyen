import { Card, CardContent } from "@/components/ui/layout";
import { QuizDetail, QuizModeInfo } from "@/lib/types/quiz";
import { QuizModeBadge } from "@/components/features/quiz/list/quiz-mode-badge";
import {
  CalendarClock,
  Clock,
  Hash,
  Info,
  CheckCircle2,
  AlertCircle,
  HourglassIcon,
  Code2,
  FileCheck,
  Brain,
  Timer,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface QuizInfoProps {
  quiz: QuizDetail;
  quizModeInfo?: QuizModeInfo | null;
}

export function QuizInfo({ quiz, quizModeInfo }: QuizInfoProps) {
  // Kiểm tra xem có phải chế độ luyện tập hoặc luyện code không
  const isPracticeMode =
    quizModeInfo?.quiz_mode === "practice" ||
    quizModeInfo?.quiz_mode === "code_practice";

  // Tạo mapping màu đồng nhất cho trạng thái theo theme của QuizStatusBadge
  const getStatusConfig = () => {
    switch (quiz.status) {
      case "active":
        return {
          label: "Đang diễn ra",
          className:
            "bg-green-500/15 text-green-600 border border-green-500/30 hover:bg-green-500/25",
          icon: <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />,
        };
      case "finished":
        return {
          label: "Đã hoàn thành",
          className:
            "bg-blue-500/15 text-blue-600 border border-blue-500/30 hover:bg-blue-500/25",
          icon: <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />,
        };
      case "pending":
      default:
        return {
          label: "Chưa bắt đầu",
          className:
            "bg-orange-500/15 text-orange-600 border border-orange-500/30 hover:bg-orange-500/25",
          icon: <HourglassIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />,
        };
    }
  };

  const statusConfig = getStatusConfig();

  // Định dạng thời gian
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa thiết lập";
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
  };

  return (
    <div className="space-y-6">
      {/* Header Card - Quiz Name và Status */}
      <Card className="bg-gradient-to-r from-background to-muted/20 border-2">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 flex-wrap">
            <div className="space-y-2 flex-1">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground break-words">
                {quiz.name}
              </h3>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <p className="text-sm sm:text-base text-muted-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
                  <span className="break-words">{quiz.course_name}</span>
                </p>
                {quizModeInfo && (
                  <QuizModeBadge mode={quizModeInfo.quiz_mode} size="md" />
                )}
                {/* Hiển thị Duration inline trong header khi ở chế độ luyện tập */}
                {isPracticeMode && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-600">
                      {quiz.duration} phút
                    </span>
                  </div>
                )}
              </div>
            </div>
            {/* Chỉ hiển thị trạng thái khi không phải chế độ luyện tập */}
            {!isPracticeMode && (
              <span
                className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 ${statusConfig.className}`}
              >
                {statusConfig.icon}
                {statusConfig.label}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quiz Details Grid - Chỉ hiển thị khi không phải chế độ luyện tập */}
      {!isPracticeMode && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Duration Card */}
          <Card className="border hover:border-primary/50 transition-colors duration-200">
            <CardContent className="p-3 sm:p-4 md:p-5">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="size-10 sm:size-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 flex items-center justify-center text-blue-600 border border-blue-500/20">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-0.5 sm:mb-1">
                    Thời gian làm bài
                  </p>
                  <p className="text-base sm:text-lg font-bold text-foreground">
                    {quiz.duration} phút
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PIN Card */}
          <Card className="border hover:border-primary/50 transition-colors duration-200">
            <CardContent className="p-3 sm:p-4 md:p-5">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="size-10 sm:size-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 flex items-center justify-center text-green-600 border border-green-500/20">
                  <Hash className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-0.5 sm:mb-1">
                    Mã PIN
                  </p>
                  <p className="text-base sm:text-lg font-bold text-foreground font-mono truncate">
                    {quiz.pin || "Chưa có"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Start Time Card */}
          <Card className="border hover:border-primary/50 transition-colors duration-200">
            <CardContent className="p-3 sm:p-4 md:p-5">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="size-10 sm:size-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 flex items-center justify-center text-purple-600 border border-purple-500/20">
                  <CalendarClock className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-0.5 sm:mb-1">
                    Thời gian bắt đầu
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-foreground break-words">
                    {formatDate(quiz.start_time)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* End Time Card */}
          <Card className="border hover:border-primary/50 transition-colors duration-200">
            <CardContent className="p-3 sm:p-4 md:p-5">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="size-10 sm:size-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 flex items-center justify-center text-orange-600 border border-orange-500/20">
                  <CalendarClock className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-0.5 sm:mb-1">
                    Thời gian kết thúc
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-foreground break-words">
                    {formatDate(quiz.end_time)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Code Configuration Card - Chỉ hiển thị khi quiz_mode là code_practice */}
      {quizModeInfo?.quiz_mode === "code_practice" && quiz.code_config && (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="size-8 sm:size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Code2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-foreground">
                Cấu hình Code Practice
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Show Test Results */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border">
                <div className="size-8 rounded-md bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <FileCheck className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Hiển thị kết quả test
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {quiz.code_config.show_test_results ? "Có" : "Không"}
                  </p>
                </div>
              </div>

              {/* Enable AI Analysis */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border">
                <div className="size-8 rounded-md bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Phân tích AI
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {quiz.code_config.enable_ai_analysis ? "Bật" : "Tắt"}
                  </p>
                </div>
              </div>

              {/* Time Limit Per Question */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border">
                <div className="size-8 rounded-md bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <Timer className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Thời gian mỗi câu
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {Math.floor(quiz.code_config.time_limit_per_question / 60)}{" "}
                    phút
                  </p>
                </div>
              </div>

              {/* Allow Multiple Submissions */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border">
                <div className="size-8 rounded-md bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Nộp nhiều lần
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {quiz.code_config.allow_multiple_submissions
                      ? "Cho phép"
                      : "Không"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer Info Card */}
      <Card className="border-dashed border-2 bg-muted/5">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5 sm:mt-0" />
            <p className="break-words">
              Cập nhật lần cuối: {formatDate(quiz.update_time)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
