"use client";

import { useState, useEffect } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { CreateQuizFormData, LO } from "@/lib/types/quiz";
import { loService } from "@/lib/services/api";
import { AssignmentService } from "@/lib/services/api/assignment.service";
import { useAssignmentContext } from "@/lib/contexts/assignment-context";
import { Checkbox } from "@/components/ui/forms";
import { ScrollArea } from "@/components/ui/layout";
import { Loader2, CheckCircle2, XCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/feedback";
import { Button } from "@/components/ui/forms";
import { cn } from "@/lib/utils";

interface QuizLoSelectionProps {
  courseId: number;
  form: UseFormReturn<CreateQuizFormData>;
}

export function QuizLoSelection({ courseId, form }: QuizLoSelectionProps) {
  const [los, setLos] = useState<LO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentAssignmentId, assignments } = useAssignmentContext();

  // Theo dõi giá trị được chọn
  const selectedLOs = useWatch({
    control: form.control,
    name: "question_criteria.loIds",
    defaultValue: [],
  });

  // Tự động xóa lỗi khi người dùng đã chọn đủ mục tiêu
  useEffect(() => {
    if (selectedLOs && selectedLOs.length > 0) {
      form.clearErrors("question_criteria.loIds");
    }
  }, [selectedLOs, form]);

  // Lấy danh sách mục tiêu học tập theo môn học từ phân công
  useEffect(() => {
    const fetchLOsByAssignment = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!currentAssignmentId) {
          setError("Chưa có phân công được chọn");
          setLos([]);
          return;
        }

        // Lấy thông tin assignment để biết subject_id
        let currentAssignment = assignments.find(
          (a) => a.assignment_id.toString() === currentAssignmentId
        );

        // Nếu không tìm thấy trong context, lấy từ API
        if (!currentAssignment) {
          const assignmentResponse = await AssignmentService.getAssignmentById(
            parseInt(currentAssignmentId)
          );
          if (assignmentResponse.success && assignmentResponse.data) {
            currentAssignment = assignmentResponse.data;
          }
        }

        if (!currentAssignment?.subject_id) {
          setError("Không tìm thấy thông tin môn học trong phân công");
          setLos([]);
          return;
        }

        // Lấy LOs theo subject_id
        const response = await loService.getLOsBySubject(
          currentAssignment.subject_id,
          false // không cần include questions
        );

        if (
          response?.success &&
          response?.data &&
          Array.isArray(response.data.los)
        ) {
          setLos(response.data.los);
        } else {
          console.error("Dữ liệu LOs không đúng định dạng hoặc rỗng", response);
          setError("Không thể tải dữ liệu mục tiêu học tập");
          setLos([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách mục tiêu học tập:", {
          error,
          currentAssignmentId,
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        });
        setError("Đã xảy ra lỗi khi tải dữ liệu mục tiêu học tập");
        setLos([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentAssignmentId) {
      fetchLOsByAssignment();
    }
  }, [currentAssignmentId, assignments]);

  // Xử lý chọn/bỏ chọn mục tiêu học tập
  const handleToggleLO = (loId: number) => {
    const currentLOs = form.getValues("question_criteria.loIds") || [];
    const newSelected = currentLOs.includes(loId)
      ? currentLOs.filter((id) => id !== loId)
      : [...currentLOs, loId];

    form.setValue("question_criteria.loIds", newSelected);

    if (newSelected.length > 0) {
      form.clearErrors("question_criteria.loIds");
    }
  };

  // Xử lý chọn tất cả
  const handleSelectAll = () => {
    const allLOIds = los.map((lo) => lo.lo_id);
    form.setValue("question_criteria.loIds", allLOIds);
    form.clearErrors("question_criteria.loIds");
  };

  // Xử lý bỏ chọn tất cả
  const handleDeselectAll = () => {
    form.setValue("question_criteria.loIds", []);
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="p-6">
          <div className="flex flex-col space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
              <Badge
                variant="outline"
                className="bg-primary/5 px-2 py-1 h-auto text-xs sm:text-sm"
              >
                {selectedLOs.length} / {los.length} được chọn
              </Badge>

              <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={los.length === 0}
                  className="h-8 text-xs flex-1 sm:flex-none sm:text-sm cursor-pointer"
                >
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                  Chọn tất cả
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  disabled={selectedLOs.length === 0}
                  className="h-8 text-xs flex-1 sm:flex-none sm:text-sm cursor-pointer"
                >
                  <XCircle className="mr-1 h-3.5 w-3.5" />
                  Bỏ chọn
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-5 sm:py-6">
                <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                <span className="text-sm">Đang tải dữ liệu...</span>
              </div>
            ) : error ? (
              <div className="py-5 sm:py-6 text-center">
                <Info className="h-5 w-5 sm:h-6 sm:w-6 text-destructive mx-auto mb-2" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            ) : los.length === 0 ? (
              <div className="py-5 sm:py-6 text-center">
                <Info className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Không có mục tiêu học tập nào cho môn học này
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-none">
                {los.map((lo) => (
                  <div
                    key={lo.lo_id}
                    className={cn(
                      "rounded-lg border p-4 transition-all duration-200 cursor-pointer",
                      selectedLOs.includes(lo.lo_id)
                        ? "bg-primary/8 border-primary/40"
                        : "hover:bg-primary/5 hover:border-primary"
                    )}
                    onClick={() => handleToggleLO(lo.lo_id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`lo-${lo.lo_id}`}
                        checked={selectedLOs.includes(lo.lo_id)}
                        onCheckedChange={() => handleToggleLO(lo.lo_id)}
                        className="mt-1 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="space-y-3 w-full">
                        <div className="text-sm font-medium leading-relaxed text-foreground">
                          {lo.description || lo.name}
                        </div>

                        {((lo.related_chapters?.length ?? 0) > 0 ||
                          (lo.Chapters?.length ?? 0) > 0) && (
                          <div className="flex flex-wrap gap-2">
                            {(lo.related_chapters || lo.Chapters || []).map(
                              (ch: {
                                chapter_id: number;
                                chapter_name?: string;
                                name?: string;
                              }) => (
                                <Badge
                                  key={ch.chapter_id}
                                  variant="outline"
                                  className="text-xs h-6 px-2 py-1 bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {ch.chapter_name || ch.name}
                                </Badge>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {form.formState.errors.question_criteria?.loIds && (
        <p className="text-[10px] sm:text-xs text-destructive flex items-center mt-1">
          <Info className="h-3 w-3 mr-1" />
          {form.formState.errors.question_criteria.loIds.message}
        </p>
      )}
    </div>
  );
}
