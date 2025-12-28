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
import { Button } from "@/components/ui/forms";
import {
  Loader2,
  AlertTriangle,
  CheckSquare,
  Target,
  BookOpen,
} from "lucide-react";

import type { PLOWithRelations } from "@/lib/types/program-management";

interface PLODeleteDialogProps {
  plo: PLOWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function PLODeleteDialog({
  plo,
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: PLODeleteDialogProps) {
  const hasSubjects = plo._count?.Subjects && plo._count.Subjects > 0;
  const hasPOs = plo.POs && plo.POs.length > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Xác nhận xóa chuẩn đầu ra chương trình
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Bạn có chắc chắn muốn xóa chuẩn đầu ra chương trình này không?
                Hành động này không thể hoàn tác.
              </p>

              {/* PLO Info */}
              <div className="bg-muted p-3 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {plo.name || `PLO ${plo.plo_id}`}
                  </span>
                </div>
                {plo.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {plo.description}
                  </p>
                )}
                {plo.Program && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Chương trình:</span>{" "}
                      {plo.Program.name}
                    </span>
                  </div>
                )}
                {hasPOs && (
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">PO liên quan:</span>{" "}
                      {plo.POs?.map((po) => po.name).join(", ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Warning about related data */}
              {(hasSubjects || hasPOs) && (
                <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-destructive text-sm font-medium mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    Cảnh báo quan trọng
                  </div>
                  <div className="space-y-1 text-sm text-destructive/80">
                    {hasSubjects && (
                      <p>• Có {plo._count?.Subjects} môn học liên quan</p>
                    )}
                    {hasPOs && <p>• Có {plo.POs?.length} PO(s) liên quan</p>}
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
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang xóa...
              </>
            ) : (
              "Xóa chuẩn đầu ra chương trình"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
