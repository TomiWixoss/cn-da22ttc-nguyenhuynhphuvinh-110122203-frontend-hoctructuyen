"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/navigation/tabs";
import { Palette, Smile } from "lucide-react";
import { AvatarGrid } from "@/components/features/avatar/avatar-grid";
import { EmojiGrid } from "@/components/features/avatar/emoji-grid";
import { AvailableItemsResponse } from "@/lib/types/avatar";

interface AvatarCustomizationProps {
  availableItems: AvailableItemsResponse["data"] | null;
  equippedAvatarId?: number;
  equippedEmojiId?: number;
  isLoading: boolean;
  isEquipping: boolean;
  onEquipAvatar: (avatarId: number) => Promise<void>;
  onEquipEmoji: (emojiId: number) => Promise<void>;
}

export function AvatarCustomization({
  availableItems,
  equippedAvatarId,
  equippedEmojiId,
  isLoading,
  isEquipping,
  onEquipAvatar,
  onEquipEmoji,
}: AvatarCustomizationProps) {
  const [activeTab, setActiveTab] = useState<"avatars" | "emojis">("avatars");

  const handleTabChange = (value: string) => {
    setActiveTab(value as "avatars" | "emojis");
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 gap-1 h-auto p-1">
        <TabsTrigger
          value="avatars"
          className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-2 sm:py-2.5"
        >
          <Palette className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
          <span className="hidden sm:inline">Ảnh đại diện</span>
          <span className="sm:hidden">Ảnh</span>
        </TabsTrigger>
        <TabsTrigger
          value="emojis"
          className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-2 sm:py-2.5"
        >
          <Smile className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
          <span className="hidden sm:inline">Biểu tượng</span>
          <span className="sm:hidden">Biểu tượng</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="avatars" className="mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Bộ sưu tập Ảnh đại diện
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Chọn ảnh đại diện để thể hiện phong cách của bạn
                </p>
              </div>
              <AvatarGrid
                ownedAvatars={availableItems?.avatars?.owned ?? []}
                lockedAvatars={availableItems?.avatars?.locked ?? []}
                equippedAvatarId={equippedAvatarId}
                onEquipAvatar={onEquipAvatar}
                isLoading={isLoading}
                isEquipping={isEquipping}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="emojis" className="mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Bộ sưu tập Biểu tượng cảm xúc
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Biểu tượng cảm xúc biểu đạt cảm xúc và phản ứng
                </p>
              </div>
              <EmojiGrid
                ownedEmojis={availableItems?.emojis?.owned ?? []}
                lockedEmojis={availableItems?.emojis?.locked ?? []}
                equippedEmojiId={equippedEmojiId}
                onEquipEmoji={onEquipEmoji}
                isLoading={isLoading}
                isEquipping={isEquipping}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
