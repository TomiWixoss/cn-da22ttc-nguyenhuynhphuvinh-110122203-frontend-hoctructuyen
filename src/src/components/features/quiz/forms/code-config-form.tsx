"use client";

import { UseFormReturn } from "react-hook-form";
import { CreateQuizFormData } from "@/lib/types/quiz";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormField,
  FormMessage,
  FormDescription,
} from "@/components/ui/forms";
import { Input } from "@/components/ui/forms/input";
import { Switch } from "@/components/ui/forms/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";

interface CodeConfigFormProps {
  form: UseFormReturn<CreateQuizFormData>;
}

export function CodeConfigForm({ form }: CodeConfigFormProps) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="code_config.time_limit_per_question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thời gian mỗi câu (giây)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="1800"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Thời gian tối đa cho mỗi câu hỏi (tối thiểu 60 giây)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code_config.allow_multiple_submissions"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Cho phép nộp nhiều lần</FormLabel>
                <FormDescription>
                  Học viên có thể nộp bài nhiều lần
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code_config.show_test_results"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Hiển thị kết quả test</FormLabel>
                <FormDescription>
                  Hiển thị kết quả test cases cho học viên
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code_config.enable_ai_analysis"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Phân tích AI</FormLabel>
                <FormDescription>Bật phân tích code bằng AI</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
