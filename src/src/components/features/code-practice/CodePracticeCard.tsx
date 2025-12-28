"use client";

import { Card, CardContent } from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { BookOpen, Clock, FileCode, Play } from "lucide-react";
import { CodePracticeQuiz } from "@/lib/services/api/code-practice.service";
import { cn } from "@/lib/utils";

interface CodePracticeCardProps {
  quiz: CodePracticeQuiz;
  onStartQuiz: (quiz: CodePracticeQuiz) => void;
  className?: string;
}

export function CodePracticeCard({
  quiz,
  onStartQuiz,
  className,
}: CodePracticeCardProps) {
  // Format time display - duration is in minutes from API
  const formatTimeLimit = (minutes?: number) => {
    if (!minutes) return "Không giới hạn";
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}p`
      : `${hours} giờ`;
  };

  return (
    <Card
      className={cn(
        "group h-full border border-border hover:border-purple-500 transition-colors duration-200",
        "bg-white dark:bg-card",
        className
      )}
    >
      <CardContent className="px-4">
        <div className="flex flex-col h-full">
          {/* Header: Subject */}
          <div className="flex items-center mb-3">
            <div className="flex items-center text-muted-foreground min-w-0 flex-1">
              <BookOpen className="h-4 w-4 mr-2 flex-shrink-0 text-purple-600 dark:text-purple-400" />
              <span className="text-sm line-clamp-1 font-medium">
                {quiz.subject_name || quiz.course_name || "Chưa phân loại"}
              </span>
            </div>
          </div>

          {/* Quiz Name */}
          <div className="flex-1 mb-4">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2 leading-tight">
              {quiz.name}
            </h3>
          </div>

          {/* Quiz Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center">
                <FileCode className="h-4 w-4 mr-2 text-purple-500" />
                <span>{quiz.question_count || 0} bài tập</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-green-500" />
                <span>{formatTimeLimit(quiz.duration)}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-center w-full mt-auto">
            <Button
              onClick={() => onStartQuiz(quiz)}
              variant="default"
              size="sm"
              className={cn(
                "h-10 px-4 text-sm cursor-pointer w-full",
                "bg-purple-600 hover:bg-purple-700",
                "text-white",
                "transition-colors duration-200"
              )}
            >
              <Play className="h-4 w-4 flex-shrink-0 mr-2" />
              <span className="whitespace-nowrap">Bắt đầu luyện tập</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
