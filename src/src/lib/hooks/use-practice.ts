import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { practiceRecommendationService } from "@/lib/services/api";
import { toast } from "sonner";

// Định nghĩa query keys cho Practice
export const practiceKeys = {
  all: ["practice"] as const,
  recommendations: () => [...practiceKeys.all, "recommendations"] as const,
  recommendation: (userId: number, courseId: number) => 
    [...practiceKeys.recommendations(), userId, courseId] as const,
  sessions: () => [...practiceKeys.all, "sessions"] as const,
  session: (sessionId: number) => [...practiceKeys.sessions(), sessionId] as const,
  progress: () => [...practiceKeys.all, "progress"] as const,
  userProgress: (userId: number) => [...practiceKeys.progress(), userId] as const,
};

// Hook để lấy gợi ý luyện tập
export function usePracticeRecommendations(userId: number, courseId: number) {
  return useQuery({
    queryKey: practiceKeys.recommendation(userId, courseId),
    queryFn: async () => {
      const response = await practiceRecommendationService.getRecommendations({
        user_id: userId,
        course_id: courseId,
      });
      
      if (response?.success && response?.data) {
        return response.data;
      }
      if (Array.isArray(response)) {
        return response;
      }
      throw new Error(
        (response as any)?.message || "Không thể tải gợi ý luyện tập"
      );
    },
    enabled: !!userId && !!courseId,
  });
}

// Hook để sinh bộ câu hỏi luyện tập
export function useGeneratePractice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      user_id: number;
      course_id: number;
      lo_id?: number;
      difficulty?: "easy" | "medium" | "hard";
      total_questions?: number;
    }) => {
      const response = await practiceRecommendationService.generatePractice(params);
      if (response?.success) {
        return response.data;
      }
      throw new Error(response?.message || "Không thể sinh bộ câu hỏi luyện tập");
    },
    onSuccess: (data, variables) => {
      // Invalidate practice recommendations để cập nhật trạng thái
      queryClient.invalidateQueries({
        queryKey: practiceKeys.recommendation(variables.user_id, variables.course_id),
      });
      toast.success("Sinh bộ câu hỏi luyện tập thành công!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Lỗi khi sinh câu hỏi luyện tập");
    },
  });
}

// Hook để tạo phiên luyện tập từ URL params
export function usePracticeSession(params: {
  userId: number;
  courseId: number;
  loId: number;
  difficulty: "easy" | "medium" | "hard";
  totalQuestions: number;
}) {
  return useQuery({
    queryKey: [...practiceKeys.sessions(), params],
    queryFn: async () => {
      const response = await practiceRecommendationService.generatePractice({
        user_id: params.userId,
        course_id: params.courseId,
        lo_id: params.loId,
        difficulty: params.difficulty,
        total_questions: params.totalQuestions,
      });
      
      if (response?.success && response?.data) {
        return response.data;
      }
      throw new Error(response?.message || "Không thể tạo phiên luyện tập");
    },
    enabled: !!(params.userId && params.courseId && params.loId),
    staleTime: 0, // Always fetch fresh data for practice sessions
    gcTime: 0, // Don't cache practice sessions
  });
}

// Hook để gửi kết quả phiên luyện tập
export function useSubmitSessionResults() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (submissionData: {
      quizInfo: {
        quiz_id: number;
        session_start_time: string;
        session_end_time: string;
      };
      performanceData: Array<{
        question_id: number;
        is_correct: boolean;
        response_time_ms: number;
        attempts: number;
      }>;
      rewardsSummary: {
        total_exp_earned: number;
        total_syncoin_earned: number;
      };
      itemsFromEggs: Array<{
        item_type: "AVATAR" | "FRAME" | "EMOJI";
        item_id: number;
      }>;
    }) => {
      const response = await practiceRecommendationService.submitSessionResults(submissionData);
      if (response?.success) {
        return response.data;
      }
      throw new Error(response?.message || "Không thể gửi kết quả phiên luyện tập");
    },
    onSuccess: () => {
      // Invalidate practice recommendations để cập nhật trạng thái
      queryClient.invalidateQueries({
        queryKey: practiceKeys.all,
      });
      toast.success("Gửi kết quả phiên luyện tập thành công!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Lỗi khi gửi kết quả phiên luyện tập");
    },
  });
}

// Utility functions
export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty.toLowerCase()) {
    case "easy":
    case "dễ":
      return "bg-green-100 text-green-800";
    case "medium":
    case "trung bình":
      return "bg-yellow-100 text-yellow-800";
    case "hard":
    case "khó":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getProgressColor = (progress: number): string => {
  if (progress >= 80) return "bg-green-500";
  if (progress >= 60) return "bg-blue-500";
  if (progress >= 40) return "bg-yellow-500";
  return "bg-red-500";
};

export const formatPracticeTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};
