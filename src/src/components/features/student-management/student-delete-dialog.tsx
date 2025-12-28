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

import { useRemoveStudentFromCourse } from "@/lib/hooks/use-teaching";

interface StudentDeleteDialogProps {
  student: any | null;
  courseId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function StudentDeleteDialog({
  student,
  courseId,
  open,
  onOpenChange,
  onSuccess,
}: StudentDeleteDialogProps) {
  const removeStudentMutation = useRemoveStudentFromCourse();
  const isDeleting = removeStudentMutation.isPending;

  React.useEffect(() => {
    if (!open) {
      // Reset any internal state if needed
    }
  }, [open]);

  if (!student) return null;

  const handleDelete = async () => {
    removeStudentMutation.mutate(
      {
        studentId: student.user_id,
        courseId: courseId,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess?.();
        },
      }
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Xác nhận xóa sinh viên
          </AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này sẽ hủy đăng ký sinh viên khỏi khóa học.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Student Info */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {student.student_name || "N/A"}
              </span>
              <Badge variant="outline">
                Mã: {student.student_code || "N/A"}
              </Badge>
            </div>

            {student.email && (
              <div className="text-sm text-muted-foreground">
                Email: {student.email}
              </div>
            )}

            {student.enrollment_date && (
              <div className="text-sm text-muted-foreground">
                Ngày đăng ký:{" "}
                {new Date(student.enrollment_date).toLocaleDateString("vi-VN")}
              </div>
            )}
          </div>
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
                Xóa sinh viên
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
