"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Edit, Trash2, Download, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/forms";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/overlay";

import type { TrainingBatchWithRelations } from "@/lib/types/training-batch";
import { useDeleteTrainingBatch } from "@/lib/hooks/use-training-batches";
import { TrainingBatchDeleteDialog } from "./training-batch-delete-dialog";

interface TrainingBatchActionsProps {
  batch: TrainingBatchWithRelations;
  onUpdate?: () => void;
  variant?: "dropdown" | "buttons";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function TrainingBatchActions({
  batch,
  onUpdate,
  variant = "dropdown",
  size = "default",
  className,
}: TrainingBatchActionsProps) {
  const router = useRouter();
  const deleteMutation = useDeleteTrainingBatch();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Action handlers
  const handleView = () => {
    router.push(`/dashboard/admin/training-batches/${batch.batch_id}`);
  };

  const handleEdit = () => {
    router.push(`/dashboard/admin/training-batches/${batch.batch_id}/edit`);
  };

  const handleDelete = async () => {
    deleteMutation.mutate(batch.batch_id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        onUpdate?.();
      },
    });
  };

  const handleExport = () => {
    // Simple export implementation
    const exportData = { ...batch };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `training-batch-${batch.batch_id}-${batch.name.replace(
      /\s+/g,
      "-"
    )}.json`;
    link.click();

    // Clean up
    document.body.appendChild(link);
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (variant === "buttons") {
    return (
      <>
        <div className="flex gap-2">
          <Button variant="outline" size={size} onClick={handleView}>
            <Eye className="h-4 w-4 mr-2" />
            Xem
          </Button>
          <Button variant="default" size={size} onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Sửa
          </Button>
          <Button
            variant="destructive"
            size={size}
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa
          </Button>
        </div>
        <TrainingBatchDeleteDialog
          batch={batch}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onSuccess={handleDelete}
        />
      </>
    );
  }

  // Dropdown variant
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={className}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleView}>
            <Eye className="h-4 w-4 mr-2" />
            Xem chi tiết
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Xuất dữ liệu
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa khóa đào tạo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <TrainingBatchDeleteDialog
        batch={batch}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={handleDelete}
      />
    </>
  );
}
