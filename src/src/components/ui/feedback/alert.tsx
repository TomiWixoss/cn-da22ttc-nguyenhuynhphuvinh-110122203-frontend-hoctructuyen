import React from "react";
import { cn } from "@/lib/utils";

interface AlertProps {
  variant?: "default" | "destructive" | "warning";
  children: React.ReactNode;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  variant = "default",
  children,
  className,
}) => {
  const baseClasses = "p-4 rounded-lg border flex items-start gap-3";
  const variantClasses = {
    default:
      "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200",
    destructive:
      "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200",
    warning:
      "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200",
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)}>
      {children}
    </div>
  );
};

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const AlertDescription: React.FC<AlertDescriptionProps> = ({
  children,
  className,
}) => {
  return <div className={cn("text-sm", className)}>{children}</div>;
};

export { Alert, AlertDescription };
