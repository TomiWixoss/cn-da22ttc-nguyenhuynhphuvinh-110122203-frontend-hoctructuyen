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

import type { ProgramWithRelations } from "@/lib/types/program-management";
import { useDeleteProgram } from "@/lib/hooks/use-programs";

interface ProgramDeleteDialogProps {
  program: ProgramWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ProgramDeleteDialog({
  program,
  open,
  onOpenChange,
  onSuccess,
}: ProgramDeleteDialogProps) {
  const deleteMutation = useDeleteProgram();
  const isDeleting = deleteMutation.isPending;

  React.useEffect(() => {
    if (!open) {
      // Reset any internal state if needed
    }
  }, [open]);

  if (!program) return null;

  const handleDelete = async () => {
    deleteMutation.mutate(program.program_id, {
      onSuccess: () => {
        onOpenChange(false);
        onSuccess?.();
      },
    });
  };

  const hasPOs = program.POs && program.POs.length > 0;
  const hasPLOs = program.PLOs && program.PLOs.length > 0;
  const hasCourses = program.Courses && program.Courses.length > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Xác nhận xóa chương trình đào tạo
          </AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Chương trình đào tạo và tất cả dữ
            liệu liên quan sẽ bị xóa vĩnh viễn.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Program Info */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{program.name}</span>
              <Badge variant="outline">ID: {program.program_id}</Badge>
            </div>

            {program.description && (
              <div className="text-sm text-muted-foreground">
                {program.description}
              </div>
            )}
          </div>

          {/* Warning about related data */}
          {(hasPOs || hasPLOs || hasCourses) && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-destructive">
                    Cảnh báo: Dữ liệu liên quan sẽ bị xóa
                  </p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {hasPOs && <div>• {program.POs?.length} POs</div>}
                    {hasPLOs && <div>• {program.PLOs?.length} PLOs</div>}
                    {hasCourses && (
                      <div>• {program.Courses?.length} Khóa học</div>
                    )}
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
                Xóa chương trình
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
