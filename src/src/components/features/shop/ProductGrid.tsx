"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "./EmptyState";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { useShopInventory } from "@/lib/hooks/shop";
import type { ShopItem } from "@/lib/services/api/shop.service";

interface ShopFilters {
  searchTerm: string;
  itemType: string;
  rarity: string;
  priceRange: string;
  sortBy: string;
  sortOrder: "ASC" | "DESC";
}

interface ProductGridProps {
  filters: ShopFilters;
  className?: string;
  onStatisticsUpdate?: (stats: {
    total: number;
    typeCounts: { avatars: number; emojis: number };
    rarityCounts: {
      common: number;
      rare: number;
      epic: number;
      legendary: number;
    };
  }) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  filters,
  className,
  onStatisticsUpdate,
}) => {

  // Use shop inventory hook
  const { avatars, emojis, loading, error, refresh } = useShopInventory({
    autoRefresh: false,
  });


  // Combine all items with their types
  const getAllItems = (): (ShopItem & {
    itemType: "avatars" | "emojis";
  })[] => {
    const allItems: (ShopItem & {
      itemType: "avatars" | "emojis";
    })[] = [
      ...avatars.map((item) => ({ ...item, itemType: "avatars" as const })),
      ...emojis.map((item) => ({ ...item, itemType: "emojis" as const })),
    ];

    return allItems;
  };

  // Calculate and send statistics to parent component
  React.useEffect(() => {
    if (!loading && !error) {
      const allItems = getAllItems();

      // Calculate type counts
      const typeCounts = {
        avatars: avatars.length,
        emojis: emojis.length,
      };

      // Calculate rarity counts
      const rarityCounts = {
        common: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
      };

      allItems.forEach((item) => {
        if (item.rarity === "common") rarityCounts.common++;
        else if (item.rarity === "rare") rarityCounts.rare++;
        else if (item.rarity === "epic") rarityCounts.epic++;
        else if (item.rarity === "legendary") rarityCounts.legendary++;
      });

      // Send statistics to parent
      onStatisticsUpdate?.({
        total: allItems.length,
        typeCounts,
        rarityCounts,
      });
    }
  }, [avatars, emojis, loading, error]);

  // Apply filters and sorting
  const filteredAndSortedItems = useMemo(() => {
    let items = getAllItems();

    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          (item.description &&
            item.description.toLowerCase().includes(searchLower))
      );
    }

    // Apply item type filter
    if (filters.itemType) {
      items = items.filter((item) => item.itemType === filters.itemType);
    }

    // Apply rarity filter
    if (filters.rarity) {
      items = items.filter((item) => item.rarity === filters.rarity);
    }

    // Apply price range filter
    if (filters.priceRange) {
      items = items.filter((item) => {
        const price = item.price;
        switch (filters.priceRange) {
          case "0-1000":
            return price >= 0 && price <= 1000;
          case "1001-5000":
            return price >= 1001 && price <= 5000;
          case "5001-10000":
            return price >= 5001 && price <= 10000;
          case "10001+":
            return price > 10000;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    items.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "price":
          comparison = a.price - b.price;
          break;
        case "rarity":
          const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
          const aRarity =
            rarityOrder[a.rarity as keyof typeof rarityOrder] ?? 0;
          const bRarity =
            rarityOrder[b.rarity as keyof typeof rarityOrder] ?? 0;
          comparison = aRarity - bRarity;
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }

      return filters.sortOrder === "DESC" ? -comparison : comparison;
    });

    return items;
  }, [avatars, emojis, filters]);

  /**
   * Handle purchase success callback
   */
  const handlePurchaseSuccess = (itemId: string) => {
    // Optionally refresh inventory or handle success
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("space-y-6", className)}>
        <EmptyState
          title="Lỗi tải dữ liệu"
          description={error}
          action={{
            label: "Thử lại",
            onClick: refresh,
          }}
        />
      </div>
    );
  }

  if (filteredAndSortedItems.length === 0) {
    const hasActiveFilters =
      filters.searchTerm ||
      filters.itemType ||
      filters.rarity ||
      filters.priceRange;

    return (
      <div className={cn("space-y-6", className)}>
        <EmptyState
          title={
            hasActiveFilters ? "Không tìm thấy vật phẩm" : "Chưa có vật phẩm"
          }
          description={
            hasActiveFilters
              ? "Không có vật phẩm nào phù hợp với bộ lọc hiện tại. Hãy thử thay đổi bộ lọc hoặc tìm kiếm khác."
              : "Hiện tại chưa có vật phẩm nào trong cửa hàng."
          }
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Grid Layout dạng Ticket - Ticket có chiều ngang lớn hơn */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 justify-items-center">
        {filteredAndSortedItems.map((item) => (
          <ProductCard
            key={`${item.itemType}-${item.id}`}
            item={item}
            itemType={item.itemType}
            onPurchaseSuccess={handlePurchaseSuccess}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
