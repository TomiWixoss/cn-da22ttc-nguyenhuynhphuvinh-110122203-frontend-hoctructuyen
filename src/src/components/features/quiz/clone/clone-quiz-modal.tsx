import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/feedback";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Button,
  Input,
} from "@/components/ui/forms";
import { Switch } from "@/components/ui/forms";
import { Loader2, Copy, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/feedback";
import { Alert, AlertDescription } from "@/components/ui/feedback";
import { Card, CardContent } from "@/components/ui/layout";
import { CourseSelectByAssignment } from "@/components/features/course/course-select-by-assignment";
import { useCloneQuiz } from "@/lib/hooks/use-teaching";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast-utils";
import {
  QuizDetail,
  CloneQuizRequest,
  CloneQuizResponse,
} from "@/lib/types/quiz";

// Schema validation cho clone quiz form
const cloneQuizSchema = z.object({
  new_name: z
    .string()
    .min(3, "Tên bài kiểm tra phải có ít nhất 3 ký tự")
    .optional(),
  new_course_id: z.number().optional(),
  clone_questions: z.boolean(),
  clone_settings: z.boolean(),
  clone_mode_config: z.boolean(),
  reset_pin: z.boolean(),
  reset_status: z.boolean(),
});

type CloneQuizFormData = z.infer<typeof cloneQuizSchema>;

interface CloneQuizModalProps {
  quiz: QuizDetail;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (clonedQuizId: number) => void;
}

export function CloneQuizModal({
  quiz,
  isOpen,
  onClose,
  onSuccess,
}: CloneQuizModalProps) {
  const [cloneResult, setCloneResult] = useState<CloneQuizResponse | null>(
    null
  );

  const cloneMutation = useCloneQuiz();

  const form = useForm<CloneQuizFormData>({
    resolver: zodResolver(cloneQuizSchema),
    defaultValues: {
      new_name: `${quiz.name} - Bản sao`,
      new_course_id: quiz.course_id,
      clone_questions: true,
      clone_settings: true,
      clone_mode_config: true,
      reset_pin: true,
      reset_status: true,
    },
  });

  // Reset form khi modal được mở
  useEffect(() => {
    if (isOpen) {
      form.reset({
        new_name: `${quiz.name} - Bản sao`,
        new_course_id: quiz.course_id,
        clone_questions: true,
        clone_settings: true,
        clone_mode_config: true,
        reset_pin: true,
        reset_status: true,
      });
      setCloneResult(null);
    }
  }, [isOpen, quiz, form]);

  const onSubmit = async (data: CloneQuizFormData) => {
    // Chuẩn bị dữ liệu clone
    const cloneRequest: CloneQuizRequest = {
      new_name: data.new_name || undefined,
      new_course_id: data.new_course_id || undefined,
      clone_questions: data.clone_questions,
      clone_settings: data.clone_settings,
      clone_mode_config: data.clone_mode_config,
      reset_pin: data.reset_pin,
      reset_status: data.reset_status,
    };

    cloneMutation.mutate(
      {
        quizId: quiz.quiz_id,
        cloneData: cloneRequest,
      },
      {
        onSuccess: (response) => {

          // Lưu kết quả để hiển thị
          setCloneResult(response);

          // Gọi callback success với ID của quiz đã clone
          onSuccess(response.cloned_quiz.quiz_id);
        },
        onError: (error) => {
          console.error("Clone Quiz Error:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Không thể sao chép bài kiểm tra";
          showErrorToast(errorMessage);
        },
      }
    );
  };

  const handleClose = () => {
    if (!cloneMutation.isPending) {
      setCloneResult(null);
      onClose();
    }
  };

  // Nếu đã clone thành công, hiển thị kết quả
  if (cloneResult) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-green-600">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Sao chép thành công!
            </DialogTitle>
            <DialogDescription>
              Bài kiểm tra đã được sao chép thành công với các thông tin dưới
              đây.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Thông tin quiz gốc */}
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  Quiz gốc
                </h4>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Tên:</span>{" "}
                    {cloneResult.original_quiz.name}
                  </div>
                  <div>
                    <span className="font-medium">ID:</span>{" "}
                    {cloneResult.original_quiz.quiz_id}
                  </div>
                  <div>
                    <span className="font-medium">Số câu hỏi:</span>{" "}
                    {cloneResult.original_quiz.questions_count}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Thông tin quiz đã clone */}
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  Quiz đã sao chép
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Tên:</span>{" "}
                    {cloneResult.cloned_quiz.name}
                  </div>
                  <div>
                    <span className="font-medium">ID:</span>{" "}
                    {cloneResult.cloned_quiz.quiz_id}
                  </div>
                  <div>
                    <span className="font-medium">Khóa học:</span>{" "}
                    {cloneResult.cloned_quiz.course_name}
                  </div>
                  <div>
                    <span className="font-medium">Thời gian:</span>{" "}
                    {cloneResult.cloned_quiz.duration} phút
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Trạng thái:</span>
                    <Badge
                      variant={
                        cloneResult.cloned_quiz.status === "pending"
                          ? "secondary"
                          : "default"
                      }
                    >
                      {cloneResult.cloned_quiz.status === "pending"
                        ? "Chờ bắt đầu"
                        : cloneResult.cloned_quiz.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">PIN:</span>
                    <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-primary font-mono">
                      {cloneResult.cloned_quiz.pin}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Chế độ:</span>
                    <Badge
                      variant={
                        cloneResult.cloned_quiz.quiz_mode === "assessment"
                          ? "default"
                          : "outline"
                      }
                    >
                      {cloneResult.cloned_quiz.quiz_mode === "assessment"
                        ? "Đánh giá"
                        : "Luyện tập"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tóm tắt việc clone */}
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  Tóm tắt sao chép
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    Câu hỏi: {cloneResult.clone_summary.questions_cloned}
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    Cài đặt:{" "}
                    {cloneResult.clone_summary.settings_cloned ? "Có" : "Không"}
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    Cấu hình:{" "}
                    {cloneResult.clone_summary.mode_config_cloned
                      ? "Có"
                      : "Không"}
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    PIN mới:{" "}
                    {cloneResult.clone_summary.new_pin_generated
                      ? "Có"
                      : "Không"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleClose}>Đóng</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Form clone quiz
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Copy className="h-5 w-5 mr-2" />
            Sao chép bài kiểm tra
          </DialogTitle>
          <DialogDescription>
            Tạo bản sao của bài kiểm tra "{quiz.name}" với các tùy chọn tùy
            chỉnh.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info Fields - Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tên mới */}
              <FormField
                control={form.control}
                name="new_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên bài kiểm tra mới</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nhập tên cho bài kiểm tra mới"
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Khóa học đích */}
              <FormField
                control={form.control}
                name="new_course_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Khóa học đích (tùy chọn)</FormLabel>
                    <FormControl>
                      <CourseSelectByAssignment
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Chọn khóa học để sao chép đến"
                        className="w-full"
                        showEmptyOption={false}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Mặc định sẽ giữ lại khóa học gốc:{" "}
                      <span className="font-medium">{quiz.course_name}</span>.
                      Chỉ hiển thị các khóa học trong phân công hiện tại.
                    </p>
                  </FormItem>
                )}
              />
            </div>

            {/* Tùy chọn clone - Compact style */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Tùy chọn sao chép</h4>

              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="clone_questions"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-2 border rounded">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm">
                          Sao chép câu hỏi
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          {quiz.questions.length} câu hỏi
                        </p>
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
                  name="clone_settings"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-2 border rounded">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm">
                          Sao chép cài đặt
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          {quiz.duration} phút
                        </p>
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
                  name="clone_mode_config"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-2 border rounded">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm">
                          Chế độ & Gamification
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          {quiz.quiz_mode}
                        </p>
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

                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="reset_pin"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between p-2 border rounded">
                        <div className="space-y-0.5">
                          <FormLabel className="text-xs">PIN mới</FormLabel>
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
                    name="reset_status"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between p-2 border rounded">
                        <div className="space-y-0.5">
                          <FormLabel className="text-xs">
                            Reset trạng thái
                          </FormLabel>
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
                </div>
              </div>
            </div>

            {/* Alert thông tin */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Sao chép "{form.watch("new_name") || `${quiz.name} - Bản sao`}"
                với{" "}
                {form.watch("clone_questions")
                  ? `${quiz.questions.length} câu hỏi`
                  : "không có câu hỏi"}
                .
              </AlertDescription>
            </Alert>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={cloneMutation.isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={cloneMutation.isPending}>
                {cloneMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Đang sao chép...
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Sao chép
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
