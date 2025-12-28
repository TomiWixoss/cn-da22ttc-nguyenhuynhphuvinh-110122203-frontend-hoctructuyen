import * as z from "zod";

// Subject validation schemas
export const createSubjectSchema = z.object({
  type_id: z.number().min(1, "Vui lòng chọn loại môn học"),
  noidung_id: z.number().min(1, "Vui lòng chọn loại nội dung"),
  name: z
    .string()
    .min(1, "Tên môn học không được để trống")
    .max(255, "Tên môn học không được quá 255 ký tự")
    .trim(),
  description: z
    .string()
    .max(1000, "Mô tả không được quá 1000 ký tự")
    .optional()
    .or(z.literal("")),
  plo_id: z.number().min(1, "Vui lòng chọn PLO"),
});

export const updateSubjectSchema = z.object({
  type_id: z.number().min(1, "Vui lòng chọn loại môn học").optional(),
  noidung_id: z.number().min(1, "Vui lòng chọn loại nội dung").optional(),
  name: z.string().min(1, "Tên môn học không được để trống").optional(),
  description: z.string().optional(),
  plo_id: z.number().min(1, "Vui lòng chọn PLO").optional(),
});

// Type Subject validation schemas
export const createTypeSubjectSchema = z.object({
  description: z
    .string()
    .min(1, "Mô tả loại môn học là bắt buộc")
    .max(255, "Mô tả không được quá 255 ký tự")
    .trim(),
});

export const updateTypeSubjectSchema = z.object({
  description: z
    .string()
    .min(1, "Mô tả loại môn học là bắt buộc")
    .max(255, "Mô tả không được quá 255 ký tự")
    .trim()
    .optional(),
});

// Search and filter schemas
export const subjectSearchSchema = z.object({
  search: z.string().optional(),
  type_id: z.number().optional(),
  noidung_id: z.number().optional(),
  // THAY ĐỔI: Xóa plo_id khỏi search schema
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

// Export types
export type CreateSubjectFormData = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectFormData = z.infer<typeof updateSubjectSchema>;
export type CreateTypeSubjectFormData = z.infer<typeof createTypeSubjectSchema>;
export type UpdateTypeSubjectFormData = z.infer<typeof updateTypeSubjectSchema>;
export type SubjectSearchParams = z.infer<typeof subjectSearchSchema>;
