"use client";

import React, { useState, useEffect } from "react"; // THÊM IMPORT
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { QuizDetail } from "@/lib/types/quiz";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/forms";
import { useQuizDetail } from "@/lib/hooks/use-teaching";
import { avatarService } from "@/lib/services"; // THÊM IMPORT
import { UserInventory } from "@/lib/types/avatar"; // THÊM IMPORT

// Tải QuizGameWrapper một cách dynamic để tránh các vấn đề liên quan đến Server-Side Rendering (SSR)
const QuizGameWrapperWithNoSSR = dynamic(
  () => import("@/components/features/game/QuizGameWrapper"),
  { ssr: false }
);

// Định nghĩa kiểu dữ liệu mà game sẽ nhận
export interface QuizPracticeData extends QuizDetail {}

export default function QuizPracticePage() {
  const params = useParams();
  const router = useRouter();
  const quizId = Number(params.quiz_id);

  // Use TanStack Query hook for quiz data
  const { data: quizResponse, isLoading, error } = useQuizDetail(quizId);

  // --- THÊM LOGIC TẢI KHO ĐỒ ---
  const [inventory, setInventory] = useState<UserInventory | null>(null);
  const [inventoryLoading, setInventoryLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setInventoryLoading(true);
        const avatarData = await avatarService.getMyAvatarData();
        if (avatarData?.inventory) {
          setInventory(avatarData.inventory);
        }
      } catch (err) {
        console.error("Lỗi khi tải kho đồ cho quiz-practice:", err);
        // Có thể hiển thị lỗi nếu cần, nhưng tạm thời cho phép game tiếp tục
      } finally {
        setInventoryLoading(false);
      }
    };

    fetchInventory();
  }, []);
  // --- KẾT THÚC LOGIC TẢI KHO ĐỒ ---

  // Extract quiz data from response
  const quizData = quizResponse?.quiz;

  if (isLoading || inventoryLoading) {
    // THÊM ĐIỀU KIỆN CHỜ
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-800 text-white">
        <Loader2 className="h-12 w-12 animate-spin mb-4" />
        <p className="text-lg">Đang tải dữ liệu practice...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-800 text-white p-4">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Đã xảy ra lỗi</h2>
        <p className="text-center mb-6">
          {error instanceof Error
            ? error.message
            : "Không thể tải dữ liệu bài kiểm tra."}
        </p>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    );
  }

  if (quizData && quizData.questions && quizData.questions.length > 0) {
    return (
      <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
        <QuizGameWrapperWithNoSSR
          quizData={quizData}
          initialInventory={inventory}
        />
      </div>
    );
  }

  // No quiz data or no questions
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-800 text-white p-4">
      <AlertCircle className="h-12 w-12 text-yellow-400 mb-4" />
      <h2 className="text-xl font-semibold mb-2">Không có dữ liệu</h2>
      <p className="text-center mb-6">Bài kiểm tra này không có câu hỏi nào.</p>
      <Button onClick={() => router.back()}>Quay lại</Button>
    </div>
  );
}
