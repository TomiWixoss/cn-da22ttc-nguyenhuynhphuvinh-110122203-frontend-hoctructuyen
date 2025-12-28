"use client";

import React from "react";
import { QuestionForm } from "./QuestionForm";
import type { QuestionWithRelations } from "@/lib/types/question";

interface EditQuestionFormProps {
  question: QuestionWithRelations;
  onSuccess?: (questionData: any) => void;
  onCancel?: () => void;
}

export function EditQuestionForm({
  question,
  onSuccess,
  onCancel,
}: EditQuestionFormProps) {
  return (
    <QuestionForm
      mode="edit"
      question={question}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
}
