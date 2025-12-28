"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Calendar,
  Users,
  Target,
  GraduationCap,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Archive,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/overlay";

import { showErrorToast, showSuccessToast } from "@/lib/utils/toast-utils";
import type { TrainingBatchWithRelations } from "@/lib/types/training-batch";
import { useDeleteTrainingBatch } from "@/lib/hooks/use-training-batches";
import { TrainingBatchDeleteDialog } from "./training-batch-delete-dialog";

interface TrainingBatchCardProps {
  batch: TrainingBatchWithRelations;
  onUpdate?: () => void;
  className?: string;
}

export function TrainingBatchCard({
  batch,
  onUpdate,
  className,
}: TrainingBatchCardProps) {
  const router = useRouter();
  const deleteMutation = useDeleteTrainingBatch();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  // Handle actions
  const handleView = () => {
    router.push(`/dashboard/admin/training-batches/${batch.batch_id}`);
  };

  const handleEdit = () => {
    router.push(`/dashboard/admin/training-batches/${batch.batch_id}/edit`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <Card
        className={`${className} cursor-pointer border-2 hover:border-primary/60`}
        onClick={handleView}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Archive className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg leading-tight hover:text-primary transition-colors">
                  {batch.name}
                </CardTitle>
                {batch.Program?.name && (
                  <CardDescription className="mt-1 flex items-center gap-1 text-xs">
                    <BookOpen className="h-3 w-3" />
                    {batch.Program.name}
                  </CardDescription>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDeleteClick}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          {batch.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {batch.description}
            </p>
          )}

          {/* Academic Year */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              Niên khóa: {batch.start_year} - {batch.end_year}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog - Outside Card to prevent click propagation */}
      <TrainingBatchDeleteDialog
        batch={batch}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={onUpdate}
      />
    </>
  );
}
