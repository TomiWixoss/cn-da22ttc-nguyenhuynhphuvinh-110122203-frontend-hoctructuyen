"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import shopService from "@/lib/services/api/shop.service";
import type {
  ShopItem,
  ShopApiResponse,
} from "@/lib/services/api/shop.service";

/**
 * Shop inventory hook options
 */
interface UseShopInventoryOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

/**
 * Shop inventory hook return type
 */
export interface UseShopInventoryReturn {
  avatars: ShopItem[];
  emojis: ShopItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

/**
 * Hook để quản lý shop inventory data
 * Fetch và cache dữ liệu từ shop service với error handling và loading states
 */
export function useShopInventory(
  options: UseShopInventoryOptions = {}
): UseShopInventoryReturn {
  const { autoRefresh = false, refreshInterval = 30000 } = options;

  // State management
  const [avatars, setAvatars] = useState<ShopItem[]>([]);
  const [emojis, setEmojis] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Refs for cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Fetch shop data từ service
   */
  const fetchShopData = useCallback(async () => {
    // Create new abort controller for this fetch
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      // Fetch tất cả shop data song song
      const [avatarsResponse, emojisResponse] = await Promise.all([
        shopService.getAvatars(),
        shopService.getEmojis(),
      ]);

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }


      // Cập nhật state với data từ response
      if (avatarsResponse.success) {
        setAvatars(avatarsResponse.data);
      }
      if (emojisResponse.success) {
        setEmojis(emojisResponse.data);
      }

      setLastUpdated(new Date());
    } catch (err) {
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch shop data";
      setError(errorMessage);
      console.error("Error fetching shop inventory:", err);
    } finally {
      // Always set loading to false unless aborted
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      } else {
      }
    }
  }, []);

  /**
   * Refresh shop data manually
   */
  const refresh = useCallback(async () => {
    await fetchShopData();
  }, [fetchShopData]);

  // Initial data fetch
  useEffect(() => {
    fetchShopData();
  }, []); // Empty dependency array - chỉ chạy một lần khi mount

  // Auto refresh setup
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchShopData();
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [autoRefresh, refreshInterval]); // Loại bỏ fetchShopData để tránh infinite loop

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Abort any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Clear intervals
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    avatars,
    emojis,
    loading,
    error,
    refresh,
    lastUpdated,
  };
}
