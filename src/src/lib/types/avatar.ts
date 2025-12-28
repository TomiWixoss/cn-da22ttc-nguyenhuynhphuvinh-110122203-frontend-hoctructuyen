// Avatar system TypeScript interfaces

// Rarity levels for avatar items
export type AvatarRarity =
  | "COMMON"
  | "UNCOMMON"
  | "RARE"
  | "EPIC"
  | "LEGENDARY";

// Unlock types for avatar items
export type UnlockType =
  | "DEFAULT"
  | "LEVEL"
  | "TIER"
  | "ACHIEVEMENT"
  | "EGG"
  | "SHOP"
  | "SPECIAL"
  | "PURCHASE"
  | "SPECIAL_EVENT";

// Item types for avatar customization
export type ItemType = "avatar" | "name_effect" | "emoji";

// Base Avatar Data Interface
export interface AvatarData {
  avatar_id: number;
  avatar_name: string;
  avatar_code: string;
  description: string;
  image_path: string;
  rarity: AvatarRarity;
  rarity_display: string;
  rarity_color: string;
  unlock_type: string;
  unlock_description: string;
  decomposition_value: number;
  is_premium: boolean;
  is_default: boolean;
  sort_order: number;
}

// Name Effect Interface
export interface NameEffect {
  effect_id: number;
  effect_name: string;
  effect_code: string;
  description: string;
  css_class: string;
  tier_name: string;
  tier_display: string;
  tier_color: string;
  unlock_level: number;
  unlock_description: string;
  is_premium: boolean;
  is_animated: boolean;
  preview_html: string;
  is_active: boolean;
  sort_order: number;
}

// Emoji Data Interface
export interface EmojiData {
  emoji_id: number;
  emoji_name: string;
  emoji_code: string;
  emoji_unicode: string;
  emoji_image: string | null;
  emoji_display: string;
  description: string;
  rarity: AvatarRarity;
  rarity_display: string;
  rarity_color: string;
  unlock_type: string;
  unlock_description: string;
  category: string;
  category_display: string;
  decomposition_value: number;
  is_premium: boolean;
  is_animated: boolean | null;
  is_default: boolean;
  sort_order: number;
}

// Inventory Item Interfaces
export interface AvatarInventoryItem {
  user_inventory_id: number;
  item_id: number;
  item_type: "avatar";
  unlocked_at: string;
  Avatar: AvatarData;
}

export interface EmojiInventoryItem {
  user_inventory_id: number;
  item_id: number;
  item_type: "emoji";
  unlocked_at: string;
  Emoji: EmojiData;
}

// User Inventory Interface
export interface UserInventory {
  avatars: AvatarInventoryItem[];
  emojis: EmojiInventoryItem[];
}

// User Customization Interface
export interface UserCustomization {
  customization_id: number;
  user_id: number;
  equipped_avatar: AvatarData | null;
  equipped_frame: any | null;
  equipped_name_effect: any | null;
  customization_settings: any;
  last_updated: string;
}

// Collection Progress Interface
export interface CollectionProgress {
  avatars: {
    owned: number;
    total: number;
    percentage: number;
  };
  emojis: {
    owned: number;
    total: number;
    percentage: number;
  };
  overall: {
    owned: number;
    total: number;
    percentage: number;
  };
}

// API Response Interfaces
export interface MyAvatarDataResponse {
  success: boolean;
  data: {
    customization: UserCustomization;
    equipped_avatar: AvatarData | null;  // Avatar đang được trang bị
    equipped_frame?: any | null;         // Frame đang được trang bị (optional)
    inventory: UserInventory;
    statistics: {
      total_items: number;
      completion_rate: string;
    };
    user_level: number;
    user_tier: string;
  };
  message?: string;
}

export interface AvailableItemsResponse {
  success: boolean;
  data: {
    user_level: number;
    user_tier: string;
    avatars: {
      owned: AvatarData[];
      locked: AvatarData[];
    };
    name_effects: {
      owned: NameEffect[];
      locked: NameEffect[];
    };
    emojis: {
      owned: EmojiData[];
      locked: EmojiData[];
    };
  };
  message?: string;
}

export interface EquipItemRequest {
  itemType: ItemType;
  itemId: number;
}

export interface EquipItemResponse {
  success: boolean;
  data: {
    customization: UserCustomization;
  };
  message?: string;
}

export interface CollectionProgressResponse {
  success: boolean;
  data: CollectionProgress;
  message?: string;
}
