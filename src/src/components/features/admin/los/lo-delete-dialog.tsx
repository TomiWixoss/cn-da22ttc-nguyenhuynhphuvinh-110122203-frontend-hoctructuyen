// frontend/src/components/features/admin/los/lo-delete-dialog.tsx
"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/overlay";
import {
  Loader2,
  AlertTriangle,
  Target,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import type { LOWithRelations } from "@/lib/types/lo";

interface LODeleteDialogProps {
  lo: LOWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function LODeleteDialog({
  lo,
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: LODeleteDialogProps) {
  const hasChapters = (lo.Chapters?.length ?? 0) > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Xác nhận xóa chuẩn đầu ra
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Bạn có chắc chắn muốn xóa chuẩn đầu ra này không? Hành động này
                không thể hoàn tác.
              </p>
              <div className="bg-muted p-3 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="font-medium">{lo.name}</span>
                </div>
                {lo.Subject && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Môn học:</span>{" "}
                      {lo.Subject.name}
                    </span>
                  </div>
                )}
              </div>
              {hasChapters && (
                <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-destructive">
                        Cảnh báo: Có dữ liệu liên quan
                      </p>
                      <p className="text-sm text-destructive/80">
                        Chuẩn đầu ra này có{" "}
                        <strong>{lo.Chapters?.length} chương</strong> liên quan.
                        Việc xóa chuẩn đầu ra sẽ xóa luôn tất cả chương này.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang xóa...
              </>
            ) : (
              "Xóa chuẩn đầu ra"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
