"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { quizService } from "@/lib/services/api";
import { QuizDetail } from "@/lib/types/quiz";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/forms";

// Tải QuizGameWrapper một cách dynamic để tránh các vấn đề liên quan đến Server-Side Rendering (SSR)
const QuizGameWrapperWithNoSSR = dynamic(
  () => import("@/components/features/game/QuizGameWrapper"),
  { ssr: false }
);

// Định nghĩa kiểu dữ liệu mà game sẽ nhận
export interface QuizGameData extends QuizDetail {}

export default function QuizGamePage() {
  const params = useParams();
  const router = useRouter();
  const quizId = Number(params.id);

  const [quizData, setQuizData] = useState<QuizGameData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNaN(quizId)) {
      setError("ID bài kiểm tra không hợp lệ.");
      setIsLoading(false);
      return;
    }

    const fetchQuizData = async () => {
      try {
        setIsLoading(true);
        const response = await quizService.getQuizById(quizId);

        if (response.success && response.data) {
          // Dữ liệu API đã phù hợp, chỉ cần đảm bảo có câu hỏi
          if (
            response.data.quiz.questions &&
            response.data.quiz.questions.length > 0
          ) {
            setQuizData(response.data.quiz);
          } else {
            setError("Bài kiểm tra này không có câu hỏi nào.");
          }
        } else {
          setError(response.message || "Không thể tải dữ liệu bài kiểm tra.");
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu quiz cho game:", err);
        setError("Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-800 text-white">
        <Loader2 className="h-12 w-12 animate-spin mb-4" />
        <p className="text-lg">Đang tải dữ liệu game...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-800 text-white p-4">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Đã xảy ra lỗi</h2>
        <p className="text-center mb-6">{error}</p>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    );
  }

  if (quizData) {
    return (
      <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
        <QuizGameWrapperWithNoSSR quizData={quizData} />
      </div>
    );
  }

  return null; // Trả về null nếu không có dữ liệu
}
