"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Button,
  Input,
  Textarea,
  Checkbox,
} from "@/components/ui/forms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";
import {
  useUpdateSubjectInProgram,
  useSubjectsByProgram,
  useSubject,
  useUpdateSubject,
  useSubjectFormData,
} from "@/lib/hooks/use-subjects";

// THAY ĐỔI: Schema không còn yêu cầu plo_id
const editSubjectSchema = z.object({
  // Thông tin môn học
  name: z.string().min(1, "Tên môn học là bắt buộc"),
  description: z.string().optional(),
  type_id: z.number().min(1, "Vui lòng chọn loại môn học"),
  noidung_id: z.number().min(1, "Vui lòng chọn loại nội dung"),
  // plo_id đã bị xóa
  // Metadata trong chương trình
  order_index: z.number().optional(),
  recommended_semester: z.number().optional(),
  is_mandatory: z.boolean().default(true),
  is_active: z.boolean().default(true),
});

interface ProgramSubjectMetadataFormProps {
  programId: number;
  subjectId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProgramSubjectMetadataForm({
  programId,
  subjectId,
  onSuccess,
  onCancel,
}: ProgramSubjectMetadataFormProps) {
  const updateSubjectMutation = useUpdateSubject();
  const updateSubjectInProgramMutation = useUpdateSubjectInProgram();
  const { data: response } = useSubjectsByProgram(programId);
  const { data: subject } = useSubject(subjectId);
  const { data: formData } = useSubjectFormData();

  // Tìm mapping hiện tại
  const currentMapping = response?.data?.find(
    (mapping: any) => mapping.subject_id === subjectId
  );

  const form = useForm({
    resolver: zodResolver(editSubjectSchema),
    defaultValues: {
      name: "",
      description: "",
      type_id: 0,
      noidung_id: 0,
      // plo_id đã bị xóa
      order_index: undefined,
      recommended_semester: undefined,
      is_mandatory: true,
      is_active: true,
    },
  });

  // Load dữ liệu hiện tại vào form
  useEffect(() => {
    if (subject && currentMapping && formData) {
      form.reset({
        name: subject.name || "",
        description: subject.description || "",
        type_id: subject.type_id ?? formData?.typeSubjects?.[0]?.type_id ?? 0,
        noidung_id:
          subject.noidung_id ??
          formData?.typeOfKnowledges?.[0]?.noidung_id ??
          0,
        // plo_id đã bị xóa
        order_index: currentMapping.order_index || undefined,
        recommended_semester: currentMapping.recommended_semester || undefined,
        is_mandatory: currentMapping.is_mandatory ?? true,
        is_active: currentMapping.is_active ?? true,
      });
    }
  }, [subject, currentMapping, formData, form]);

  const onSubmit = async (data: z.infer<typeof editSubjectSchema>) => {
    try {
      // 1. Cập nhật thông tin môn học
      const subjectData = {
        name: data.name,
        description: data.description,
        type_id: data.type_id,
        noidung_id: data.noidung_id,
        // plo_id đã bị xóa
      };

      await updateSubjectMutation.mutateAsync({
        subjectId,
        data: subjectData,
      });

      // 2. Cập nhật metadata trong chương trình
      const metadataData = {
        order_index: data.order_index,
        recommended_semester: data.recommended_semester,
        is_mandatory: data.is_mandatory,
        is_active: data.is_active,
      };

      await updateSubjectInProgramMutation.mutateAsync({
        programId,
        subjectId,
        data: metadataData,
      });

      onSuccess();
    } catch (error) {
      console.error("Error updating subject:", error);
    }
  };

  if (!subject || !currentMapping) {
    return <div>Đang tải dữ liệu...</div>;
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Thông tin cơ bản môn học */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Thông tin môn học</h3>

            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên môn học *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên môn học" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Mô tả môn học" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* THAY ĐỔI: Bỏ grid 3 cột, chỉ còn 2 cột */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="type_id"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại môn học *</FormLabel>
                    <Select
                      key={`type-select-${field.value}-${
                        formData?.typeSubjects?.length || 0
                      }`}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={
                        field.value !== undefined &&
                        field.value !== null &&
                        field.value > 0
                          ? field.value.toString()
                          : ""
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {formData?.typeSubjects?.map((type) => (
                          <SelectItem
                            key={type.type_id}
                            value={type.type_id.toString()}
                          >
                            {type.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="noidung_id"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại nội dung *</FormLabel>
                    <Select
                      key={`noidung-select-${field.value}-${
                        formData?.typeOfKnowledges?.length || 0
                      }`}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={
                        field.value !== undefined &&
                        field.value !== null &&
                        field.value > 0
                          ? field.value.toString()
                          : ""
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn nội dung" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {formData?.typeOfKnowledges?.map((type) => (
                          <SelectItem
                            key={type.noidung_id}
                            value={type.noidung_id.toString()}
                          >
                            {type.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* THAY ĐỔI: Xóa FormField của plo_id */}
            </div>
          </div>

          {/* Metadata trong chương trình */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium">
              Thông tin trong chương trình
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="order_index"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thứ tự</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Thứ tự môn học"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="recommended_semester"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Học kỳ gợi ý</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Học kỳ"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                name="is_mandatory"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Môn học bắt buộc</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                name="is_active"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Hiển thị môn học</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={
                updateSubjectMutation.isPending ||
                updateSubjectInProgramMutation.isPending
              }
            >
              {updateSubjectMutation.isPending ||
              updateSubjectInProgramMutation.isPending
                ? "Đang lưu..."
                : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
