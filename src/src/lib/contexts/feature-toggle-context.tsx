"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  FeatureFlags,
  FeatureKey,
  MemoryInfo,
  DEFAULT_FEATURE_FLAGS,
} from "@/lib/types/feature-toggle";
import featureToggleService from "@/lib/services/api/feature-toggle.service";

interface FeatureToggleContextType {
  // Feature flags
  features: FeatureFlags;
  // Memory info
  memory: MemoryInfo | null;
  // Server uptime
  uptime: number;
  // Loading state
  isLoading: boolean;
  // Error state
  error: string | null;
  // Check if a specific feature is enabled
  isFeatureEnabled: (feature: FeatureKey) => boolean;
  // Refresh feature status from server
  refreshStatus: () => Promise<void>;
  // Last updated timestamp
  lastUpdated: Date | null;
}

const FeatureToggleContext = createContext<
  FeatureToggleContextType | undefined
>(undefined);

interface FeatureToggleProviderProps {
  children: ReactNode;
  // Polling interval in ms (default: 60 seconds)
  pollingInterval?: number;
}

export function FeatureToggleProvider({
  children,
  pollingInterval = 60000,
}: FeatureToggleProviderProps) {
  const [features, setFeatures] = useState<FeatureFlags>(DEFAULT_FEATURE_FLAGS);
  const [memory, setMemory] = useState<MemoryInfo | null>(null);
  const [uptime, setUptime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await featureToggleService.getStatus();
      if (response.success) {
        setFeatures(response.features);
        setMemory(response.memory);
        setUptime(response.uptime);
        setLastUpdated(new Date(response.timestamp));
        setError(null);
      }
    } catch (err) {
      console.error("Failed to fetch feature status:", err);
      setError("Không thể kết nối đến server");
      // Giữ nguyên features hiện tại khi có lỗi
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Polling để cập nhật status định kỳ
  useEffect(() => {
    if (pollingInterval <= 0) return;

    const intervalId = setInterval(fetchStatus, pollingInterval);
    return () => clearInterval(intervalId);
  }, [fetchStatus, pollingInterval]);

  // Check if a specific feature is enabled
  const isFeatureEnabled = useCallback(
    (feature: FeatureKey): boolean => {
      return features[feature] ?? true;
    },
    [features]
  );

  // Manual refresh
  const refreshStatus = useCallback(async () => {
    setIsLoading(true);
    await fetchStatus();
  }, [fetchStatus]);

  const value: FeatureToggleContextType = {
    features,
    memory,
    uptime,
    isLoading,
    error,
    isFeatureEnabled,
    refreshStatus,
    lastUpdated,
  };

  return (
    <FeatureToggleContext.Provider value={value}>
      {children}
    </FeatureToggleContext.Provider>
  );
}

/**
 * Hook để sử dụng Feature Toggle context
 */
export function useFeatureToggle(): FeatureToggleContextType {
  const context = useContext(FeatureToggleContext);
  if (context === undefined) {
    throw new Error(
      "useFeatureToggle must be used within a FeatureToggleProvider"
    );
  }
  return context;
}

/**
 * Hook đơn giản để check một feature có enabled không
 */
export function useFeatureEnabled(feature: FeatureKey): boolean {
  const { isFeatureEnabled } = useFeatureToggle();
  return isFeatureEnabled(feature);
}
