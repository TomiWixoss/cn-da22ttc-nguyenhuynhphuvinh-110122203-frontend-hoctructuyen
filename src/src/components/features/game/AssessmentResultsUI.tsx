"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  CheckCircle,
  XCircle,
  BarChart,
  BookOpen,
  ChevronDown,
  Clock,
  Percent,
  RefreshCw,
  Home,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SessionAnswer,
  PerformanceDataItem,
} from "@/lib/services/quiz/QuizSessionService";
import { Question } from "@/lib/types/quiz";
import { Badge } from "@/components/ui/feedback/badge";
import { MediaViewer } from "@/components/shared/MediaViewer";

// Props không thay đổi
interface AssessmentResultsUIProps {
  quizName?: string;
  onBackToMenu: () => void;
  className?: string;
  sessionAnswers: SessionAnswer[];
  performanceData: PerformanceDataItem[];
}

// Component QuestionHistoryItem - Web Style
const QuestionHistoryItem = ({
  sessionAnswer,
}: {
  sessionAnswer: SessionAnswer;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    question,
    isCorrect,
    selectedAnswerId,
    attempt_number = 1,
  } = sessionAnswer;

  return (
    <div
      className={cn(
        "bg-white rounded-lg border transition-all duration-200",
        isCorrect ? "border-green-300" : "border-red-300",
        isExpanded && ""
      )}
    >
      <button
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors rounded-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {isCorrect ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <p className="text-sm font-medium text-gray-900 truncate flex-1">
            {question.question_text.replace(/<[^>]+>/g, "")}
          </p>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <Badge variant="outline" className="text-gray-600 border-gray-300">
            Lượt {attempt_number}
          </Badge>
          <ChevronDown
            className={cn(
              "w-5 h-5 text-gray-400 transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-gray-200">
              <p
                className="text-base font-semibold text-gray-900 mb-4"
                dangerouslySetInnerHTML={{ __html: question.question_text }}
              />
              <MediaViewer
                mediaFiles={question.MediaFiles}
                ownerType="question"
                ownerId={question.question_id}
                className="flex flex-wrap gap-2 mb-4"
                imageClassName="w-20 h-20"
              />
              <div className="space-y-2">
                {question.answers.map((ans) => {
                  const isStudentChoice = ans.answer_id === selectedAnswerId;
                  const isCorrectAnswer = ans.iscorrect;

                  return (
                    <div
                      key={ans.answer_id}
                      className={cn(
                        "text-sm p-3 rounded-lg border transition-all flex items-center justify-between gap-2",
                        {
                          "bg-green-50 border-green-300 text-green-900":
                            isCorrectAnswer,
                          "bg-red-50 border-red-300 text-red-900":
                            isStudentChoice && !isCorrectAnswer,
                          "bg-green-100 border-green-400 text-green-900 font-medium":
                            isStudentChoice && isCorrectAnswer,
                          "bg-gray-50 border-gray-200 text-gray-700":
                            !isCorrectAnswer && !isStudentChoice,
                        }
                      )}
                    >
                      <div className="flex-1">
                        <span className="block">{ans.answer_text}</span>
                        <MediaViewer
                          mediaFiles={question.MediaFiles}
                          ownerType="answer"
                          ownerId={ans.answer_id}
                          className="flex flex-wrap gap-1 mt-1"
                          imageClassName="w-12 h-12"
                        />
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isCorrectAnswer && (
                          <Badge
                            variant="default"
                            className="bg-green-600 text-white"
                          >
                            Đáp án đúng
                          </Badge>
                        )}
                        {isStudentChoice && (
                          <Badge
                            variant="default"
                            className="bg-blue-600 text-white"
                          >
                            Lựa chọn của bạn
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Component QuestionGroup - Web Style
const QuestionGroup = ({
  title,
  answers,
}: {
  title: string;
  answers: SessionAnswer[];
}) => {
  if (answers.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-500">
          Không có câu hỏi nào trong mục này.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {answers.map((answer) => (
        <QuestionHistoryItem
          key={`${answer.question.question_id}-${answer.attempt_number || 1}`}
          sessionAnswer={answer}
        />
      ))}
    </div>
  );
};

// Component StatsPanel - Web Style
const StatsPanel = ({ stats }: { stats: any }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex flex-col items-center justify-center">
      <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
      <p className="text-3xl font-bold text-gray-900">{stats.correctAnswers}</p>
      <p className="text-sm font-medium text-green-700 mt-1">Đúng</p>
    </div>
    <div className="bg-red-50 p-4 rounded-lg border border-red-200 flex flex-col items-center justify-center">
      <XCircle className="w-8 h-8 text-red-600 mb-2" />
      <p className="text-3xl font-bold text-gray-900">
        {stats.incorrectAnswers}
      </p>
      <p className="text-sm font-medium text-red-700 mt-1">Sai</p>
    </div>
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex flex-col items-center justify-center">
      <Percent className="w-8 h-8 text-blue-600 mb-2" />
      <p className="text-3xl font-bold text-gray-900">
        {stats.accuracy.toFixed(0)}
        <span className="text-xl">%</span>
      </p>
      <p className="text-sm font-medium text-blue-700 mt-1">Chính Xác</p>
    </div>
    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 flex flex-col items-center justify-center">
      <Clock className="w-8 h-8 text-purple-600 mb-2" />
      <p className="text-2xl font-bold text-gray-900">
        {Math.floor(stats.totalTimeSeconds / 60)}
        <span className="text-base">p</span>{" "}
        {String(Math.floor(stats.totalTimeSeconds % 60)).padStart(2, "0")}
        <span className="text-base">s</span>
      </p>
      <p className="text-sm font-medium text-purple-700 mt-1">Thời Gian</p>
    </div>
  </div>
);

export default function AssessmentResultsUI({
  quizName,
  onBackToMenu,
  className = "",
  sessionAnswers,
  performanceData,
}: AssessmentResultsUIProps) {
  // Bỏ state activeTab
  // const [activeTab, setActiveTab] = useState("overview");

  // Logic tách dữ liệu vẫn giữ nguyên
  const { initialAttempts, reviewAttempts, finalSessionAnswers } =
    useMemo(() => {
      const initial = sessionAnswers.filter(
        (a) => (a.attempt_number || 1) === 1
      );
      const review = sessionAnswers.filter((a) => (a.attempt_number || 1) > 1);

      const finalAnswersMap = new Map<number, SessionAnswer>();
      sessionAnswers.forEach((answer) => {
        const questionId = answer.question.question_id;
        const existing = finalAnswersMap.get(questionId);
        const currentAttempt = answer.attempt_number || 1;
        const existingAttempt = existing?.attempt_number || 1;
        if (!existing || currentAttempt > existingAttempt) {
          finalAnswersMap.set(questionId, answer);
        }
      });

      return {
        initialAttempts: initial,
        reviewAttempts: review,
        finalSessionAnswers: Array.from(finalAnswersMap.values()),
      };
    }, [sessionAnswers]);

  // Logic tính toán thống kê vẫn giữ nguyên
  const calculateStats = (
    answers: SessionAnswer[],
    perfData: PerformanceDataItem[]
  ) => {
    const totalQuestions = answers.length;
    if (totalQuestions === 0)
      return {
        totalQuestions: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        accuracy: 0,
        totalTimeSeconds: 0,
      };

    const correctAnswers = answers.filter((ans) => ans.isCorrect).length;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const accuracy = (correctAnswers / totalQuestions) * 100;

    const questionIdsInAnswers = new Set(
      answers.map((a) => a.question.question_id)
    );
    const relevantPerfData = perfData.filter((p) =>
      questionIdsInAnswers.has(p.question_id)
    );
    const totalTimeMs = relevantPerfData.reduce(
      (sum, item) => sum + item.response_time_ms,
      0
    );
    const totalTimeSeconds = totalTimeMs / 1000;

    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      accuracy,
      totalTimeSeconds,
    };
  };

  const finalStats = useMemo(
    () => calculateStats(finalSessionAnswers, performanceData),
    [finalSessionAnswers, performanceData]
  );

  return (
    <div
      className={cn(
        "w-full min-h-full p-4 md:p-8 overflow-y-auto bg-gray-50",
        className
      )}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Trophy className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Hoàn Thành Bài Đánh Giá
          </h1>
          <p className="text-lg text-gray-600">{quizName}</p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8 space-y-8">
          {/* Phần 1: Thống kê tổng quan */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Kết Quả Cuối Cùng
            </h2>
            <StatsPanel stats={finalStats} />
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Phần 2: Lượt chơi chính */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Lượt Chơi Chính
            </h2>
            <QuestionGroup
              title="Lịch sử lượt chơi chính"
              answers={initialAttempts}
            />
          </div>

          {/* Phần 3: Lượt làm lại (chỉ hiển thị nếu có) */}
          {reviewAttempts.length > 0 && (
            <>
              <div className="border-t border-gray-200"></div>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Lượt Làm Lại ({reviewAttempts.length} câu)
                </h2>
                <QuestionGroup
                  title="Lịch sử lượt làm lại"
                  answers={reviewAttempts}
                />
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={onBackToMenu}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Về Menu Chính
          </button>
        </div>
      </div>
    </div>
  );
}
