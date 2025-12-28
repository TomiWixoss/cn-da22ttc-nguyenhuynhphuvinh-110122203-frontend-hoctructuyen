"use client";

import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";

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
import { Badge } from "@/components/ui/feedback";

import { useRemoveSubjectFromProgram } from "@/lib/hooks/use-subjects";

interface SubjectDeleteDialogProps {
  subject: any | null;
  programId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function SubjectDeleteDialog({
  subject,
  programId,
  open,
  onOpenChange,
  onSuccess,
}: SubjectDeleteDialogProps) {
  const removeSubjectMutation = useRemoveSubjectFromProgram();
  const isDeleting = removeSubjectMutation.isPending;

  React.useEffect(() => {
    if (!open) {
      // Reset any internal state if needed
    }
  }, [open]);

  if (!subject) return null;

  const handleDelete = async () => {
    removeSubjectMutation.mutate(
      {
        programId: programId,
        subjectId: subject.subject_id,
        force: (subject.Subject?.Courses?.length || 0) > 0,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess?.();
        },
      }
    );
  };

  const hasCourses =
    subject.Subject?.Courses && subject.Subject.Courses.length > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Xác nhận xóa môn học
          </AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này sẽ gỡ bỏ môn học khỏi chương trình đào tạo.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Subject Info */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{subject.Subject?.name}</span>
              <Badge variant="outline">ID: {subject.subject_id}</Badge>
            </div>

            {subject.Subject?.code && (
              <div className="text-sm text-muted-foreground">
                Mã: {subject.Subject.code}
              </div>
            )}
          </div>

          {/* Warning about related data */}
          {hasCourses && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-destructive">
                    Cảnh báo: Dữ liệu liên quan sẽ bị ảnh hưởng
                  </p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      • {subject.Subject.Courses.length} Khóa học liên quan
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? (
              "Đang xóa..."
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa môn học
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
