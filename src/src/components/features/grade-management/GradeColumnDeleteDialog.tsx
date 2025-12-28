"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/feedback";
import { Button } from "@/components/ui/forms";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { courseGradeService } from "@/lib/services/api/course-grade.service";
import type { GradeColumnWithRelations } from "@/lib/types/course-grade";

interface GradeColumnDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column: GradeColumnWithRelations | null;
  courseId: number;
  onDeleteComplete?: () => void;
}

export function GradeColumnDeleteDialog({
  open,
  onOpenChange,
  column,
  courseId,
  onDeleteComplete,
}: GradeColumnDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!column) return;

    try {
      setIsDeleting(true);

      // Nếu có quiz được gán, tự động gỡ tất cả quiz trước
      if (hasQuizzes) {
        const unassignResponse =
          await courseGradeService.unassignAllQuizzesFromColumn(
            courseId,
            column.column_id
          );

        if (!unassignResponse.success) {
          toast.error("Không thể gỡ quiz khỏi cột điểm");
          return;
        }
      }

      // Sau đó xóa cột điểm
      const response = await courseGradeService.deleteGradeColumn(
        courseId,
        column.column_id
      );

      if (response.success) {
        toast.success(
          hasQuizzes
            ? "Đã gỡ quiz và xóa cột điểm thành công"
            : "Đã xóa cột điểm thành công"
        );
        onOpenChange(false);
        onDeleteComplete?.();
      } else {
        toast.error(response.message || "Không thể xóa cột điểm");
      }
    } catch (error) {
      console.error("Error deleting grade column:", error);
      toast.error("Lỗi khi xóa cột điểm");
    } finally {
      setIsDeleting(false);
    }
  };

  const hasQuizzes = column?.Quizzes && column.Quizzes.length > 0;

  if (!column) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Xác nhận xóa cột điểm
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa cột điểm này không?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Column Info */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tên cột:</span>
              <span className="text-sm">{column.column_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Trọng số:</span>
              <span className="text-sm">{column.weight_percentage}%</span>
            </div>
            {hasQuizzes && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Số quiz:</span>
                <span className="text-sm text-orange-600 font-medium">
                  {column.Quizzes?.length || 0} quiz
                </span>
              </div>
            )}
          </div>

          {/* Warning */}
          {hasQuizzes && (
            <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-800 dark:text-orange-200">
                <p className="font-medium mb-1">Cảnh báo:</p>
                <p>
                  Cột điểm này đang có {column.Quizzes?.length || 0} quiz được
                  gán. Hệ thống sẽ tự động gỡ tất cả các quiz này trước khi xóa
                  cột điểm.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800 dark:text-red-200">
              <p className="font-medium">Hành động này không thể hoàn tác!</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Đang xóa...
              </div>
            ) : (
              "Xóa cột điểm"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
