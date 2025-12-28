import { z } from "zod";

// Schema validation cho form tạo quiz
export const createQuizSchema = z.object({
  course_id: z.number({
    required_error: "Vui lòng chọn khóa học",
  }),
  name: z.string().min(3, "Tên bài kiểm tra phải có ít nhất 3 ký tự"),
  duration: z
    .number({
      required_error: "Vui lòng nhập thời gian làm bài",
      invalid_type_error: "Thời gian phải là số phút",
    })
    .min(1, "Thời gian tối thiểu là 1 phút"),
  quiz_mode: z.enum(["assessment", "practice", "code_practice"], {
    required_error: "Vui lòng chọn chế độ quiz",
    invalid_type_error: "Chế độ quiz không hợp lệ",
  }),
  question_criteria: z
    .object({
      loIds: z.array(z.number()).min(1, "Chọn ít nhất một mục tiêu học tập"),
      totalQuestions: z
        .number({
          required_error: "Vui lòng nhập số lượng câu hỏi",
        })
        .min(1, "Phải có ít nhất 1 câu hỏi"),
      difficultyRatio: z
        .object({
          easy: z.number().min(0).max(100),
          medium: z.number().min(0).max(100),
          hard: z.number().min(0).max(100),
        })
        .refine((data) => data.easy + data.medium + data.hard === 100, {
          message: "Tổng tỷ lệ phải bằng 100%",
        }),
      type: z.number().optional(),
    })
    .optional(),
  code_config: z
    .object({
      allow_multiple_submissions: z.boolean(),
      show_test_results: z.boolean(),
      enable_ai_analysis: z.boolean(),
      time_limit_per_question: z
        .number()
        .min(60, "Thời gian tối thiểu là 60 giây"),
      allowed_languages: z.array(z.string()).optional(),
      auto_save_interval: z.number().optional(),
      show_hints_after_attempts: z.number().optional(),
    })
    .optional(),
  question_ids: z.array(z.number()).optional(),
  question_selection_method: z.enum(["existing", "auto_generate"]).optional(),
});

// Schema validation cho clone quiz
export const cloneQuizSchema = z.object({
  new_name: z
    .string()
    .min(3, "Tên bài kiểm tra phải có ít nhất 3 ký tự")
    .optional(),
  new_course_id: z.number().positive("ID khóa học phải là số dương").optional(),
  clone_questions: z.boolean().default(true),
  clone_settings: z.boolean().default(true),
  clone_mode_config: z.boolean().default(true),
  reset_pin: z.boolean().default(true),
  reset_status: z.boolean().default(true),
});
