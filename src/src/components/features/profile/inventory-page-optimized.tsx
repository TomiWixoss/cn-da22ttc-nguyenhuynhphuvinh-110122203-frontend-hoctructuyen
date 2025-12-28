"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { InventoryGridOptimized } from "./inventory-grid-optimized";
import { InventoryFilter } from "./inventory-filter";
import { useAvatar } from "@/lib/hooks/use-avatar";
import gsap from "gsap";

interface InventoryFilters {
  itemType?: string;
  rarity?: string;
  sortBy: string;
  sortOrder: "ASC" | "DESC";
}

interface InventoryPageOptimizedProps {
  className?: string;
}

export const InventoryPageOptimized: React.FC<InventoryPageOptimizedProps> = ({
  className,
}) => {
  const {
    ownedAvatars,
    ownedEmojis,
    isLoading,
    error,
    equipItem,
    equippedAvatar,
    myAvatarData,
    isEquipping,
  } = useAvatar();

  // DEBUG: Log inventory data

  const [filters, setFilters] = useState<InventoryFilters>({
    itemType: "",
    rarity: "",
    sortBy: "name",
    sortOrder: "ASC",
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Animate page entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo(
        filterRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      ).fromTo(
        gridContainerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        "-=0.3"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Statistics from InventoryGridOptimized
  const [statistics, setStatistics] = useState({
    total: 0,
    typeCounts: { avatars: 0, emojis: 0 },
    rarityCounts: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 },
  });

  // Callback to receive statistics from InventoryGridOptimized
  const handleStatisticsUpdate = useCallback((stats: typeof statistics) => {
    setStatistics(stats);
  }, []);

  // Handler functions
  const handleItemTypeChange = (itemType: string) => {
    setFilters((prev) => ({ ...prev, itemType }));
  };

  const handleRarityChange = (rarity: string) => {
    setFilters((prev) => ({ ...prev, rarity }));
  };

  const handleSortByChange = (sortBy: string) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  };

  const handleSortOrderChange = (sortOrder: "ASC" | "DESC") => {
    setFilters((prev) => ({ ...prev, sortOrder }));
  };

  const handleClearFilters = () => {
    setFilters({
      itemType: "",
      rarity: "",
      sortBy: "name",
      sortOrder: "ASC",
    });
  };

  // Equipment handlers
  const handleEquipAvatar = async (avatarId: number) => {
    await equipItem({
      itemType: "avatar",
      itemId: avatarId,
    });
  };

  const handleEquipEmoji = async (emojiId: number) => {
    await equipItem({
      itemType: "emoji",
      itemId: emojiId,
    });
  };

  return (
    <div ref={containerRef} className={className || ""}>
      {/* Inventory Filter */}
      <div ref={filterRef}>
        <InventoryFilter
          total={statistics.total}
          itemType={filters.itemType}
          onItemTypeChange={handleItemTypeChange}
          rarity={filters.rarity}
          onRarityChange={handleRarityChange}
          sortBy={filters.sortBy}
          onSortByChange={handleSortByChange}
          sortOrder={filters.sortOrder}
          onSortOrderChange={handleSortOrderChange}
          onClearFilters={handleClearFilters}
          typeCounts={statistics.typeCounts}
          rarityCounts={statistics.rarityCounts}
        />
      </div>

      {/* Optimized Inventory Grid using my-data API */}
      <div ref={gridContainerRef}>
        <InventoryGridOptimized
          ownedAvatars={ownedAvatars}
          ownedEmojis={ownedEmojis}
          equippedAvatarId={equippedAvatar?.avatar_id}
          equippedEmojiId={undefined} // API không trả về equipped_emoji
          isLoading={isLoading}
          isEquipping={isEquipping}
          onEquipAvatar={handleEquipAvatar}
          onEquipEmoji={handleEquipEmoji}
          filters={filters}
          onStatisticsUpdate={handleStatisticsUpdate}
        />
      </div>
    </div>
  );
};

export default InventoryPageOptimized;
