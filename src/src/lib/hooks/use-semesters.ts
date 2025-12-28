import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  SemesterService,
  type Semester,
  type CreateSemesterRequest,
} from "@/lib/services/api/semester.service";
import { toast } from "sonner";

// Query keys
export const semesterKeys = {
  all: ["semesters"] as const,
  lists: () => [...semesterKeys.all, "list"] as const,
  list: (filters: string) => [...semesterKeys.lists(), { filters }] as const,
  details: () => [...semesterKeys.all, "detail"] as const,
  detail: (id: number) => [...semesterKeys.details(), id] as const,
  active: () => [...semesterKeys.all, "active"] as const,
  byBatch: (batchId: number) =>
    [...semesterKeys.all, "byBatch", batchId] as const,
};

// Fetch all semesters
export function useSemesters(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: semesterKeys.lists(),
    queryFn: () => SemesterService.getAllSemesters(params),
  });
}

// Fetch semester by ID (using statistics endpoint as fallback)
export function useSemester(semesterId: number) {
  return useQuery({
    queryKey: semesterKeys.detail(semesterId),
    queryFn: () => SemesterService.getSemesterStatistics(semesterId),
    enabled: !!semesterId,
  });
}

// Fetch active semester
export function useActiveSemester() {
  return useQuery({
    queryKey: semesterKeys.active(),
    queryFn: () => SemesterService.getActiveSemester(),
  });
}

// Fetch semesters by Training Batch
export function useSemestersByBatch(batchId: number) {
  return useQuery({
    queryKey: semesterKeys.byBatch(batchId),
    queryFn: async () => {
      const response = await SemesterService.getSemestersByBatch(batchId);
      // Service đã trả về { success: true, data: Semester[] }
      // Đảm bảo trả về array và sort theo thứ tự (active semester lên đầu)
      const semesters = Array.isArray(response.data) ? response.data : [];
      return semesters.sort((a, b) => {
        // Đưa semester active lên đầu
        if (a.is_active && !b.is_active) return -1;
        if (!a.is_active && b.is_active) return 1;
        // Sau đó sort theo start_date
        return (
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        );
      });
    },
    enabled: !!batchId,
  });
}

// Create semester mutation
export function useCreateSemester() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSemesterRequest) =>
      SemesterService.createSemester(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Đã tạo học kỳ mới");
        // Invalidate and refetch semesters list
        // Invalidate tất cả semester list queries
        queryClient.invalidateQueries({
          queryKey: semesterKeys.all,
          predicate: (query) => {
            return (
              query.queryKey[0] === "semesters" && query.queryKey[1] === "list"
            );
          },
        });
      } else {
        toast.error("Không thể tạo học kỳ");
      }
    },
    onError: (error: any) => {
      console.error("Error creating semester:", error);
      toast.error("Không thể tạo học kỳ");
    },
  });
}

// Update semester mutation
export function useUpdateSemester() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      semesterId,
      data,
    }: {
      semesterId: number;
      data: CreateSemesterRequest;
    }) => SemesterService.updateSemester(semesterId, data),
    onSuccess: (response, { semesterId }) => {
      if (response.success) {
        toast.success("Đã cập nhật học kỳ");
        // Invalidate and refetch semesters list and specific semester
        // Invalidate tất cả semester list queries
        queryClient.invalidateQueries({
          queryKey: semesterKeys.all,
          predicate: (query) => {
            return (
              query.queryKey[0] === "semesters" && query.queryKey[1] === "list"
            );
          },
        });
        queryClient.invalidateQueries({
          queryKey: semesterKeys.detail(semesterId),
        });
      } else {
        toast.error("Không thể cập nhật học kỳ");
      }
    },
    onError: (error: any) => {
      console.error("Error updating semester:", error);
      toast.error("Không thể cập nhật học kỳ");
    },
  });
}

// Delete semester mutation
export function useDeleteSemester() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (semesterId: number) =>
      SemesterService.deleteSemester(semesterId),
    onSuccess: () => {
      toast.success("Xóa học kỳ thành công");
      // Invalidate tất cả semester queries (bao gồm cả byBatch)
      queryClient.invalidateQueries({
        queryKey: semesterKeys.all,
      });
    },
    onError: (error: any) => {
      console.error("Error deleting semester:", error);
      toast.error("Có lỗi xảy ra khi xóa học kỳ");
    },
  });
}

// Activate semester mutation
export function useActivateSemester() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (semesterId: number) =>
      SemesterService.activateSemester(semesterId),
    onSuccess: () => {
      toast.success("Kích hoạt học kỳ thành công");
      // Invalidate and refetch semesters list and active semester
      // Invalidate tất cả semester queries
      queryClient.invalidateQueries({
        queryKey: semesterKeys.all,
        predicate: (query) => {
          return query.queryKey[0] === "semesters";
        },
      });
    },
    onError: (error: any) => {
      console.error("Error activating semester:", error);
      toast.error("Có lỗi xảy ra khi kích hoạt học kỳ");
    },
  });
}
