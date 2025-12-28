// frontend/src/lib/services/game/game-rewards.config.ts

// Định nghĩa cấu trúc của một loại trứng
export interface Egg {
  id: string;
  name: string;
  imagePath: string;
  goldenImagePath: string;
  rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";
  description: string;
}

// Định nghĩa các loại trứng có trong game, dựa trên file `eggs_icon_pack_directory_structure.txt`
export const EGG_TYPES: Record<string, Egg> = {
  BASIC: {
    id: "BASIC",
    name: "Trứng Cơ Bản",
    imagePath: "/eggs-icon-pack/basic-egg/egg.png",
    goldenImagePath: "/eggs-icon-pack/basic-egg/golden-egg.png",
    rarity: "COMMON",
    description:
      "Một quả trứng phổ biến, có thể chứa những vật phẩm quen thuộc.",
  },
  CAT: {
    id: "CAT",
    name: "Trứng Mèo",
    imagePath: "/eggs-icon-pack/cat-egg/cat-egg.png",
    goldenImagePath: "/eggs-icon-pack/cat-egg/cat-egg-golden.png",
    rarity: "UNCOMMON",
    description: "Một quả trứng đáng yêu, thường chứa các avatar ngộ nghĩnh.",
  },
  DRAGON: {
    id: "DRAGON",
    name: "Trứng Rồng",
    imagePath: "/eggs-icon-pack/dragon-egg/dragon-egg.png",
    goldenImagePath: "/eggs-icon-pack/dragon-egg/dragon-egg-golden.png",
    rarity: "RARE",
    description: "Một quả trứng mạnh mẽ, có khả năng chứa những vật phẩm hiếm.",
  },
  RAINBOW: {
    id: "RAINBOW",
    name: "Trứng Cầu Vồng",
    imagePath: "/eggs-icon-pack/rainbow-egg/rainbow-egg.png",
    goldenImagePath: "/eggs-icon-pack/rainbow-egg/rainbow-egg.png", // Không có bản vàng
    rarity: "EPIC",
    description:
      "Rực rỡ sắc màu, quả trứng này chứa những phần thưởng đặc biệt.",
  },
  LEGENDARY: {
    id: "LEGENDARY",
    name: "Trứng Huyền Thoại",
    imagePath: "/eggs-icon-pack/legendary-egg/legendary-egg.png",
    goldenImagePath: "/eggs-icon-pack/legendary-egg/legendary-egg-golden.png",
    rarity: "LEGENDARY",
    description:
      "Cực kỳ hiếm, chỉ những người may mắn nhất mới tìm thấy. Phần thưởng bên trong chắc chắn sẽ rất tuyệt vời!",
  },
};

// Bảng tỉ lệ rớt vật phẩm dựa trên độ hiếm của trứng
// Ví dụ: Trứng COMMON có 80% ra vật phẩm COMMON, 19% ra UNCOMMON, 1% ra RARE
export const LOOT_TABLES = {
  COMMON: { COMMON: 80, UNCOMMON: 19, RARE: 1, EPIC: 0, LEGENDARY: 0 },
  UNCOMMON: { COMMON: 20, UNCOMMON: 60, RARE: 19, EPIC: 1, LEGENDARY: 0 },
  RARE: { COMMON: 0, UNCOMMON: 30, RARE: 60, EPIC: 9, LEGENDARY: 1 },
  EPIC: { COMMON: 0, UNCOMMON: 0, RARE: 40, EPIC: 55, LEGENDARY: 5 },
  LEGENDARY: { COMMON: 0, UNCOMMON: 0, RARE: 0, EPIC: 70, LEGENDARY: 30 },
};

// Tỉ lệ trứng thường vs trứng vàng (90% thường, 10% vàng)
export const GOLDEN_EGG_CHANCE = 0.1;

// Danh sách các loại trứng có thể spawn ngẫu nhiên
export const SPAWNABLE_EGG_IDS = [
  EGG_TYPES.BASIC.id,
  EGG_TYPES.CAT.id,
  EGG_TYPES.DRAGON.id,
  EGG_TYPES.RAINBOW.id,
  EGG_TYPES.LEGENDARY.id,
];
