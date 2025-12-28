"use client";

import React from "react";
import { Search, Filter, SortAsc, SortDesc } from "lucide-react";
import { Input } from "@/components/ui/forms";
import { Button } from "@/components/ui/forms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";

interface ShopSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  total: number;
  // Filter props
  itemType?: string;
  onItemTypeChange: (itemType: string) => void;
  rarity?: string;
  onRarityChange: (rarity: string) => void;
  priceRange?: string;
  onPriceRangeChange: (priceRange: string) => void;
  // Sort props
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
  sortOrder: "ASC" | "DESC";
  onSortOrderChange: (sortOrder: "ASC" | "DESC") => void;
  // Clear filters
  onClearFilters: () => void;
  // Statistics for each option
  typeCounts?: {
    avatars: number;
    emojis: number;
  };
  rarityCounts?: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
  };
}

export const ShopSearch: React.FC<ShopSearchProps> = ({
  searchTerm,
  onSearchChange,
  total,
  itemType,
  onItemTypeChange,
  rarity,
  onRarityChange,
  priceRange,
  onPriceRangeChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onClearFilters,
  typeCounts = { avatars: 0, emojis: 0 },
  rarityCounts = { common: 0, rare: 0, epic: 0, legendary: 0 },
}) => {
  const hasActiveFilters = itemType || rarity || priceRange || searchTerm;

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case "avatars":
        return "Avatar";
      case "emojis":
        return "Emoji";
      default:
        return "Tất cả";
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "Thông thường";
      case "rare":
        return "Hiếm";
      case "epic":
        return "Sử thi";
      case "legendary":
        return "Huyền thoại";
      default:
        return "Tất cả";
    }
  };

  const getPriceRangeLabel = (range: string) => {
    switch (range) {
      case "0-1000":
        return "0 - 1,000 SynCoin";
      case "1001-5000":
        return "1,001 - 5,000 SynCoin";
      case "5001-10000":
        return "5,001 - 10,000 SynCoin";
      case "10001+":
        return "Trên 10,000 SynCoin";
      default:
        return "Tất cả";
    }
  };

  return (
    <div className="mb-6">
      {/* Tìm kiếm và bộ lọc trên cùng 1 dòng */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start lg:items-center">
        {/* Search bar - với label và viền riêng */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">
            Tìm kiếm
          </label>
          <div className={`relative flex-1 max-w-lg ${ hasActiveFilters ? 'min-w-[280px]' : 'min-w-[400px]' }`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm vật phẩm theo tên..."
              className="pl-10 h-10 text-sm border-2 border-border/60 rounded-lg focus-visible:ring-primary/20 bg-background"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Filters với thống kê tích hợp */}
        <div className="flex flex-wrap items-end gap-3">
          {/* Item Type Filter với thống kê */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              Loại vật phẩm
            </label>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={itemType || "all"}
                onValueChange={(value) =>
                  onItemTypeChange(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-[140px] bg-background border-2 border-border/60">
                  <SelectValue placeholder="Loại vật phẩm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center justify-between w-full">
                      <span>Tất cả</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {total}
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="avatars">
                    <div className="flex items-center justify-between w-full">
                      <span>Avatar</span>
                      <Badge
                        variant="outline"
                        className="ml-2 text-xs bg-blue-50 text-blue-600 border-blue-200"
                      >
                        {typeCounts.avatars}
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="emojis">
                    <div className="flex items-center justify-between w-full">
                      <span>Emoji</span>
                      <Badge
                        variant="outline"
                        className="ml-2 text-xs bg-green-50 text-green-600 border-green-200"
                      >
                        {typeCounts.emojis}
                      </Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Rarity Filter với thống kê */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              Độ hiếm
            </label>
            <Select
              value={rarity || "all"}
              onValueChange={(value) =>
                onRarityChange(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-[140px] bg-background border-2 border-border/60">
                <SelectValue placeholder="Độ hiếm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center justify-between w-full">
                    <span>Tất cả</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {total}
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="common">
                  <div className="flex items-center justify-between w-full">
                    <span>Thông thường</span>
                    <Badge
                      variant="outline"
                      className="ml-2 text-xs bg-gray-50 text-gray-600 border-gray-200"
                    >
                      {rarityCounts.common}
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="rare">
                  <div className="flex items-center justify-between w-full">
                    <span>Hiếm</span>
                    <Badge
                      variant="outline"
                      className="ml-2 text-xs bg-blue-50 text-blue-600 border-blue-200"
                    >
                      {rarityCounts.rare}
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="epic">
                  <div className="flex items-center justify-between w-full">
                    <span>Sử thi</span>
                    <Badge
                      variant="outline"
                      className="ml-2 text-xs bg-purple-50 text-purple-600 border-purple-200"
                    >
                      {rarityCounts.epic}
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="legendary">
                  <div className="flex items-center justify-between w-full">
                    <span>Huyền thoại</span>
                    <Badge
                      variant="outline"
                      className="ml-2 text-xs bg-yellow-50 text-yellow-600 border-yellow-200"
                    >
                      {rarityCounts.legendary}
                    </Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              Khoảng giá
            </label>
            <Select
              value={priceRange || "all"}
              onValueChange={(value) =>
                onPriceRangeChange(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-[170px] bg-background border-2 border-border/60">
                <SelectValue placeholder="Khoảng giá" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <span>Tất cả mức giá</span>
                </SelectItem>
                <SelectItem value="0-1000">
                  <span>0 - 1,000</span>
                </SelectItem>
                <SelectItem value="1001-5000">
                  <span>1,001 - 5,000</span>
                </SelectItem>
                <SelectItem value="5001-10000">
                  <span>5,001 - 10,000</span>
                </SelectItem>
                <SelectItem value="10001+">
                  <span>Trên 10,000</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Options với viền */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              Sắp xếp theo
            </label>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={onSortByChange}>
                <SelectTrigger className="w-[120px] bg-background border-2 border-border/60">
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Tên</SelectItem>
                  <SelectItem value="price">Giá</SelectItem>
                  <SelectItem value="rarity">Độ hiếm</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onSortOrderChange(sortOrder === "ASC" ? "DESC" : "ASC")
                }
                className="px-2 bg-background border-2 border-border/60"
              >
                {sortOrder === "ASC" ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Clear filters button với viền - nằm cùng hàng với các bộ lọc */}
          {hasActiveFilters && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground opacity-0">
                &nbsp;
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="text-xs border-2 border-border/60 h-10"
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-border/30 mt-4">
          {itemType && (
            <Badge variant="secondary" className="text-xs">
              Loại: {getItemTypeLabel(itemType)}
            </Badge>
          )}
          {rarity && (
            <Badge variant="secondary" className="text-xs">
              Độ hiếm: {getRarityLabel(rarity)}
            </Badge>
          )}
          {priceRange && (
            <Badge variant="secondary" className="text-xs">
              Giá: {getPriceRangeLabel(priceRange)}
            </Badge>
          )}
          {searchTerm && (
            <Badge variant="secondary" className="text-xs">
              Tìm kiếm: &quot;{searchTerm}&quot;
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default ShopSearch;
