"use client";

import React, { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/feedback/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/forms";
import { Button } from "@/components/ui/forms";
import { Input } from "@/components/ui/forms";
import { Textarea } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import { AlertCircle, Calculator } from "lucide-react";

import { gradeColumnCreateSchema } from "@/lib/validations/course-grade";
import type {
  GradeColumnFormData,
  GradeColumnWithRelations,
} from "@/lib/types/course-grade";

interface GradeColumnFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: GradeColumnFormData) => Promise<void>;
  existingColumns: GradeColumnWithRelations[];
  courseId: number;
  initialData?: GradeColumnWithRelations | null;
}

export function GradeColumnForm({
  open,
  onOpenChange,
  onSubmit,
  existingColumns,
  courseId,
  initialData,
}: GradeColumnFormProps) {
  const isEditing = !!initialData;

  const form = useForm<GradeColumnFormData>({
    resolver: zodResolver(gradeColumnCreateSchema),
    defaultValues: {
      name: "",
      weight: 0,
      description: "",
      course_id: courseId,
    },
  });

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        // Parse weight_percentage thành số, xử lý cả dấu phẩy và dấu chấm
        const weightValue = parseFloat(
          String(initialData.weight_percentage).replace(",", ".")
        );
        form.reset({
          name: initialData.column_name,
          weight: isNaN(weightValue) ? 0 : weightValue,
          description: initialData.description || "",
          course_id: courseId,
        });
      } else {
        form.reset({
          name: "",
          weight: 0,
          description: "",
          course_id: courseId,
        });
      }
    }
  }, [open, initialData, courseId, form]);

  // Calculate current total weight excluding the column being edited (memoized)
  const currentTotalWeight = useMemo(() => {
    // Filter: Loại bỏ cột đang edit (nếu đang edit)
    const filtered = existingColumns.filter((col) => {
      if (!isEditing) return true; // Không edit thì giữ tất cả
      return col.column_id !== initialData?.column_id; // Đang edit thì loại bỏ cột đang edit
    });

    const total = filtered.reduce((sum, col) => {
      const weight = parseFloat(String(col.weight_percentage)) || 0;
      return sum + weight;
    }, 0);

    return total;
  }, [existingColumns, isEditing, initialData?.column_id]);

  // Watch weight percentage to provide real-time validation
  const watchedWeight = form.watch("weight");

  // Memoize validation calculations
  const { projectedTotal, isWeightValid, isWeightExceeded } = useMemo(() => {
    const total = currentTotalWeight + (watchedWeight || 0);
    return {
      projectedTotal: total,
      isWeightValid: Math.abs(total - 100) < 0.01,
      isWeightExceeded: total > 100,
    };
  }, [currentTotalWeight, watchedWeight]);

  const handleSubmit = async (data: GradeColumnFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {isEditing ? "Chỉnh sửa cột điểm" : "Thêm cột điểm"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {isEditing ? "Cập nhật thông tin cột điểm" : "Tạo cột điểm mới"}.
            Tổng trọng số cần bằng 100%.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Column Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên cột điểm *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ví dụ: Bài tập, Kiểm tra giữa kỳ, Thi cuối kỳ..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Weight Percentage */}
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trọng số (%) *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => {
                          let value = e.target.value;
                          // Thay thế dấu phẩy thành dấu chấm
                          value = value.replace(/,/g, ".");
                          // Chỉ cho phép số và dấu chấm
                          value = value.replace(/[^\d.]/g, "");
                          // Chỉ cho phép một dấu chấm
                          const parts = value.split(".");
                          if (parts.length > 2) {
                            value = parts[0] + "." + parts.slice(1).join("");
                          }
                          // Parse thành số
                          const numValue =
                            value === "" ? 0 : parseFloat(value) || 0;
                          // Giới hạn 0-100
                          const clampedValue = Math.min(
                            Math.max(numValue, 0),
                            100
                          );
                          field.onChange(clampedValue);
                        }}
                        value={field.value || ""}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />

                  {/* Real-time weight validation */}
                  <div className="mt-2 p-2 bg-muted/30 rounded text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Hiện tại:</span>
                      <span className="font-mono font-medium">
                        {(Number(currentTotalWeight) || 0).toFixed(1)}%
                      </span>
                    </div>

                    {watchedWeight > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Sau khi {isEditing ? "sửa" : "thêm"}:
                        </span>
                        <span
                          className={`font-mono font-medium ${
                            isWeightValid
                              ? "text-green-600"
                              : isWeightExceeded
                              ? "text-red-600"
                              : "text-amber-600"
                          }`}
                        >
                          {(Number(projectedTotal) || 0).toFixed(1)}%
                        </span>
                      </div>
                    )}

                    {watchedWeight > 0 && !isWeightValid && (
                      <div
                        className={`text-xs ${
                          isWeightExceeded ? "text-red-600" : "text-amber-600"
                        }`}
                      >
                        {isWeightExceeded
                          ? `Vượt ${(Number(projectedTotal) - 100).toFixed(1)}%`
                          : `Còn thiếu ${(100 - Number(projectedTotal)).toFixed(
                              1
                            )}%`}
                      </div>
                    )}

                    {watchedWeight > 0 && isWeightValid && (
                      <div className="text-xs text-green-600 font-medium">
                        ✓ Đạt 100%
                      </div>
                    )}
                  </div>
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả ngắn gọn..."
                      className="min-h-[60px] text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                size="sm"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                size="sm"
              >
                {form.formState.isSubmitting
                  ? "Đang lưu..."
                  : isEditing
                  ? "Cập nhật"
                  : "Tạo"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
