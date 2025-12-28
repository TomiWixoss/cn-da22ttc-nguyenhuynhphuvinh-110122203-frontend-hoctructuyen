import { Calendar, Clock, Bookmark } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/layout";
import { Quiz } from "@/lib/types/quiz";
import { QuizActions } from "./quiz-actions";
import { QuizStatusBadge } from "./quiz-status-badge";
import { QuizModeBadge } from "./quiz-mode-badge";
import { formatDate } from "@/lib/utils";

interface QuizCardProps {
  quiz: Quiz;
  courseName: string;
}

export function QuizCard({ quiz, courseName }: QuizCardProps) {
  const quizStatus = quiz.status || "pending";

  return (
    <Card className="h-full border-2 border-border hover:border-primary/60 transition-all duration-300 bg-gradient-to-br from-white to-slate-50/50 dark:from-card dark:to-card/80">
      <CardContent className="px-4">
        <div className="flex flex-col h-full px-2">
          {/* Header: Course name và badge */}
          <div className="flex flex-col gap-2 mb-3">
            {/* Course name và badge cùng hàng */}
            <div className="flex items-center justify-between min-w-0 gap-2">
              <div className="flex items-center text-muted-foreground hover:text-blue-600 transition-colors min-w-0 flex-1">
                <Bookmark className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 flex-shrink-0 text-blue-500" />
                <span className="text-xs sm:text-sm line-clamp-1 font-medium">
                  {courseName}
                </span>
              </div>
              {/* Nếu là practice hoặc code_practice thì hiển thị mode badge, không thì hiển thị status badge */}
              {quiz.quiz_mode === "practice" ||
              quiz.quiz_mode === "code_practice" ? (
                <QuizModeBadge
                  mode={quiz.quiz_mode}
                  className="flex-shrink-0"
                  size="sm"
                />
              ) : (
                <QuizStatusBadge
                  status={quizStatus}
                  className="flex-shrink-0"
                />
              )}
            </div>
          </div>

          {/* Tên quiz - được ưu tiên hiển thị */}
          <div className="flex-1 flex items-start py-2">
            <h3 className="font-semibold text-base sm:text-lg text-foreground hover:text-primary transition-colors line-clamp-3 leading-tight text-left">
              {quiz.name}
            </h3>
          </div>

          {/* Thông tin thời gian ở dưới */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-auto pt-2 border-t border-border/50">
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 flex-shrink-0 text-blue-500" />
              <span className="text-xs sm:text-sm font-medium">
                {quiz.duration} phút
              </span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 flex-shrink-0 text-blue-500" />
              <span className="text-xs sm:text-sm truncate">
                {formatDate(quiz.update_time)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-3 px-6 flex justify-center">
        <QuizActions
          quizId={quiz.quiz_id}
          status={quizStatus}
          quizMode={quiz.quiz_mode}
        />
      </CardFooter>
    </Card>
  );
}
