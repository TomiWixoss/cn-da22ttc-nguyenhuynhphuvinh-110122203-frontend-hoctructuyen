import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chapterService } from "@/lib/services/api/chapter.service";
import type {
  CreateChapterRequest,
  UpdateChapterRequest,
  SectionCreateRequest,
} from "@/lib/services/api/chapter.service";
import { toast } from "sonner";

// Định nghĩa query keys
export const chapterKeys = {
  all: ["chapters"] as const,
  bySubject: (subjectId: number, page?: number, limit?: number) =>
    [...chapterKeys.all, "bySubject", subjectId, { page, limit }] as const,
  details: () => [...chapterKeys.all, "detail"] as const,
  detail: (id: number) => [...chapterKeys.details(), id] as const,
  sections: (chapterId: number) =>
    [...chapterKeys.detail(chapterId), "sections"] as const, // Key cho sections
};

// Hook để lấy danh sách chương theo môn học
export function useChaptersBySubject(
  subjectId: number,
  page: number = 1,
  limit: number = 10
) {
  return useQuery({
    queryKey: chapterKeys.bySubject(subjectId, page, limit),
    queryFn: async () => {
      const response = await chapterService.getChaptersBySubject(
        subjectId,
        page,
        limit
      );
      if (response.success) {
        return response.data;
      }
      throw new Error("Không thể tải danh sách chương");
    },
    enabled: !!subjectId,
  });
}

// Hook để lấy chi tiết một chương
export function useChapter(chapterId: number) {
  return useQuery({
    queryKey: chapterKeys.detail(chapterId),
    queryFn: async () => {
      const response = await chapterService.getChapterById(chapterId);
      if (response.success) {
        return response.data;
      }
      throw new Error("Không thể tải thông tin chương");
    },
    enabled: !!chapterId,
  });
}

// Hook để tạo chương mới
export function useCreateChapter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateChapterRequest) => {
      return chapterService.createChapter(data);
    },
    onSuccess: (data, variables) => {
      toast.success("Tạo chương thành công!");
      // Invalidate tất cả các query liên quan đến chapter để đảm bảo refetch
      queryClient.invalidateQueries({ queryKey: chapterKeys.all });
    },
    onError: (error: any) => {
      console.error("❌ [Chapter Hook] Create error:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi tạo chương"
      );
    },
  });
}

// Hook để cập nhật chương
export function useUpdateChapter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      chapterId,
      data,
    }: {
      chapterId: number;
      data: UpdateChapterRequest;
    }) => {
      return chapterService.updateChapter(chapterId, data);
    },
    onSuccess: (data, variables) => {
      toast.success("Cập nhật chương thành công!");
      // Invalidate tất cả các query liên quan đến chapter
      queryClient.invalidateQueries({ queryKey: chapterKeys.all });
      // Invalidate cả query chi tiết của chapter vừa được cập nhật
      queryClient.invalidateQueries({
        queryKey: chapterKeys.detail(variables.chapterId),
      });
    },
    onError: (error: any) => {
      console.error("❌ [Chapter Hook] Update error:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật chương"
      );
    },
  });
}

// Hook để xóa chương
export function useDeleteChapter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      chapterId,
      subjectId,
    }: {
      chapterId: number;
      subjectId: number;
    }) => {
      return chapterService.deleteChapter(chapterId);
    },
    onSuccess: (data, variables) => {
      toast.success("Xóa chương thành công!");
      // Invalidate tất cả các query liên quan đến chapter
      queryClient.invalidateQueries({ queryKey: chapterKeys.all });
    },
    onError: (error: any) => {
      console.error("❌ [Chapter Hook] Delete error:", error);
      toast.error(
        error.response?.data?.data?.message ||
          error.response?.data?.message ||
          "Không thể xóa chương. Có thể do chương đã có câu hỏi."
      );
    },
  });
}

// THAY THẾ: Hook mới để cập nhật liên kết LO của một Chapter
export function useUpdateChapterLOs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      chapterId,
      loIds,
      subjectId,
    }: {
      chapterId: number;
      loIds: number[];
      subjectId: number;
    }) => chapterService.updateChapter(chapterId, { lo_ids: loIds }),
    onSuccess: (_, { subjectId }) => {
      // Không cần toast ở đây vì handleSave trong component sẽ hiển thị toast tổng
      // Invalidate query của chapters theo subject để cập nhật lại ma trận
      queryClient.invalidateQueries({
        queryKey: chapterKeys.bySubject(subjectId),
      });
    },
    onError: (error: any) => {
      // Lỗi sẽ được bắt ở component để hiển thị toast tổng
      console.error("❌ [Chapter Hook] Update LOs error:", error);
      throw error; // Ném lỗi ra để Promise.all trong component bắt được
    },
  });
}

// ===== SECTION HOOKS =====

// Hook để lấy danh sách section của một chapter
export function useChapterSections(chapterId: number) {
  return useQuery({
    queryKey: chapterKeys.sections(chapterId),
    queryFn: async () => {
      const response = await chapterService.getSectionsByChapter(chapterId);
      if (response.success) {
        return response.data.sections;
      }
      throw new Error("Không thể tải danh sách section");
    },
    enabled: !!chapterId,
  });
}

// Hook để thêm section vào chapter
export function useAddSectionToChapter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      chapterId,
      sections,
    }: {
      chapterId: number;
      sections: SectionCreateRequest[];
    }) => chapterService.addSectionsToChapter(chapterId, sections),
    onSuccess: (_, { chapterId }) => {
      toast.success("Thêm section thành công!");
      queryClient.invalidateQueries({
        queryKey: chapterKeys.sections(chapterId),
      });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi thêm section"
      );
    },
  });
}

// Hook để cập nhật section
export function useUpdateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      chapterId,
      sectionId,
      data,
    }: {
      chapterId: number;
      sectionId: number;
      data: Partial<SectionCreateRequest>;
    }) => chapterService.updateSection(chapterId, sectionId, data),
    onSuccess: (_, { chapterId }) => {
      toast.success("Cập nhật section thành công!");
      queryClient.invalidateQueries({
        queryKey: chapterKeys.sections(chapterId),
      });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật section"
      );
    },
  });
}

// Hook để xóa section
export function useDeleteSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      chapterId,
      sectionId,
    }: {
      chapterId: number;
      sectionId: number;
    }) => chapterService.deleteSection(chapterId, sectionId),
    onSuccess: (_, { chapterId }) => {
      toast.success("Xóa section thành công!");
      queryClient.invalidateQueries({
        queryKey: chapterKeys.sections(chapterId),
      });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi xóa section"
      );
    },
  });
}
