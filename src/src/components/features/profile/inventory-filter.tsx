"use client";

import React from "react";
import { Filter, SortAsc, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/forms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";

interface InventoryFilterProps {
  total: number;
  // Filter props
  itemType?: string;
  onItemTypeChange: (itemType: string) => void;
  rarity?: string;
  onRarityChange: (rarity: string) => void;
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

export const InventoryFilter: React.FC<InventoryFilterProps> = ({
  total,
  itemType,
  onItemTypeChange,
  rarity,
  onRarityChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onClearFilters,
  typeCounts = { avatars: 0, emojis: 0 },
  rarityCounts = { common: 0, rare: 0, epic: 0, legendary: 0 },
}) => {
  const hasActiveFilters = itemType || rarity;

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
      case "COMMON":
        return "Thông thường";
      case "UNCOMMON":
        return "Không phổ biến";
      case "RARE":
        return "Hiếm";
      case "EPIC":
        return "Huyền thoại";
      case "LEGENDARY":
        return "Truyền thuyết";
      default:
        return "Tất cả";
    }
  };

  return (
    <div className="mb-6">
      {/* Bộ lọc và sắp xếp */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start lg:items-center">
        {/* Filters với thống kê tích hợp */}
        <div className="flex flex-wrap items-center gap-3">
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
                <SelectTrigger className="w-[180px] bg-background border-2 border-border/60">
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
                  <SelectItem value="avatar">
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
                  <SelectItem value="emoji">
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
              <SelectTrigger className="w-[180px] bg-background border-2 border-border/60">
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
                <SelectItem value="COMMON">
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
                <SelectItem value="UNCOMMON">
                  <div className="flex items-center justify-between w-full">
                    <span>Không phổ biến</span>
                    <Badge
                      variant="outline"
                      className="ml-2 text-xs bg-green-50 text-green-600 border-green-200"
                    >
                      {rarityCounts.rare}
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="RARE">
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
                <SelectItem value="EPIC">
                  <div className="flex items-center justify-between w-full">
                    <span>Huyền thoại</span>
                    <Badge
                      variant="outline"
                      className="ml-2 text-xs bg-purple-50 text-purple-600 border-purple-200"
                    >
                      {rarityCounts.epic}
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="LEGENDARY">
                  <div className="flex items-center justify-between w-full">
                    <span>Truyền thuyết</span>
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

          {/* Sort Options với viền */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              Sắp xếp theo
            </label>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={onSortByChange}>
                <SelectTrigger className="w-[160px] bg-background border-2 border-border/60">
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Tên</SelectItem>
                  <SelectItem value="rarity">Độ hiếm</SelectItem>
                  <SelectItem value="type">Loại</SelectItem>
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
            <div className="flex items-center pt-6">
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
        </div>
      )}
    </div>
  );
};
