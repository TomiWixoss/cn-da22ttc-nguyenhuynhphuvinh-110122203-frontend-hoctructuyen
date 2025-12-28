"use client";

import React, { useEffect, useState } from "react";
import { X, Loader2, Smile } from "lucide-react";
import { Button } from "@/components/ui/forms";

import { emojiService, InventoryEmoji } from "@/lib/services/api/emoji.service";
import { toast } from "sonner";

interface EmojiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emojiTypeId: number) => void;
}

const RARITY_BORDER_COLORS = {
  COMMON: "border-gray-400",
  UNCOMMON: "border-green-500",
  RARE: "border-blue-500",
  EPIC: "border-purple-500",
  LEGENDARY: "border-amber-400",
};

const RARITY_LABELS = {
  COMMON: "Thường",
  UNCOMMON: "Không phổ biến",
  RARE: "Hiếm",
  EPIC: "Sử thi",
  LEGENDARY: "Huyền thoại",
};

export const EmojiDrawer: React.FC<EmojiDrawerProps> = ({
  isOpen,
  onClose,
  onEmojiSelect,
}) => {
  const [emojis, setEmojis] = useState<InventoryEmoji[]>([]);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      loadEmojis();
      // Trigger animation after render
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      // Remove from DOM after animation
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const loadEmojis = async () => {
    try {
      setLoading(true);
      const items = await emojiService.getEmojiCollection();
      setEmojis(items);
    } catch (error) {
      console.error("Error loading emojis:", error);
      toast.error("Không thể tải kho emoji");
    } finally {
      setLoading(false);
    }
  };

  const handleEmojiClick = (emojiTypeId: number) => {
    onEmojiSelect(emojiTypeId);
    onClose();
  };

  if (!shouldRender) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-1/2 w-full max-w-4xl bg-background rounded-t-2xl shadow-2xl z-50 h-[60vh] flex flex-col transition-all duration-300 ease-out ${
          isVisible
            ? "-translate-x-1/2 translate-y-0"
            : "-translate-x-1/2 translate-y-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Smile className="h-5 w-5 text-primary" />
            Kho Emoji ({emojis.length})
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="cursor-pointer"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : emojis.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Smile className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Bạn chưa có emoji nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-6 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4">
              {emojis.map((inventoryEmoji) => (
                <button
                  key={inventoryEmoji.inventory_id}
                  onClick={() =>
                    handleEmojiClick(inventoryEmoji.emoji.emoji_type_id)
                  }
                  className={`aspect-square rounded-md sm:rounded-lg border-2 sm:border-3 ${
                    RARITY_BORDER_COLORS[
                      inventoryEmoji.emoji
                        .rarity as keyof typeof RARITY_BORDER_COLORS
                    ]
                  } hover:scale-110 hover:shadow-lg transition-all cursor-pointer flex items-center justify-center p-1.5 sm:p-2 md:p-3 group bg-background`}
                  title={`${inventoryEmoji.emoji.emoji_name} (${
                    RARITY_LABELS[
                      inventoryEmoji.emoji.rarity as keyof typeof RARITY_LABELS
                    ]
                  })`}
                >
                  <img
                    src={inventoryEmoji.emoji.emoji_image_path}
                    alt={inventoryEmoji.emoji.emoji_name}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
