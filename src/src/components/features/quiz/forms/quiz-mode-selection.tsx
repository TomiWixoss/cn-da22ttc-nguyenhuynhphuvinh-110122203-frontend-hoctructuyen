"use client";

import { useEffect } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { CreateQuizFormData, QuizMode } from "@/lib/types/quiz";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormField,
  FormMessage,
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/forms";
import { Card, CardContent } from "@/components/ui/layout";
import { Badge } from "@/components/ui/feedback";
import { FileText, Gamepad2, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizModeSelectionProps {
  form: UseFormReturn<CreateQuizFormData>;
}

export function QuizModeSelection({ form }: QuizModeSelectionProps) {
  // Theo dõi giá trị quiz_mode để tự động xóa lỗi
  const quizMode = useWatch({
    control: form.control,
    name: "quiz_mode",
  });

  // Tự động xóa lỗi khi đã chọn quiz mode
  useEffect(() => {
    if (quizMode) {
      form.clearErrors("quiz_mode");
    }
  }, [quizMode, form]);

  const modeOptions: Array<{
    value: QuizMode;
    label: string;
    icon: React.ElementType;
    description: string;
    badge: {
      text: string;
      variant: "default" | "secondary" | "destructive" | "outline";
    };
  }> = [
    {
      value: "assessment",
      label: "Chế độ Đánh giá",
      icon: FileText,
      description:
        "Đánh giá học tập chính thức, tập trung vào độ chính xác và kết quả",
      badge: {
        text: "Chính thức",
        variant: "default",
      },
    },
    {
      value: "practice",
      label: "Chế độ Luyện tập",
      icon: Gamepad2,
      description:
        "Luyện tập tương tác với đầy đủ tính năng gamification và hỗ trợ học tập",
      badge: {
        text: "Tương tác",
        variant: "secondary",
      },
    },
    {
      value: "code_practice",
      label: "Chế độ Luyện Code",
      icon: Code2,
      description:
        "Luyện tập lập trình với trình soạn thảo code, test cases và phân tích AI",
      badge: {
        text: "Lập trình",
        variant: "outline",
      },
    },
  ];

  return (
    <div className="space-y-4 mt-6">
      <FormField
        control={form.control}
        name="quiz_mode"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-3"
              >
                {modeOptions.map((option) => {
                  const IconComponent = option.icon;
                  const isSelected = field.value === option.value;

                  return (
                    <div
                      key={option.value}
                      className={cn(
                        "flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-all",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      )}
                      onClick={() => field.onChange(option.value)}
                    >
                      <FormControl>
                        <RadioGroupItem value={option.value} className="mt-1" />
                      </FormControl>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <IconComponent
                              className={cn(
                                "h-5 w-5",
                                isSelected
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              )}
                            />
                            <FormLabel className="text-base font-medium cursor-pointer">
                              {option.label}
                            </FormLabel>
                          </div>
                          <Badge
                            variant={option.badge.variant}
                            className="text-xs"
                          >
                            {option.badge.text}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </RadioGroup>
            </FormControl>
            <FormMessage className="text-xs sm:text-sm" />
          </FormItem>
        )}
      />
    </div>
  );
}
