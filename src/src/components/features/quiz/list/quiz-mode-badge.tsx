import { Badge } from "@/components/ui/feedback";
import { FileText, Gamepad2, Code2 } from "lucide-react";
import { QuizMode } from "@/lib/types/quiz";
import { cn } from "@/lib/utils";

interface QuizModeBadgeProps {
  mode?: QuizMode;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md";
}

export function QuizModeBadge({
  mode = "assessment",
  className,
  showIcon = true,
  size = "sm",
}: QuizModeBadgeProps) {
  const getModeConfig = () => {
    switch (mode) {
      case "practice":
        return {
          label: "Luyện tập",
          variant: "secondary" as const,
          icon: Gamepad2,
          className:
            "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
        };
      case "code_practice":
        return {
          label: "Luyện Code",
          variant: "secondary" as const,
          icon: Code2,
          className:
            "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
        };
      case "assessment":
      default:
        return {
          label: "Đánh giá",
          variant: "default" as const,
          icon: FileText,
          className:
            "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
        };
    }
  };

  const config = getModeConfig();
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "font-medium transition-colors duration-200",
        config.className,
        size === "sm" ? "text-xs px-2 py-1" : "text-sm px-3 py-1.5",
        className
      )}
    >
      {showIcon && (
        <Icon
          className={cn("mr-1.5", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")}
        />
      )}
      {config.label}
    </Badge>
  );
}
