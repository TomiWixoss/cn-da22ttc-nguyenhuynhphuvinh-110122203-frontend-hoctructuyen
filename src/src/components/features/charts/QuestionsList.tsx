"use client";

import React from "react";
import { Check, X } from "lucide-react";

interface Answer {
  answer_id: number;
  answer_text: string;
  iscorrect: boolean;
}

interface Question {
  question_id: number;
  question_text: string;
  answers?: Answer[];
  student_answer?: {
    selected_answer_id: number;
    selected_answer_text: string;
    is_correct: boolean;
    time_spent?: number;
    attempt_date?: string;
  } | null;
}

interface QuestionsListProps {
  questions: Question[];
  title?: string;
  className?: string;
  loading?: boolean;
}

const QuestionsList: React.FC<QuestionsListProps> = ({
  questions,
  title,
  className = "",
  loading = false,
}) => {
  // Helper function để tạo màu cho đáp án
  const getAnswerConfig = (answer: Answer, question: Question) => {
    const isSelected =
      !!question.student_answer &&
      question.student_answer.selected_answer_id === answer.answer_id;
    const isCorrect = !!answer.iscorrect;

    if (isCorrect) {
      return {
        className:
          "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 hover:bg-green-100/70 dark:hover:bg-green-950/30",
        iconBg:
          "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-300 dark:border-green-700",
        icon: <Check className="h-4 w-4" />,
      };
    }
    if (isSelected) {
      return {
        className:
          "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 hover:bg-red-100/70 dark:hover:bg-red-950/30",
        iconBg:
          "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-300 dark:border-red-700",
        icon: <X className="h-4 w-4" />,
      };
    }
    return {
      className: "bg-background border-border hover:bg-muted/30",
      iconBg: "bg-muted text-muted-foreground border-border",
      icon: null,
    };
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">
          Đang tải danh sách câu hỏi...
        </p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">Chưa có câu hỏi nào</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {title && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h5 className="font-bold text-xl text-blue-700 dark:text-blue-400 text-center">
            Danh sách câu hỏi ({questions.length} câu)
          </h5>
        </div>
      )}

      <div className="space-y-4">
        {questions.map((question, qIndex) => (
          <div
            key={question.question_id}
            className="border border-border bg-card rounded-lg overflow-hidden hover:border-primary/40 transition-all duration-200"
          >
            <div className="p-4 sm:p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="size-8 sm:size-9 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-bold border border-primary/20 flex-shrink-0">
                  {qIndex + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-medium leading-relaxed text-foreground">
                    {question.question_text}
                  </p>
                </div>
              </div>

              {/* Answers Section */}
              {question.answers && question.answers.length > 0 && (
                <div className="space-y-3">
                  {question.answers.map((answer, aIndex) => {
                    const config = getAnswerConfig(answer, question);
                    return (
                      <div
                        key={answer.answer_id}
                        className={`flex items-center gap-3 p-3 sm:p-4 rounded-lg border transition-all duration-200 ${config.className}`}
                      >
                        <span className="flex-shrink-0 size-6 rounded bg-muted/50 flex items-center justify-center text-xs font-semibold text-muted-foreground">
                          {String.fromCharCode(65 + aIndex)}
                        </span>
                        <div className="flex-1 text-sm leading-relaxed text-foreground">
                          {answer.answer_text}
                        </div>
                        {config.icon && (
                          <div
                            className={`flex-shrink-0 size-6 rounded-lg flex items-center justify-center border ${config.iconBg}`}
                          >
                            {config.icon}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionsList;
