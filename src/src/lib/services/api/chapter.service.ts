import api from "./client";
import { ApiResponse } from "@/lib/types/course-grade";

// ===== SECTION TYPES =====

export interface Section {
  section_id: number;
  chapter_id: number;
  title: string;
  content?: string | null;
  order: number;
}

export interface SectionCreateRequest {
  title: string;
  content?: string;
  order?: number;
}

// ===== CHAPTER TYPES =====

export interface Chapter {
  chapter_id: number;
  subject_id: number;
  name: string;
  description?: string | null;
  Subject?: {
    subject_id: number;
    name: string;
  };
  LOs?: Array<{
    lo_id: number;
    name: string;
    description?: string;
  }>;
  Sections?: Section[]; // Thêm Sections vào Chapter
}

export interface ChapterListResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  chapters: Chapter[];
}

export interface ChaptersBySubjectResponse {
  success: boolean;
  data: ChapterListResponse;
}

export interface CreateChapterRequest {
  name: string;
  description?: string;
  subject_id: number;
  lo_ids?: number[];
}

export interface UpdateChapterRequest {
  name?: string;
  description?: string;
  subject_id?: number;
  lo_ids?: number[];
}

// ===== CHAPTER SERVICE =====

export const chapterService = {
  /**
   * Lấy danh sách chương theo Môn học
   * API: GET /api/chapters/subject/:subject_id
   * Response: { success: true, data: { totalItems, totalPages, currentPage, chapters: Chapter[] } }
   */
  getChaptersBySubject: async (
    subjectId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<Chapter[]>> => {
    try {
      const response = await api.get(
        `/chapters/subject/${subjectId}?page=${page}&limit=${limit}`
      );

      if (response.data.success && response.data.data) {
        const result = {
          success: true,
          data: response.data.data.chapters || [],
        };
        return result;
      } else {
        console.warn(
          "⚠️ [Chapter API] Unexpected response structure:",
          response.data
        );
        return {
          success: false,
          data: [],
        };
      }
    } catch (error) {
      console.error("❌ [Chapter API] Error getting chapters:", error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết một chương theo ID
   * API: GET /api/chapters/:id
   */
  getChapterById: async (chapterId: number): Promise<ApiResponse<Chapter>> => {
    try {
      const response = await api.get(`/chapters/${chapterId}`);
      return response.data;
    } catch (error) {
      console.error("❌ [Chapter API] Error getting chapter:", error);
      throw error;
    }
  },

  /**
   * Tạo một chương mới
   */
  createChapter: async (
    data: CreateChapterRequest
  ): Promise<ApiResponse<{ chapter: Chapter }>> => {
    try {
      const response = await api.post("/chapters", data);
      return response.data;
    } catch (error) {
      console.error("❌ [Chapter API] Error creating chapter:", error);
      throw error;
    }
  },

  /**
   * Cập nhật một chương
   */
  updateChapter: async (
    chapterId: number,
    data: UpdateChapterRequest
  ): Promise<ApiResponse<{ chapter: Chapter }>> => {
    try {
      const response = await api.put(`/chapters/${chapterId}`, data);
      return response.data;
    } catch (error) {
      console.error("❌ [Chapter API] Error updating chapter:", error);
      throw error;
    }
  },

  /**
   * Xóa một chương
   */
  deleteChapter: async (
    chapterId: number
  ): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await api.delete(`/chapters/${chapterId}?force=true`);
      return response.data;
    } catch (error) {
      console.error("❌ [Chapter API] Error deleting chapter:", error);
      throw error;
    }
  },

  // ===== SECTION MANAGEMENT APIS =====

  /**
   * Lấy danh sách section của một chapter
   * API: GET /api/chapters/:id/sections
   */
  getSectionsByChapter: async (
    chapterId: number
  ): Promise<ApiResponse<{ chapter: Chapter; sections: Section[] }>> => {
    try {
      const response = await api.get(`/chapters/${chapterId}/sections`);
      return response.data;
    } catch (error) {
      console.error("❌ [Chapter API] Error getting sections:", error);
      throw error;
    }
  },

  /**
   * Thêm một hoặc nhiều section vào chapter
   * API: POST /api/chapters/:id/sections
   */
  addSectionsToChapter: async (
    chapterId: number,
    sections: SectionCreateRequest[]
  ): Promise<
    ApiResponse<{ chapter_id: number; created_sections: Section[] }>
  > => {
    try {
      const response = await api.post(`/chapters/${chapterId}/sections`, {
        sections,
      });
      return response.data;
    } catch (error) {
      console.error("❌ [Chapter API] Error adding sections:", error);
      throw error;
    }
  },

  /**
   * Cập nhật một section
   * API: PUT /api/chapters/:id/sections/:sectionId
   */
  updateSection: async (
    chapterId: number,
    sectionId: number,
    data: Partial<SectionCreateRequest>
  ): Promise<ApiResponse<Section>> => {
    try {
      const response = await api.put(
        `/chapters/${chapterId}/sections/${sectionId}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("❌ [Chapter API] Error updating section:", error);
      throw error;
    }
  },

  /**
   * Xóa một section
   * API: DELETE /api/chapters/:id/sections/:sectionId
   */
  deleteSection: async (
    chapterId: number,
    sectionId: number
  ): Promise<ApiResponse<{ deleted_section_id: string }>> => {
    try {
      const response = await api.delete(
        `/chapters/${chapterId}/sections/${sectionId}`
      );
      return response.data;
    } catch (error) {
      console.error("❌ [Chapter API] Error deleting section:", error);
      throw error;
    }
  },

  // XÓA BỎ: Các hàm associate và disassociate không chính xác
};
