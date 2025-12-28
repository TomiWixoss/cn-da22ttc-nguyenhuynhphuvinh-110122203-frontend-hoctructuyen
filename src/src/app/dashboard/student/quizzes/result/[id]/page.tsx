"use client";

import { use } from "react";
import { useAuthStatus } from "@/lib/hooks/use-auth";
import { useQuizResultDetail } from "@/lib/hooks/use-quiz-results";
import { Skeleton } from "@/components/ui/feedback";
import { Loader2, AlertCircle } from "lucide-react";
import { QuizResultStudent } from "@/lib/types/quiz";
import { useRouter } from "next/navigation";
import ChapterAnalysisChart from "@/components/features/charts/ChapterAnalysisChart";
import { PracticeRecommendationsByQuiz } from "@/components/features/learning/PracticeRecommendationsByQuiz";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation";
import Link from "next/link";
import { EmptyState } from "@/components/ui/feedback";

interface QuizResultPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function QuizResultDetailPage({ params }: QuizResultPageProps) {
  const { getUser } = useAuthStatus();
  const router = useRouter();

  // Sử dụng React.use() để unwrap params
  const resolvedParams = use(params);
  const resultId = Number(resolvedParams.id);

  // Use TanStack Query hook to fetch quiz result detail
  const {
    data: resultDetail,
    isLoading,
    error: queryError,
  } = useQuizResultDetail(resultId);

  // Check access permission and handle errors
  const user = getUser();
  let error: string | null = null;

  if (isNaN(resultId)) {
    error = "ID kết quả không hợp lệ";
  } else if (queryError) {
    error = "Đã xảy ra lỗi khi tải chi tiết kết quả bài kiểm tra";
  } else if (
    resultDetail &&
    user &&
    String(user.user_id) !== String(resultDetail.user_id)
  ) {
    error = "Bạn không có quyền xem kết quả này";
  }

  if (isLoading) {
    return (
      <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Breadcrumb Skeleton */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <Skeleton className="h-6 w-64" />
        </div>

        {/* Header Skeleton */}
        <div className="relative mb-8 p-8 sm:p-12 rounded-2xl border">
          <div className="text-center">
            <Skeleton className="h-10 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-4 sm:mb-6 md:mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/student/quizzes/completed">
                  Kết quả bài kiểm tra
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Chi tiết kết quả</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <EmptyState
          title="Không thể tải kết quả bài kiểm tra"
          description={
            error || "Đã xảy ra lỗi khi tải chi tiết kết quả bài kiểm tra"
          }
          icon="AlertCircle"
          className="py-16"
        />
      </div>
    );
  }

  if (!resultDetail) {
    return (
      <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-4 sm:mb-6 md:mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/student/quizzes/completed">
                  Kết quả bài kiểm tra
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Chi tiết kết quả</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <EmptyState
          title="Không tìm thấy kết quả bài kiểm tra"
          description="Không thể tìm thấy thông tin chi tiết của kết quả bài kiểm tra này."
          icon="Search"
          className="py-16"
        />
      </div>
    );
  }

  return (
    <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-4 sm:mb-6 md:mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard/student/quizzes/completed">
                Kết quả bài kiểm tra
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Chi tiết: {resultDetail.Quiz.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Chapter Analysis Chart */}
      <ChapterAnalysisChart
        quizId={resultDetail.quiz_id}
        quizName={resultDetail.Quiz.name}
        className="w-full mb-6"
      />

      {/* Practice Recommendations */}
      <PracticeRecommendationsByQuiz
        quizId={resultDetail.quiz_id}
        className="w-full"
      />
    </div>
  );
}
