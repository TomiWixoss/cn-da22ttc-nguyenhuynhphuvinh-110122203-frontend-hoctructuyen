"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/forms";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/feedback/confirm-dialog";
import { useRemoveSubjectFromProgram } from "@/lib/hooks/use-subjects";
import { DropdownMenuItem } from "@/components/ui/overlay";

interface ProgramSubjectActionsProps {
  programId: number;
  subjectId: number;
  hasCourse?: boolean;
  dropdownMode?: boolean;
}

export function ProgramSubjectActions({
  programId,
  subjectId,
  hasCourse,
  dropdownMode = false,
}: ProgramSubjectActionsProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [forceDelete, setForceDelete] = useState(false);
  const removeSubjectMutation = useRemoveSubjectFromProgram();

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Delay để tránh conflict với dropdown close
    setTimeout(() => {
      setShowConfirm(true);
    }, 100);
  };

  const handleDelete = () => {
    removeSubjectMutation.mutate(
      { programId, subjectId, force: forceDelete },
      {
        onSuccess: () => {
          setShowConfirm(false);
          setForceDelete(false);
        },
        onError: (error: any) => {
          // Nếu có lỗi do có course liên kết, cho phép force delete
          if (error.response?.status === 400 && hasCourse) {
            setForceDelete(true);
          }
        },
      }
    );
  };

  const confirmMessage = forceDelete
    ? `Môn học này đã có khóa học liên kết. Bạn có chắc chắn muốn gỡ bỏ môn học khỏi chương trình? Điều này có thể ảnh hưởng đến dữ liệu liên quan.`
    : `Bạn có chắc chắn muốn gỡ môn học này khỏi chương trình?`;

  if (dropdownMode) {
    return (
      <>
        <DropdownMenuItem
          onClick={handleDeleteClick}
          className="text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Xóa
        </DropdownMenuItem>

        <ConfirmDialog
          open={showConfirm}
          onOpenChange={setShowConfirm}
          title={forceDelete ? "Xác nhận gỡ bỏ (Force)" : "Xác nhận gỡ bỏ"}
          description={confirmMessage}
          onConfirm={handleDelete}
          loading={removeSubjectMutation.isPending}
          confirmText={forceDelete ? "Gỡ bỏ" : "Xác nhận"}
          variant="destructive"
        />
      </>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDeleteClick}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title={forceDelete ? "Xác nhận gỡ bỏ (Force)" : "Xác nhận gỡ bỏ"}
        description={confirmMessage}
        onConfirm={handleDelete}
        loading={removeSubjectMutation.isPending}
        confirmText={forceDelete ? "Gỡ bỏ" : "Xác nhận"}
        variant="destructive"
      />
    </>
  );
}
