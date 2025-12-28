// src/components/features/admin/chapters/sections/SectionForm.tsx
"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/feedback";
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
import { Loader2 } from "lucide-react";
import {
  useAddSectionToChapter,
  useUpdateSection,
} from "@/lib/hooks/use-chapters";
import {
  Section,
  SectionCreateRequest,
} from "@/lib/services/api/chapter.service";

const sectionSchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc."),
  content: z.string().optional(),
  order: z.number().min(0, "Thứ tự phải là số không âm.").optional(),
});

type SectionFormData = z.infer<typeof sectionSchema>;

interface SectionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapterId: number;
  initialData?: Section | null;
  mode: "create" | "edit";
  onSuccess: () => void;
}

export function SectionForm({
  open,
  onOpenChange,
  chapterId,
  initialData,
  mode,
  onSuccess,
}: SectionFormProps) {
  const addSectionMutation = useAddSectionToChapter();
  const updateSectionMutation = useUpdateSection();

  const form = useForm<SectionFormData>({
    resolver: zodResolver(sectionSchema),
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: initialData?.title || "",
        content: initialData?.content || "",
        order: initialData?.order || 0,
      });
    }
  }, [open, initialData, form]);

  const onSubmit = (data: SectionFormData) => {
    const sectionData: SectionCreateRequest = {
      ...data,
      order: data.order || 0,
    };

    if (mode === "create") {
      addSectionMutation.mutate(
        { chapterId, sections: [sectionData] },
        { onSuccess }
      );
    } else if (initialData) {
      updateSectionMutation.mutate(
        { chapterId, sectionId: initialData.section_id, data: sectionData },
        { onSuccess }
      );
    }
  };

  const isLoading =
    addSectionMutation.isPending || updateSectionMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm Section mới" : "Chỉnh sửa Section"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: 1.1 Giới thiệu..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập nội dung chi tiết..."
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thứ tự</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {mode === "create" ? "Thêm" : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
