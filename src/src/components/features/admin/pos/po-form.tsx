"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/forms";
import { Button } from "@/components/ui/forms";
import { Input } from "@/components/ui/forms";
import { Textarea } from "@/components/ui/forms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";
import { Loader2, Save, X, Target } from "lucide-react";
import { toast } from "sonner";

import { poService } from "@/lib/services/api/po.service";
import { programService } from "@/lib/services/api/program.service";
import { useCreatePO, useUpdatePO } from "@/lib/hooks/use-pos";
import {
  poCreateSchema,
  poUpdateSchema,
} from "@/lib/validations/program-management";
import type {
  POCreateRequest,
  POUpdateRequest,
  POWithRelations,
  Program,
} from "@/lib/types/program-management";

interface POFormProps {
  po?: POWithRelations;
  programId?: number; // Thêm programId để pre-set program
  onSuccess?: (po?: POWithRelations) => void;
  onCancel?: () => void;
  className?: string;
}

type POFormData = POCreateRequest;

export function POForm({
  po,
  programId,
  onSuccess,
  onCancel,
  className,
}: POFormProps) {
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);

  // Use TanStack Query mutations
  const createPO = useCreatePO();
  const updatePO = useUpdatePO();

  const isEditing = !!po;
  const schema = isEditing ? poUpdateSchema : poCreateSchema;

  const form = useForm<POFormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: po?.name || "",
      description: po?.description || "",
      program_id: po?.program_id || programId || undefined,
    },
  });

  // Load programs for dropdown
  useEffect(() => {
    const loadPrograms = async () => {
      try {
        setIsLoadingPrograms(true);
        const response = await programService.getPrograms();
        if (response.success) {
          setPrograms(response.data.records);
        }
      } catch (error) {
        console.error("Error loading programs:", error);
        toast.error("Không thể tải danh sách chương trình");
      } finally {
        setIsLoadingPrograms(false);
      }
    };

    loadPrograms();
  }, []);

  const onSubmit = async (data: POFormData) => {
    try {
      setIsSubmitting(true);

      if (isEditing && po) {
        await updatePO.mutateAsync({
          poId: po.po_id,
          data: data as POUpdateRequest,
        });
      } else {
        await createPO.mutateAsync(data);
      }

      if (onSuccess) {
        onSuccess(); // Gọi callback để redirect đúng nơi
      } else {
        router.push("/dashboard/admin/pos");
      }
    } catch (error: any) {
      console.error("Error submitting PO form:", error);

      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        backendErrors.forEach((err: any) => {
          form.setError(err.field as keyof POFormData, {
            type: "manual",
            message: err.message,
          });
        });
      } else {
        toast.error(
          error.response?.data?.message ||
            (isEditing
              ? "Không thể cập nhật mục tiêu đào tạo"
              : "Không thể tạo mục tiêu đào tạo")
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <div className={className}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Program Selection - Chỉ hiển thị khi không có programId */}
          {!programId && (
            <FormField
              control={form.control}
              name="program_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chương trình đào tạo *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                    disabled={isLoadingPrograms}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn chương trình đào tạo" />
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
                  <FormDescription>
                    Chọn chương trình đào tạo mà mục tiêu đào tạo này thuộc về
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* PO Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên mục tiêu đào tạo *</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập tên mục tiêu đào tạo" {...field} />
                </FormControl>
                <FormDescription>
                  Tên mô tả ngắn gọn về mục tiêu đào tạo này
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* PO Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả chi tiết</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Nhập mô tả chi tiết về mục tiêu đào tạo này"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Mô tả chi tiết về nội dung và yêu cầu của mục tiêu đào tạo
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
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
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? "Đang cập nhật..." : "Đang tạo..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? "Cập nhật" : "Tạo mục tiêu đào tạo"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
