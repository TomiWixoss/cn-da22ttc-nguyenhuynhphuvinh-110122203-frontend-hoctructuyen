"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import { Progress } from "@/components/ui/feedback";
import { CheckCircle, XCircle, X, Trophy, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface PracticeQuestion {
  question_id: number;
  question_text: string;
  question_type: "multiple_choice" | "true_false";
  options: Array<{
    option_id: number;
    option_text: string;
    is_correct: boolean;
  }>;
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
}

interface PracticeSession {
  quiz_id: string;
  lo_id: number;
  lo_name: string;
  difficulty: "easy" | "medium" | "hard";
  level_name: string;
  total_questions: number;
  new_questions_count: number;
  review_questions_count: number;
  estimated_time_minutes: number;
  questions: PracticeQuestion[];
  // Additional fields for display
  course_id?: number;
  subject_name?: string;
  chapter_name?: string;
  session_id?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface PracticeQuizInterfaceProps {
  practiceSession: PracticeSession;
  user: User;
  onComplete: (results: {
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    score: number;
    timeSpent: number;
  }) => void;
  onExit: () => void;
}

export function PracticeQuizInterface({
  practiceSession,
  user,
  onComplete,
  onExit,
}: PracticeQuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [questionIndex: number]: number;
  }>({});
  const [showResults, setShowResults] = useState<{
    [questionIndex: number]: boolean;
  }>({});
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [startTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);

  const currentQuestion = practiceSession.questions[currentQuestionIndex];
  const isLastQuestion =
    currentQuestionIndex === practiceSession.questions.length - 1;
  const hasSelectedAnswer = selectedAnswers[currentQuestionIndex] !== undefined;
  const hasViewedResult = showResults[currentQuestionIndex];
  const canCheck = hasSelectedAnswer && !hasViewedResult;
  const canContinue = hasViewedResult;

  useEffect(() => {
    if (isCompleted) return;
    if (isLastQuestion && hasViewedResult) {
      setTimeout(() => {
        handleCompleteQuiz();
      }, 1500);
    }
  }, [isLastQuestion, hasViewedResult, isCompleted]);

  const handleAnswerSelect = (optionId: number) => {
    if (hasViewedResult) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionId,
    }));
  };

  const handleCheckAnswer = () => {
    if (!canCheck) return;

    setShowResults((prev) => ({
      ...prev,
      [currentQuestionIndex]: true,
    }));

    // Check if answer is correct
    const selectedOption = currentQuestion.options.find(
      (opt) => opt.option_id === selectedAnswers[currentQuestionIndex]
    );

    if (selectedOption?.is_correct) {
      setCorrectAnswers((prev) => prev + 1);
    }

    setAnsweredCount((prev) => prev + 1);
  };

  const handleContinue = () => {
    if (!canContinue) return;

    if (!isLastQuestion) {
      setCurrentQuestionIndex((prev) => prev + 1);

      // Auto-scroll to the next question after a short delay
      setTimeout(() => {
        const nextQuestionElement = document.querySelector(
          `[data-question-index="${currentQuestionIndex + 1}"]`
        );
        if (nextQuestionElement) {
          nextQuestionElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });
        }
      }, 100);
    }
  };

  const handleButtonClick = () => {
    if (hasViewedResult && isLastQuestion) {
      handleCompleteQuiz();
    } else if (canCheck) {
      handleCheckAnswer();
    } else if (canContinue && !isLastQuestion) {
      handleContinue();
    }
  };

  const handleBackToPractice = () => {
    onComplete({
      totalQuestions: practiceSession.total_questions,
      correctAnswers,
      wrongAnswers: practiceSession.total_questions - correctAnswers,
      score: Math.round(
        (correctAnswers / practiceSession.total_questions) * 100
      ),
      timeSpent: Date.now() - startTime,
    });
  };

  const handleRetry = () => {
    // Reset all states để làm lại
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults({});
    setCorrectAnswers(0);
    setAnsweredCount(0);
    setIsCompleted(false);
  };

  const handleCompleteQuiz = () => {
    const totalTime = Date.now() - startTime;
    const wrongAnswers = practiceSession.total_questions - correctAnswers;
    const score = Math.round(
      (correctAnswers / practiceSession.total_questions) * 100
    );

    setIsCompleted(true);

    // Không tự động chuyển hướng nữa
  };

  const getOptionClassName = (questionIndex: number, option: any) => {
    const isCurrentQuestion = questionIndex === currentQuestionIndex;

    if (!showResults[questionIndex]) {
      const isSelected = selectedAnswers[questionIndex] === option.option_id;
      return cn(
        "p-4 rounded-lg border-2 transition-all duration-200",
        isCurrentQuestion
          ? "cursor-pointer hover:border-blue-200"
          : "cursor-default",
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:bg-gray-50"
      );
    }

    const isSelected = selectedAnswers[questionIndex] === option.option_id;
    const isCorrect = option.is_correct;

    if (isCorrect) {
      return "p-4 rounded-lg border-2 border-green-500 bg-green-50 text-green-800";
    } else if (isSelected && !isCorrect) {
      return "p-4 rounded-lg border-2 border-red-500 bg-red-50 text-red-800";
    } else {
      return "p-4 rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-600";
    }
  };

  if (isCompleted) {
    const score = Math.round(
      (correctAnswers / practiceSession.total_questions) * 100
    );

    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-lg w-full text-center space-y-12">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-gray-900">
              Hoàn thành bài luyện tập!
            </h2>
            <p className="text-xl text-gray-600">
              Bạn đã hoàn thành bài luyện tập
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex justify-between items-center p-6 bg-white rounded-xl">
              <span className="text-xl font-medium">Điểm số:</span>
              <span className="text-xl font-bold text-blue-600">
                {correctAnswers}/{practiceSession.total_questions}
              </span>
            </div>
            <div className="flex justify-between items-center p-6 bg-white rounded-xl">
              <span className="text-xl font-medium">Tỷ lệ đúng:</span>
              <Badge
                variant={
                  score >= 80
                    ? "default"
                    : score >= 60
                    ? "secondary"
                    : "destructive"
                }
                className="text-lg px-4 py-2"
              >
                {score}%
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleBackToPractice}
              className="w-full h-12 text-base font-medium"
              is3DNoLayout={true}
            >
              Về trang luyện tập
            </Button>
            <Button
              onClick={handleRetry}
              variant="outline"
              className="w-full h-12 text-base font-medium"
            >
              Làm lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onExit} className="p-4">
              <X className="h-7 w-7" />
            </Button>

            <div className="flex-1 mx-8">
              <Progress
                value={(answeredCount / practiceSession.total_questions) * 100}
                className="h-4"
              />
            </div>

            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-blue-600" />
              <span className="text-3xl font-bold">{answeredCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Content - Sequential Display */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="space-y-8">
          {practiceSession.questions
            .slice(0, currentQuestionIndex + 1)
            .map((question, questionIndex) => (
              <div
                key={question.question_id}
                className="space-y-6"
                data-question-index={questionIndex}
              >
                {/* Question */}
                <div>
                  <h2 className="text-lg font-medium leading-relaxed mb-6 text-gray-900">
                    {question.question_text}
                  </h2>

                  {/* Options */}
                  <div className="space-y-3">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={option.option_id}
                        className={getOptionClassName(questionIndex, option)}
                        onClick={() =>
                          questionIndex === currentQuestionIndex
                            ? handleAnswerSelect(option.option_id)
                            : undefined
                        }
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-sm font-medium flex items-center justify-center">
                            {String.fromCharCode(65 + optionIndex)}
                          </span>
                          <span className="flex-1">{option.option_text}</span>
                          {showResults[questionIndex] && option.is_correct && (
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          )}
                          {showResults[questionIndex] &&
                            selectedAnswers[questionIndex] ===
                              option.option_id &&
                            !option.is_correct && (
                              <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                            )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Explanation */}
                  {showResults[questionIndex] && question.explanation && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Giải thích:
                      </h4>
                      <p className="text-sm text-blue-800">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 p-6 z-50">
        <div className="container mx-auto max-w-2xl">
          <Button
            onClick={handleButtonClick}
            disabled={
              !canCheck && !canContinue && !(hasViewedResult && isLastQuestion)
            }
            className="w-full h-12 text-base font-medium transition-all"
            is3DNoLayout={true}
          >
            {hasViewedResult && isLastQuestion
              ? "Hoàn thành"
              : canContinue && !isLastQuestion
              ? "Tiếp tục"
              : "Kiểm tra"}
          </Button>
        </div>
      </div>
    </div>
  );
}
