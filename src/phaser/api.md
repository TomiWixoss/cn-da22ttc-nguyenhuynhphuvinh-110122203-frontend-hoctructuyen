## 🚀 API Endpoints Đề Xuất

### 1. Round Completion APIs

#### POST /api/racing/complete-round

Báo cáo hoàn thành một vòng đua

**Request Body:**

```json
{
  "quiz_id": "session_123",
  "round_number": 1,
  "round_score": 1250,
  "skipped_round": false
}
```

**Response:**

```json
{
  "success": true,
  "message": "Vòng đua hoàn thành thành công",
  "data": {
    "round_result": {
      "user_id": 123,
      "username": "player1",
      "round_number": 1,
      "round_score": 1250,
      "total_score": 5850,
      "rank_change": {
        "previous_rank": 3,
        "current_rank": 2,
        "moved_up": true
      }
    }
  },
  "note": "Round score được cộng vào tổng điểm của realtime leaderboard. Bảng xếp hạng sẽ được cập nhật tự động qua Socket.io. Nếu `skipped_round: true` thì player bị loại khỏi top ranking tất cả các vòng sau."
}
```

## 🔌 Socket.io Events Đề Xuất

### Server → Client Events

#### `round-top-finisher`

Thông báo ngay khi có 1 người về đích top 1, 2, hoặc 3 trong từng vòng cụ thể

**Ví dụ Vòng 1 - Top 1:**

```json
{
  "type": "round_top_finisher",
  "round_number": 1,
  "finisher": {
    "position": 1,
    "user_id": 456,
    "username": "speedRunner",
    "full_name": "Nguyễn Văn A",
    "round_score": 1500,
    "finish_order": "1st"
  },
  "message": "🥇 Nguyễn Văn A về đích đầu tiên vòng 1!",
  "celebration_type": "gold",
  "timestamp": 1703934645000
}
```

**Ví dụ Vòng 2 - Top 2:**

```json
{
  "type": "round_top_finisher",
  "round_number": 2,
  "finisher": {
    "position": 2,
    "user_id": 123,
    "username": "player1",
    "full_name": "Trần Thị B",
    "round_score": 1250,
    "finish_order": "2nd"
  },
  "message": "🥈 Trần Thị B về đích thứ 2 vòng 2!",
  "celebration_type": "silver",
  "timestamp": 1703934650000
}
```

**Các loại celebration:**

- **position 1**: `celebration_type: "gold"` - Vàng, fireworks 🎆
- **position 2**: `celebration_type: "silver"` - Bạc, confetti 🎊
- **position 3**: `celebration_type: "bronze"` - Đồng, sparkles ✨

**Ghi chú**: Event phát ngay khi có người về đích top 1/2/3 của từng vòng. Mỗi vòng có ranking riêng biệt.

**Luồng hoạt động:**

- **Vòng 1**: 3 người về đích đầu → 3 events riêng (top 1, top 2, top 3 của vòng 1)
- **Vòng 2**: 3 người về đích đầu → 3 events riêng (top 1, top 2, top 3 của vòng 2)
- **Vòng 3**: 3 người về đích đầu → 3 events riêng (top 1, top 2, top 3 của vòng 3)
- **Vòng 4**: 3 người về đích đầu → 3 events riêng (top 1, top 2, top 3 của vòng 4)

**⚠️ Quy tắc Skip Round:**

- Nếu player skip 1 mini game bất kỳ (`skipped_round: true`)
- Player đó sẽ bị **loại vĩnh viễn** khỏi top ranking ở tất cả vòng sau
- Không được xuất hiện trong `round-top-finisher` events nữa
- Vẫn nhận điểm và cập nhật leaderboard nhưng không có celebration

```

```
