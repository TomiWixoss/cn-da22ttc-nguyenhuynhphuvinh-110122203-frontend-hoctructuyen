import React, { useState } from "react";
import { QuizDetail, QuizModeInfo, QuizMode } from "@/lib/types/quiz";
import { QuizInfo } from "./quiz-info";
import { QuestionList } from "./question-list";
import { CloneQuizButton } from "../clone/clone-quiz-button";
import { quizService } from "@/lib/services/api";
// THAY ĐỔI: Import thêm useSwitchQuizMode
import { useDeleteQuiz, useSwitchQuizMode } from "@/lib/hooks/use-teaching";
import { Button } from "@/components/ui/forms";
import { Loader2, Trash, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAssignmentContext } from "@/lib/contexts/assignment-context";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/feedback";

interface QuizDetailViewProps {
  quiz: QuizDetail;
  onUpdate: () => void;
  onDelete: () => void;
  quizModeInfo?: QuizModeInfo | null;
}

export function QuizDetailView({
  quiz,
  onUpdate,
  onDelete,
  quizModeInfo,
}: QuizDetailViewProps) {
  const router = useRouter();
  const { createTeacherUrl } = useAssignmentContext();
  const [isReshuffleLoading, setIsReshuffleLoading] = useState(false);
  // XÓA BỎ: const [isModeToggleLoading, setIsModeToggleLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // THAY ĐỔI: Sử dụng các mutation hook
  const deleteMutation = useDeleteQuiz();
  const switchModeMutation = useSwitchQuizMode();

  // Xử lý trộn lại câu hỏi
  const handleReshuffle = async () => {
    try {
      setIsReshuffleLoading(true);
      await quizService.reshuffleQuestions(quiz.quiz_id);
      showSuccessToast("Trộn lại câu hỏi thành công, đang tải dữ liệu mới...");

      // Cập nhật lại trang hiện tại để hiển thị câu hỏi đã trộn
      onUpdate();
    } catch (error) {
      showErrorToast("Lỗi khi trộn lại câu hỏi");
    } finally {
      setIsReshuffleLoading(false);
    }
  };

  // THAY ĐỔI: Cập nhật hàm handleModeToggle
  const handleModeToggle = async () => {
    if (!quizModeInfo) {
      showErrorToast("Không thể xác định chế độ hiện tại");
      return;
    }

    const currentMode = quizModeInfo.quiz_mode;
    const newMode: QuizMode =
      currentMode === "assessment" ? "practice" : "assessment";

    switchModeMutation.mutate({ quizId: quiz.quiz_id, newMode });
  };

  // Xử lý khi clone thành công
  const handleCloneSuccess = (clonedQuizId: number) => {
    showSuccessToast(
      `Bài kiểm tra đã được sao chép thành công (ID: ${clonedQuizId})`
    );
    // Chuyển hướng đến trang chi tiết của quiz mới
    const url = createTeacherUrl(
      `/dashboard/teaching/quizzes/detail/${clonedQuizId}`
    );
    router.push(url);
  };

  // Xử lý xóa bài kiểm tra
  const handleDeleteQuiz = async () => {
    deleteMutation.mutate(quiz.quiz_id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        onDelete();
      },
      onError: () => {
        setIsDeleteDialogOpen(false);
      },
    });
  };

  return (
    <div className="w-full mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
          Chi tiết bài kiểm tra
        </h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Clone Button */}
          <CloneQuizButton
            quiz={quiz}
            onCloneSuccess={handleCloneSuccess}
            variant="outline"
            size="sm"
            className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm cursor-pointer w-full sm:w-auto"
          />

          {quizModeInfo &&
            quiz.status !== "finished" &&
            quizModeInfo.quiz_mode !== "code_practice" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleModeToggle}
                disabled={
                  switchModeMutation.isPending || deleteMutation.isPending
                }
                className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm cursor-pointer w-full sm:w-auto"
              >
                {switchModeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1.5" />
                )}
                <span className="truncate">
                  Chuyển sang{" "}
                  {quizModeInfo.quiz_mode === "assessment"
                    ? "Luyện tập"
                    : "Đánh giá"}
                </span>
              </Button>
            )}
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={deleteMutation.isPending}
                className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm cursor-pointer w-full sm:w-auto"
              >
                <Trash className="h-4 w-4 mr-1.5" />
                Xóa bài kiểm tra
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl font-bold">
                  Xác nhận xóa bài kiểm tra
                </DialogTitle>
                <DialogDescription className="pt-2 text-sm">
                  Bạn có chắc chắn muốn xóa bài kiểm tra &quot;{quiz.name}
                  &quot;? Hành động này không thể hoàn tác.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={deleteMutation.isPending}
                  className="cursor-pointer w-full sm:w-auto"
                >
                  Hủy
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteQuiz}
                  disabled={deleteMutation.isPending}
                  className="cursor-pointer w-full sm:w-auto"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : null}
                  Xóa
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8 md:space-y-10">
        <QuizInfo quiz={quiz} quizModeInfo={quizModeInfo} />
        <QuestionList
          questions={quiz.questions}
          onReshuffle={handleReshuffle}
          isReshuffleLoading={isReshuffleLoading}
          quizMode={quizModeInfo?.quiz_mode}
        />
      </div>
    </div>
  );
}
