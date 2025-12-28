/**
 * 🎮 CÁC HẰNG SỐ GAME - Tập trung tất cả config ở đây để dễ điều chỉnh
 */

// === CẤU HÌNH GAME CƠ BẢN ===
export const GAME_CONFIG = {
  BACKGROUND_COLOR: "#87CEEB", // Màu nền sky blue - phù hợp platformer
} as const;

// === KEYS CỦA CÁC SCENE ===
export const SCENE_KEYS = {
  PRELOAD: "PreloadScene", // Scene loading assets
  // Các scene cũ đã bị xóa. Scene gameplay sẽ được định nghĩa ở Giai đoạn 2.
} as const;

// === BẢNG MÀU GAME ===
export const COLORS = {
  SKY_BLUE: "#87CEEB", // Màu nền chính
} as const;

// === CẤU HÌNH CAMERA - CHỈNH Ở ĐÂY để tất cả camera effects tự động update ===
export const CAMERA_CONFIG = {
  // Offset chính - điều chỉnh góc nhìn toàn bộ game
  DEFAULT_OFFSET: { x: 0, y: -50 }, // Âm = nhìn lên, Dương = nhìn xuống

  // Các offset động khi player di chuyển (cộng vào DEFAULT_OFFSET)
  JUMP_OFFSET_MODIFIER: -30, // Nhìn lên khi nhảy
  FALL_OFFSET_MODIFIER: 20, // Nhìn xuống khi rơi
  FAST_FALL_OFFSET_MODIFIER: 40, // Nhìn xuống nhiều khi rơi nhanh

  // Tốc độ camera follow (càng nhỏ càng mượt)
  LERP_SPEED: { x: 0.1, y: 0.1 },
} as const;


// === CẤU HÌNH VẬT PHẨM ===
export const COIN_VALUES = {
  easy: 1,
  medium: 3,
  hard: 5,
} as const;
