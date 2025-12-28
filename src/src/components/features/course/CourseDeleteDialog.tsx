"use client";

import React from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/feedback";
import { Button } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";

import { useDeleteCourse } from "@/lib/hooks/use-courses";
import type { Course, CourseWithRelations } from "@/lib/types/course";

interface CourseDeleteDialogProps {
  course: Course | CourseWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CourseDeleteDialog({
  course,
  open,
  onOpenChange,
  onSuccess,
}: CourseDeleteDialogProps) {
  const deleteCourse = useDeleteCourse();

  if (!course) return null;

  const hasRelatedData = "_count" in course || "Subjects" in course;
  const relatedCounts = "_count" in course ? course._count : undefined;

  const handleDelete = async () => {
    deleteCourse.mutate(course.course_id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Xác nhận xóa khóa học
          </DialogTitle>
          <DialogDescription>
            Hành động này không thể hoàn tác. Khóa học và tất cả dữ liệu liên
            quan sẽ bị xóa vĩnh viễn.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Course Info */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{course.name}</span>
              <Badge variant="outline">ID: {course.course_id}</Badge>
            </div>

            {course.code && (
              <div className="text-sm text-muted-foreground">
                Mã: {course.code}
              </div>
            )}

            {course.description && (
              <div className="text-sm text-muted-foreground">
                {course.description}
              </div>
            )}

            {/* Course Details */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {course.credits && <span>Tín chỉ: {course.credits}</span>}
              {course.semester && course.year && (
                <span>
                  HK{course.semester}/{course.year}
                </span>
              )}
              {"Program" in course && course.Program && (
                <span>CT: {course.Program.name}</span>
              )}
            </div>
          </div>

          {/* Warning about related data */}
          {hasRelatedData && relatedCounts && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-destructive">
                    Cảnh báo: Dữ liệu liên quan sẽ bị xóa
                  </p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {relatedCounts.Subjects > 0 && (
                      <div>• {relatedCounts.Subjects} môn học</div>
                    )}
                    {relatedCounts.Students > 0 && (
                      <div>• {relatedCounts.Students} sinh viên đã đăng ký</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subjects warning for CourseWithRelations */}
          {"Subjects" in course &&
            course.Subjects &&
            course.Subjects.length > 0 && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-destructive">
                      Cảnh báo: Dữ liệu liên quan sẽ bị xóa
                    </p>
                    <div className="text-sm text-muted-foreground">
                      • {course.Subjects.length} môn học liên quan
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteCourse.isPending}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteCourse.isPending}
            className="min-w-[100px]"
          >
            {deleteCourse.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang xóa...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa khóa học
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
