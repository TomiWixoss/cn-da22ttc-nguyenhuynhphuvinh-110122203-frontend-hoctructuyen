import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

type Step = {
  id: string;
  title: string;
  description: string;
};

interface QuizProgressBarProps {
  steps: Step[];
  currentStep: string;
  completedSteps: string[];
}

export function QuizProgressBar({
  steps,
  currentStep,
  completedSteps,
}: QuizProgressBarProps) {
  return (
    <div className="mb-6 sm:mb-10 max-w-4xl mx-auto px-2">
      <div className="relative flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = completedSteps.includes(step.id);
          const isLast = index === steps.length - 1;

          return (
            <div
              key={step.id}
              className="relative flex flex-col items-center flex-1"
            >
              {/* Nút trạng thái */}
              <div
                className={cn(
                  "z-20 flex h-9 w-9 sm:h-14 sm:w-14 items-center justify-center rounded-full border-2 sm:border-4 text-base font-semibold transition-all duration-200 relative",
                  isActive && !isCompleted
                    ? "border-primary bg-primary text-primary-foreground scale-110"
                    : isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30 bg-background text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 sm:h-8 sm:w-8" />
                ) : (
                  <span className="text-xs sm:text-base">{index + 1}</span>
                )}
              </div>

              {/* Đường nối giữa các bước */}
              {!isLast && (
                <div
                  className={cn(
                    "absolute top-4 sm:top-7 left-1/2 h-[2px] sm:h-[4px] z-10",
                    "w-full transform translate-x-0",
                    isCompleted ? "bg-primary" : "bg-muted-foreground/20"
                  )}
                  style={{
                    width: "calc(100% - 2.25rem)", // Trừ đi width của circle
                    marginLeft: "1.125rem", // Một nửa width của circle
                  }}
                />
              )}

              {/* Tiêu đề và mô tả */}
              <div className="mt-2 sm:mt-4 w-20 sm:w-32 text-center">
                <p
                  className={cn(
                    "font-medium text-xs sm:text-base",
                    isActive
                      ? "text-primary font-semibold"
                      : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </p>
                <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
