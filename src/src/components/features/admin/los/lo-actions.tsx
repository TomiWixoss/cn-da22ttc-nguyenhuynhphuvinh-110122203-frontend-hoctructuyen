// frontend/src/components/features/admin/los/lo-actions.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/overlay";
import { Button } from "@/components/ui/forms";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { loService } from "@/lib/services/api";
import type { LOWithRelations } from "@/lib/types/lo";
import { LODeleteDialog } from "./lo-delete-dialog";

interface LOActionsProps {
  lo: LOWithRelations;
  programId?: number; // Thêm programId optional
  subjectId?: number; // Thêm subjectId optional
  onUpdate?: () => void;
}

export function LOActions({
  lo,
  programId,
  subjectId,
  onUpdate,
}: LOActionsProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleView = () => {
    // Nếu có đầy đủ programId và subjectId, sử dụng cấu trúc phân cấp
    if (programId && subjectId) {
      router.push(
        `/dashboard/admin/programs/${programId}/subjects/${subjectId}/los/${lo.lo_id}`
      );
    } else {
      // Fallback về cấu trúc cũ nếu không có đầy đủ params
      router.push(`/dashboard/admin/los/${lo.lo_id}`);
    }
  };

  const handleEdit = () => {
    if (programId && subjectId) {
      router.push(
        `/dashboard/admin/programs/${programId}/subjects/${subjectId}/los/${lo.lo_id}/edit`
      );
    } else {
      router.push(`/dashboard/admin/los/${lo.lo_id}/edit`);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await loService.deleteLO(lo.lo_id);
      toast.success("Xóa chuẩn đầu ra thành công!");
      onUpdate?.();
    } catch (error) {
      console.error("❌ [API] Error deleting LO:", error);
      toast.error("Xóa chuẩn đầu ra thất bại. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" /> Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LODeleteDialog
        lo={lo}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}
