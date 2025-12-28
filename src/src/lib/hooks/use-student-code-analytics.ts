"use client";

import { useQuery } from "@tanstack/react-query";
import codeSubmissionService, {
  UserAnalyticsData,
  StudentTrackingData,
} from "@/lib/services/api/code-submission.service";

/**
 * Hook để lấy thống kê code analytics của sinh viên
 */
export function useStudentCodeAnalytics() {
  const {
    data: analytics,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<UserAnalyticsData>({
    queryKey: ["student-code-analytics"],
    queryFn: () => codeSubmissionService.getUserAnalytics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  return {
    analytics,
    isLoading,
    isError,
    error,
    refetch,
  };
}

/**
 * Hook để lấy tracking progress của một câu hỏi cụ thể
 */
export function useQuestionTracking(questionId: number | null) {
  const {
    data: tracking,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<StudentTrackingData>({
    queryKey: ["question-tracking", questionId],
    queryFn: () => {
      if (!questionId) throw new Error("Question ID is required");
      return codeSubmissionService.getStudentTracking(questionId);
    },
    enabled: !!questionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });

  return {
    tracking,
    isLoading,
    isError,
    error,
    refetch,
  };
}
