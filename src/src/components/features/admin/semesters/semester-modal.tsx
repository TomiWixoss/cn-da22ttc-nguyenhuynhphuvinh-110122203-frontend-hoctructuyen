"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/forms";
import { Input } from "@/components/ui/forms";
import { Textarea } from "@/components/ui/forms";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/feedback/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/forms";
import { type Semester } from "@/lib/services/api/semester.service";
import {
  useCreateSemester,
  useUpdateSemester,
} from "@/lib/hooks/use-semesters";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type SemesterModalMode = "create" | "edit";

interface SemesterModalProps {
  mode: SemesterModalMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  batchId: number; // Bắt buộc phải có batchId
  semester?: Semester; // Required when mode is 'edit'
}

const semesterSchema = z.object({
  name: z.string().min(1, "Tên học kỳ là bắt buộc"),
  academic_year: z.string().min(1, "Năm học là bắt buộc"),
  semester_number: z.number().min(1).max(3),
  description: z.string().optional(),
  start_date: z.string().min(1, "Ngày bắt đầu là bắt buộc"),
  end_date: z.string().min(1, "Ngày kết thúc là bắt buộc"),
});

type FormData = z.infer<typeof semesterSchema>;

export function SemesterModal({
  mode,
  open,
  onOpenChange,
  onSuccess,
  batchId,
  semester,
}: SemesterModalProps) {
  // Use TanStack Query hooks
  const createSemesterMutation = useCreateSemester();
  const updateSemesterMutation = useUpdateSemester();

  const form = useForm<FormData>({
    resolver: zodResolver(semesterSchema),
    defaultValues: {
      name: "",
      academic_year: "",
      semester_number: 1,
      description: "",
      start_date: "",
      end_date: "",
    },
  });

  const getDefaultValues = (): FormData => {
    if (mode === "edit" && semester) {
      return {
        name: semester.name,
        academic_year: semester.academic_year || "",
        semester_number: semester.semester_number || 1,
        description: semester.description || "",
        start_date: semester.start_date.split("T")[0],
        end_date: semester.end_date.split("T")[0],
      };
    }
    return {
      name: "",
      academic_year: "",
      semester_number: 1,
      description: "",
      start_date: "",
      end_date: "",
    };
  };

  useEffect(() => {
    if (open) {
      form.reset(getDefaultValues());
    }
  }, [open, mode, semester, form]);

  const onSubmit = async (data: FormData) => {
    if (new Date(data.start_date) >= new Date(data.end_date)) {
      toast.error("Ngày kết thúc phải sau ngày bắt đầu");
      return;
    }

    if (mode === "create") {
      if (
        !data.name ||
        !data.academic_year ||
        !data.start_date ||
        !data.end_date
      ) {
        return;
      }

      const createData = {
        name: data.name,
        academic_year: data.academic_year,
        semester_number: data.semester_number,
        description: data.description || undefined,
        start_date: data.start_date,
        end_date: data.end_date,
        batch_id: batchId, // Thêm batch_id
      };

      createSemesterMutation.mutate(createData, {
        onSuccess: () => {
          setTimeout(() => {
            onOpenChange(false);
            form.reset();
            onSuccess();
          }, 1000);
        },
      });
    } else {
      if (!semester) {
        toast.error("Không tìm thấy thông tin học kỳ");
        return;
      }

      const updateData = {
        name: data.name,
        academic_year: data.academic_year,
        semester_number: data.semester_number,
        description: data.description || undefined,
        start_date: data.start_date,
        end_date: data.end_date,
        batch_id: batchId, // Thêm batch_id
      };

      updateSemesterMutation.mutate(
        {
          semesterId: semester.semester_id || semester.id || 0,
          data: updateData,
        },
        {
          onSuccess: () => {
            setTimeout(() => {
              onOpenChange(false);
              form.reset();
              onSuccess();
            }, 1000);
          },
        }
      );
    }
  };

  // Dynamic content based on mode
  const modalTitle = mode === "create" ? "Tạo học kỳ mới" : "Chỉnh sửa học kỳ";
  const submitButtonText = mode === "create" ? "Tạo học kỳ" : "Cập nhật";
  const isLoading =
    createSemesterMutation.isPending || updateSemesterMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên học kỳ *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: Học kỳ 1 năm 2024-2025"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="academic_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Năm học *</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: 2024-2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="semester_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Học kỳ số *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="3"
                        placeholder="1, 2, hoặc 3"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 1)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả về học kỳ (tùy chọn)"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày bắt đầu *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày kết thúc *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitButtonText}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
