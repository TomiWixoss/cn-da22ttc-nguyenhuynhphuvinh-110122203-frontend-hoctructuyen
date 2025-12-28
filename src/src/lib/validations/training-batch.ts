import * as z from "zod";

// ===== TRAINING BATCH VALIDATION SCHEMAS =====

const trainingBatchBaseSchema = z.object({
  program_id: z
    .number({
      required_error: "Vui lòng chọn chương trình đào tạo.",
    })
    .min(1, "Vui lòng chọn chương trình đào tạo."),
  name: z
    .string()
    .min(2, {
      message: "Tên khóa đào tạo phải có ít nhất 2 ký tự.",
    })
    .max(255, {
      message: "Tên khóa đào tạo không được vượt quá 255 ký tự.",
    }),
  start_year: z
    .number({
      required_error: "Năm bắt đầu là bắt buộc.",
    })
    .min(2000, "Năm bắt đầu phải sau năm 2000.")
    .max(2100, "Năm bắt đầu không hợp lệ."),
  end_year: z
    .number({
      required_error: "Năm kết thúc là bắt buộc.",
    })
    .min(2000, "Năm kết thúc phải sau năm 2000.")
    .max(2100, "Năm kết thúc không hợp lệ."),
  description: z.string().optional(),
});

export const trainingBatchCreateSchema = trainingBatchBaseSchema.refine(
  (data) => data.end_year > data.start_year,
  {
    message: "Năm kết thúc phải lớn hơn năm bắt đầu.",
    path: ["end_year"],
  }
);

export const trainingBatchUpdateSchema = trainingBatchBaseSchema.partial();

export type TrainingBatchFormData = z.infer<typeof trainingBatchCreateSchema>;
