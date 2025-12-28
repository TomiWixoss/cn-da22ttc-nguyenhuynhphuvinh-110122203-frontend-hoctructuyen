"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Quiz,
  QuizListResponse,
  QuizFilterParams,
  QuizMode,
} from "@/lib/types/quiz";
import { Course } from "@/lib/types/course";
import { Loader2 } from "lucide-react";
import { QuizSearch } from "@/components/features/quiz/list/quiz-search";
import { QuizGrid } from "@/components/features/quiz/list/quiz-grid";
import { QuizEmptyState } from "@/components/features/quiz/list/quiz-empty-state";
import { PaginationWithInfo } from "@/components/ui/navigation";
import { PageHeader } from "@/components/ui/layout";
import {
  useTeacherQuizzesWithPagination,
  useQuizzesByCourse,
} from "@/lib/hooks/use-teaching";
import { useAssignmentContext } from "@/lib/contexts/assignment-context";

export default function QuizListPage() {
  const { currentAssignmentId } = useAssignmentContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<QuizFilterParams>({
    page: 1,
    limit: 12,
    status: "",
    course_id: undefined,
    search: "",
    sort_by: "update_time",
    sort_order: "DESC",
    quiz_mode: undefined,
  });

  // Sử dụng hook với pagination khi có course_id cụ thể
  // Ưu tiên course filtering hơn assignment filtering
  const useSpecificCourse = !!filters.course_id;

  // Hook cho quiz theo course cụ thể (server-side filtering)
  const {
    data: courseQuizzesData,
    isLoading: isCourseQuizzesLoading,
    isError: isCourseQuizzesError,
    error: courseQuizzesError,
  } = useQuizzesByCourse(
    useSpecificCourse ? filters.course_id : undefined,
    useSpecificCourse
      ? {
          page: filters.page,
          limit: filters.limit,
          status: filters.status || undefined,
          search: filters.search || undefined,
          sort_by: filters.sort_by,
          sort_order: filters.sort_order,
        }
      : undefined
  );

  // Hook cho tất cả quiz hoặc theo assignment (client-side filtering)
  // Chỉ sử dụng assignment khi không có course_id cụ thể
  const {
    data: allQuizzesData,
    isLoading: isAllQuizzesLoading,
    isError: isAllQuizzesError,
    error: allQuizzesError,
  } = useTeacherQuizzesWithPagination(
    !useSpecificCourse ? currentAssignmentId || undefined : undefined,
    !useSpecificCourse
      ? {
          page: filters.page,
          limit: filters.limit,
          status: filters.status || undefined,
          search: filters.search || undefined,
          sort_by: filters.sort_by,
          sort_order: filters.sort_order,
        }
      : undefined
  );

  // Chọn data source phù hợp
  const quizzesData = useSpecificCourse ? courseQuizzesData : allQuizzesData;
  const isLoading = useSpecificCourse
    ? isCourseQuizzesLoading
    : isAllQuizzesLoading;
  const isError = useSpecificCourse ? isCourseQuizzesError : isAllQuizzesError;
  const error = useSpecificCourse ? courseQuizzesError : allQuizzesError;

  // Process data from hook - handle both array and object structure
  let quizzes: Quiz[] = [];
  let paginationInfo = {
    total: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 12,
    hasNextPage: false,
    hasPrevPage: false,
  };

  if (quizzesData) {
    if (Array.isArray(quizzesData)) {
      // Legacy array response
      quizzes = quizzesData;
    } else if (quizzesData.quizzes && Array.isArray(quizzesData.quizzes)) {
      // New structured response
      quizzes = quizzesData.quizzes;
      paginationInfo = quizzesData.pagination || paginationInfo;
    }
  }

  // Calculate statistics from loaded data
  const statistics = {
    statusCounts: {
      pending: quizzes.filter((q: Quiz) => q.status === "pending").length,
      active: quizzes.filter((q: Quiz) => q.status === "active").length,
      finished: quizzes.filter((q: Quiz) => q.status === "finished").length,
    },
    courseCounts: quizzes.reduce(
      (acc: { [key: number]: number }, quiz: Quiz) => {
        if (quiz.course_id) {
          acc[quiz.course_id] = (acc[quiz.course_id] || 0) + 1;
        }
        return acc;
      },
      {}
    ),
    modeCounts: {
      assessment: quizzes.filter((q: Quiz) => q.quiz_mode === "assessment")
        .length,
      practice: quizzes.filter((q: Quiz) => q.quiz_mode === "practice").length,
      code_practice: quizzes.filter(
        (q: Quiz) => q.quiz_mode === "code_practice"
      ).length,
    },
  };

  // Client-side filtering for cases where server-side filtering is not complete
  let filteredQuizzes = quizzes;
  let shouldUseServerPagination = useSpecificCourse && !!filters.course_id; // Server đã lọc theo course và phân trang

  if (!shouldUseServerPagination) {
    // Client-side filtering khi không dùng server pagination
    filteredQuizzes = quizzes.filter((quiz: Quiz) => {
      if (
        filters.search &&
        !quiz.name?.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }
      if (filters.status && quiz.status !== filters.status) {
        return false;
      }
      if (filters.course_id && quiz.course_id !== filters.course_id) {
        return false;
      }
      if (filters.quiz_mode && quiz.quiz_mode !== filters.quiz_mode) {
        return false;
      }
      return true;
    });
  }

  // Pagination logic
  let pagination;
  let paginatedQuizzes;

  if (shouldUseServerPagination) {
    // Use server pagination info
    pagination = paginationInfo;
    paginatedQuizzes = filteredQuizzes; // Server đã phân trang sẵn
  } else {
    // Client-side pagination
    pagination = {
      total: filteredQuizzes.length,
      totalPages: Math.ceil(filteredQuizzes.length / (filters.limit || 12)),
      currentPage: filters.page || 1,
      limit: filters.limit || 12,
      hasNextPage:
        (filters.page || 1) <
        Math.ceil(filteredQuizzes.length / (filters.limit || 12)),
      hasPrevPage: (filters.page || 1) > 1,
    };

    paginatedQuizzes = filteredQuizzes.slice(
      ((filters.page || 1) - 1) * (filters.limit || 12),
      (filters.page || 1) * (filters.limit || 12)
    );
  }

  const getCourseName = (courseId: number) => {
    return `Khóa học #${courseId}`;
  };

  // Handler functions
  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
    setFilters((prev) => ({
      ...prev,
      search,
      page: 1, // Reset to first page when searching
    }));
  };

  const handleStatusChange = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status,
      page: 1,
    }));
  };

  const handleCourseChange = (course_id: number | undefined) => {
    setFilters((prev) => ({
      ...prev,
      course_id,
      page: 1,
    }));
  };

  const handleQuizModeChange = (quiz_mode: QuizMode | undefined) => {
    setFilters((prev) => ({
      ...prev,
      quiz_mode,
      page: 1,
    }));
  };

  const handleSortByChange = (sort_by: string) => {
    setFilters((prev) => ({
      ...prev,
      sort_by,
    }));
  };

  const handleSortOrderChange = (sort_order: "ASC" | "DESC") => {
    setFilters((prev) => ({
      ...prev,
      sort_order,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({
      page: 1,
      limit: 12,
      status: "",
      course_id: filters.course_id, // Giữ nguyên course_id hiện tại
      search: "",
      sort_by: "update_time",
      sort_order: "DESC",
      quiz_mode: undefined,
    });
  };

  return (
    <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <PageHeader
        title="Quản lý Quiz"
        description="Quản lý các bài kiểm tra của bạn một cách hiệu quả"
      />

      <QuizSearch
        searchTerm={searchTerm}
        onChange={handleSearchChange}
        total={pagination.total}
        status={filters.status}
        onStatusChange={handleStatusChange}
        courseId={filters.course_id}
        onCourseChange={handleCourseChange}
        quizMode={filters.quiz_mode}
        onQuizModeChange={handleQuizModeChange}
        sortBy={filters.sort_by || "update_time"}
        onSortByChange={handleSortByChange}
        sortOrder={filters.sort_order || "DESC"}
        onSortOrderChange={handleSortOrderChange}
        onClearFilters={handleClearFilters}
        statusCounts={statistics.statusCounts}
        courseCounts={statistics.courseCounts}
        modeCounts={statistics.modeCounts}
      />

      {isLoading ? (
        <div className="space-y-6">
          {/* Search skeleton */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start lg:items-center mb-6">
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-4 w-20 bg-muted dark:bg-muted/50 animate-pulse rounded" />
              <div className="h-10 w-full max-w-lg bg-muted dark:bg-muted/50 animate-pulse rounded-lg" />
            </div>
            <div className="flex flex-wrap items-end gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="h-4 w-16 bg-muted dark:bg-muted/50 animate-pulse rounded" />
                  <div className="h-10 w-32 bg-muted dark:bg-muted/50 animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Quiz cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="border-2 rounded-xl p-4 space-y-3 bg-gradient-to-br from-white to-slate-50/50 dark:from-card dark:to-card/80"
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-muted dark:bg-muted/50 animate-pulse rounded" />
                  <div className="h-6 w-20 bg-muted dark:bg-muted/50 animate-pulse rounded-full" />
                </div>
                <div className="h-6 w-3/4 bg-muted dark:bg-muted/50 animate-pulse rounded" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-4 w-full bg-muted dark:bg-muted/50 animate-pulse rounded" />
                  <div className="h-4 w-full bg-muted dark:bg-muted/50 animate-pulse rounded" />
                </div>
                <div className="h-10 w-full bg-muted dark:bg-muted/50 animate-pulse rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <p className="text-red-600">Lỗi tải dữ liệu: {error?.message}</p>
        </div>
      ) : paginatedQuizzes.length === 0 ? (
        <QuizEmptyState
          isSearching={
            !!filters.search || !!filters.status || !!filters.course_id
          }
        />
      ) : (
        <>
          <QuizGrid quizzes={paginatedQuizzes} getCourseName={getCourseName} />

          {pagination.totalPages > 1 && (
            <div className="mt-8">
              <PaginationWithInfo
                currentPage={pagination.currentPage!}
                totalPages={pagination.totalPages}
                total={pagination.total}
                limit={pagination.limit!}
                onPageChange={handlePageChange}
                className="justify-center"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
