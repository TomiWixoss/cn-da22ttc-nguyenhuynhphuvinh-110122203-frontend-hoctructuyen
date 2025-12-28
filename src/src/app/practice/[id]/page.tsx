"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStatus } from "@/lib/hooks/use-auth";
import { usePracticeSession } from "@/lib/hooks/use-practice";
import { PracticeQuizInterface } from "@/components/features/practice/PracticeQuizInterface";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/forms";

interface PracticeQuestion {
  question_id: number;
  question_text: string;
  question_number: number;
  difficulty: "easy" | "medium" | "hard";
  is_review: boolean;
  answers: Array<{
    answer_id: number;
    answer_text: string;
    is_correct: boolean;
  }>;
  // Compatibility fields for component
  question_type: "multiple_choice" | "true_false";
  options: Array<{
    option_id: number;
    option_text: string;
    is_correct: boolean;
  }>;
  explanation?: string;
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

export default function PracticePage() {
  const { id } = useParams();
  const router = useRouter();
  const { getUser, loading: authLoading } = useAuthStatus();
  const user = getUser();

  // Create compatible user object for component
  const compatibleUser = user
    ? {
        id: user.user_id,
        name: user.fullName || user.name || "",
        email: user.email,
      }
    : null;

  // Parse practice parameters from URL
  const practiceId = parseInt(id as string, 10);

  // Get practice session details from URL search params
  const practiceParams = useMemo(() => {
    if (typeof window === "undefined") return null;
    
    const urlParams = new URLSearchParams(window.location.search);
    const userId = parseInt(
      urlParams.get("user_id") || user?.user_id?.toString() || "0",
      10
    );
    const courseId = parseInt(urlParams.get("course_id") || "0", 10);
    const loId = parseInt(urlParams.get("lo_id") || "0", 10);
    const difficulty = (urlParams.get("difficulty") || "medium") as
      | "easy"
      | "medium"
      | "hard";
    const totalQuestions = parseInt(
      urlParams.get("total_questions") || "10",
      10
    );

    return {
      userId,
      courseId,
      loId,
      difficulty,
      totalQuestions,
      subjectName: urlParams.get("subject_name") || "Không xác định",
      chapterName: urlParams.get("chapter_name") || "Không xác định",
    };
  }, [user?.user_id]);

  // Use TanStack Query hook for practice session
  const {
    data: practiceSessionData,
    isLoading,
    error,
  } = usePracticeSession(
    practiceParams && practiceParams.userId && practiceParams.courseId && practiceParams.loId
      ? {
          userId: practiceParams.userId,
          courseId: practiceParams.courseId,
          loId: practiceParams.loId,
          difficulty: practiceParams.difficulty,
          totalQuestions: practiceParams.totalQuestions,
        }
      : {
          userId: 0,
          courseId: 0,
          loId: 0,
          difficulty: "medium",
          totalQuestions: 10,
        }
  );

  // Map response to match our interface
  const practiceSession = useMemo(() => {
    if (!practiceSessionData || !practiceParams) return null;

    const mappedQuestions: PracticeQuestion[] = practiceSessionData.questions.map(
      (q) => ({
        ...q,
        question_type: "multiple_choice" as const,
        options: q.answers.map((a) => ({
          option_id: a.answer_id,
          option_text: a.answer_text,
          is_correct: a.is_correct,
        })),
        explanation: undefined,
      })
    );

    const mappedSession: PracticeSession = {
      ...practiceSessionData,
      session_id: practiceSessionData.quiz_id,
      course_id: practiceParams.courseId,
      subject_name: practiceParams.subjectName,
      chapter_name: practiceParams.chapterName,
      questions: mappedQuestions,
    };

    return mappedSession;
  }, [practiceSessionData, practiceParams]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  useEffect(() => {
    if (isNaN(practiceId)) {
      router.push("/dashboard");
    }
  }, [practiceId, router]);

  const handlePracticeComplete = (results: {
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    score: number;
    timeSpent: number;
  }) => {
    // Navigate back to practice recommendations page
    router.push(`/dashboard/student/practice`);
  };

  const handleBackToRecommendations = () => {
    router.back();
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <h3 className="text-lg font-semibold mt-4">Đang tạo bài luyện tập</h3>
        <p className="text-muted-foreground mt-2">
          Vui lòng chờ trong giây lát...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-red-600 mb-2">
          Lỗi tải bài luyện tập
        </h3>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          {error instanceof Error ? error.message : "Không thể tải bài luyện tập"}
        </p>
        <div className="flex gap-3">
          <Button onClick={handleBackToRecommendations} variant="outline">
            Quay lại
          </Button>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  if (!practiceSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          Không tìm thấy bài luyện tập
        </h3>
        <p className="text-muted-foreground mb-6 text-center">
          Bài luyện tập không tồn tại hoặc đã hết hạn
        </p>
        <Button onClick={handleBackToRecommendations} variant="outline">
          Quay lại đề xuất luyện tập
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PracticeQuizInterface
        practiceSession={practiceSession}
        user={compatibleUser!}
        onComplete={handlePracticeComplete}
        onExit={handleBackToRecommendations}
      />
    </div>
  );
}
