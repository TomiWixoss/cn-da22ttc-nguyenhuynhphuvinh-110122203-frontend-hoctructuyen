"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Form, Button } from "@/components/ui/forms";
import { Card, CardContent } from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/feedback/skeleton";

// Types and Services
import type {
  QuestionWithRelations,
  QuestionType,
  Level,
  LearningOutcome,
  MediaFile,
} from "@/lib/types/question";
import { questionService } from "@/lib/services/api/question.service";
import { loService } from "@/lib/services/api/lo.service";
import { AssignmentService } from "@/lib/services/api/assignment.service";
import { useAssignmentContext } from "@/lib/contexts/assignment-context";
import { useSearchParams } from "next/navigation";
import {
  useCreateQuestion,
  useUpdateQuestion,
} from "@/lib/hooks/use-questions";
import {
  questionFormSchema,
  QuestionFormData,
} from "@/lib/validations/question";

// Components
import { QuestionBasicInfo } from "./QuestionBasicInfo";
import { CodeExerciseFields } from "./CodeExerciseFields";
import { RegularQuestionFields } from "./RegularQuestionFields";

interface QuestionFormProps {
  mode: "create" | "edit";
  question?: QuestionWithRelations;
  onSuccess?: (questionData: any) => void;
  onCancel?: () => void;
}

export function QuestionForm({
  mode,
  question,
  onSuccess,
  onCancel,
}: QuestionFormProps) {
  const { currentAssignmentId, assignments } = useAssignmentContext();
  const searchParams = useSearchParams();
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();

  const assignmentIdFromUrl = searchParams?.get("assignment_id");
  const activeAssignmentId = assignmentIdFromUrl || currentAssignmentId;

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [learningOutcomes, setLearningOutcomes] = useState<LearningOutcome[]>(
    []
  );
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [currentAssignment, setCurrentAssignment] = useState<any>(null);
  const [questionMedia, setQuestionMedia] = useState<File | null>(null);
  const [answerMedia, setAnswerMedia] = useState<Record<number, File | null>>(
    {}
  );
  const [existingMedia, setExistingMedia] = useState<MediaFile[]>(
    question?.MediaFiles || []
  );
  const [mediaToRemove, setMediaToRemove] = useState<number[]>([]);

  // Default values - CHỈ CÓ TRƯỜNG CẦN THIẾT
  const defaultFormValues: QuestionFormData = {
    question_text: "",
    question_type_id: 1,
    level_id: 1,
    lo_id: 1,
    explanation: "",
    answers: [
      { text: "", iscorrect: true, _isNew: true },
      { text: "", iscorrect: false, _isNew: true },
    ],
  } as QuestionFormData;

  // Form setup
  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionFormSchema),
    defaultValues:
      mode === "edit" && question
        ? {
            question_text: question.question_text,
            question_type_id: question.question_type_id,
            level_id: question.level_id,
            lo_id: question.lo_id || 1,
            explanation: question.explanation || "",
            ...(question.question_type_id === 4
              ? {
                  time_limit: (question as any).time_limit,
                  tags: (question as any).tags
                    ? Array.isArray((question as any).tags)
                      ? (question as any).tags
                      : JSON.parse((question as any).tags)
                    : [],
                  hints: (question as any).hints
                    ? Array.isArray((question as any).hints)
                      ? (question as any).hints
                      : JSON.parse((question as any).hints)
                    : [],
                  validation_rules: (question as any).validation_rules
                    ? typeof (question as any).validation_rules === "object"
                      ? (question as any).validation_rules
                      : JSON.parse((question as any).validation_rules)
                    : {
                        language: "javascript",
                        test_cases: [],
                        max_execution_time: 1000,
                      },
                }
              : {
                  answers: question.Answers?.map((answer) => {
                    const mediaFile = question.MediaFiles?.find(
                      (mf) =>
                        mf.owner_type === "answer" &&
                        mf.owner_id == answer.answer_id
                    );
                    return {
                      answer_id: answer.answer_id,
                      text: answer.answer_text,
                      iscorrect:
                        answer.iscorrect === true || answer.iscorrect === 1,
                      _isNew: false,
                      _toDelete: false,
                      media_filename: mediaFile?.file_name,
                    };
                  }) || [
                    { text: "", iscorrect: true, _isNew: true },
                    { text: "", iscorrect: false, _isNew: true },
                  ],
                }),
          }
        : defaultFormValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "answers",
  });

  // Watch question_type_id để reset form khi chuyển loại câu hỏi
  const questionTypeId = form.watch("question_type_id");

  useEffect(() => {
    if (questionTypeId === 4) {
      // Code exercise - xóa answers và thêm validation_rules
      form.setValue("answers", undefined as any);
      if (!form.getValues("validation_rules")) {
        form.setValue("validation_rules", {
          language: "javascript",
          test_cases: [],
          max_execution_time: 1000,
        });
      }
    } else {
      // Regular question - xóa validation_rules và thêm answers
      form.setValue("validation_rules", undefined as any);
      const currentAnswers = form.getValues("answers");
      if (!currentAnswers || currentAnswers.length === 0) {
        form.setValue("answers", [
          { text: "", iscorrect: true, _isNew: true },
          { text: "", iscorrect: false, _isNew: true },
        ]);
      }
    }
  }, [questionTypeId]);

  // Get assignment data
  useEffect(() => {
    if (activeAssignmentId && assignments.length > 0) {
      const assignment = assignments.find(
        (a) => a.assignment_id.toString() === activeAssignmentId
      );
      setCurrentAssignment(assignment || null);
    } else if (activeAssignmentId && assignments.length === 0) {
      const fetchAssignmentData = async () => {
        try {
          const response = await AssignmentService.getAssignmentById(
            parseInt(activeAssignmentId)
          );
          if (response.success && response.data) {
            setCurrentAssignment(response.data);
          }
        } catch (error) {
          console.error("Error fetching assignment:", error);
        }
      };
      fetchAssignmentData();
    }
  }, [activeAssignmentId, assignments]);

  // Load reference data
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        setIsLoadingData(true);

        const [questionTypesResponse, levelsResponse] = await Promise.all([
          questionService.getQuestionTypes({ limit: 100 }),
          questionService.getLevels({ limit: 100 }),
        ]);

        if (questionTypesResponse.success && questionTypesResponse.data) {
          setQuestionTypes(questionTypesResponse.data.questionTypes || []);
        }

        if (levelsResponse.success && levelsResponse.data) {
          setLevels(levelsResponse.data.levels || []);
        }

        if (currentAssignment?.subject_id) {
          const learningOutcomesResponse = await loService.getLOsBySubject(
            currentAssignment.subject_id,
            false
          );

          if (
            learningOutcomesResponse.success &&
            learningOutcomesResponse.data
          ) {
            const los = learningOutcomesResponse.data.los || [];
            setLearningOutcomes(los);

            // Tự động chọn LO đầu tiên khi tạo mới
            if (mode === "create" && los.length > 0) {
              form.setValue("lo_id", los[0].lo_id);
            }
          } else {
            setLearningOutcomes([]);
          }
        } else {
          setLearningOutcomes([]);
        }
      } catch (error) {
        console.error("Error loading reference data:", error);
        toast.error("Không thể tải dữ liệu tham chiếu");
      } finally {
        setIsLoadingData(false);
      }
    };

    if (currentAssignment?.subject_id || !activeAssignmentId) {
      loadReferenceData();
    }
  }, [currentAssignment?.subject_id, activeAssignmentId]);

  // File handlers
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    forAnswerIndex?: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (forAnswerIndex !== undefined) {
      const hasExistingMedia = existingMedia.some(
        (f) =>
          f.owner_type === "answer" &&
          f.owner_id == fields[forAnswerIndex]?.answer_id
      );
      const hasNewMedia = answerMedia[forAnswerIndex];

      if (hasExistingMedia || hasNewMedia) {
        toast.error("Mỗi câu trả lời chỉ được thêm 1 media");
        e.target.value = "";
        return;
      }

      setAnswerMedia((prev) => ({ ...prev, [forAnswerIndex]: file }));
      form.setValue(`answers.${forAnswerIndex}.media_filename`, file.name);
    } else {
      const hasExistingQuestionMedia = existingMedia.some(
        (f) => f.owner_type === "question"
      );

      if (hasExistingQuestionMedia || questionMedia) {
        toast.error("Câu hỏi chỉ được thêm 1 media");
        e.target.value = "";
        return;
      }

      setQuestionMedia(file);
    }
  };

  const removeNewFile = (forAnswerIndex?: number) => {
    if (forAnswerIndex !== undefined) {
      setAnswerMedia((prev) => {
        const newState = { ...prev };
        delete newState[forAnswerIndex];
        return newState;
      });
      form.setValue(`answers.${forAnswerIndex}.media_filename`, undefined);
    } else {
      setQuestionMedia(null);
    }
  };

  const removeExistingMedia = (mediaId: number, forAnswerIndex?: number) => {
    setMediaToRemove((prev) => [...prev, mediaId]);
    setExistingMedia((prev) => prev.filter((m) => m.media_id !== mediaId));
  };

  // Submit handler
  const onSubmit: SubmitHandler<QuestionFormData> = async (data) => {
    setIsSubmitting(true);
    const formData = new FormData();

    formData.append("question_text", data.question_text);
    formData.append("question_type_id", data.question_type_id.toString());
    formData.append("level_id", data.level_id.toString());
    if (data.lo_id) formData.append("lo_id", data.lo_id.toString());
    if (data.explanation) formData.append("explanation", data.explanation);

    const isCodeExercise = data.question_type_id === 4;

    if (isCodeExercise) {
      if (data.time_limit)
        formData.append("time_limit", data.time_limit.toString());
      if (data.tags) formData.append("tags", JSON.stringify(data.tags));
      if (data.hints) formData.append("hints", JSON.stringify(data.hints));
      if (data.validation_rules) {
        formData.append(
          "validation_rules",
          JSON.stringify(data.validation_rules)
        );
      }
    } else {
      if (data.answers) {
        const answersForApi = data.answers.map((ans, index) => ({
          answer_id: ans.answer_id,
          text: ans.text,
          is_correct: ans.iscorrect,
          media_filename: answerMedia[index]?.name || ans.media_filename,
          _isNew: ans._isNew,
          _toDelete: ans._toDelete,
        }));
        formData.append("answers", JSON.stringify(answersForApi));
      }

      if (questionMedia) {
        formData.append("media_files", questionMedia, questionMedia.name);
      }
      Object.values(answerMedia).forEach((file) => {
        if (file) {
          formData.append("media_files", file, file.name);
        }
      });

      if (mode === "edit" && mediaToRemove.length > 0) {
        formData.append("remove_media_ids", JSON.stringify(mediaToRemove));
      }
    }

    try {
      if (mode === "create") {
        await createQuestion.mutateAsync(formData);
      } else if (question) {
        await updateQuestion.mutateAsync({
          id: question.question_id,
          formData,
        });
      }
      onSuccess?.({});
    } catch (e) {
      // Lỗi đã được xử lý trong hook
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === "create" && !activeAssignmentId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-12 w-12 text-muted-foreground mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            Chưa có phân công được chọn
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Vui lòng chọn một phân công môn học từ menu trước khi tạo câu hỏi
            mới.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <QuestionBasicInfo
            form={form}
            mode={mode}
            questionTypes={questionTypes}
            levels={levels}
            learningOutcomes={learningOutcomes}
            questionMedia={questionMedia}
            existingMedia={existingMedia}
            onFileChange={handleFileChange}
            onRemoveNewFile={removeNewFile}
            onRemoveExistingMedia={removeExistingMedia}
          />

          {/* Code Exercise Fields */}
          {form.watch("question_type_id") === 4 && (
            <CodeExerciseFields form={form} />
          )}

          {/* Regular Question Fields */}
          {form.watch("question_type_id") !== 4 && (
            <RegularQuestionFields
              form={form}
              mode={mode}
              fields={fields}
              append={append}
              remove={remove}
              existingMedia={existingMedia}
              answerMedia={answerMedia}
              mediaToRemove={mediaToRemove}
              onFileChange={handleFileChange}
              onRemoveNewFile={removeNewFile}
              onRemoveExistingMedia={removeExistingMedia}
            />
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[140px] px-6"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {mode === "create" ? "Đang tạo..." : "Đang cập nhật..."}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {mode === "create" ? "Tạo câu hỏi" : "Cập nhật câu hỏi"}
                </span>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
