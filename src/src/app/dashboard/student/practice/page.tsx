"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, BookOpen } from "lucide-react";
// import { PracticeRecommendationsCard } from "@/components/features/learning";
import { PracticeQuizList } from "@/components/features/practice/PracticeQuizList";
import { PageHeader } from "@/components/ui/layout";
import { useAuthStatus } from "@/lib/hooks/use-auth";
import { useStudentCourses } from "@/lib/hooks/use-learning-analytics";
// import { usePracticeRecommendations } from "@/lib/hooks/use-practice";
// import { type PracticeRecommendation } from "@/lib/services/api/practice-recommendation.service";
import { toast } from "sonner";

export default function PracticePage() {
  const router = useRouter();
  const { getUser } = useAuthStatus();
  const user = getUser();
  const [courseId, setCourseId] = useState<number | null>(null);

  const { data: courses, isLoading: coursesLoading } = useStudentCourses();

  useEffect(() => {
    if (courses && courses.length > 0) {
      const targetCourse =
        courses.find((c: any) => c.course_id === 3) || courses[0];
      setCourseId(targetCourse.course_id);
    }
  }, [courses]);

  // Tính năng luyện tập theo đề xuất đã bị ẩn
  // const {
  //   data: practiceRecommendations,
  //   isLoading: practiceLoading,
  //   isError: practiceError,
  // } = usePracticeRecommendations(user?.user_id || 0, courseId || 0);

  const handleStartQuiz = (quiz: any) => {
    if (quiz.quiz_mode === "practice") {
      router.push(`/quiz-practice/${quiz.quiz_id}`);
    } else {
      router.push(`/quiz/${quiz.quiz_id}`);
    }
  };

  const handleStartPractice = async (recommendation: any) => {
    if (!user || !courseId) {
      toast.error("Không tìm thấy thông tin người dùng hoặc khóa học.");
      return;
    }

    // Bây giờ, chúng ta sẽ tạo một quiz "ảo" dựa trên đề xuất
    // và điều hướng đến trang thực hành. Trang đó sẽ tự xử lý việc tạo session.
    try {
      // API generatePractice giờ đây không còn cần thiết ở bước này.
      // Backend sẽ tự tạo câu hỏi khi session bắt đầu nếu cần.
      // Chúng ta sẽ điều hướng đến một URL giả định, ví dụ /quiz-practice/{lo_id}?type=recommendation
      // Tuy nhiên, để đơn giản và phù hợp với API hiện tại, chúng ta vẫn cần generate 1 quiz_id.
      // Giả sử API `generatePractice` vẫn tồn tại và trả về một quiz_id để bắt đầu.

      // **QUAN TRỌNG**: Logic này giả định rằng bạn vẫn cần gọi một API
      // để có `quiz_id` trước khi vào trang game. Nếu API `start-session`
      // có thể tự tạo quiz, bạn có thể bỏ qua bước này.

      // Vì API mới không còn `generatePractice`, chúng ta giả sử
      // sẽ điều hướng trực tiếp và trang `/quiz-practice` sẽ xử lý.
      // Để làm được điều đó, chúng ta cần một `quiz_id` từ `PracticeQuizList`.
      // Vì vậy, logic này sẽ được xử lý trong `PracticeQuizList` khi người dùng
      // click vào một quiz cụ thể.

      // Hiện tại, `PracticeRecommendationsCard` không có quiz_id, nên chúng ta sẽ tạm thời
      // vô hiệu hóa nó và tập trung vào `PracticeQuizList`.

      toast.info("Tính năng luyện tập theo đề xuất sẽ được cập nhật sau.");
    } catch (error) {
      console.error("Lỗi khi bắt đầu luyện tập:", error);
      toast.error("Không thể bắt đầu phiên luyện tập.");
    }
  };

  if (coursesLoading) {
    return (
      <div className="w-full mx-auto">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <h2 className="text-lg font-semibold mb-2">
            Đang khởi tạo trang luyện tập...
          </h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full mx-auto">
        <div className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-lg font-semibold text-gray-600 mb-2">
            Vui lòng đăng nhập
          </h2>
          <p className="text-muted-foreground">
            Bạn cần đăng nhập để sử dụng tính năng luyện tập
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <PageHeader
        title="Luyện tập"
        description="Hoàn thành các bài tập để tăng cấp độ và nhận thưởng."
      />

      <div className="space-y-6">
        <PracticeQuizList
          userId={user.user_id}
          onStartQuiz={handleStartQuiz}
          className="w-full"
        />

        {/* Tính năng luyện tập theo đề xuất đã bị ẩn */}
        {/* {courseId && practiceRecommendations && (
          <PracticeRecommendationsCard
            className="w-full"
            userId={user.user_id}
            courseId={courseId}
            onStartPractice={handleStartPractice}
          />
        )} */}
      </div>
    </div>
  );
}
