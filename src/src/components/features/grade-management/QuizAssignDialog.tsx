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
import { Button, Input, Label } from "@/components/ui/forms";
import { Checkbox } from "@/components/ui/forms";
import { Badge, Skeleton } from "@/components/ui/feedback";
import { Slider } from "@/components/ui/forms/slider";
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
  Link as LinkIcon,
  ArrowRight,
  ArrowLeft,
  Play,
  FileCheck,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

import { courseGradeService } from "@/lib/services/api/course-grade.service";
import type {
  GradeColumnWithRelations,
  AvailableQuiz,
  QuizAssignmentWithWeight,
} from "@/lib/types/course-grade";

interface QuizAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column: GradeColumnWithRelations | null;
  availableQuizzes: AvailableQuiz[];
  courseId: number;
  onAssignmentComplete: () => void;
}

export function QuizAssignDialog({
  open,
  onOpenChange,
  column,
  availableQuizzes,
  courseId,
  onAssignmentComplete,
}: QuizAssignDialogProps) {
  const [selectedQuizIds, setSelectedQuizIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentStep, setCurrentStep] = useState<"select" | "weight">("select");

  // New state for weight management
  const [useWeights, setUseWeights] = useState(false);
  const [quizWeights, setQuizWeights] = useState<Record<number, number>>({});

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      // Reset all state when dialog opens
      setSelectedQuizIds([]);
      setUseWeights(false);
      setQuizWeights({});
      setSearchTerm("");
      setCurrentStep("select");
    } else {
      // Reset state when dialog closes
      setSelectedQuizIds([]);
      setUseWeights(false);
      setQuizWeights({});
      setSearchTerm("");
      setCurrentStep("select");
    }
  }, [open, column]);

  // Filter quizzes based on search term and only show finished quizzes
  // Only show quizzes that are not currently assigned to this column
  const currentlyAssignedIds =
    column?.Quizzes?.map((quiz) => quiz.quiz_id) || [];
  const filteredQuizzes = (availableQuizzes || []).filter(
    (quiz) =>
      quiz.status === "finished" && // Only show finished quizzes
      !currentlyAssignedIds.includes(quiz.quiz_id) && // Exclude already assigned quizzes
      (quiz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.Course?.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleQuizToggle = (quizId: number) => {
    setSelectedQuizIds((prev) => {
      if (prev.includes(quizId)) {
        return prev.filter((id) => id !== quizId);
      } else {
        return [...prev, quizId];
      }
    });

    // Initialize weight if using weights and quiz is selected
    if (useWeights && !selectedQuizIds.includes(quizId)) {
      setQuizWeights((prev) => ({
        ...prev,
        [quizId]: 0,
      }));
    }
  };

  // Handle weight change for a specific quiz
  const handleWeightChange = (quizId: number, weight: number) => {
    setQuizWeights((prev) => ({
      ...prev,
      [quizId]: weight,
    }));
  };

  // Auto-distribute weights evenly
  const handleAutoDistribute = () => {
    if (selectedQuizIds.length === 0) return;

    const evenWeight = Math.round(100 / selectedQuizIds.length);
    const newWeights: Record<number, number> = {};

    selectedQuizIds.forEach((quizId, index) => {
      if (index === selectedQuizIds.length - 1) {
        // Last quiz gets the remainder to ensure total = 100%
        const usedWeight = (selectedQuizIds.length - 1) * evenWeight;
        newWeights[quizId] = 100 - usedWeight;
      } else {
        newWeights[quizId] = evenWeight;
      }
    });

    setQuizWeights(newWeights);
  };

  // Calculate total weight
  const getTotalWeight = () => {
    return selectedQuizIds.reduce((sum, quizId) => {
      return sum + (quizWeights[quizId] || 0);
    }, 0);
  };

  // Custom close handler to ensure state reset
  const handleClose = () => {
    setSelectedQuizIds([]);
    setUseWeights(false);
    setQuizWeights({});
    setSearchTerm("");
    setCurrentStep("select");
    onOpenChange(false);
  };

  const handleNextStep = () => {
    if (selectedQuizIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một quiz");
      return;
    }

    // Initialize weights for selected quizzes
    const initialWeights: Record<number, number> = {};
    const evenWeight = Math.round(100 / selectedQuizIds.length);

    selectedQuizIds.forEach((quizId, index) => {
      if (index === selectedQuizIds.length - 1) {
        initialWeights[quizId] =
          100 - (selectedQuizIds.length - 1) * evenWeight;
      } else {
        initialWeights[quizId] = evenWeight;
      }
    });

    setQuizWeights(initialWeights);
    setUseWeights(true);
    setCurrentStep("weight");
  };

  const handleBackStep = () => {
    setCurrentStep("select");
  };

  const handleSelectAll = (quizzes: AvailableQuiz[]) => {
    const quizIds = quizzes.map((q) => q.quiz_id);
    setSelectedQuizIds((prev) => {
      const newIds = [...prev];
      quizIds.forEach((id) => {
        if (!newIds.includes(id)) {
          newIds.push(id);
        }
      });
      return newIds;
    });
  };

  const handleDeselectAll = () => {
    setSelectedQuizIds([]);
  };

  const handleSubmit = async () => {
    if (!column || selectedQuizIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một quiz để gán");
      return;
    }

    try {
      setLoading(true);

      // Prepare quiz assignments with weights if enabled
      const quizAssignments: QuizAssignmentWithWeight[] = selectedQuizIds.map(
        (quizId) => {
          const assignment: QuizAssignmentWithWeight = { quiz_id: quizId };

          // Only add weight_percentage if using weights and value is valid
          if (useWeights && quizWeights[quizId] && quizWeights[quizId] > 0) {
            assignment.weight_percentage = quizWeights[quizId];
          }

          return assignment;
        }
      );

      // Validate total weight if using weights
      if (useWeights) {
        const totalWeight = Object.values(quizWeights).reduce(
          (sum, weight) => sum + (weight || 0),
          0
        );
        if (Math.abs(totalWeight - 100) > 0.01) {
          toast.error(
            `Tổng tỷ lệ phần trăm phải bằng 100%. Hiện tại: ${totalWeight}%`
          );
          return;
        }
      }

      const response = await courseGradeService.assignQuizzesToColumn(
        courseId,
        column.column_id,
        { quiz_assignments: quizAssignments }
      );

      if (response.success) {
        toast.success(`Đã gán ${selectedQuizIds.length} quiz thành công`);
        onAssignmentComplete();
        handleClose();
      } else {
        toast.error("Không thể gán quiz");
      }
    } catch (error) {
      console.error("Error assigning quizzes:", error);
      toast.error("Lỗi khi gán quiz");
    } finally {
      setLoading(false);
    }
  };

  const getQuizStatusIcon = (quiz: AvailableQuiz) => {
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

  const QuizCard = ({ quiz }: { quiz: AvailableQuiz }) => {
    const isSelected = selectedQuizIds.includes(quiz.quiz_id);

    return (
      <div
        className={`p-3 border rounded-lg cursor-pointer transition-all ${
          isSelected
            ? "border-primary bg-primary/5"
            : "hover:bg-muted/20 border-border hover:border-primary/30"
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
        </div>
      </div>
    );
  };

  if (!column) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[92vh] flex flex-col p-6">
        <DialogHeader className="pb-4 space-y-2">
          <DialogTitle className="text-xl font-semibold">
            Gán Quiz → {column.column_name}
            {currentStep === "weight" && (
              <span className="text-base font-normal text-muted-foreground ml-3">
                (Thiết lập tỷ lệ)
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {currentStep === "select" ? (
              <>Chọn quiz đã kết thúc để gán vào cột điểm</>
            ) : (
              <>Thiết lập tỷ lệ điểm cho mỗi quiz (tổng = 100%)</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-3 overflow-hidden">
          {currentStep === "select" ? (
            <>
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
                  {filteredQuizzes.length} quiz
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSelectAll(filteredQuizzes)}
                  disabled={filteredQuizzes.length === 0}
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

              {/* Available Quizzes Grid */}
              <ScrollArea className="h-[550px]">
                <div className="pr-4">
                  {filteredQuizzes.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
                      <p className="text-base">
                        {searchTerm
                          ? "Không tìm thấy quiz"
                          : "Không có quiz khả dụng"}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 pb-2">
                      {filteredQuizzes.map((quiz) => (
                        <QuizCard key={quiz.quiz_id} quiz={quiz} />
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <>
              {/* Weight Management */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <span className="text-base font-medium">
                  {selectedQuizIds.length} quiz
                </span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAutoDistribute}
                    className="h-9 px-4 text-sm"
                  >
                    Phân bổ đều
                  </Button>
                  <span className="text-base font-semibold">
                    Tổng:{" "}
                    <span
                      className={
                        Math.abs(getTotalWeight() - 100) > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }
                    >
                      {getTotalWeight()}%
                    </span>
                  </span>
                </div>
              </div>

              <ScrollArea className="h-[550px]">
                <div className="grid grid-cols-2 gap-3 pr-4">
                  {selectedQuizIds.map((quizId) => {
                    const quiz = availableQuizzes.find(
                      (q) => q.quiz_id === quizId
                    );
                    const currentWeight = quizWeights[quizId] || 0;

                    return (
                      <div
                        key={quizId}
                        className="p-4 bg-card rounded-lg border"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-sm font-medium truncate flex-1 mr-3">
                            {quiz?.name || `Quiz ${quizId}`}
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              value={currentWeight || ""}
                              onChange={(e) =>
                                handleWeightChange(
                                  quizId,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-16 h-8 text-sm text-center p-1"
                              placeholder="0"
                            />
                            <span className="text-sm font-medium">%</span>
                          </div>
                        </div>
                        <Slider
                          value={[currentWeight]}
                          onValueChange={(value) =>
                            handleWeightChange(quizId, value[0])
                          }
                          max={100}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between pt-4 border-t mt-2">
          <span className="text-sm text-muted-foreground font-medium">
            {currentStep === "select"
              ? `${selectedQuizIds.length} quiz đã chọn`
              : `Tổng: ${getTotalWeight()}%`}
          </span>
          <div className="flex gap-3">
            {currentStep === "weight" && (
              <Button
                variant="outline"
                onClick={handleBackStep}
                disabled={loading}
                size="default"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              size="default"
            >
              Hủy
            </Button>
            {currentStep === "select" ? (
              <Button
                onClick={handleNextStep}
                disabled={selectedQuizIds.length === 0}
                size="default"
              >
                Tiếp theo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={
                  loading ||
                  selectedQuizIds.length === 0 ||
                  Math.abs(getTotalWeight() - 100) > 0
                }
                size="default"
              >
                {loading ? "Đang gán..." : "Gán quiz"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
