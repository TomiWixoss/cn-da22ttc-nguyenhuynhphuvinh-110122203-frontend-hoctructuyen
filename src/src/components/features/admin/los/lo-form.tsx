// frontend/src/components/features/admin/los/lo-form.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/forms";
import {
  Button,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";
import { Checkbox } from "@/components/ui/forms";
import { Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { loService } from "@/lib/services/api";
import { SubjectService, Subject } from "@/lib/services/api/subject.service";
import { useCreateLO, useUpdateLO } from "@/lib/hooks/use-los";
import { loSchema, LOFormData } from "@/lib/validations/lo";
import type { LOWithRelations } from "@/lib/types/lo";

interface LOFormProps {
  mode: "create" | "edit";
  initialData?: LOWithRelations;
  subjectId?: number;
  programId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function LOForm({
  mode,
  initialData,
  subjectId,
  programId,
  onSuccess,
  onCancel,
}: LOFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);

  // Use TanStack Query mutations
  const createLO = useCreateLO();
  const updateLO = useUpdateLO();

  const form = useForm<LOFormData>({
    resolver: zodResolver(loSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      subject_id: initialData?.subject_id || subjectId || null,
      // XÓA BỎ: Khởi tạo giá trị `chapter_ids`
    },
  });

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const response = await SubjectService.getAllSubjects(1, 1000); // Lấy tất cả môn học
        if (response.success) {
          setSubjects(response.data.subjects);
        }
      } catch (error) {
        console.error("❌ [API] Error fetching subjects:", error);
        toast.error("Không thể tải danh sách môn học.");
      } finally {
        setIsLoadingSubjects(false);
      }
    };
    loadSubjects();
  }, []);

  const onSubmit = async (data: LOFormData) => {
    try {
      setIsSubmitting(true);
      // Convert null values to undefined for API compatibility
      const apiData = {
        ...data,
        subject_id: data.subject_id || subjectId || 0, // Use subjectId from props if available
        description: data.description || undefined,
      };

      if (mode === "create") {
        await createLO.mutateAsync(apiData);
        toast.success("Tạo chuẩn đầu ra thành công!");
      } else if (initialData) {
        await updateLO.mutateAsync({ loId: initialData.lo_id, data: apiData });
        toast.success("Cập nhật chuẩn đầu ra thành công!");
      }
      onSuccess ? onSuccess() : router.push("/dashboard/admin/los");
    } catch (error) {
      console.error("❌ [API] Error submitting LO form:", error);
      toast.error(
        mode === "create"
          ? "Tạo chuẩn đầu ra thất bại."
          : "Cập nhật chuẩn đầu ra thất bại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {!subjectId && (
            <FormField
              control={form.control}
              name="subject_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Môn học *</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value ? Number(value) : null)
                    }
                    value={field.value?.toString() || ""}
                    disabled={isLoadingSubjects}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingSubjects ? "Đang tải..." : "Chọn môn học"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem
                          key={subject.subject_id}
                          value={subject.subject_id.toString()}
                        >
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên chuẩn đầu ra *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="VD: Phân tích yêu cầu hệ thống"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Mô tả chi tiết về chuẩn đầu ra..."
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* XÓA BỎ: Toàn bộ FormField cho `chapter_ids` */}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel || (() => router.back())}
            >
              <X className="mr-2 h-4 w-4" /> Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {mode === "create" ? "Tạo chuẩn đầu ra" : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
