"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/feedback/dialog";
import { Button } from "@/components/ui/forms/button";
import { Badge } from "@/components/ui/feedback/badge";
import { Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { QuestionWithRelations } from "@/lib/types/question";
import { questionService } from "@/lib/services/api/question.service";

interface QuestionDeleteDialogProps {
  question: QuestionWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function QuestionDeleteDialog({
  question,
  open,
  onOpenChange,
  onSuccess,
}: QuestionDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!question) return;

    try {
      setIsDeleting(true);

      const response = await questionService.deleteQuestionById(
        question.question_id
      );

      if (response.success) {
        toast.success(response.message || "Xóa câu hỏi thành công");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(response.message || "Không thể xóa câu hỏi");
      }
    } catch (error: any) {
      console.error("Error deleting question:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Có lỗi xảy ra khi xóa câu hỏi";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!question) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Xác nhận xóa câu hỏi
          </DialogTitle>
          <DialogDescription className="text-left space-y-3">
            <p>
              Bạn có chắc chắn muốn xóa câu hỏi này? Hành động này không thể
              hoàn tác.
            </p>

            <div className="bg-muted p-3 rounded-lg space-y-2">
              <p className="font-medium text-sm">Thông tin câu hỏi:</p>
              <p className="text-sm">
                <span className="font-medium">Nội dung:</span>{" "}
                <span className="text-muted-foreground">
                  {question.question_text.length > 100
                    ? `${question.question_text.substring(0, 100)}...`
                    : question.question_text}
                </span>
              </p>

              <div className="flex flex-wrap gap-2 text-xs">
                {question.QuestionType && (
                  <Badge variant="outline">
                    Loại: {question.QuestionType.name}
                  </Badge>
                )}
                {question.Level && (
                  <Badge variant="outline">Độ khó: {question.Level.name}</Badge>
                )}
                {question.LO && (
                  <Badge variant="outline">LO: {question.LO.name}</Badge>
                )}
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-3 rounded-lg">
              <p className="text-red-800 dark:text-red-400 text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Cảnh báo
              </p>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                Câu hỏi sẽ bị xóa khỏi tất cả các quiz đang sử dụng nó. Việc này
                có thể ảnh hưởng đến kết quả của các bài kiểm tra.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            {isDeleting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang xóa...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa câu hỏi
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
