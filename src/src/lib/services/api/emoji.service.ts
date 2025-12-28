/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./client";

// Types cho Emoji API
export interface EmojiType {
  emoji_type_id: number;
  emoji_name: string;
  emoji_code: string;
  emoji_image_path: string;
  category: string;
  rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";
  tier_requirement: string;
}

export interface InventoryEmoji {
  inventory_id: number;
  user_id: number;
  item_type: "EMOJI";
  item_id: number;
  quantity: number;
  obtained_from: string;
  obtained_from_display: string;
  obtained_at: string;
  is_equipped: boolean;
  metadata: Record<string, any>;
  emoji: EmojiType;
}

export interface EmojiCollectionResponse {
  success: boolean;
  data: {
    item_type: "EMOJI";
    items: InventoryEmoji[];
  };
}

export interface SendEmojiRealtimeRequest {
  emoji_type_id: number;
  quiz_id: number;
  target_user_id?: number;
}

export interface SendEmojiRealtimeResponse {
  success: boolean;
  message: string;
  data: {
    user_id: number;
    emoji_type_id: number;
    emoji_code: string;
    emoji_name: string;
    timestamp: string;
  };
}

class EmojiService {
  /**
   * Lấy collection emoji của user hiện tại
   * GET /api/avatar/inventory/emojis
   */
  async getEmojiCollection(): Promise<InventoryEmoji[]> {
    try {
      const response = await api.get("/avatar/inventory/emojis");
      const data: EmojiCollectionResponse = response.data;

      if (!data.success) {
        throw new Error("Failed to fetch emoji collection");
      }

      return data.data.items;
    } catch (error: any) {
      console.error("❌ [Emoji Service] Error fetching collection:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Không thể tải collection emoji"
      );
    }
  }

  /**
   * Gửi emoji realtime trong quiz
   * POST /api/emojis/send-realtime
   */
  async sendEmojiRealtime(
    request: SendEmojiRealtimeRequest
  ): Promise<SendEmojiRealtimeResponse["data"]> {
    try {
      const response = await api.post("/emojis/send-realtime", request);
      const data: SendEmojiRealtimeResponse = response.data;

      if (!data.success) {
        throw new Error(data.message || "Failed to send emoji");
      }

      return data.data;
    } catch (error: any) {
      console.error("❌ [Emoji Service] Error sending emoji:", error);
      throw new Error(
        error.response?.data?.message || error.message || "Không thể gửi emoji"
      );
    }
  }

  /**
   * Utility: Lấy màu sắc theo rarity
   */
  getRarityColor(rarity: string): string {
    const colors: Record<string, string> = {
      COMMON: "#9CA3AF",
      UNCOMMON: "#10B981",
      RARE: "#3B82F6",
      EPIC: "#8B5CF6",
      LEGENDARY: "#F59E0B",
    };
    return colors[rarity] || colors.COMMON;
  }

  /**
   * Utility: Lấy tên hiển thị cho rarity
   */
  getRarityDisplayName(rarity: string): string {
    const names: Record<string, string> = {
      COMMON: "Thông thường",
      UNCOMMON: "Không phổ biến",
      RARE: "Hiếm",
      EPIC: "Sử thi",
      LEGENDARY: "Huyền thoại",
    };
    return names[rarity] || "Không xác định";
  }
}

export const emojiService = new EmojiService();
export default emojiService;
