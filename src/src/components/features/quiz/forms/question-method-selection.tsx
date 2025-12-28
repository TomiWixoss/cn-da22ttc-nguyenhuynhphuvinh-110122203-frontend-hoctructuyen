"use client";

import { UseFormReturn } from "react-hook-form";
import { CreateQuizFormData, QuestionSelectionMethod } from "@/lib/types/quiz";
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
import { ListChecks, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionMethodSelectionProps {
  form: UseFormReturn<CreateQuizFormData>;
}

export function QuestionMethodSelection({
  form,
}: QuestionMethodSelectionProps) {
  const methodOptions: Array<{
    value: QuestionSelectionMethod;
    label: string;
    icon: React.ElementType;
    description: string;
    badge: {
      text: string;
      variant: "default" | "secondary" | "destructive" | "outline";
    };
  }> = [
    {
      value: "existing",
      label: "Chọn câu hỏi có sẵn",
      icon: ListChecks,
      description: "Chọn từ ngân hàng câu hỏi code đã tạo trước",
      badge: {
        text: "Thủ công",
        variant: "default",
      },
    },
    {
      value: "auto_generate",
      label: "Tự động sinh câu hỏi",
      icon: Sparkles,
      description: "Hệ thống tự động chọn câu hỏi dựa trên LO và độ khó",
      badge: {
        text: "Tự động",
        variant: "secondary",
      },
    },
  ];

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="question_selection_method"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid gap-4 md:grid-cols-2"
              >
                {methodOptions.map((option) => {
                  const IconComponent = option.icon;
                  const isSelected = field.value === option.value;

                  return (
                    <Card
                      key={option.value}
                      className={cn(
                        "relative cursor-pointer transition-all duration-200",
                        isSelected
                          ? "ring-2 ring-primary bg-primary/5"
                          : "hover:border-primary/50"
                      )}
                      onClick={() => field.onChange(option.value)}
                    >
                      <CardContent className="p-4 sm:p-6">
                        <FormItem className="flex items-start space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem
                              value={option.value}
                              className="mt-1"
                            />
                          </FormControl>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-2">
                                <IconComponent
                                  className={cn(
                                    "h-5 w-5",
                                    isSelected
                                      ? "text-primary"
                                      : "text-muted-foreground"
                                  )}
                                />
                                <FormLabel className="text-base font-semibold cursor-pointer">
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
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {option.description}
                            </p>
                          </div>
                        </FormItem>
                      </CardContent>
                    </Card>
                  );
                })}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
