"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/feedback/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/overlay/alert-dialog";
import { Button } from "@/components/ui/forms";
import { Checkbox } from "@/components/ui/forms";
import { Badge, Skeleton } from "@/components/ui/feedback";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { ScrollArea } from "@/components/ui/layout/scroll-area";
import {
  Search,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Unlink,
  Trash2,
  Play,
  FileCheck,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import { courseGradeService } from "@/lib/services/api/course-grade.service";
import type { GradeColumnWithRelations } from "@/lib/types/course-grade";

interface QuizUnassignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column: GradeColumnWithRelations | null;
  courseId: number;
  onUnassignComplete: () => void;
}

export function QuizUnassignDialog({
  open,
  onOpenChange,
  column,
  courseId,
  onUnassignComplete,
}: QuizUnassignDialogProps) {
  const [selectedQuizIds, setSelectedQuizIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"selected" | "all" | null>(
    null
  );

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSelectedQuizIds([]);
      setSearchTerm("");
    } else {
      setSelectedQuizIds([]);
      setSearchTerm("");
    }
  }, [open]);

  // Get assigned quizzes from column data
  const assignedQuizzes = (column?.Quizzes || []).filter(
    (quiz) =>
      quiz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.Course?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuizToggle = (quizId: number) => {
    setSelectedQuizIds((prev) => {
      if (prev.includes(quizId)) {
        return prev.filter((id) => id !== quizId);
      } else {
        return [...prev, quizId];
      }
    });
  };

  const handleSelectAll = () => {
    const allQuizIds = assignedQuizzes.map((q) => q.quiz_id);
    setSelectedQuizIds(allQuizIds);
  };

  const handleDeselectAll = () => {
    setSelectedQuizIds([]);
  };

  // Custom close handler to ensure state reset
  const handleClose = () => {
    setSelectedQuizIds([]);
    setSearchTerm("");
    onOpenChange(false);
  };

  const handleUnassignSelected = () => {
    if (!column || selectedQuizIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một quiz để gỡ");
      return;
    }
    setConfirmAction("selected");
    setConfirmDialogOpen(true);
  };

  const handleUnassignAll = () => {
    if (!column || assignedQuizzes.length === 0) return;
    setConfirmAction("all");
    setConfirmDialogOpen(true);
  };

  const executeUnassign = async () => {
    if (!column) return;

    try {
      setLoading(true);
      setConfirmDialogOpen(false);

      if (confirmAction === "selected") {
        const response = await courseGradeService.unassignQuizzesFromColumn(
          courseId,
          column.column_id,
          { quiz_ids: selectedQuizIds }
        );

        if (response.success) {
          toast.success(
            `Đã gỡ ${response.data.unassigned_quizzes} quiz thành công`
          );
          onUnassignComplete();
          handleClose();
        } else {
          toast.error("Không thể gỡ quiz");
        }
      } else if (confirmAction === "all") {
        const response = await courseGradeService.unassignAllQuizzesFromColumn(
          courseId,
          column.column_id
        );

        if (response.success) {
          toast.success(
            `Đã gỡ tất cả ${response.data.unassigned_quizzes} quiz thành công`
          );
          onUnassignComplete();
          handleClose();
        } else {
          toast.error("Không thể gỡ tất cả quiz");
        }
      }
    } catch (error) {
      console.error("Error unassigning quizzes:", error);
      toast.error("Lỗi khi gỡ quiz");
    } finally {
      setLoading(false);
      setConfirmAction(null);
    }
  };

  const getQuizStatusIcon = (quiz: any) => {
    switch (quiz.status) {
      case "active":
        return <Play className="h-4 w-4 text-green-500" />;
      case "finished":
        return <FileCheck className="h-4 w-4 text-blue-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "finished":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "secondary";
    }
  };

  const QuizCard = ({ quiz }: { quiz: any }) => {
    const isSelected = selectedQuizIds.includes(quiz.quiz_id);

    return (
      <div
        className={`p-3 border rounded-lg cursor-pointer transition-all ${
          isSelected
            ? "border-red-500 bg-red-50 dark:bg-red-950/30"
            : "hover:bg-muted/20 border-border hover:border-red-300"
        }`}
        onClick={() => handleQuizToggle(quiz.quiz_id)}
      >
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => handleQuizToggle(quiz.quiz_id)}
            className="h-4 w-4"
          />
          <h4 className="font-medium text-sm truncate flex-1">{quiz.name}</h4>
          {quiz.weight_percentage && (
            <span className="text-sm text-muted-foreground font-medium">
              {quiz.weight_percentage}%
            </span>
          )}
        </div>
      </div>
    );
  };

  if (!column) return null;

  const getConfirmMessage = () => {
    if (confirmAction === "selected") {
      return `Bạn có chắc chắn muốn gỡ ${selectedQuizIds.length} quiz đã chọn?`;
    } else if (confirmAction === "all") {
      return `Bạn có chắc chắn muốn gỡ tất cả ${assignedQuizzes.length} quiz đã gán?`;
    }
    return "";
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[92vh] flex flex-col p-6">
          <DialogHeader className="pb-4 space-y-2">
            <DialogTitle className="text-xl font-semibold">
              Gỡ Quiz ← {column.column_name}
            </DialogTitle>
            <DialogDescription className="text-sm">
              Chọn quiz để gỡ khỏi cột điểm. Điểm số sẽ được cập nhật lại.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-3 overflow-hidden">
            {/* Search and Controls */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Tìm quiz..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border rounded-md focus:outline-none"
                />
              </div>
              <span className="text-sm text-muted-foreground whitespace-nowrap min-w-[70px]">
                {assignedQuizzes.length} quiz
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSelectAll}
                disabled={assignedQuizzes.length === 0}
                className="h-9 px-4 text-sm"
              >
                Chọn tất cả
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDeselectAll}
                disabled={selectedQuizIds.length === 0}
                className="h-9 px-4 text-sm"
              >
                Bỏ chọn
              </Button>
            </div>

            {/* Assigned Quizzes */}
            <ScrollArea className="h-[550px]">
              <div className="pr-4">
                {assignedQuizzes.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p className="text-base">
                      {searchTerm ? "Không tìm thấy quiz" : "Chưa có quiz nào"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 pb-2">
                    {assignedQuizzes.map((quiz) => (
                      <QuizCard key={quiz.quiz_id} quiz={quiz} />
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter className="flex items-center justify-between pt-4 border-t mt-2">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground font-medium">
                {selectedQuizIds.length} quiz đã chọn
              </span>
              <Button
                variant="destructive"
                size="default"
                onClick={handleUnassignAll}
                disabled={loading || assignedQuizzes.length === 0}
                className="h-9 px-4"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Gỡ tất cả
              </Button>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                size="default"
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleUnassignSelected}
                disabled={loading || selectedQuizIds.length === 0}
                size="default"
              >
                {loading ? "Đang gỡ..." : "Gỡ đã chọn"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle className="text-lg">
                Xác nhận gỡ quiz
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm pt-2">
              {getConfirmMessage()}
              <br />
              <span className="text-muted-foreground">
                Điểm số của sinh viên sẽ được cập nhật lại sau khi gỡ.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeUnassign}
              disabled={loading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {loading ? "Đang gỡ..." : "Xác nhận gỡ"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
