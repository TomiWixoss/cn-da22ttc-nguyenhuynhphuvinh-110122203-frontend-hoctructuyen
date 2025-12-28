import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { questionService } from "@/lib/services/api/question.service";
import { QuestionWithRelations } from "@/lib/types/question";
import { toast } from "sonner";

// Định nghĩa query keys cho Questions
export const questionKeys = {
  all: ["questions"] as const,
  lists: () => [...questionKeys.all, "list"] as const,
  list: (filters: string) => [...questionKeys.lists(), { filters }] as const,
  details: () => [...questionKeys.all, "detail"] as const,
  detail: (id: number) => [...questionKeys.details(), id] as const,
};

// Hook để lấy chi tiết một câu hỏi
export function useQuestion(questionId: number) {
  return useQuery({
    queryKey: questionKeys.detail(questionId),
    queryFn: async () => {
      const response = await questionService.getQuestionById(questionId);
      if (response?.success && response?.data) {
        return response.data as QuestionWithRelations;
      }
      throw new Error(response?.message || "Không thể tải thông tin câu hỏi");
    },
    enabled: !!questionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook để lấy danh sách câu hỏi
export function useQuestions(filters?: {
  page?: number;
  limit?: number;
  search?: string;
  subject_id?: number;
  level_id?: number;
  question_type_id?: number;
}) {
  const filterKey = JSON.stringify(filters || {});

  return useQuery({
    queryKey: questionKeys.list(filterKey),
    queryFn: async () => {
      const response = await questionService.getQuestions(filters);
      if (response?.success && response?.data) {
        return Array.isArray(response.data)
          ? response.data
          : response.data.questions;
      }
      if (Array.isArray(response)) {
        return response;
      }
      return [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook để tạo câu hỏi mới sử dụng FormData
export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      // Nhận FormData
      const response = await questionService.createEnhancedQuestion(formData);
      if (response?.success) {
        return response.data;
      }
      throw new Error(response?.message || "Không thể tạo câu hỏi");
    },
    onSuccess: () => {
      // Invalidate tất cả question queries
      queryClient.invalidateQueries({
        queryKey: questionKeys.all,
      });
      // Invalidate các queries liên quan khác
      queryClient.invalidateQueries({
        queryKey: ["los"],
      });
      queryClient.invalidateQueries({
        queryKey: ["subjects"],
      });
      queryClient.invalidateQueries({
        queryKey: ["courses"],
      });
      queryClient.invalidateQueries({
        queryKey: ["quizzes"],
      });
      toast.success("Tạo câu hỏi thành công!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Lỗi khi tạo câu hỏi");
    },
  });
}

// Hook để cập nhật câu hỏi sử dụng FormData
export function useUpdateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: number; formData: FormData }) => {
      // Nhận FormData
      const response = await questionService.updateEnhancedQuestion(
        params.id,
        params.formData
      );
      if (response?.success) {
        return response.data;
      }
      throw new Error(response?.message || "Không thể cập nhật câu hỏi");
    },
    onSuccess: (data, variables) => {
      // Invalidate tất cả question queries
      queryClient.invalidateQueries({
        queryKey: questionKeys.all,
      });
      // Invalidate các queries liên quan khác
      queryClient.invalidateQueries({
        queryKey: ["los"],
      });
      queryClient.invalidateQueries({
        queryKey: ["subjects"],
      });
      queryClient.invalidateQueries({
        queryKey: ["courses"],
      });
      queryClient.invalidateQueries({
        queryKey: ["quizzes"],
      });
      toast.success("Cập nhật câu hỏi thành công!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Lỗi khi cập nhật câu hỏi");
    },
  });
}

// Hook để xóa câu hỏi
export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionId: number) => {
      const response = await questionService.deleteQuestionById(questionId);
      if (response?.success) {
        return response;
      }
      throw new Error(response?.message || "Không thể xóa câu hỏi");
    },
    onSuccess: () => {
      // Invalidate tất cả question list queries
      queryClient.invalidateQueries({
        queryKey: questionKeys.all,
        predicate: (query) => {
          return (
            query.queryKey[0] === "questions" && query.queryKey[1] === "list"
          );
        },
      });
      toast.success("Xóa câu hỏi thành công!");
    },
    onError: (error: any) => {
      console.error("Error deleting question:", error);
      toast.error(error.message || "Có lỗi xảy ra khi xóa câu hỏi");
    },
  });
}

// Hook để import câu hỏi từ CSV
export function useImportQuestionsFromCSV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      subjectId,
    }: {
      file: File;
      subjectId: number;
    }) => {
      const response = await questionService.importQuestionsFromCSV(
        file,
        subjectId
      );
      if (response?.success) {
        return response.data;
      }
      throw new Error(response?.message || "Không thể import câu hỏi");
    },
    onSuccess: () => {
      // Invalidate tất cả question list queries
      queryClient.invalidateQueries({
        queryKey: questionKeys.all,
        predicate: (query) => {
          return (
            query.queryKey[0] === "questions" && query.queryKey[1] === "list"
          );
        },
      });
      toast.success("Import câu hỏi từ CSV thành công!");
    },
    onError: (error: any) => {
      console.error("Error importing questions from CSV:", error);
      toast.error(error.message || "Có lỗi xảy ra khi import câu hỏi từ CSV");
    },
  });
}

// Hook để import câu hỏi từ Excel
export function useImportQuestionsFromExcel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      subjectId,
    }: {
      file: File;
      subjectId: number;
    }) => {
      const response = await questionService.importQuestionsFromExcel(
        file,
        subjectId
      );
      if (response?.success) {
        return response.data;
      }
      throw new Error(response?.message || "Không thể import câu hỏi");
    },
    onSuccess: () => {
      // Invalidate tất cả question list queries
      queryClient.invalidateQueries({
        queryKey: questionKeys.all,
        predicate: (query) => {
          return (
            query.queryKey[0] === "questions" && query.queryKey[1] === "list"
          );
        },
      });
      toast.success("Import câu hỏi từ Excel thành công!");
    },
    onError: (error: any) => {
      console.error("Error importing questions from Excel:", error);
      toast.error(error.message || "Có lỗi xảy ra khi import câu hỏi từ Excel");
    },
  });
}
