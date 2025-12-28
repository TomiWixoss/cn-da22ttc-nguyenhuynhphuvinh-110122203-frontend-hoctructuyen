"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export function ToasterProvider() {
  const { theme } = useTheme();

  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      theme={theme as "light" | "dark" | "system"}
      toastOptions={{
        classNames: {
          toast:
            "bg-background text-foreground border-border shadow-lg backdrop-blur-sm",
          title: "text-foreground font-semibold",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground",
          closeButton:
            "bg-background border-border hover:bg-muted text-foreground",
          error: "bg-destructive/10 text-destructive border-destructive/20",
          success: "bg-success/10 text-success border-success/20",
          warning: "bg-warning/10 text-warning border-warning/20",
          info: "bg-info/10 text-info border-info/20",
        },
      }}
    />
  );
}
