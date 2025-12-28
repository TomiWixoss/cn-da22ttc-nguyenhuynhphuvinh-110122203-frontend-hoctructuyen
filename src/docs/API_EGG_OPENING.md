# API Đập Trứng (Egg Opening API)

## Tổng quan

Hiện tại logic đập trứng đang được thực hiện ở **frontend**, cần chuyển sang **backend** để đảm bảo tính bảo mật và tính toàn vẹn dữ liệu.

## Luồng hoạt động hiện tại

### 1. Thu thập trứng trong game

- Học sinh chơi quiz practice mode (platformer game)
- Thu thập xu (SynCoin) và trứng
- Mỗi trứng có:
  - `egg_type`: BASIC, CAT, DRAGON, RAINBOW, LEGENDARY
  - `is_golden`: Boolean - trứng vàng tăng tỉ lệ drop 1 bậc độ hiếm

### 2. Đập trứng (hiện tại ở frontend - CẦN CHUYỂN SANG BACKEND)

**File**: `src/lib/services/game/gameRewardService.ts`

#### Bảng tỉ lệ drop theo độ hiếm trứng:

```
COMMON:    { COMMON: 80%, UNCOMMON: 19%, RARE: 1% }
UNCOMMON:  { COMMON: 20%, UNCOMMON: 60%, RARE: 19%, EPIC: 1% }
RARE:      { UNCOMMON: 30%, RARE: 60%, EPIC: 9%, LEGENDARY: 1% }
EPIC:      { RARE: 40%, EPIC: 55%, LEGENDARY: 5% }
LEGENDARY: { EPIC: 70%, LEGENDARY: 30% }
```

#### Giá trị quy đổi khi vật phẩm trùng:

```
COMMON: 50 SynCoin
UNCOMMON: 100 SynCoin
RARE: 250 SynCoin
EPIC: 500 SynCoin
LEGENDARY: 1000 SynCoin
```

#### Logic đập trứng:

1. Xác định độ hiếm trứng (nếu golden thì +1 bậc)
2. Random độ hiếm vật phẩm theo loot table
3. Lọc danh sách vật phẩm có độ hiếm tương ứng
4. Random chọn 1 vật phẩm
5. Kiểm tra trùng lặp:
   - **Đã sở hữu** → Trả về SynCoin (theo bảng giá trị)
   - **Chưa có** → Trả về vật phẩm mới và thêm vào inventory

## API Backend cần xây dựng

### Endpoint: `POST /api/practice-sessions/submit-with-eggs`

Thay thế endpoint submit hiện tại, nhận **danh sách trứng chưa đập** và xử lý logic đập trứng ở backend.

### Request Body

```typescript
{
  quizInfo: {
    quiz_id: number;
    session_start_time: string; // ISO 8601
    session_end_time: string;
  },

  performanceData: {
    total_questions: number;
    correct_answers: number;
    incorrect_answers: number;
    total_time_seconds: number;
    score: number;
  },

  baseRewards: {
    syncoin_collected: number;  // Xu nhặt trong game
  },

  // QUAN TRỌNG: Danh sách trứng chưa đập
  eggsToOpen: Array<{
    egg_type: "BASIC" | "CAT" | "DRAGON" | "RAINBOW" | "LEGENDARY";
    is_golden: boolean;
  }>
}
```

### Response Body

```typescript
{
  success: boolean;
  data: {
    session_id: number;

    rewards_summary: {
      total_exp_earned: number;
      total_syncoin_earned: number;
      syncoin_from_gameplay: number;
      syncoin_from_duplicates: number;
    },

    // Kết quả đập trứng từ backend
    egg_opening_results: Array<{
      egg_type: string;
      is_golden: boolean;
      reward_type: "item" | "currency";

      // Nếu là vật phẩm mới
      item?: {
        item_type: "AVATAR" | "EMOJI";
        item_id: number;
        item_name: string;
        item_code: string;
        image_path: string;
        rarity: string;
        rarity_display: string;
        rarity_color: string;
      },

      // Nếu là vật phẩm trùng
      currency?: {
        currency_type: "SYNC";
        amount: number;
        original_item_rarity: string;
      }
    }>,

    level_up?: {
      old_level: number;
      new_level: number;
      new_tier?: string;
    }
  }
}
```

## Database - Master Data Vật phẩm

### ⚠️ YÊU CẦU QUAN TRỌNG

Backend cần xây dựng bảng master data chứa **tất cả vật phẩm** có thể nhận từ trứng.

### 1. Bảng `Avatars`

Chứa tất cả avatar động vật (tham khảo file mock có 30 con):

- Gà Con, Chó, Thỏ, Gấu, Gấu Trúc, Vẹt, Trâu, Gà, Bò, Vịt
- Cá Sấu, Voi, Ếch, Hươu Cao Cổ, Dê, Khỉ Đột, Hà Mã, Ngựa, Khỉ, Nai Sừng Tấm
- Cá Voi Một Sừng, Cú, Chim Cánh Cụt, Heo, Tê Giác, Lười, Rắn, Hải Mã, Cá Voi, Ngựa Vằn

**Cấu trúc cần có**:

- `avatar_id`, `avatar_name`, `avatar_code`
- `image_path` (đường dẫn file ảnh)
- `rarity`: COMMON, UNCOMMON, RARE, EPIC, LEGENDARY
- `rarity_display`, `rarity_color` (để frontend hiển thị)
- `unlock_type`: Phân loại cách mở khóa
  - **EGG_REWARD** ← Quan trọng: Chỉ avatar có type này mới rơi từ trứng
  - LEVEL (mở khóa theo cấp độ)
  - ACHIEVEMENT (hoàn thành thành tích)
  - SHOP (mua từ shop)
  - SPECIAL_EVENT (sự kiện đặc biệt)
- `decomposition_value`: Giá trị quy đổi khi trùng (50-1000 SynCoin)
- `is_premium`, `is_default`

### 2. Bảng `Emojis`

Chứa tất cả emoji (tham khảo mock):

- Face with Tears of Joy, Smiling Face, Thinking Face, Crying Face
- Angry Face, Astonished Face, Exploding Head, Clown Face, Robot, v.v.

**Cấu trúc tương tự Avatars**:

- `emoji_id`, `emoji_name`, `emoji_code`, `emoji_unicode`
- `emoji_image`, `emoji_display`
- `rarity`, `category` (Happy, Sad, Angry, Surprised, Special)
- `unlock_type` (cũng cần có **EGG_REWARD**)
- `decomposition_value`

### 3. Yêu cầu về phân bổ vật phẩm

Backend cần đảm bảo:

#### Số lượng đủ mỗi độ hiếm:

- **COMMON**: 40-50% tổng số vật phẩm (ít nhất 15-20 items)
- **UNCOMMON**: 25-30% (ít nhất 10-12 items)
- **RARE**: 15-20% (ít nhất 6-8 items)
- **EPIC**: 5-10% (ít nhất 3-5 items)
- **LEGENDARY**: 2-5% (ít nhất 2-3 items)

#### Lý do:

- Tránh trường hợp không có vật phẩm nào để drop
- Giảm tỉ lệ trùng lặp quá cao
- Đảm bảo trải nghiệm người chơi tốt

### 4. Bảng `UserInventory`

Lưu vật phẩm người dùng đã sở hữu:

- `user_id`, `item_type` (AVATAR/EMOJI), `item_id`
- Cần **index** trên `(user_id, item_type, item_id)` để query nhanh

### 5. Bảng `EggOpeningHistory`

Lưu lịch sử đập trứng:

- `user_id`, `session_id`, `eggs_opened`, `items_received`
- `syncoin_from_duplicates`, `total_value_syncoin`, `opened_at`

## Logic Backend cần implement

### 1. Validation

- Kiểm tra quiz_id tồn tại và là practice mode
- Kiểm tra thời gian hợp lệ
- Giới hạn số trứng tối đa (ví dụ: 50 trứng/phiên)
- Validate egg_type hợp lệ

### 2. Xử lý đập trứng

**Ý tưởng thuật toán**:

```
Cho mỗi quả trứng:
  1. Lấy danh sách vật phẩm đã sở hữu của user
  2. Lấy danh sách vật phẩm có thể nhận (unlock_type = 'EGG_REWARD')

  3. Xác định độ hiếm trứng:
     - Nếu is_golden = true → tăng 1 bậc độ hiếm
     - BASIC → COMMON, CAT → UNCOMMON, DRAGON → RARE, etc.

  4. Random độ hiếm vật phẩm theo loot table

  5. Lọc vật phẩm có độ hiếm tương ứng
     - Nếu không có → fallback xuống độ hiếm thấp hơn

  6. Random chọn 1 vật phẩm

  7. Kiểm tra trùng lặp:
     - Đã có → Trả về SynCoin (theo decomposition_value)
     - Chưa có → Thêm vào inventory, trả về vật phẩm
     - Cập nhật danh sách đã sở hữu để tránh trùng trong cùng batch
```

### 3. Cập nhật database (dùng Transaction)

```
BEGIN TRANSACTION
  1. Lưu thông tin phiên practice
  2. Đập tất cả trứng và lưu kết quả
  3. Lưu lịch sử đập trứng
  4. Cộng SynCoin (từ gameplay + từ trứng trùng)
  5. Cộng EXP và kiểm tra level up
  6. Cập nhật inventory với vật phẩm mới
COMMIT
```

## Migration từ Frontend sang Backend

### Bước 1: Backend

- Tạo bảng master data Avatars và Emojis với đầy đủ vật phẩm
- Implement endpoint `/api/practice-sessions/submit-with-eggs`
- Test kỹ với nhiều trường hợp

### Bước 2: Frontend

Thay đổi từ:

```typescript
// Cũ: Tự đập trứng ở frontend
const rewards = eggsToOpen.map((egg) =>
  gameRewardService.openEgg(egg, availableItems, ownedItemIds)
);
```

Sang:

```typescript
// Mới: Gửi trứng chưa đập cho backend
const response = await api.submitSessionWithEggs({
  quizInfo,
  performanceData,
  baseRewards: { syncoin_collected: totalCoinValue },
  eggsToOpen: collectedEggs.map((egg) => ({
    egg_type: egg.id,
    is_golden: egg.isGolden,
  })),
});

// Backend trả về kết quả đã đập
const rewards = response.data.egg_opening_results;
```

### Bước 3: UI

- Component `EggOpeningUI` giữ nguyên animation
- Nhưng nhận dữ liệu từ API response thay vì tự đập

## Lợi ích

1. **Bảo mật**: Người dùng không thể cheat
2. **Tính toàn vẹn**: Logic nhất quán, không bị modify
3. **Audit trail**: Lưu lịch sử để phân tích
4. **Dễ cân bằng**: Thay đổi tỉ lệ không cần update frontend
5. **Chống duplicate**: Backend kiểm soát inventory chính xác

## Testing Checklist

- [ ] Test với 0 trứng
- [ ] Test với 1 trứng thường
- [ ] Test với 1 trứng vàng
- [ ] Test với nhiều trứng (10, 20, 50)
- [ ] Test khi tất cả vật phẩm đều trùng
- [ ] Test khi không còn vật phẩm để unlock
- [ ] Test concurrent requests
- [ ] Test transaction rollback
- [ ] Verify không có race condition

## Notes

- Thêm rate limiting để tránh spam
- Log chi tiết để debug
- Có thể thêm feature flag để A/B test tỉ lệ drop
- Cache danh sách available items để tăng performance
