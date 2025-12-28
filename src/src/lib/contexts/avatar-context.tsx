"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast-utils";
import { avatarService } from "@/lib/services";
import {
  MyAvatarDataResponse,
  AvailableItemsResponse,
  UserCustomization,
  UserInventory,
  CollectionProgress,
  AvatarData,
  EquipItemRequest,
  ItemType,
} from "@/lib/types/avatar";

import { useAuthStatus } from "@/lib/hooks/use-auth";

interface UseAvatarReturn {
  // Data
  myAvatarData: MyAvatarDataResponse["data"] | null;
  availableItems: AvailableItemsResponse["data"] | null;
  collectionProgress: CollectionProgress | null;

  // Loading states
  isLoading: boolean;
  isAvailableItemsLoading: boolean;
  isCollectionProgressLoading: boolean;
  isEquipping: boolean;

  // Error states
  error: string | null;
  availableItemsError: string | null;
  collectionProgressError: string | null;
  equipError: string | null;

  // Actions
  fetchMyAvatarData: () => Promise<void>;
  fetchAvailableItems: () => Promise<void>;
  fetchCollectionProgress: () => Promise<void>;
  equipItem: (request: EquipItemRequest) => Promise<boolean>;
  refreshData: () => Promise<void>;
  invalidateCache: () => void;

  // Computed values
  equippedAvatar: AvatarData | null;
  totalItems: number;
  completionRate: string;
  hasItems: boolean;

  // Additional utility methods
  hasItem: (itemType: "avatar" | "emoji", itemId: number) => boolean;
  getRarityColor: (rarity: string) => string;
  getRarityDisplayName: (rarity: string) => string;

  // Inventory data
  ownedAvatars: any[];
  ownedEmojis: any[];
}

// Create Context
const AvatarContext = createContext<UseAvatarReturn | undefined>(undefined);

// Create Provider
export function AvatarProvider({ children }: { children: React.ReactNode }) {
  // Data states
  const [myAvatarData, setMyAvatarData] = useState<
    MyAvatarDataResponse["data"] | null
  >(null);
  const [availableItems, setAvailableItems] = useState<
    AvailableItemsResponse["data"] | null
  >(null);
  const [collectionProgress, setCollectionProgress] =
    useState<CollectionProgress | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailableItemsLoading, setIsAvailableItemsLoading] = useState(false);
  const [isCollectionProgressLoading, setIsCollectionProgressLoading] =
    useState(false);
  const [isEquipping, setIsEquipping] = useState(false);

  // Error states
  const [error, setError] = useState<string | null>(null);
  const [availableItemsError, setAvailableItemsError] = useState<string | null>(
    null
  );
  const [collectionProgressError, setCollectionProgressError] = useState<
    string | null
  >(null);
  const [equipError, setEquipError] = useState<string | null>(null);

  // Cache management
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes TTL

  // Lấy đối tượng user (reactive) từ useAuthStatus
  const { user } = useAuthStatus();

  // Fetch my avatar data
  const fetchMyAvatarData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await avatarService.getMyAvatarData();

      if (data) {
        setMyAvatarData(data);
      } else {
        console.warn(
          "⚠️ [Avatar Context] Received null/undefined data from API"
        );
      }

      setLastFetchTime(Date.now());
    } catch (err: any) {
      const errorMessage = err.message || "Không thể tải dữ liệu avatar";
      setError(errorMessage);
      console.error("❌ [Avatar API] Error fetching my avatar data:", err);
      console.error("❌ [Avatar API] Error details:", err.response?.data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch available items
  const fetchAvailableItems = useCallback(async () => {
    try {
      setIsAvailableItemsLoading(true);
      setAvailableItemsError(null);

      const data = await avatarService.getAvailableItems();
      setAvailableItems(data);
    } catch (err: any) {
      const errorMessage = err.message || "Không thể tải danh sách items";
      setAvailableItemsError(errorMessage);
      console.error("❌ [Avatar API] Error fetching available items:", err);
    } finally {
      setIsAvailableItemsLoading(false);
    }
  }, []);

  // Fetch collection progress
  const fetchCollectionProgress = useCallback(async () => {
    try {
      setIsCollectionProgressLoading(true);
      setCollectionProgressError(null);

      const data = await avatarService.getCollectionProgress();
      setCollectionProgress(data);
    } catch (err: any) {
      const errorMessage = err.message || "Không thể tải tiến độ sưu tập";
      setCollectionProgressError(errorMessage);
      console.error(
        "❌ [Avatar Context] Error fetching collection progress:",
        err
      );
      console.error("❌ [Avatar Context] Error details:", err.response?.data);
    } finally {
      setIsCollectionProgressLoading(false);
    }
  }, []);

  // Equip item
  const equipItem = useCallback(
    async (request: EquipItemRequest): Promise<boolean> => {
      try {
        setIsEquipping(true);
        setEquipError(null);

        await avatarService.equipItem(request);

        // Show success notification first
        showSuccessToast("Trang bị vật phẩm thành công!");

        // Wait a bit for toast to show before refreshing
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Only refresh avatar data, not available items to avoid full reload
        await fetchMyAvatarData();

        return true;
      } catch (err: any) {
        const errorMessage = err.message || "Không thể trang bị item";
        setEquipError(errorMessage);
        console.error("❌ [Avatar Context] Error equipping item:", err);
        showErrorToast("Trang bị thất bại. Vui lòng thử lại.");
        return false;
      } finally {
        setIsEquipping(false);
      }
    },
    [myAvatarData]
  );

  // Refresh all data with caching
  const refreshData = useCallback(async () => {
    const now = Date.now();
    const shouldRefresh = now - lastFetchTime > CACHE_DURATION;

    if (shouldRefresh || lastFetchTime === 0) {
      await Promise.all([
        fetchMyAvatarData(),
        fetchAvailableItems(),
        fetchCollectionProgress(),
      ]);
    }
  }, [
    fetchMyAvatarData,
    fetchAvailableItems,
    fetchCollectionProgress,
    lastFetchTime,
    CACHE_DURATION,
  ]);

  // Invalidate cache manually
  const invalidateCache = useCallback(() => {
    setLastFetchTime(0);
  }, []);

  // Computed values
  const equippedAvatar = useMemo(() => {
    // Ưu tiên sử dụng equipped_avatar từ API response nếu có
    if (myAvatarData?.equipped_avatar) {
      return myAvatarData.equipped_avatar;
    }

    // Fallback: tìm trong inventory nếu API không trả về equipped_avatar
    if (!myAvatarData?.customization || !myAvatarData?.inventory) return null;
    return avatarService.getEquippedAvatar(
      myAvatarData.customization,
      myAvatarData.inventory
    );
  }, [
    myAvatarData?.equipped_avatar,
    myAvatarData?.customization,
    myAvatarData?.inventory,
  ]);

  const totalItems = useMemo(() => {
    if (!myAvatarData?.inventory) return 0;
    return (
      myAvatarData.inventory.avatars.length +
      myAvatarData.inventory.emojis.length
    );
  }, [myAvatarData?.inventory]);

  const completionRate = useMemo(() => {
    if (!myAvatarData?.statistics?.completion_rate) return "0%";
    return avatarService.formatCompletionRate(
      myAvatarData.statistics.completion_rate
    );
  }, [myAvatarData?.statistics?.completion_rate]);

  const hasItems = useMemo(() => {
    return totalItems > 0;
  }, [totalItems]);

  // Additional utility methods
  const hasItem = useCallback(
    (itemType: "avatar" | "emoji", itemId: number): boolean => {
      if (!myAvatarData?.inventory) return false;
      return avatarService.hasItem(itemType, itemId, myAvatarData.inventory);
    },
    [myAvatarData?.inventory]
  );

  const getRarityColor = useCallback((rarity: string): string => {
    return avatarService.getRarityColor(rarity);
  }, []);

  const getRarityDisplayName = useCallback((rarity: string): string => {
    return avatarService.getRarityDisplayName(rarity);
  }, []);

  // Inventory computed values
  const ownedAvatars = useMemo(() => {
    return myAvatarData?.inventory?.avatars || [];
  }, [myAvatarData?.inventory?.avatars]);

  const ownedEmojis = useMemo(() => {
    return myAvatarData?.inventory?.emojis || [];
  }, [myAvatarData?.inventory?.emojis]);

  // Auto-fetch on mount
  useEffect(() => {
    // Sử dụng `user` làm dependency. Khi user thay đổi (từ null sang object), effect sẽ chạy lại.
    if (user) {
      fetchMyAvatarData();
      fetchAvailableItems();
      fetchCollectionProgress();
    } else {
      setMyAvatarData(null);
      setAvailableItems(null);
      setCollectionProgress(null);
    }
  }, [user, fetchMyAvatarData, fetchAvailableItems, fetchCollectionProgress]);

  const value: UseAvatarReturn = {
    // Data
    myAvatarData,
    availableItems,
    collectionProgress,

    // Loading states
    isLoading,
    isAvailableItemsLoading,
    isCollectionProgressLoading,
    isEquipping,

    // Error states
    error,
    availableItemsError,
    collectionProgressError,
    equipError,

    // Actions
    fetchMyAvatarData,
    fetchAvailableItems,
    fetchCollectionProgress,
    equipItem,
    refreshData,
    invalidateCache,

    // Computed values
    equippedAvatar,
    totalItems,
    completionRate,
    hasItems,

    // Additional utility methods
    hasItem,
    getRarityColor,
    getRarityDisplayName,

    // Inventory data
    ownedAvatars,
    ownedEmojis,
  };

  return (
    <AvatarContext.Provider value={value}>{children}</AvatarContext.Provider>
  );
}

// Create hook to use Context
export function useAvatarContext() {
  const context = useContext(AvatarContext);
  if (context === undefined) {
    throw new Error("useAvatarContext must be used within an AvatarProvider");
  }
  return context;
}
