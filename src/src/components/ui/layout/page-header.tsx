import React from "react";
import { cn } from "@/lib/utils";

// Định nghĩa các biến thể màu sắc
const variantStyles = {
  default: {
    container:
      "from-blue-50 via-white to-slate-50 dark:from-blue-950/20 dark:via-card dark:to-slate-900/20 border-blue-100/50 dark:border-blue-800/30",
    title:
      "from-blue-600 via-blue-700 to-blue-800 dark:from-blue-400 dark:via-blue-500 dark:to-blue-600",
    blur1: "from-blue-400/10 to-blue-600/10",
    blur2: "from-slate-400/10 to-slate-600/10",
  },
  inventory: {
    container:
      "from-purple-50 via-white to-pink-50 dark:from-purple-950/20 dark:via-card dark:to-pink-900/20 border-purple-100/50 dark:border-purple-800/30",
    title:
      "from-purple-600 via-purple-700 to-pink-800 dark:from-purple-400 dark:via-purple-500 dark:to-pink-600",
    blur1: "from-purple-400/10 to-purple-600/10",
    blur2: "from-pink-400/10 to-pink-600/10",
  },
  profile: {
    container:
      "from-blue-50 via-white to-purple-50 dark:from-blue-950/20 dark:via-card dark:to-purple-900/20 border-blue-100/50 dark:border-blue-800/30",
    title:
      "from-blue-600 via-blue-700 to-purple-800 dark:from-blue-400 dark:via-blue-500 dark:to-purple-600",
    blur1: "from-blue-400/10 to-blue-600/10",
    blur2: "from-purple-400/10 to-purple-600/10",
  },
  quizzes: {
    container:
      "from-emerald-50 via-white to-slate-50 dark:from-emerald-950/20 dark:via-card dark:to-slate-900/20 border-emerald-100/50 dark:border-emerald-800/30",
    title:
      "from-emerald-600 via-emerald-700 to-emerald-800 dark:from-emerald-400 dark:via-emerald-500 dark:to-emerald-600",
    blur1: "from-emerald-400/10 to-emerald-600/10",
    blur2: "from-slate-400/10 to-slate-600/10",
  },
  shop: {
    container:
      "from-purple-50 via-white to-pink-50 dark:from-purple-950/20 dark:via-card dark:to-pink-900/20 border-purple-100/50 dark:border-purple-800/30",
    title:
      "from-purple-600 via-purple-700 to-pink-800 dark:from-purple-400 dark:via-purple-500 dark:to-pink-600",
    blur1: "from-purple-400/10 to-purple-600/10",
    blur2: "from-pink-400/10 to-pink-600/10",
  },
  leaderboard: {
    container:
      "from-yellow-50 via-white to-amber-50 dark:from-yellow-950/20 dark:via-card dark:to-amber-900/20 border-yellow-100/50 dark:border-yellow-800/30",
    title:
      "from-yellow-600 via-yellow-700 to-amber-800 dark:from-yellow-400 dark:via-yellow-500 dark:to-amber-600",
    blur1: "from-yellow-400/10 to-yellow-600/10",
    blur2: "from-amber-400/10 to-amber-600/10",
  },
};

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
  variant?: keyof typeof variantStyles;
  icon?: React.ReactNode;
}

/**
 * Reusable Page Header component with modern gradient design
 * Consistent with the header style used across dashboard pages
 */
export function PageHeader({
  title,
  description,
  className,
  children,
  variant = "default",
  icon,
}: PageHeaderProps) {
  const styles = variantStyles[variant] || variantStyles.default;

  return (
    <div
      className={cn(
        "relative mb-8 p-8 sm:p-12 rounded-2xl bg-gradient-to-br border",
        styles.container,
        className
      )}
    >
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          {icon && <div>{icon}</div>}
          <h1
            className={cn(
              "text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r bg-clip-text text-transparent leading-tight py-2",
              styles.title
            )}
            style={{ lineHeight: "1.1" }}
          >
            {title}
          </h1>
        </div>
        {description && (
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>

      {/* Decorative elements */}
      <div
        className={cn(
          "absolute top-4 right-4 w-20 h-20 bg-gradient-to-br rounded-full blur-xl",
          styles.blur1
        )}
      ></div>
      <div
        className={cn(
          "absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br rounded-full blur-lg",
          styles.blur2
        )}
      ></div>
    </div>
  );
}

export default PageHeader;
