/**
 * Feature Toggle Hooks
 * Custom hooks cho hệ thống Feature Toggles
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import featureToggleService from "@/lib/services/api/feature-toggle.service";
import {
  FeatureKey,
  ToggleFeatureRequest,
  SetAllFeaturesRequest,
} from "@/lib/types/feature-toggle";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast-utils";

// Query keys
export const featureToggleKeys = {
  all: ["features"] as const,
  status: () => [...featureToggleKeys.all, "status"] as const,
  memory: () => [...featureToggleKeys.all, "memory"] as const,
};

/**
 * Hook để lấy trạng thái features (dùng React Query)
 * Sử dụng cho các component cần reactive updates
 */
export function useFeatureStatus() {
  return useQuery({
    queryKey: featureToggleKeys.status(),
    queryFn: () => featureToggleService.getStatus(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Tắt để tránh block navigation
    refetchOnReconnect: false,
    retry: false, // Không retry để tránh block
    throwOnError: false, // Không throw error
  });
}

/**
 * Hook để lấy chi tiết memory (cho Admin dashboard)
 */
export function useMemoryStatus() {
  return useQuery({
    queryKey: featureToggleKeys.memory(),
    queryFn: () => featureToggleService.getMemoryStatus(),
    staleTime: 10 * 1000, // 10 seconds - cập nhật thường xuyên hơn
    gcTime: 60 * 1000, // 1 minute
    refetchInterval: 10 * 1000, // Auto refetch mỗi 10s
  });
}

/**
 * Hook để toggle một feature (Admin only)
 */
export function useToggleFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ToggleFeatureRequest) =>
      featureToggleService.toggleFeature(request),
    onSuccess: (data) => {
      showSuccessToast(data.message);
      // Invalidate để refetch status
      queryClient.invalidateQueries({ queryKey: featureToggleKeys.status() });
    },
    onError: (error: Error) => {
      showErrorToast(error.message || "Không thể thay đổi cấu hình");
    },
  });
}

/**
 * Hook để toggle feature và restart server (Admin only)
 */
export function useToggleAndRestart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ToggleFeatureRequest) =>
      featureToggleService.toggleAndRestart(request),
    onSuccess: (data) => {
      showSuccessToast(data.message);
      // Delay invalidate vì server đang restart
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: featureToggleKeys.all });
      }, 3000);
    },
    onError: (error: Error) => {
      showErrorToast(error.message || "Không thể restart server");
    },
  });
}

/**
 * Hook để restart server (Admin only)
 */
export function useRestartServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => featureToggleService.restartServer(),
    onSuccess: (data) => {
      showSuccessToast(data.message);
      // Delay invalidate vì server đang restart
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: featureToggleKeys.all });
      }, 3000);
    },
    onError: (error: Error) => {
      showErrorToast(error.message || "Không thể restart server");
    },
  });
}

/**
 * Hook để set tất cả features (Admin only)
 */
export function useSetAllFeatures() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SetAllFeaturesRequest) =>
      featureToggleService.setAllFeatures(request),
    onSuccess: (data, variables) => {
      showSuccessToast(data.message);
      if (variables.restart) {
        // Delay invalidate nếu có restart
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: featureToggleKeys.all });
        }, 3000);
      } else {
        queryClient.invalidateQueries({ queryKey: featureToggleKeys.status() });
      }
    },
    onError: (error: Error) => {
      showErrorToast(error.message || "Không thể cập nhật cấu hình");
    },
  });
}

/**
 * Helper hook để check feature enabled (dùng với React Query)
 */
export function useIsFeatureEnabled(feature: FeatureKey): boolean {
  const { data } = useFeatureStatus();
  return data?.features?.[feature] ?? true;
}
