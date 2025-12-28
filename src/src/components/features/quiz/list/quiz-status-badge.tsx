import { cn } from "@/lib/utils";

interface QuizStatusBadgeProps {
  status: "pending" | "active" | "finished";
  className?: string;
}

export function QuizStatusBadge({ status, className }: QuizStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "active":
        return {
          label: "Đang diễn ra",
          className:
            "bg-green-500/15 text-green-600 border border-green-500/30",
        };
      case "finished":
        return {
          label: "Đã kết thúc",
          className: "bg-blue-500/15 text-blue-600 border border-blue-500/30",
        };
      case "pending":
      default:
        return {
          label: "Chưa bắt đầu",
          className:
            "bg-orange-500/15 text-orange-600 border border-orange-500/30",
        };
    }
  };

  const { label, className: statusClassName } = getStatusConfig();

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200",
        statusClassName,
        className
      )}
    >
      {label}
    </span>
  );
}
