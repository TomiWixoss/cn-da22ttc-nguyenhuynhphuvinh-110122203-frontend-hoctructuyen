import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Question } from "@/lib/types/quiz";
import quizService from "@/lib/services";

// Cập nhật interface Question để bao gồm trường id
type QuestionWithId = Question & { id: number };

interface UseQuizDataProps {
  quizId: number;
  onScoreChange?: (score: number) => void;
  initialScore?: number;
}

interface UseQuizDataReturn {
  questions: QuestionWithId[];
  loading: boolean;
  error: string | null;
  currentScore: number;
  setCurrentScore: (score: number) => void;
}

export const useQuizData = ({
  quizId,
  onScoreChange,
  initialScore,
}: UseQuizDataProps): UseQuizDataReturn => {
  const [currentScore, setCurrentScore] = useState<number>(initialScore ?? 0);

  // Sử dụng useQuery để fetch câu hỏi quiz
  const {
    data: questions = [],
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["quiz-questions", quizId],
    queryFn: async () => {
      const response = await quizService.getQuizQuestions(quizId);

      if (
        response?.success &&
        response?.data &&
        Array.isArray(response.data.questions)
      ) {
        const questionsWithId = response.data.questions.map(
          (q: Question, index: number) => ({
            ...q,
            id: index,
          })
        );
        return questionsWithId;
      } else {
        console.error("Invalid questions data:", response);
        throw new Error("Dữ liệu câu hỏi không hợp lệ");
      }
    },
    enabled: !!quizId,
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000, // 10 phút
  });

  // Chuyển đổi error từ TanStack Query
  const error = queryError ? (queryError as Error).message : null;

  // Gọi onScoreChange khi currentScore thay đổi
  useEffect(() => {
    if (onScoreChange) {
      onScoreChange(currentScore);
    }
  }, [currentScore, onScoreChange]);

  return {
    questions,
    loading,
    error,
    currentScore,
    setCurrentScore,
  };
};
