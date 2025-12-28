"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/feedback";
import {
  Palette,
  Smile,
  Lock,
  Check,
  Star,
  Sparkles,
  Crown,
  Gem,
} from "lucide-react";
import Image from "next/image";
import { AvatarData } from "@/lib/types/avatar";
import { cn } from "@/lib/utils";
import gsap from "gsap";

interface InventoryFilters {
  itemType?: string;
  rarity?: string;
  sortBy: string;
  sortOrder: "ASC" | "DESC";
}

interface InventoryGridOptimizedProps {
  ownedAvatars: AvatarData[];
  ownedEmojis: any[]; // EmojiData type from inventory
  equippedAvatarId?: number;
  equippedEmojiId?: number;
  isLoading: boolean;
  isEquipping: boolean;
  onEquipAvatar: (avatarId: number) => Promise<void>;
  onEquipEmoji: (emojiId: number) => Promise<void>;
  // Filter props
  filters?: InventoryFilters;
  onStatisticsUpdate?: (stats: {
    total: number;
    typeCounts: { avatars: number; emojis: number };
    rarityCounts: {
      common: number;
      uncommon: number;
      rare: number;
      epic: number;
      legendary: number;
    };
  }) => void;
}

type InventoryItem = {
  id: number;
  name: string;
  description: string;
  image_path: string;
  rarity: string;
  unlock_type: string;
  unlock_level: number;
  type: "avatar" | "emoji";
  owned: boolean;
  equipped: boolean;
};

const rarityColors = {
  COMMON: "border-gray-400",
  UNCOMMON: "border-green-400",
  RARE: "border-blue-400",
  EPIC: "border-purple-400",
  LEGENDARY: "border-yellow-400",
};

const rarityIcons = {
  COMMON: null,
  UNCOMMON: Star,
  RARE: Sparkles,
  EPIC: Crown,
  LEGENDARY: Gem,
};

export const InventoryGridOptimized: React.FC<InventoryGridOptimizedProps> = ({
  ownedAvatars,
  ownedEmojis,
  equippedAvatarId,
  equippedEmojiId,
  isLoading,
  isEquipping,
  onEquipAvatar,
  onEquipEmoji,
  filters,
  onStatisticsUpdate,
}) => {
  // DEBUG: Log props received

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const equippedBadgeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dialogContentRef = useRef<HTMLDivElement>(null);

  // Convert owned items to unified format - ONLY OWNED ITEMS
  const allItems = useMemo(() => {
    const items: InventoryItem[] = [];

    // Add owned avatars only
    ownedAvatars.forEach((inventoryItem: any) => {
      const avatar = inventoryItem.Avatar || inventoryItem; // Handle both structures
      items.push({
        id: avatar.avatar_id,
        name: avatar.avatar_name,
        description: avatar.description,
        image_path: avatar.image_path,
        rarity: avatar.rarity,
        unlock_type: avatar.unlock_type,
        unlock_level: 0, // Not available in AvatarData
        type: "avatar",
        owned: true, // All items here are owned
        equipped: avatar.avatar_id === equippedAvatarId,
      });
    });

    // Add owned emojis only - Emoji KHÔNG THỂ trang bị trong hệ thống hiện tại
    ownedEmojis.forEach((inventoryItem: any) => {
      const emoji = inventoryItem.Emoji || inventoryItem; // Handle both structures
      items.push({
        id: emoji.emoji_type_id,
        name: emoji.name,
        description: emoji.description,
        image_path: emoji.image_path,
        rarity: emoji.rarity,
        unlock_type: emoji.unlock_method,
        unlock_level: 0, // Not available for emojis
        type: "emoji",
        owned: true,
        equipped: false, // Emoji không thể trang bị trong hệ thống hiện tại
      });
    });

    return items;
  }, [ownedAvatars, ownedEmojis, equippedAvatarId, equippedEmojiId]);

  // Calculate statistics and send to parent
  React.useEffect(() => {
    if (onStatisticsUpdate && allItems.length >= 0) {
      const typeCounts = { avatars: 0, emojis: 0 };
      const rarityCounts = {
        common: 0,
        uncommon: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
      };
      const ownershipCounts = { owned: allItems.length, locked: 0 }; // All items are owned

      allItems.forEach((item) => {
        // Count by type
        if (item.type === "avatar") typeCounts.avatars++;
        else if (item.type === "emoji") typeCounts.emojis++;

        // Count by rarity
        const rarity = item.rarity?.toLowerCase() || "common";
        if (rarity === "common") rarityCounts.common++;
        else if (rarity === "uncommon") rarityCounts.uncommon++;
        else if (rarity === "rare") rarityCounts.rare++;
        else if (rarity === "epic") rarityCounts.epic++;
        else if (rarity === "legendary") rarityCounts.legendary++;
      });

      onStatisticsUpdate({
        total: allItems.length,
        typeCounts,
        rarityCounts,
      });
    }
  }, [allItems, onStatisticsUpdate]);

  // Apply filters and sorting
  const filteredAndSortedItems = useMemo(() => {
    let items = [...allItems];

    if (filters) {
      // Apply item type filter
      if (filters.itemType) {
        items = items.filter((item) => item.type === filters.itemType);
      }

      // Apply rarity filter
      if (filters.rarity) {
        items = items.filter((item) => item.rarity === filters.rarity);
      }

      // Apply sorting
      items.sort((a, b) => {
        let comparison = 0;

        switch (filters.sortBy) {
          case "name":
            comparison = (a.name || "").localeCompare(b.name || "");
            break;
          case "rarity":
            const rarityOrder = [
              "COMMON",
              "UNCOMMON",
              "RARE",
              "EPIC",
              "LEGENDARY",
            ];
            comparison =
              rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
            break;
          case "type":
            comparison = (a.type || "").localeCompare(b.type || "");
            break;
          default:
            comparison = (a.name || "").localeCompare(b.name || "");
        }

        return filters.sortOrder === "DESC" ? -comparison : comparison;
      });
    }

    return items;
  }, [allItems, filters]);

  const displayItems = filters ? filteredAndSortedItems : allItems;

  // Animate grid items on mount and when items change
  useEffect(() => {
    if (!isLoading && itemRefs.current.length > 0) {
      gsap.fromTo(
        itemRefs.current,
        {
          opacity: 0,
          scale: 0.8,
          y: 20,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          stagger: {
            amount: 0.6,
            grid: "auto",
            from: "start",
          },
          ease: "back.out(1.2)",
          clearProps: "all",
        }
      );
    }
  }, [displayItems, isLoading]);

  // Animate equipped badges
  useEffect(() => {
    equippedBadgeRefs.current.forEach((badge) => {
      if (badge) {
        gsap.to(badge, {
          scale: 1.2,
          duration: 0.8,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
        });
      }
    });
  }, [displayItems]);

  const handleItemClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);

    // Animate dialog when it opens
    setTimeout(() => {
      if (dialogContentRef.current) {
        gsap.fromTo(
          dialogContentRef.current,
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.5)" }
        );
      }
    }, 50);
  };

  const handleEquipItem = async () => {
    if (!selectedItem || !selectedItem.owned) return;

    try {
      switch (selectedItem.type) {
        case "avatar":
          await onEquipAvatar(selectedItem.id);
          break;
        case "emoji":
          await onEquipEmoji(selectedItem.id);
          break;
      }

      // Success animation before closing
      if (dialogContentRef.current) {
        gsap.to(dialogContentRef.current, {
          scale: 1.05,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut",
          onComplete: () => {
            setIsDialogOpen(false);
          },
        });
      } else {
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error equipping item:", error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "avatar":
        return <Palette className="w-4 h-4" />;
      case "emoji":
        return <Smile className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case "avatar":
        return "Ảnh đại diện";
      case "emoji":
        return "Biểu tượng cảm xúc";
      default:
        return type;
    }
  };

  const getRarityName = (rarity: string) => {
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
        return rarity;
    }
  };

  const RarityIcon = selectedItem
    ? rarityIcons[selectedItem.rarity as keyof typeof rarityIcons]
    : null;

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-3 p-2 sm:p-4">
        {Array.from({ length: 32 }).map((_, index) => (
          <div
            key={index}
            className="aspect-square bg-muted/50 dark:bg-muted/30 animate-pulse rounded-lg border-2 border-muted dark:border-muted/50"
          />
        ))}
      </div>
    );
  }

  // Show empty state if no items
  if (displayItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Palette className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">Chưa có vật phẩm nào</h3>
        <p className="text-muted-foreground max-w-sm">
          {filters?.itemType || filters?.rarity
            ? "Không tìm thấy vật phẩm nào phù hợp với bộ lọc hiện tại."
            : "Bạn chưa sở hữu vật phẩm nào. Hãy tham gia các hoạt động để mở khóa vật phẩm mới!"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        ref={gridRef}
        className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-3 p-2 sm:p-4"
      >
        {displayItems.map((item, index) => {
          const rarityColor =
            rarityColors[item.rarity as keyof typeof rarityColors] ||
            rarityColors.COMMON;

          return (
            <div
              key={`${item.type}-${item.id || index}`}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              onClick={() => handleItemClick(item)}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  scale: 1.1,
                  y: -4,
                  duration: 0.3,
                  ease: "power2.out",
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  scale: 1,
                  y: 0,
                  duration: 0.3,
                  ease: "power2.out",
                });
              }}
              className={cn(
                "aspect-square relative cursor-pointer rounded-lg border-2 group",
                `bg-gradient-to-br from-background to-muted/30 ${rarityColor}`,
                item.equipped && "ring-2 ring-blue-500 ring-offset-2"
              )}
            >
              {/* Type indicator - RESPONSIVE */}
              <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1">
                <div className="w-3 h-3 sm:w-4 sm:h-4">
                  {getTypeIcon(item.type)}
                </div>
              </div>

              {/* Item image/icon - RESPONSIVE */}
              <div className="w-full h-full flex items-center justify-center p-1.5 sm:p-2">
                <div className="relative w-full h-full">
                  {item.type === "avatar" && (
                    <>
                      {item.image_path ? (
                        <Image
                          src={item.image_path}
                          alt={item.name || "Avatar"}
                          fill
                          className="object-contain rounded"
                          onLoad={() => {}}
                          onError={(e) => {
                            console.error(
                              "❌ [Avatar Image Error] Failed to load:",
                              item.image_path,
                              "for avatar:",
                              item.name
                            );
                            console.error(
                              "❌ [Avatar Image Error] Full item data:",
                              item
                            );
                            // Hide the broken image and show fallback icon
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML =
                                '<div class="w-full h-full flex items-center justify-center"><svg class="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V19L8.5 15.5L11 18L14.5 14.5L19 19V9Z"/></svg></div>';
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Palette className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                        </div>
                      )}
                    </>
                  )}
                  {item.type === "emoji" && (
                    <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl">
                      {item.image_path ? (
                        <Image
                          src={item.image_path}
                          alt={item.name || "Emoji"}
                          fill
                          className="object-contain rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML =
                                '<div class="w-full h-full flex items-center justify-center text-xl sm:text-2xl">😊</div>';
                            }
                          }}
                          onLoad={() => {}}
                        />
                      ) : (
                        <Smile className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Equipped indicator - RESPONSIVE with pulse animation */}
              {item.equipped && (
                <div
                  ref={(el) => {
                    equippedBadgeRefs.current[index] = el;
                  }}
                  className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 bg-blue-500 text-white rounded-full p-0.5 sm:p-1"
                >
                  <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg" />
            </div>
          );
        })}
      </div>

      {/* Item Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <div ref={dialogContentRef}>
            {selectedItem && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {getTypeIcon(selectedItem.type)}
                    {selectedItem.name}
                    {selectedItem.equipped && (
                      <Badge variant="secondary" className="ml-auto">
                        Đang trang bị
                      </Badge>
                    )}
                  </DialogTitle>
                  <DialogDescription>
                    {getTypeName(selectedItem.type)}
                    {selectedItem.type === "emoji" && " • Chỉ để xem"}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Item Preview */}
                  <div className="flex justify-center">
                    <div
                      className={cn(
                        "relative w-24 h-24 rounded-lg border-2 p-2 bg-background",
                        rarityColors[
                          selectedItem.rarity as keyof typeof rarityColors
                        ] || rarityColors.COMMON
                      )}
                    >
                      <div className="relative w-full h-full">
                        {selectedItem.type === "avatar" && (
                          <>
                            {selectedItem.image_path ? (
                              <Image
                                src={selectedItem.image_path}
                                alt={selectedItem.name || "Avatar"}
                                fill
                                className="object-contain rounded"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML =
                                      '<div class="w-full h-full flex items-center justify-center"><svg class="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V19L8.5 15.5L11 18L14.5 14.5L19 19V9Z"/></svg></div>';
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Palette className="w-12 h-12 text-gray-400" />
                              </div>
                            )}
                          </>
                        )}
                        {selectedItem.type === "emoji" && (
                          <div className="w-full h-full flex items-center justify-center text-4xl">
                            {selectedItem.image_path ? (
                              <Image
                                src={selectedItem.image_path}
                                alt={selectedItem.name || "Emoji"}
                                fill
                                className="object-contain rounded"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML =
                                      '<div class="w-full h-full flex items-center justify-center text-4xl">😊</div>';
                                  }
                                }}
                              />
                            ) : (
                              <Smile className="w-12 h-12 text-gray-500" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Item Info */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-1">Mô tả</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedItem.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Độ hiếm:</span>
                        <div className="flex items-center gap-1 mt-1">
                          {RarityIcon && <RarityIcon className="w-4 h-4" />}
                          <span className="text-muted-foreground">
                            {getRarityName(selectedItem.rarity)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Cách mở khóa:</span>
                        <p className="text-muted-foreground mt-1">
                          {selectedItem.unlock_type}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    {selectedItem.type === "emoji" ? (
                      // Emoji không thể trang bị - chỉ hiển thị nút đóng
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="flex-1"
                      >
                        Đóng
                      </Button>
                    ) : (
                      // Avatar có thể trang bị
                      <>
                        <Button
                          onClick={handleEquipItem}
                          disabled={isEquipping || selectedItem.equipped}
                          className="flex-1"
                          variant={
                            selectedItem.equipped ? "secondary" : "default"
                          }
                        >
                          {isEquipping
                            ? "Đang trang bị..."
                            : selectedItem.equipped
                            ? "Đã trang bị"
                            : "Trang bị"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Đóng
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
