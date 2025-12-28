"use client";

import { Bot } from "lucide-react";
import { Button } from "@/components/ui/forms";
import { useFeatureStatus } from "@/lib/hooks/use-feature-toggle";
import { DEFAULT_FEATURE_FLAGS } from "@/lib/types/feature-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/feedback";

interface AITutorButtonProps {
  onClick?: () => void;
  className?: string;
}

/**
 * Nút "Hỏi AI" - tự động ẩn khi AI_TUTOR feature bị tắt
 */
export function AITutorButton({ onClick, className }: AITutorButtonProps) {
  const { data } = useFeatureStatus();
  const features = data?.features ?? DEFAULT_FEATURE_FLAGS;

  // Ẩn nút nếu AI_TUTOR bị tắt
  if (!features.AI_TUTOR) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onClick}
            className={className}
          >
            <Bot className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Hỏi AI Tutor</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
