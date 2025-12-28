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

import type {
  TrainingBatch,
  TrainingBatchWithRelations,
} from "@/lib/types/training-batch";
import { useDeleteTrainingBatch } from "@/lib/hooks/use-training-batches";

interface TrainingBatchDeleteDialogProps {
  batch: TrainingBatch | TrainingBatchWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TrainingBatchDeleteDialog({
  batch,
  open,
  onOpenChange,
  onSuccess,
}: TrainingBatchDeleteDialogProps) {
  const deleteMutation = useDeleteTrainingBatch();
  const isDeleting = deleteMutation.isPending;

  React.useEffect(() => {
    if (!open) {
      // Reset any internal state if needed
    }
  }, [open]);

  if (!batch) return null;

  const hasRelatedData = "_count" in batch;
  const relatedCounts = "_count" in batch ? batch._count : undefined;

  const handleDelete = async () => {
    deleteMutation.mutate(batch.batch_id, {
      onSuccess: () => {
        onOpenChange(false);
        onSuccess?.();
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Xác nhận xóa khóa đào tạo
          </AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Khóa đào tạo và tất cả dữ liệu
            liên quan sẽ bị xóa vĩnh viễn.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Batch Info */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{batch.name}</span>
              <Badge variant="outline">ID: {batch.batch_id}</Badge>
            </div>

            <div className="text-sm text-muted-foreground">
              Niên khóa: {batch.start_year} - {batch.end_year}
            </div>

            {batch.description && (
              <div className="text-sm text-muted-foreground">
                {batch.description}
              </div>
            )}
          </div>

          {/* Warning about related data */}
          {hasRelatedData &&
            relatedCounts &&
            (relatedCounts.Semesters > 0 ||
              relatedCounts.TeacherAssignments > 0 ||
              relatedCounts.Courses > 0) && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-destructive">
                      Cảnh báo: Dữ liệu liên quan cũng sẽ bị ảnh hưởng
                    </p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {relatedCounts.Semesters > 0 && (
                        <div>• {relatedCounts.Semesters} Học kỳ</div>
                      )}
                      {relatedCounts.TeacherAssignments > 0 && (
                        <div>
                          • {relatedCounts.TeacherAssignments} Phân công
                        </div>
                      )}
                      {relatedCounts.Courses > 0 && (
                        <div>• {relatedCounts.Courses} Lớp học</div>
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
                Xóa khóa đào tạo
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
