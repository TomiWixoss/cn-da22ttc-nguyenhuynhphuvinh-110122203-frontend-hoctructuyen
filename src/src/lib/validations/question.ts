// frontend/src/lib/validations/question.ts
import { z } from "zod";

const answerSchema = z.object({
  answer_id: z.number().optional(),
  text: z.string().min(1, "Nội dung câu trả lời không được để trống"),
  iscorrect: z.boolean(),
  media_filename: z.string().optional(),
  _isNew: z.boolean().optional(),
  _toDelete: z.boolean().optional(),
});

// Schema cho test case của code exercise - Function Mode
const functionTestCaseSchema = z.object({
  input: z.string().min(1, "Input không được để trống"),
  expected: z.union([z.string(), z.number()]),
  description: z.string().optional(),
});

// Schema cho test case của code exercise - STDIO Mode
const stdioTestCaseSchema = z.object({
  input: z.string().min(1, "Input không được để trống"),
  output: z.string().min(1, "Output không được để trống"),
  description: z.string().optional(),
});

// Combined test case schema (supports both modes)
const testCaseSchema = z.object({
  input: z.string().min(1, "Input không được để trống"),
  expected: z.union([z.string(), z.number()]).optional(),
  output: z.string().optional(),
  description: z.string().optional(),
});

// Schema cho validation rules của code exercise - Function Mode
const functionValidationRulesSchema = z.object({
  language: z.enum(["javascript", "python", "c", "cpp", "c++"], {
    errorMap: () => ({ message: "Vui lòng chọn ngôn ngữ lập trình" }),
  }),
  mode: z.literal("function").optional(),
  test_cases: z.array(functionTestCaseSchema).min(1, "Phải có ít nhất 1 test case"),
  max_execution_time: z.number().optional(),
});

// Schema cho validation rules của code exercise - STDIO Mode
const stdioValidationRulesSchema = z.object({
  language: z.enum(["javascript", "python", "c", "cpp", "c++"], {
    errorMap: () => ({ message: "Vui lòng chọn ngôn ngữ lập trình" }),
  }),
  mode: z.literal("stdio"),
  test_cases: z.array(stdioTestCaseSchema).min(1, "Phải có ít nhất 1 test case"),
  max_execution_time: z.number().optional(),
});

// Combined validation rules schema
const validationRulesSchema = z.union([
  functionValidationRulesSchema,
  stdioValidationRulesSchema,
]);

export const questionFormSchema = z
  .object({
    question_text: z
      .string()
      .min(10, "Nội dung câu hỏi phải có ít nhất 10 ký tự"),
    question_type_id: z.number().min(1, "Vui lòng chọn loại câu hỏi"),
    level_id: z.number().min(1, "Vui lòng chọn độ khó"),
    lo_id: z.number().min(1, "Vui lòng chọn chuẩn đầu ra").optional(),
    explanation: z.string().optional(),
    time_limit: z.number().optional(),

    // Trường cho code exercise
    tags: z.array(z.string()).optional(),
    hints: z.array(z.string()).optional(),
    validation_rules: validationRulesSchema.optional(),

    // Trường cho các loại câu hỏi khác
    answers: z.array(answerSchema).optional(),
  })
  .refine(
    (data) => {
      // Nếu là code_exercise (type 4), không cần answers
      if (data.question_type_id === 4) {
        return true;
      }
      // Các loại khác cần có answers
      if (!data.answers || data.answers.length < 2) {
        return false;
      }
      // Kiểm tra có đúng 1 câu trả lời đúng
      const activeAnswers = data.answers.filter((a) => !a._toDelete);
      const correctAnswers = activeAnswers.filter((answer) => answer.iscorrect);
      return correctAnswers.length === 1;
    },
    {
      message: "Phải có ít nhất 2 câu trả lời và đúng 1 câu trả lời đúng",
      path: ["answers"],
    }
  )
  .refine(
    (data) => {
      // Nếu là code_exercise, phải có validation_rules
      if (data.question_type_id === 4) {
        return (
          !!data.validation_rules && data.validation_rules.test_cases.length > 0
        );
      }
      return true;
    },
    {
      message: "Câu hỏi lập trình phải có ít nhất 1 test case",
      path: ["validation_rules"],
    }
  );

export type QuestionFormData = z.infer<typeof questionFormSchema>;
