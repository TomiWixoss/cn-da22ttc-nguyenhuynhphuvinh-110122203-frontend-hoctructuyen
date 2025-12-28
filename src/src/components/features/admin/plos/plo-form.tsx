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
import { Loader2, Save, X, CheckSquare } from "lucide-react";
import { toast } from "sonner";

import { ploService } from "@/lib/services/api/plo.service";
import { programService } from "@/lib/services/api/program.service";
import { useCreatePLO, useUpdatePLO } from "@/lib/hooks/use-plos";
import {
  ploCreateSchema,
  ploUpdateSchema,
} from "@/lib/validations/program-management";
import type {
  PLOCreateRequest,
  PLOUpdateRequest,
  PLOWithRelations,
  Program,
} from "@/lib/types/program-management";

interface PLOFormProps {
  plo?: PLOWithRelations;
  programId?: number; // Thêm programId để pre-set program
  onSuccess?: (plo?: PLOWithRelations) => void;
  onCancel?: () => void;
  className?: string;
}

type PLOFormData = PLOCreateRequest;

export function PLOForm({
  plo,
  programId,
  onSuccess,
  onCancel,
  className,
}: PLOFormProps) {
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);

  // Use TanStack Query mutations
  const createPLO = useCreatePLO();
  const updatePLO = useUpdatePLO();

  const isEditing = !!plo;
  const schema = isEditing ? ploUpdateSchema : ploCreateSchema;

  const form = useForm<PLOFormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: plo?.name || "",
      description: plo?.description || "",
      program_id: plo?.program_id || programId || undefined,
    },
  });

  const selectedProgramId = programId || form.watch("program_id");
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

  const onSubmit = async (data: PLOFormData) => {
    try {
      setIsSubmitting(true);

      if (isEditing && plo) {
        await updatePLO.mutateAsync({
          ploId: plo.plo_id,
          data: data as PLOUpdateRequest,
        });
      } else {
        await createPLO.mutateAsync(data);
      }

      if (onSuccess) {
        onSuccess(); // Gọi callback để redirect đúng nơi
      } else {
        router.push("/dashboard/admin/plos");
      }
    } catch (error: any) {
      console.error("Error submitting PLO form:", error);

      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        backendErrors.forEach((err: any) => {
          form.setError(err.field as keyof PLOFormData, {
            type: "manual",
            message: err.message,
          });
        });
      } else {
        toast.error(
          error.response?.data?.message ||
            (isEditing
              ? "Không thể cập nhật Chuẩn đầu ra Chương trình"
              : "Không thể tạo Chuẩn đầu ra Chương trình")
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
                    onValueChange={(value) => {
                      field.onChange(parseInt(value));
                    }}
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
                    Chọn chương trình đào tạo mà Chuẩn đầu ra Chương trình này
                    thuộc về
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* PLO Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên Chuẩn đầu ra Chương trình</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nhập tên Chuẩn đầu ra Chương trình"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Tên ngắn gọn cho Chuẩn đầu ra Chương trình (không bắt buộc)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* PLO Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả chi tiết *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Nhập mô tả chi tiết về Chuẩn đầu ra Chương trình này"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Mô tả chi tiết về nội dung và yêu cầu của Chuẩn đầu ra Chương
                  trình
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
                  {isEditing ? "Cập nhật" : "Tạo Chuẩn đầu ra Chương trình"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
