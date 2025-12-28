import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quizService } from "@/lib/services/api";
import { chapterAnalyticsService } from "@/lib/services/api";
import { toast } from "sonner";

// Định nghĩa query keys cho Quiz Results
export const quizResultsKeys = {
  all: ["quiz-results"] as const,
  lists: () => [...quizResultsKeys.all, "list"] as const,
  list: (filters: string) => [...quizResultsKeys.lists(), { filters }] as const,
  details: () => [...quizResultsKeys.all, "detail"] as const,
  detail: (id: number) => [...quizResultsKeys.details(), id] as const,
  byQuiz: (quizId: number) =>
    [...quizResultsKeys.all, "byQuiz", quizId] as const,
  analytics: (quizId: number) =>
    [...quizResultsKeys.all, "analytics", quizId] as const,
  // Keys cho các loại phân tích khác
  learningOutcomes: (quizId: number) =>
    [...quizResultsKeys.all, "learningOutcomes", quizId] as const,
  studentGroups: (quizId: number) =>
    [...quizResultsKeys.all, "studentGroups", quizId] as const,
  radar: (quizId: number) => [...quizResultsKeys.all, "radar", quizId] as const,
  difficultyHeatmap: (quizId: number) =>
    [...quizResultsKeys.all, "difficultyHeatmap", quizId] as const,
};

// Interface cho Quiz Result
export interface QuizResult {
  result_id: number;
  quiz_id: number;
  user_id: number;
  score: number;
  status: string;
  completion_time: number | null;
  update_time: string;
  Quiz: {
    quiz_id: number;
    name: string;
    quiz_mode?: "assessment" | "practice";
  };
  Student?: {
    user_id?: string;
    name?: string;
    email?: string;
  };
  lo_chapters?: Array<{
    lo_id: number;
    lo_name: string;
    chapters: Array<{
      chapter_id: number;
      chapter_name: string;
      sections: Array<{
        section_id: number;
        title: string;
        content: string;
        order: number;
      }>;
    }>;
  }>;
}

// Hook để lấy kết quả quiz theo quiz ID
export function useQuizResults(quizId: number) {
  return useQuery({
    queryKey: quizResultsKeys.byQuiz(quizId),
    queryFn: async () => {
      const response = await quizService.getQuizResultsByQuizId(quizId);

      // Xử lý wrapper nếu có, fallback cho cấu trúc cũ
      if (response?.success && response?.data && Array.isArray(response.data)) {
        // Cấu trúc mới với wrapper
        return response.data as QuizResult[];
      } else if (Array.isArray(response)) {
        // Cấu trúc cũ - array trực tiếp
        return response as QuizResult[];
      } else {
        console.warn("Unexpected quiz results response structure:", response);
        return [] as QuizResult[];
      }
    },
    enabled: !!quizId, // Chỉ chạy query khi quizId có giá trị
  });
}

// Hook để lấy dữ liệu Learning Outcomes Chart
export function useLearningOutcomesChart(quizId: number) {
  return useQuery({
    queryKey: quizResultsKeys.learningOutcomes(quizId),
    queryFn: () => chapterAnalyticsService.getLearningOutcomesChart(quizId),
    enabled: !!quizId,
  });
}

// Hook để lấy dữ liệu Student Groups Chart
export function useStudentGroupsChart(quizId: number) {
  return useQuery({
    queryKey: quizResultsKeys.studentGroups(quizId),
    queryFn: () => chapterAnalyticsService.getStudentGroupsChart(quizId),
    enabled: !!quizId,
  });
}

// Hook để lấy dữ liệu Teacher Radar Chart
export function useTeacherRadarChart(quizId: number) {
  return useQuery({
    queryKey: quizResultsKeys.radar(quizId),
    queryFn: () => quizService.getAllRadarData(quizId), // Giả sử API này vẫn tồn tại
    enabled: !!quizId,
  });
}

// Hook để lấy dữ liệu Difficulty-LO Heatmap
export function useDifficultyLOHeatmap(quizId: number) {
  return useQuery({
    queryKey: quizResultsKeys.difficultyHeatmap(quizId),
    queryFn: () => chapterAnalyticsService.getDifficultyLODistribution(quizId),
    enabled: !!quizId,
  });
}

// Utility functions cho grade classification
export const getGradeClassification = (score: number): string => {
  if (score >= 9) return "xuất sắc";
  if (score >= 8) return "giỏi";
  if (score >= 6.5) return "khá";
  if (score >= 5) return "trung bình";
  if (score >= 3.5) return "yếu";
  return "kém";
};

// Utility functions cho màu sắc
export const getScoreColor = (score: number): string => {
  if (score >= 8) return "text-green-600";
  if (score >= 6.5) return "text-blue-600";
  if (score >= 5) return "text-yellow-600";
  return "text-red-600";
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "passed":
    case "đạt":
      return "bg-green-100 text-green-800";
    case "failed":
    case "không đạt":
      return "bg-red-100 text-red-800";
    case "completed":
    case "hoàn thành":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getGradeColor = (grade: string): string => {
  switch (grade.toLowerCase()) {
    case "xuất sắc":
      return "bg-purple-100 text-purple-800";
    case "giỏi":
      return "bg-green-100 text-green-800";
    case "khá":
      return "bg-blue-100 text-blue-800";
    case "trung bình":
      return "bg-yellow-100 text-yellow-800";
    case "yếu":
      return "bg-orange-100 text-orange-800";
    case "kém":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Hook để lấy kết quả quiz của user hiện tại
export function useCurrentUserQuizResults(userId: number) {
  return useQuery({
    queryKey: [...quizResultsKeys.all, "currentUser", userId],
    queryFn: async () => {
      const response = await quizService.getCurrentUserQuizResults(userId);

      // Xử lý wrapper nếu có, fallback cho cấu trúc cũ
      if (response?.success && response?.data && Array.isArray(response.data)) {
        // Cấu trúc mới với wrapper
        return response.data as QuizResult[];
      } else if (Array.isArray(response)) {
        // Cấu trúc cũ - array trực tiếp
        return response as QuizResult[];
      } else {
        console.warn(
          "Unexpected current user quiz results response structure:",
          response
        );
        return [] as QuizResult[];
      }
    },
    enabled: !!userId,
  });
}

// Hook để lấy chi tiết một quiz result cụ thể
export function useQuizResultDetail(resultId: number) {
  return useQuery({
    queryKey: quizResultsKeys.detail(resultId),
    queryFn: async () => {
      const response = await quizService.getQuizResultById(resultId);

      // Xử lý wrapper nếu có, fallback cho cấu trúc cũ
      if (response?.success && response?.data) {
        return response.data;
      } else if (
        response &&
        typeof response === "object" &&
        "result_id" in response
      ) {
        // Cấu trúc cũ - object trực tiếp
        return response;
      } else {
        throw new Error("Không thể tải chi tiết kết quả bài kiểm tra");
      }
    },
    enabled: !!resultId,
  });
}

// Hook để filter results
export function useFilteredQuizResults(
  results: QuizResult[],
  searchTerm: string,
  gradeFilter: string
) {
  return results.filter((result) => {
    const studentName = result.Student?.name?.toLowerCase() || "";
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = studentName.includes(searchLower);

    if (gradeFilter === "all") {
      return nameMatch;
    }

    const gradeClassification = getGradeClassification(result.score);
    return nameMatch && gradeClassification === gradeFilter;
  });
}
