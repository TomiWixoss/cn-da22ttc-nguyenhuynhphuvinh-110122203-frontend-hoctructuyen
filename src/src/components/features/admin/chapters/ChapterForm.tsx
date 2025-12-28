"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/forms";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/forms";
import { Input } from "@/components/ui/forms";
import { Textarea } from "@/components/ui/forms";
import { useCreateChapter, useUpdateChapter } from "@/lib/hooks/use-chapters";
import { Chapter } from "@/lib/services/api/chapter.service";
import { Loader2 } from "lucide-react";

// XÓA BỎ: `lo_ids` khỏi schema
const chapterSchema = z.object({
  name: z.string().min(3, { message: "Tên chương phải có ít nhất 3 ký tự." }),
  description: z.string().optional(),
});

type ChapterFormData = z.infer<typeof chapterSchema>;

interface ChapterFormProps {
  mode: "create" | "edit";
  initialData?: Chapter;
  subjectId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ChapterForm({
  mode,
  initialData,
  subjectId,
  onSuccess,
  onCancel,
}: ChapterFormProps) {
  const form = useForm<ChapterFormData>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      // XÓA BỎ: Khởi tạo giá trị cho `lo_ids`
    },
  });

  const createChapterMutation = useCreateChapter();
  const updateChapterMutation = useUpdateChapter();

  const isLoading =
    createChapterMutation.isPending || updateChapterMutation.isPending;

  const onSubmit = (data: ChapterFormData) => {
    if (mode === "create") {
      createChapterMutation.mutate(
        { ...data, subject_id: subjectId },
        { onSuccess }
      );
    } else if (initialData) {
      updateChapterMutation.mutate(
        {
          chapterId: initialData.chapter_id,
          // THAY ĐỔI: Chỉ gửi dữ liệu schema, không gửi `lo_ids`
          data: { ...data, subject_id: subjectId },
        },
        { onSuccess }
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên chương *</FormLabel>
              <FormControl>
                <Input placeholder="Ví dụ: Chương 1: Giới thiệu" {...field} />
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
              <FormLabel>Mô tả (Tùy chọn)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Mô tả ngắn gọn về nội dung chương..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* XÓA BỎ: Toàn bộ FormField cho `lo_ids` */}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Tạo chương" : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
