"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CreateQuizFormData } from "@/lib/types/quiz";
import { quizService } from "@/lib/services/api";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast-utils";
import { teachingKeys } from "./use-teaching";

/**
 * Hook xử lý tạo bài kiểm tra
 */
export const useQuizCreation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  /**
   * Tạo bài kiểm tra mới
   * @param formData Dữ liệu form tạo bài kiểm tra
   * @returns true nếu tạo thành công, false nếu thất bại
   */
  const createQuiz = async (formData: CreateQuizFormData): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      // Kiểm tra quiz_mode hợp lệ
      if (
        !formData.quiz_mode ||
        !["assessment", "practice", "code_practice"].includes(
          formData.quiz_mode
        )
      ) {
        setError("Chế độ quiz không hợp lệ");
        return false;
      }

      // Prepare payload based on quiz mode
      let payload: any = {
        course_id: formData.course_id,
        name: formData.name,
        duration: formData.duration,
        quiz_mode: formData.quiz_mode,
      };

      if (formData.quiz_mode === "code_practice") {
        // Code practice mode - ONLY include code_config for this mode
        if (formData.code_config) {
          payload.code_config = formData.code_config;
        }

        if (formData.question_selection_method === "existing") {
          // Use existing questions
          payload.question_ids = formData.question_ids;
        } else {
          // Auto-generate questions
          payload.question_criteria = {
            ...formData.question_criteria,
            type: 4, // code_exercise type
          };
        }
      } else {
        // Assessment or practice mode - DO NOT include code_config
        if (!formData.question_criteria) {
          setError("Thiếu thông tin tiêu chí câu hỏi");
          return false;
        }

        const { easy, medium, hard } =
          formData.question_criteria.difficultyRatio;
        if (easy + medium + hard !== 100) {
          setError("Tổng tỷ lệ độ khó phải bằng 100%");
          return false;
        }

        payload.question_criteria = formData.question_criteria;
        // Explicitly ensure code_config is NOT sent
        delete payload.code_config;
      }

      // Gọi API tạo bài kiểm tra
      await quizService.createQuiz(payload);

      // Hiển thị thông báo thành công dựa trên chế độ
      const modeText =
        formData.quiz_mode === "assessment"
          ? "chế độ đánh giá"
          : formData.quiz_mode === "practice"
          ? "chế độ luyện tập"
          : "chế độ luyện code";
      showSuccessToast(`Tạo bài kiểm tra ${modeText} thành công`);

      // Invalidate tất cả quiz queries để đảm bảo danh sách được cập nhật
      await queryClient.invalidateQueries({ queryKey: teachingKeys.all });

      // Làm mới dữ liệu
      router.refresh();

      return true;
    } catch (err: Error | unknown) {
      // Xử lý lỗi
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi khi tạo bài kiểm tra";
      setError(errorMessage);
      showErrorToast(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createQuiz,
    isLoading,
    error,
  };
};
