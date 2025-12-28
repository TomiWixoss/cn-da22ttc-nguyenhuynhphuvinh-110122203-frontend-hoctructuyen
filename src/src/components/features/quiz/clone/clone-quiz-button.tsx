import React, { useState } from "react";
import { Button } from "@/components/ui/forms";
import { Copy, Loader2 } from "lucide-react";
import { CloneQuizModal } from "./clone-quiz-modal";
import { QuizDetail } from "@/lib/types/quiz";

interface CloneQuizButtonProps {
  quiz: QuizDetail;
  onCloneSuccess?: (clonedQuizId: number) => void;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export function CloneQuizButton({
  quiz,
  onCloneSuccess,
  className,
  variant = "outline",
  size = "sm",
}: CloneQuizButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCloneSuccess = (clonedQuizId: number) => {
    setIsModalOpen(false);
    onCloneSuccess?.(clonedQuizId);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsModalOpen(true)}
        className={className}
        title="Sao chép bài kiểm tra"
      >
        <Copy className="h-4 w-4 mr-1.5" />
        Sao chép
      </Button>

      <CloneQuizModal
        quiz={quiz}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCloneSuccess}
      />
    </>
  );
}
