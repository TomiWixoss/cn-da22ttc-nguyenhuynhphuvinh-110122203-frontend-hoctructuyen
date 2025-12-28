import { useQuery } from "@tanstack/react-query";
import { chapterAnalyticsService, loService, courseService } from "@/lib/services/api";
import {
  ChapterAnalyticsResponse,
  ComprehensiveAnalysisParams,
} from "@/lib/types/chapter-analytics";
import type { LOCompletionAnalysisParams, LOCompletionAnalysisResponse } from "@/lib/services/api/lo.service";

// Định nghĩa query keys
export const learningAnalyticsKeys = {
  all: ["learningAnalytics"] as const,
  comprehensive: (params: ComprehensiveAnalysisParams) =>
    [...learningAnalyticsKeys.all, "comprehensive", params] as const,
  loCompletion: (params: LOCompletionAnalysisParams) =>
    [...learningAnalyticsKeys.all, "loCompletion", params] as const,
  courses: () => [...learningAnalyticsKeys.all, "courses"] as const,
};

// Hook để lấy dữ liệu phân tích tổng hợp
export function useComprehensiveAnalysis(params: ComprehensiveAnalysisParams) {
  return useQuery({
    queryKey: learningAnalyticsKeys.comprehensive(params),
    queryFn: () =>
      chapterAnalyticsService.getComprehensiveAnalysis(params),
    enabled: !!params.course_id && !!params.user_id,
  });
}

// Hook để lấy dữ liệu phân tích hoàn thành LO
export function useLOCompletionAnalysis(params: LOCompletionAnalysisParams) {
  return useQuery({
    queryKey: learningAnalyticsKeys.loCompletion(params),
    queryFn: async () => {
      const response = await loService.getCompletionAnalysis(params);
      if (response?.success && response?.data) {
        return response.data;
      }
      if (response && !(response as any).hasOwnProperty("success")) {
        return response as any;
      }
      throw new Error(
        (response as any)?.message || "Không thể tải dữ liệu phân tích LO"
      );
    },
    enabled: !!params.course_id && !!params.user_id,
  });
}

// Hook để lấy danh sách khóa học
export function useStudentCourses() {
  return useQuery({
    queryKey: learningAnalyticsKeys.courses(),
    queryFn: async () => {
      const response = await courseService.getCourses();
      if (response?.success && response?.data) {
        return Array.isArray(response.data)
          ? response.data
          : response.data.courses;
      }
      if (Array.isArray(response)) {
        return response;
      }
      return [];
    },
  });
}
