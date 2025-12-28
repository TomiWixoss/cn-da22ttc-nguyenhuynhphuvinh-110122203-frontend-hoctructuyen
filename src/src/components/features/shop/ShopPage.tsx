"use client";

import React, { useState, useMemo, useCallback } from "react";
import { ProductGrid } from "./ProductGrid";
import { ShopSearch } from "./ShopSearch";

export type TabType = "avatars" | "emojis";

interface ShopPageProps {
  className?: string;
}

interface ShopFilters {
  searchTerm: string;
  itemType: string;
  rarity: string;
  priceRange: string;
  sortBy: string;
  sortOrder: "ASC" | "DESC";
}

export const ShopPage: React.FC<ShopPageProps> = ({ className }) => {
  const [filters, setFilters] = useState<ShopFilters>({
    searchTerm: "",
    itemType: "",
    rarity: "",
    priceRange: "",
    sortBy: "name",
    sortOrder: "ASC",
  });

  // Statistics from ProductGrid
  const [statistics, setStatistics] = useState({
    total: 0,
    typeCounts: { avatars: 0, emojis: 0 },
    rarityCounts: { common: 0, rare: 0, epic: 0, legendary: 0 },
  });

  // Callback to receive statistics from ProductGrid - memoized to prevent infinite loops
  const handleStatisticsUpdate = useCallback((stats: typeof statistics) => {
    setStatistics(stats);
  }, []);

  // Handler functions
  const handleSearchChange = (searchTerm: string) => {
    setFilters((prev) => ({ ...prev, searchTerm }));
  };

  const handleItemTypeChange = (itemType: string) => {
    setFilters((prev) => ({ ...prev, itemType }));
  };

  const handleRarityChange = (rarity: string) => {
    setFilters((prev) => ({ ...prev, rarity }));
  };

  const handlePriceRangeChange = (priceRange: string) => {
    setFilters((prev) => ({ ...prev, priceRange }));
  };

  const handleSortByChange = (sortBy: string) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  };

  const handleSortOrderChange = (sortOrder: "ASC" | "DESC") => {
    setFilters((prev) => ({ ...prev, sortOrder }));
  };

  const handleClearFilters = () => {
    setFilters({
      searchTerm: "",
      itemType: "",
      rarity: "",
      priceRange: "",
      sortBy: "name",
      sortOrder: "ASC",
    });
  };

  return (
    <div className={className || ""}>
      {/* Shop Search & Filters */}
      <ShopSearch
        searchTerm={filters.searchTerm}
        onSearchChange={handleSearchChange}
        total={statistics.total}
        itemType={filters.itemType}
        onItemTypeChange={handleItemTypeChange}
        rarity={filters.rarity}
        onRarityChange={handleRarityChange}
        priceRange={filters.priceRange}
        onPriceRangeChange={handlePriceRangeChange}
        sortBy={filters.sortBy}
        onSortByChange={handleSortByChange}
        sortOrder={filters.sortOrder}
        onSortOrderChange={handleSortOrderChange}
        onClearFilters={handleClearFilters}
        typeCounts={statistics.typeCounts}
        rarityCounts={statistics.rarityCounts}
      />

      {/* Product Grid với filters */}
      <ProductGrid
        filters={filters}
        onStatisticsUpdate={handleStatisticsUpdate}
      />
    </div>
  );
};

export default ShopPage;
