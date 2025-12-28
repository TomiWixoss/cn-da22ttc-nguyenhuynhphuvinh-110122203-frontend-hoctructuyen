"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createSubjectSchema,
  updateSubjectSchema,
  type CreateSubjectFormData,
  type UpdateSubjectFormData,
} from "@/lib/validations/subject";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/forms";
import {
  SubjectService,
  type CreateSubjectRequest,
  type UpdateSubjectRequest,
  type SubjectTypes,
  type Subject,
} from "@/lib/services/api/subject.service";
import { toast } from "sonner";
import { Loader2, Save, X } from "lucide-react";
import {
  useSubject,
  useCreateSubject,
  useUpdateSubject,
} from "@/lib/hooks/use-subjects";

interface SubjectFormProps {
  mode: "create" | "edit";
  subjectId?: number;
  programId?: number; // Thêm programId để filter PLOs
  initialData?: Subject;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SubjectForm({
  mode,
  subjectId,
  programId,
  initialData,
  onSuccess,
  onCancel,
}: SubjectFormProps) {
  const [formDataLoading, setFormDataLoading] = useState(true);
  const [formData, setFormData] = useState<{
    typeSubjects: SubjectTypes.TypeSubject[];
    typeOfKnowledges: SubjectTypes.TypeOfKnowledge[];
    plos: SubjectTypes.PLO[];
    courses: any[];
  }>({
    typeSubjects: [],
    typeOfKnowledges: [],
    plos: [],
    courses: [],
  });

  const isEdit = mode === "edit";
  const schema = isEdit ? updateSubjectSchema : createSubjectSchema;

  // Use TanStack Query hooks
  const { data: subjectData } = useSubject(subjectId || 0);
  const createSubjectMutation = useCreateSubject();
  const updateSubjectMutation = useUpdateSubject();

  const form = useForm<CreateSubjectFormData | UpdateSubjectFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type_id: initialData?.type_id || 0,
      noidung_id: initialData?.noidung_id || 0,
      name: initialData?.name || "",
      description: initialData?.description || "",
      // THAY ĐỔI: Bỏ plo_id
    },
  });

  const loadFormData = async () => {
    try {
      setFormDataLoading(true);
      const data = await SubjectService.getFormData();

      // THAY ĐỔI: Không cần filter PLOs nữa vì không dùng trong form
      setFormData(data);
    } catch (error) {
      console.error("Error loading form data:", error);
      toast.error("Không thể tải dữ liệu form");
    } finally {
      setFormDataLoading(false);
    }
  };

  useEffect(() => {
    loadFormData();
  }, [programId]);

  useEffect(() => {
    const dataToUse = subjectData || initialData;
    if (dataToUse) {
      form.reset({
        type_id: dataToUse.type_id,
        noidung_id: dataToUse.noidung_id,
        name: dataToUse.name,
        description: dataToUse.description || "",
        // THAY ĐỔI: Bỏ plo_id
      });
    }
  }, [subjectData, initialData, form]);

  const onSubmit = async (
    data: CreateSubjectFormData | UpdateSubjectFormData
  ) => {
    if (isEdit && initialData) {
      const updateData: UpdateSubjectRequest = {
        type_id: data.type_id,
        noidung_id: data.noidung_id,
        name: data.name,
        description: data.description || undefined,
        // THAY ĐỔI: Bỏ plo_ids
      };

      updateSubjectMutation.mutate(
        { subjectId: initialData.subject_id, data: updateData },
        {
          onSuccess: () => {
            onSuccess?.();
          },
        }
      );
    } else {
      const createData: CreateSubjectRequest = {
        type_id: data.type_id!,
        noidung_id: data.noidung_id!,
        name: data.name!,
        description: data.description || undefined,
        // THAY ĐỔI: Bỏ plo_ids
      };

      createSubjectMutation.mutate(createData, {
        onSuccess: () => {
          onSuccess?.();
        },
      });
    }
  };

  if (formDataLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
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
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Nhập mô tả môn học"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại môn học *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại môn học" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {formData.typeSubjects.map((type) => (
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
              control={form.control}
              name="noidung_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại kiến thức *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại kiến thức" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {formData.typeOfKnowledges.map((type) => (
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
          </div>

          {/* THAY ĐỔI: Xóa bỏ hoàn toàn FormField của plo_id */}

          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={
                createSubjectMutation.isPending ||
                updateSubjectMutation.isPending
              }
            >
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={
                createSubjectMutation.isPending ||
                updateSubjectMutation.isPending
              }
            >
              {createSubjectMutation.isPending ||
              updateSubjectMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEdit ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
