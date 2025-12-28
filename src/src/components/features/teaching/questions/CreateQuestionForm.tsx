"use client";

import React from "react";
import { QuestionForm } from "./QuestionForm";

interface CreateQuestionFormProps {
  onSuccess?: (questionData: any) => void;
  onCancel?: () => void;
}

export function CreateQuestionForm({
  onSuccess,
  onCancel,
}: CreateQuestionFormProps) {
  return (
    <QuestionForm mode="create" onSuccess={onSuccess} onCancel={onCancel} />
  );
}
