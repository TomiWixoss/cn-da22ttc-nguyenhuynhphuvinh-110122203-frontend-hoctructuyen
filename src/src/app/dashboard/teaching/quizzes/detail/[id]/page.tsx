"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { QuizDetail, QuizModeInfo } from "@/lib/types/quiz";
import { QuizDetailView } from "@/components/features/quiz/detail/quiz-detail";
import { EmptyState } from "@/components/ui/feedback";
import { Loader2 } from "lucide-react";
import { showErrorToast } from "@/lib/utils/toast-utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation";
import Link from "next/link";
import { useAssignmentContext } from "@/lib/contexts/assignment-context";
// THAY ĐỔI: Import useQueryClient
import { useQuizDetail } from "@/lib/hooks/use-teaching";
import { useQueryClient } from "@tanstack/react-query";
import { QuizDetailSkeleton } from "@/components/features/quiz/detail/QuizDetailSkeleton";

interface QuizDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function QuizDetailPage({ params }: QuizDetailPageProps) {
  const router = useRouter();
  const { createTeacherUrl } = useAssignmentContext();
  const queryClient = useQueryClient(); // THÊM MỚI

  // Sử dụng React.use() để unwrap params
  const resolvedParams = use(params);
  const quizId = parseInt(resolvedParams.id);

  // Use TanStack Query hook
  const { data: quizData, isLoading, error } = useQuizDetail(quizId);

  // Handle invalid quiz ID
  useEffect(() => {
    if (isNaN(quizId)) {
      const errorMessage = "ID bài kiểm tra không hợp lệ";
      showErrorToast(errorMessage);
    }
  }, [quizId]);

  // Handle error from query
  useEffect(() => {
    if (error) {
      const errorMessage =
        "Không thể lấy chi tiết bài kiểm tra. Vui lòng thử lại sau.";
      showErrorToast(errorMessage);
    }
  }, [error]);

  // Xử lý cập nhật dữ liệu
  const handleUpdate = async () => {
    // THAY ĐỔI: Invalidate query để refetch
    await queryClient.invalidateQueries({
      queryKey: ["teaching", "quiz", quizId],
    });
  };

  // Xử lý xóa bài kiểm tra và chuyển hướng
  const handleDelete = () => {
    const url = createTeacherUrl("/dashboard/teaching/quizzes/list");
    router.push(url);
  };

  // Hiển thị trạng thái loading
  if (isLoading) {
    return (
      <div className="container px-4 py-4 sm:px-6 sm:py-6 lg:px-8 max-w-7xl mx-auto">
        <Breadcrumb className="mb-4 sm:mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={createTeacherUrl("/dashboard/teaching/quizzes/list")}
                >
                  Quản lý Quiz
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Chi tiết Quiz</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <QuizDetailSkeleton />
      </div>
    );
  }

  // Hiển thị lỗi
  if (error || !quizData?.quiz) {
    return (
      <div className="container px-4 sm:px-6 max-w-7xl mx-auto py-6 sm:py-10">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={createTeacherUrl("/dashboard/teaching/quizzes/list")}
                >
                  Quản lý Quiz
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Chi tiết Quiz</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <EmptyState
          title="Không tìm thấy bài kiểm tra"
          description={
            error?.message ||
            "Không thể tìm thấy thông tin chi tiết của bài kiểm tra này."
          }
          icon="Search"
          className="py-16"
        />
      </div>
    );
  }

  // Hiển thị chi tiết bài kiểm tra
  return (
    <div className="container px-4 py-4 sm:px-6 sm:py-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-4 sm:mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={createTeacherUrl("/dashboard/teaching/quizzes/list")}>
                Quản lý Quiz
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="line-clamp-1">
              Chi tiết: {quizData.quiz.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <QuizDetailView
        quiz={quizData.quiz}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        quizModeInfo={quizData.quizModeInfo}
      />
    </div>
  );
}
