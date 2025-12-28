"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Save, X } from "lucide-react";

import { Button } from "@/components/ui/forms";
import { Input } from "@/components/ui/forms";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/forms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";
import { Textarea } from "@/components/ui/forms";

import {
  useCreateTrainingBatch,
  useUpdateTrainingBatch,
} from "@/lib/hooks/use-training-batches";
import { usePrograms } from "@/lib/hooks/use-programs";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast-utils";
import {
  trainingBatchCreateSchema,
  trainingBatchUpdateSchema,
} from "@/lib/validations/training-batch";
import type {
  TrainingBatch,
  TrainingBatchCreateRequest,
  TrainingBatchUpdateRequest,
} from "@/lib/types/training-batch";
import type { Program } from "@/lib/types/program-management";

interface TrainingBatchFormProps {
  mode: "create" | "edit";
  initialData?: TrainingBatch;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function TrainingBatchForm({
  mode,
  initialData,
  onSuccess,
  onCancel,
  className,
}: TrainingBatchFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Use TanStack Query mutations
  const createTrainingBatch = useCreateTrainingBatch();
  const updateTrainingBatch = useUpdateTrainingBatch();
  const { data: programsData, isLoading: programsLoading } = usePrograms();
  const programs = programsData?.data?.records || [];

  // Choose validation schema based on mode
  const validationSchema =
    mode === "create" ? trainingBatchCreateSchema : trainingBatchUpdateSchema;

  // Initialize form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      program_id: initialData?.program_id || undefined,
      name: initialData?.name || "",
      start_year: initialData?.start_year || new Date().getFullYear(),
      end_year: initialData?.end_year || new Date().getFullYear() + 4,
      description: initialData?.description || "",
    },
  });

  // Track form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setHasUnsavedChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof validationSchema>) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      if (mode === "create") {
        const createData: TrainingBatchCreateRequest = {
          program_id: values.program_id!,
          name: values.name!,
          start_year: values.start_year!,
          end_year: values.end_year!,
          description: values.description,
        };

        await createTrainingBatch.mutateAsync(createData);
        setHasUnsavedChanges(false);

        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/dashboard/admin/training-batches");
        }
      } else if (mode === "edit" && initialData) {
        const updateData: TrainingBatchUpdateRequest = {
          program_id: values.program_id,
          name: values.name,
          start_year: values.start_year,
          end_year: values.end_year,
          description: values.description,
        };

        await updateTrainingBatch.mutateAsync({
          batchId: initialData.batch_id,
          data: updateData,
        });
        setHasUnsavedChanges(false);

        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/dashboard/admin/training-batches");
        }
      }
    } catch (error) {
      const errorMessage =
        mode === "create"
          ? "Không thể tạo khóa đào tạo"
          : "Không thể cập nhật khóa đào tạo";
      showErrorToast(errorMessage);
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (hasUnsavedChanges && !confirm("Bạn có muốn hủy bỏ các thay đổi?")) {
      return;
    }

    if (onCancel) {
      onCancel();
    } else {
      router.push("/dashboard/admin/training-batches");
    }
  };

  return (
    <div className={className}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Program Selection */}
          <FormField
            control={form.control}
            name="program_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chương trình đào tạo *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value?.toString()}
                  disabled={programsLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          programsLoading
                            ? "Đang tải..."
                            : "Chọn chương trình đào tạo"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem
                        key={program.program_id}
                        value={program.program_id.toString()}
                      >
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Batch Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tên khóa đào tạo <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ví dụ: K16 - Công nghệ thông tin"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Start & End Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="start_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Năm bắt đầu *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="2023"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Năm kết thúc *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="2027"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Mô tả chi tiết về khóa đào tạo..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                "Đang lưu..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === "create" ? "Tạo khóa đào tạo" : "Cập nhật"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
