// frontend/src/lib/validations/lo.ts
import * as z from "zod";

// XÓA BỎ: `chapter_ids` khỏi schema
export const loSchema = z.object({
  name: z.string().min(3, "Tên LO phải có ít nhất 3 ký tự.").max(255),
  description: z
    .string()
    .max(1000, "Mô tả không được quá 1000 ký tự.")
    .optional()
    .nullable(),
  subject_id: z
    .number({ required_error: "Vui lòng chọn môn học." })
    .positive()
    .nullable(),
});

export type LOFormData = z.infer<typeof loSchema>;
