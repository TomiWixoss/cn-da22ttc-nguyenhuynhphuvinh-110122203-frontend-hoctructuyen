"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateQuizFormData } from "@/lib/types/quiz";
import { createQuizSchema } from "@/lib/validations/quiz";
import { useQuizCreation } from "@/lib/hooks/use-quiz-creation";
import { BasicInfoForm } from "../forms/basic-info-form";
import { QuizModeSelection } from "../forms/quiz-mode-selection";
import { QuestionCriteriaForm } from "../forms/question-criteria-form";
import { QuizLoSelection } from "../forms/quiz-lo-selection";
import { CodeConfigForm } from "../forms/code-config-form";
import { QuestionMethodSelection } from "../forms/question-method-selection";
import { CodeQuestionSelector } from "../forms/code-question-selector";
import { Form } from "@/components/ui/forms";
import { QuizProgressBar } from "./quiz-progress-bar";
import { QuizStepContent } from "./quiz-step-content";
import { showInfoToast } from "@/lib/utils/toast-utils";
import { useAssignmentContext } from "@/lib/contexts/assignment-context";

// Move steps constant outside component to avoid recreation on each render
const QUIZ_CREATION_STEPS = [
  {
    id: "basic-info",
    title: "Thông tin cơ bản",
    description: "Tên và thời gian",
  },
  {
    id: "quiz-mode",
    title: "Chế độ Quiz",
    description: "Đánh giá hoặc Luyện tập",
  },
  {
    id: "lo-selection",
    title: "Mục tiêu học tập",
    description: "Chọn nội dung",
  },
  {
    id: "question-criteria",
    title: "Tiêu chí câu hỏi",
    description: "Số lượng và độ khó",
  },
];

const CODE_PRACTICE_STEPS = [
  {
    id: "basic-info",
    title: "Thông tin cơ bản",
    description: "Tên và thời gian",
  },
  {
    id: "quiz-mode",
    title: "Chế độ Quiz",
    description: "Chọn chế độ",
  },
  {
    id: "code-config",
    title: "Cấu hình Code",
    description: "Thiết lập môi trường",
  },
  {
    id: "question-method",
    title: "Phương thức chọn câu",
    description: "Chọn hoặc tự động",
  },
  {
    id: "question-selection",
    title: "Chọn câu hỏi",
    description: "Câu hỏi code",
  },
];

export function CreateQuizContainer() {
  const router = useRouter();
  const { createTeacherUrl } = useAssignmentContext();
  const [currentStep, setCurrentStep] = useState("basic-info");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const { createQuiz, isLoading, error } = useQuizCreation();

  const form = useForm<CreateQuizFormData>({
    resolver: zodResolver(createQuizSchema),
    defaultValues: {
      name: "",
      duration: 30,
      quiz_mode: "assessment",
      question_criteria: {
        loIds: [],
        totalQuestions: 10,
        difficultyRatio: {
          easy: 30,
          medium: 40,
          hard: 30,
        },
        type: undefined,
      },
      code_config: {
        allow_multiple_submissions: true,
        show_test_results: true,
        enable_ai_analysis: true,
        time_limit_per_question: 1800,
      },
      question_selection_method: "existing",
      question_ids: [],
    },
  });

  // Xử lý khi chọn khóa học
  const handleCourseSelect = (id: number) => {
    setSelectedCourseId(id);
    form.setValue("course_id", id);
  };

  // Kiểm tra và xử lý hoàn thành bước
  const validateAndCompleteStep = (stepId: string): boolean => {
    if (stepId === "basic-info") {
      const { course_id, name, duration } = form.getValues();

      if (!course_id) {
        form.setError("course_id", { message: "Vui lòng chọn khóa học" });
        return false;
      }

      if (!name || name.length < 3) {
        form.setError("name", {
          message: "Tên bài kiểm tra phải có ít nhất 3 ký tự",
        });
        return false;
      }

      if (!duration || duration < 1) {
        form.setError("duration", { message: "Thời gian tối thiểu là 1 phút" });
        return false;
      }

      // Hoàn thành bước
      if (!completedSteps.includes(stepId)) {
        setCompletedSteps((prev) => [...prev, stepId]);
      }
      return true;
    }

    if (stepId === "quiz-mode") {
      const { quiz_mode } = form.getValues();

      if (!quiz_mode) {
        form.setError("quiz_mode", { message: "Vui lòng chọn chế độ quiz" });
        return false;
      }

      // Reset current step based on mode
      if (quiz_mode === "code_practice") {
        setCurrentStep("code-config");
      }

      // Hoàn thành bước
      if (!completedSteps.includes(stepId)) {
        setCompletedSteps((prev) => [...prev, stepId]);
      }
      return true;
    }

    if (stepId === "code-config") {
      const { code_config } = form.getValues();

      if (
        !code_config?.time_limit_per_question ||
        code_config.time_limit_per_question < 60
      ) {
        showInfoToast("Thời gian mỗi câu phải ít nhất 60 giây");
        return false;
      }

      if (!completedSteps.includes(stepId)) {
        setCompletedSteps((prev) => [...prev, stepId]);
      }
      return true;
    }

    if (stepId === "question-method") {
      const { question_selection_method } = form.getValues();

      if (!question_selection_method) {
        showInfoToast("Vui lòng chọn phương thức chọn câu hỏi");
        return false;
      }

      if (!completedSteps.includes(stepId)) {
        setCompletedSteps((prev) => [...prev, stepId]);
      }
      return true;
    }

    if (stepId === "question-selection") {
      const { question_selection_method, question_ids, question_criteria } =
        form.getValues();

      if (question_selection_method === "existing") {
        if (!question_ids || question_ids.length === 0) {
          showInfoToast("Vui lòng chọn ít nhất một câu hỏi");
          return false;
        }
      } else if (question_selection_method === "auto_generate") {
        if (
          !question_criteria ||
          !question_criteria.loIds ||
          question_criteria.loIds.length === 0
        ) {
          showInfoToast("Vui lòng chọn ít nhất một mục tiêu học tập");
          return false;
        }
        if (
          !question_criteria ||
          !question_criteria.totalQuestions ||
          question_criteria.totalQuestions < 1
        ) {
          showInfoToast("Số lượng câu hỏi phải ít nhất là 1");
          return false;
        }
        if (question_criteria && question_criteria.difficultyRatio) {
          const total =
            question_criteria.difficultyRatio.easy +
            question_criteria.difficultyRatio.medium +
            question_criteria.difficultyRatio.hard;
          if (total !== 100) {
            showInfoToast(
              `Tổng tỷ lệ độ khó phải bằng 100%, hiện tại là ${total}%`
            );
            return false;
          }
        }
      }

      if (!completedSteps.includes(stepId)) {
        setCompletedSteps((prev) => [...prev, stepId]);
      }
      return true;
    }

    if (stepId === "lo-selection") {
      const { question_criteria } = form.getValues();

      if (
        !question_criteria ||
        !question_criteria.loIds ||
        question_criteria.loIds.length === 0
      ) {
        showInfoToast("Vui lòng chọn ít nhất một mục tiêu học tập");
        return false;
      }

      // Hoàn thành bước
      if (!completedSteps.includes(stepId)) {
        setCompletedSteps((prev) => [...prev, stepId]);
      }
      return true;
    }

    if (stepId === "question-criteria") {
      const { question_criteria } = form.getValues();

      if (!question_criteria) {
        showInfoToast("Thiếu thông tin tiêu chí câu hỏi");
        return false;
      }

      const { totalQuestions, difficultyRatio } = question_criteria;

      if (!totalQuestions || totalQuestions < 1) {
        showInfoToast("Số lượng câu hỏi phải ít nhất là 1");
        return false;
      }

      const total =
        difficultyRatio.easy + difficultyRatio.medium + difficultyRatio.hard;
      if (total !== 100) {
        showInfoToast(
          `Tổng tỷ lệ độ khó phải bằng 100%, hiện tại là ${total}%`
        );
        return false;
      }

      // Hoàn thành bước
      if (!completedSteps.includes(stepId)) {
        setCompletedSteps((prev) => [...prev, stepId]);
      }
      return true;
    }

    return false;
  };

  // Get current steps based on quiz mode
  const getCurrentSteps = () => {
    const quizMode = form.getValues("quiz_mode");
    return quizMode === "code_practice"
      ? CODE_PRACTICE_STEPS
      : QUIZ_CREATION_STEPS;
  };

  // Xử lý nút tiếp theo
  const handleNext = () => {
    const isValid = validateAndCompleteStep(currentStep);
    if (!isValid) return;

    const steps = getCurrentSteps();
    const currentIndex = steps.findIndex((step) => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  // Xử lý nút quay lại
  const handleBack = () => {
    const steps = getCurrentSteps();
    const currentIndex = steps.findIndex((step) => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  // Xử lý tạo bài kiểm tra
  const handleSubmit = async () => {
    const quizMode = form.getValues("quiz_mode");
    const lastStep =
      quizMode === "code_practice" ? "question-selection" : "question-criteria";

    const isValid = validateAndCompleteStep(lastStep);
    if (!isValid) return;

    const result = await createQuiz(form.getValues());
    if (result) {
      const url = createTeacherUrl("/dashboard/teaching/quizzes/list");
      router.push(url);
    }
  };

  // Render theo bước hiện tại
  const renderStepContent = () => {
    switch (currentStep) {
      case "basic-info":
        return (
          <QuizStepContent
            onNext={handleNext}
            showBackButton={false}
            error={error}
          >
            <h2 className="text-lg sm:text-xl font-bold text-center mb-3 sm:mb-4">
              Thông tin cơ bản
            </h2>
            <BasicInfoForm form={form} onSelectCourse={handleCourseSelect} />
          </QuizStepContent>
        );

      case "quiz-mode":
        return (
          <QuizStepContent
            onNext={handleNext}
            onBack={handleBack}
            error={error}
          >
            <h2 className="text-lg sm:text-xl font-bold text-center mb-3 sm:mb-4">
              Chế độ Quiz
            </h2>
            <QuizModeSelection form={form} />
          </QuizStepContent>
        );

      case "lo-selection":
        return (
          <QuizStepContent
            onNext={handleNext}
            onBack={handleBack}
            error={error}
          >
            <h2 className="text-lg sm:text-xl font-bold text-center mb-3 sm:mb-4">
              Mục tiêu học tập
            </h2>
            {selectedCourseId && (
              <QuizLoSelection courseId={selectedCourseId} form={form} />
            )}
          </QuizStepContent>
        );

      case "question-criteria":
        return (
          <QuizStepContent
            onBack={handleBack}
            onSubmit={handleSubmit}
            showNextButton={false}
            showSubmitButton={true}
            isLoading={isLoading}
            error={error}
          >
            <h2 className="text-lg sm:text-xl font-bold text-center mb-3 sm:mb-4">
              Tiêu chí câu hỏi
            </h2>
            <QuestionCriteriaForm form={form} />
          </QuizStepContent>
        );

      case "code-config":
        return (
          <QuizStepContent
            onNext={handleNext}
            onBack={handleBack}
            error={error}
          >
            <h2 className="text-lg sm:text-xl font-bold text-center mb-3 sm:mb-4">
              Cấu hình Luyện Code
            </h2>
            <CodeConfigForm form={form} />
          </QuizStepContent>
        );

      case "question-method":
        return (
          <QuizStepContent
            onNext={handleNext}
            onBack={handleBack}
            error={error}
          >
            <h2 className="text-lg sm:text-xl font-bold text-center mb-3 sm:mb-4">
              Phương thức chọn câu hỏi
            </h2>
            <QuestionMethodSelection form={form} />
          </QuizStepContent>
        );

      case "question-selection":
        const questionMethod = form.getValues("question_selection_method");
        return (
          <QuizStepContent
            onBack={handleBack}
            onSubmit={handleSubmit}
            showNextButton={false}
            showSubmitButton={true}
            isLoading={isLoading}
            error={error}
          >
            <h2 className="text-lg sm:text-xl font-bold text-center mb-3 sm:mb-4">
              {questionMethod === "existing"
                ? "Chọn câu hỏi Code"
                : "Cấu hình tự động"}
            </h2>
            {questionMethod === "existing" && selectedCourseId && (
              <CodeQuestionSelector courseId={selectedCourseId} form={form} />
            )}
            {questionMethod === "auto_generate" && selectedCourseId && (
              <>
                <QuizLoSelection courseId={selectedCourseId} form={form} />
                <div className="mt-6">
                  <QuestionCriteriaForm form={form} />
                </div>
              </>
            )}
          </QuizStepContent>
        );

      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <div className="space-y-6 px-2 sm:px-4 md:px-6">
        <QuizProgressBar
          steps={getCurrentSteps()}
          currentStep={currentStep}
          completedSteps={completedSteps}
        />
        {renderStepContent()}
      </div>
    </Form>
  );
}
