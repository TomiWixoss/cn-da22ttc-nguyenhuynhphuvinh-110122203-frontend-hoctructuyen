"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FileCode } from "lucide-react";
import { CodePracticeList } from "@/components/features/code-practice/CodePracticeList";
import { PageHeader } from "@/components/ui/layout";
import { useAuthStatus } from "@/lib/hooks/use-auth";
import { CodePracticeQuiz } from "@/lib/services/api/code-practice.service";
import { toast } from "sonner";

export default function CodePracticePage() {
  const router = useRouter();
  const { getUser } = useAuthStatus();
  const user = getUser();

  const handleStartQuiz = (quiz: CodePracticeQuiz) => {
    // Điều hướng đến trang code editor hoặc quiz practice
    // Tùy thuộc vào cách bạn muốn xử lý code practice
    if (quiz.quiz_mode === "code_practice") {
      // Nếu có trang riêng cho code practice
      router.push(`/code-practice/${quiz.quiz_id}`);
    } else {
      // Hoặc sử dụng trang quiz practice hiện có
      router.push(`/quiz-practice/${quiz.quiz_id}`);
    }
  };

  if (!user) {
    return (
      <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center py-12">
          <FileCode className="h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-lg font-semibold text-gray-600 mb-2">
            Vui lòng đăng nhập
          </h2>
          <p className="text-muted-foreground">
            Bạn cần đăng nhập để sử dụng tính năng luyện code
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <PageHeader
        title="Luyện Code"
        description="Rèn luyện kỹ năng lập trình với các bài tập code thực tế."
      />

      <div className="space-y-6">
        <CodePracticeList
          userId={user.user_id}
          onStartQuiz={handleStartQuiz}
          className="w-full"
        />
      </div>
    </div>
  );
}
