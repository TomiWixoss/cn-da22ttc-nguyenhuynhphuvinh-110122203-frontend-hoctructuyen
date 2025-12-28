import { useQuery } from "@tanstack/react-query";
import { codeAnalyticsService } from "@/lib/services/api/code-analytics.service";

export const codeAnalyticsKeys = {
  all: ["code-analytics"] as const,
  question: (questionId: number) =>
    [...codeAnalyticsKeys.all, "question", questionId] as const,
};

export function useCodeAnalytics(questionId: number) {
  return useQuery({
    queryKey: codeAnalyticsKeys.question(questionId),
    queryFn: () => codeAnalyticsService.getQuestionDifficulty(questionId),
    enabled: !!questionId,
  });
}

// Utility functions
export const getDifficultyColor = (
  level: "easy" | "medium" | "hard"
): string => {
  switch (level) {
    case "easy":
      return "bg-green-100 text-green-800 border-green-300";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "hard":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

export const getPassRateColor = (passRate: number): string => {
  if (passRate >= 0.8) return "text-green-600";
  if (passRate >= 0.5) return "text-yellow-600";
  return "text-red-600";
};

export const getPriorityColor = (
  priority: "high" | "medium" | "low"
): string => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 border-red-300";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "low":
      return "bg-blue-100 text-blue-800 border-blue-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};
