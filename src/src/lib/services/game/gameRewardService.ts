// frontend/src/lib/services/game/gameRewardService.ts

import { EGG_TYPES, LOOT_TABLES } from "./game-rewards.config";
import { AvatarData } from "@/lib/types/avatar"; // Import AvatarData

// --- INTERFACE MỚI CHO KẾT QUẢ MỞ TRỨNG ---
export interface EggReward {
  type: "item" | "currency";
  data:
    | AvatarData
    | {
        currency_type: "SYNC";
        amount: number;
        name: string;
        image_path: string; // Thêm đường dẫn ảnh cho currency
      };
}

// --- GIÁ TRỊ VÀNG KHI ĐỔI VẬT PHẨM TRÙNG THEO ĐỘ HIẾM ---
const DUPLICATE_REWARD_VALUE: Record<string, number> = {
  COMMON: 50,
  UNCOMMON: 100,
  RARE: 250,
  EPIC: 500,
  LEGENDARY: 1000,
};

class GameRewardService {
  /**
   * --- SỬA ĐỔI TOÀN BỘ HÀM NÀY ---
   * Mở một quả trứng và trả về một vật phẩm hoặc vàng nếu trùng.
   * @param egg - Dữ liệu của quả trứng cần mở.
   * @param availableItems - Danh sách các vật phẩm (locked) mà người chơi có thể nhận.
   * @param ownedItemIds - Một Set chứa ID của các vật phẩm người chơi đã sở hữu.
   * @returns Một object EggReward.
   */
  public openEgg(
    egg: any,
    availableItems: AvatarData[],
    ownedItemIds: Set<number>
  ): EggReward {
    const eggRarity = egg.isGolden
      ? this.getHigherRarity(egg.rarity)
      : egg.rarity;
    const lootTable = LOOT_TABLES[eggRarity as keyof typeof LOOT_TABLES];

    // 1. Xác định độ hiếm của vật phẩm sẽ rớt ra
    const randomPercent = Math.random() * 100;
    let cumulativePercent = 0;
    let rewardRarity = "COMMON";

    for (const [rarity, chance] of Object.entries(lootTable)) {
      cumulativePercent += chance;
      if (randomPercent <= cumulativePercent) {
        rewardRarity = rarity;
        break;
      }
    }

    // 2. Lọc danh sách vật phẩm có độ hiếm tương ứng
    let possibleRewards = availableItems.filter(
      (item) => item.rarity === rewardRarity
    );

    // Nếu không có vật phẩm ở độ hiếm đó, fallback xuống độ hiếm thấp hơn
    if (possibleRewards.length === 0) {
      const rarityOrder: (keyof typeof LOOT_TABLES)[] = [
        "LEGENDARY",
        "EPIC",
        "RARE",
        "UNCOMMON",
        "COMMON",
      ];
      for (
        let i = rarityOrder.indexOf(rewardRarity as any) + 1;
        i < rarityOrder.length;
        i++
      ) {
        const fallbackRarity = rarityOrder[i];
        possibleRewards = availableItems.filter(
          (item) => item.rarity === fallbackRarity
        );
        if (possibleRewards.length > 0) break;
      }
    }

    // Nếu vẫn không có, trả về vật phẩm common bất kỳ
    if (possibleRewards.length === 0) {
      possibleRewards = availableItems.filter(
        (item) => item.rarity === "COMMON"
      );
    }

    // Nếu vẫn không có gì, trả về lỗi hoặc một phần thưởng mặc định
    if (possibleRewards.length === 0) {
      return {
        type: "currency",
        data: {
          currency_type: "SYNC",
          amount: 10, // Phần thưởng an ủi
          name: "10 SynCoin",
          image_path: "/ai-image/syncoin.png",
        },
      };
    }

    // 3. Chọn ngẫu nhiên một vật phẩm
    const randomIndex = Math.floor(Math.random() * possibleRewards.length);
    const chosenItem = possibleRewards[randomIndex];


    // 4. KIỂM TRA TRÙNG LẶP
    if (ownedItemIds.has(chosenItem.avatar_id)) {
      // Nếu đã sở hữu, chuyển thành vàng
      const rewardAmount = DUPLICATE_REWARD_VALUE[chosenItem.rarity] || 50;
      return {
        type: "currency",
        data: {
          currency_type: "SYNC",
          amount: rewardAmount,
          name: `${rewardAmount} SynCoin`,
          image_path: "/ai-image/syncoin.png",
        },
      };
    } else {
      // Nếu chưa sở hữu, trả về vật phẩm
      return {
        type: "item",
        data: chosenItem,
      };
    }
  }

  private getHigherRarity(
    rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC"
  ): "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" {
    switch (rarity) {
      case "COMMON":
        return "UNCOMMON";
      case "UNCOMMON":
        return "RARE";
      case "RARE":
        return "EPIC";
      case "EPIC":
        return "LEGENDARY";
      default:
        return "LEGENDARY";
    }
  }
}

export const gameRewardService = new GameRewardService();
