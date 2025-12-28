# 📚 API Documentation: Gửi Kết Quả Toàn Bộ Phiên Luyện Tập

## 🎯 Mục đích

API này được thiết kế để nhận một payload duy nhất từ frontend sau khi người dùng hoàn thành một phiên quiz ở chế độ luyện tập. Backend sẽ xử lý toàn bộ dữ liệu này trong một lần để:

1. Cập nhật điểm kinh nghiệm (EXP) và xử lý việc lên cấp
2. Cập nhật số dư **SynCoin**
3. Thêm các vật phẩm nhận được từ "trứng thưởng" vào kho đồ của người dùng
4. Lưu lại lịch sử chi tiết của phiên làm bài để phục vụ cho việc phân tích
5. Đánh dấu phiên quiz là đã hoàn thành cho người dùng

## API Endpoint

```http
POST /api/practice/submit-session-results
```

- **Quyền truy cập:** Yêu cầu xác thực (Sinh viên)
- **Headers:**
  ```json
  {
    "Authorization": "Bearer <your_jwt_token>",
    "Content-Type": "application/json"
  }
  ```

## Nội dung Request (Body)

Payload đã được đơn giản hóa, không còn chứa `Kristal` và `source_egg_type`.

```json
{
  // --- Thông tin chung về phiên làm bài ---
  "quizInfo": {
    "quiz_id": 123, // Bắt buộc: ID của bài quiz
    "session_start_time": "2024-12-08T10:00:00.000Z", // Bắt buộc: Thời điểm bắt đầu làm bài
    "session_end_time": "2024-12-08T10:25:30.000Z" // Bắt buộc: Thời điểm nộp bài
  },

  // --- Dữ liệu chi tiết từng câu trả lời ---
  "performanceData": [
    // Bắt buộc: Mảng chứa kết quả từng câu hỏi
    {
      "question_id": 789,
      "is_correct": true,
      "response_time_ms": 4500, // Thời gian trả lời (miliseconds)
      "attempts": 1 // Số lần đã thử trả lời câu này
    },
    {
      "question_id": 790,
      "is_correct": false,
      "response_time_ms": 8200,
      "attempts": 1
    }
    // ... và các câu trả lời khác
  ],

  // --- Tổng hợp phần thưởng do Frontend tính toán ---
  "rewardsSummary": {
    // Bắt buộc: Tổng hợp phần thưởng
    "total_exp_earned": 150, // Tổng EXP người dùng nhận được trong phiên
    "total_syncoin_earned": 75 // Tổng SynCoin
  },

  // --- Vật phẩm nhận được từ trứng (nếu có) ---
  "itemsFromEggs": [
    // Tùy chọn: Mảng các vật phẩm nhận được từ việc mở trứng
    {
      "item_type": "AVATAR", // Loại vật phẩm: AVATAR, EMOJI
      "item_id": 15 // ID của vật phẩm
    },
    {
      "item_type": "FRAME",
      "item_id": 8
    }
  ]
}
```

## Phản hồi (Response)

### ✅ Thành công (200 OK)

Phản hồi đã được cập nhật để không chứa thông tin về Kristal.

```json
{
  "success": true,
  "message": "Kết quả phiên luyện tập đã được ghi nhận thành công!",
  "data": {
    // Tóm tắt các cập nhật
    "updates_summary": {
      "exp_added": 150,
      "syncoin_added": 75,
      "new_items_added": 2,
      "quiz_result_created": true
    },
    // Trạng thái gamification mới của người dùng
    "new_gamification_state": {
      "user_id": 456,
      "total_points": 2600, // Điểm kinh nghiệm mới
      "current_level": 26, // Level mới
      "level_up": true, // Báo hiệu đã lên cấp
      "experience_points": 10, // EXP trong level mới
      "experience_to_next_level": 90
    },
    // Số dư tiền tệ mới
    "new_currency_balances": {
      "SYNC": 1325
    },
    // Danh sách vật phẩm mới đã được thêm vào kho đồ
    "new_inventory_items": [
      {
        "item_type": "AVATAR",
        "item_id": 15
      },
      {
        "item_type": "FRAME",
        "item_id": 8
      }
    ]
  }
}
```

### ❌ Thất bại (4xx/5xx)

```json
{
  "success": false,
  "message": "Lỗi xác thực dữ liệu đầu vào",
  "error": "Trường 'rewardsSummary.total_exp_earned' là bắt buộc."
}
```

## Workflow và Lưu ý cho Frontend

1. **Bắt đầu phiên luyện tập:** Frontend lấy danh sách câu hỏi và tự quản lý toàn bộ phiên làm bài.

2. **Trong khi làm bài:** Frontend cần:

   - Lưu lại kết quả (đúng/sai, thời gian) của từng câu hỏi vào một mảng `performanceData`.
   - Tự tính toán và hiển thị cho người dùng số **SynCoin** và **EXP** họ "thu thập" được sau mỗi câu trả lời. Lưu tổng số này vào object `rewardsSummary`.
   - Nếu có cơ chế mở trứng, lưu lại các vật phẩm nhận được vào mảng `itemsFromEggs` (chỉ cần `item_type` và `item_id`).

3. **Khi người dùng bấm "Hoàn thành":**

   - Tập hợp tất cả dữ liệu đã thu thập vào một object lớn theo đúng cấu trúc đã cập nhật ở trên.
   - Gửi một request duy nhất đến `POST /api/practice/submit-session-results`.

4. **Sau khi nhận phản hồi thành công:**
   - Sử dụng `new_gamification_state` và `new_currency_balances` để cập nhật giao diện người dùng (thanh EXP, level, số dư SynCoin) mà không cần phải gọi thêm các API `GET` khác.
   - Hiển thị thông báo về các vật phẩm mới đã được thêm vào kho đồ.

## Validation Rules

### Trường bắt buộc:

- `quizInfo.quiz_id` (number)
- `quizInfo.session_start_time` (ISO 8601 string)
- `quizInfo.session_end_time` (ISO 8601 string)
- `performanceData` (array, không được rỗng)
- `rewardsSummary.total_exp_earned` (number >= 0)
- `rewardsSummary.total_syncoin_earned` (number >= 0)

### Trường tùy chọn:

- `itemsFromEggs` (array, có thể rỗng hoặc không có)

### Validation cho performanceData:

Mỗi phần tử trong mảng phải có:

- `question_id` (number)
- `is_correct` (boolean)
- `response_time_ms` (number > 0)
- `attempts` (number >= 1)

### Validation cho itemsFromEggs:

Mỗi phần tử trong mảng phải có:

- `item_type` (string: "AVATAR", "EMOJI")
- `item_id` (number)

## Error Codes

| Status Code | Mô tả                        |
| ----------- | ---------------------------- |
| 200         | Thành công                   |
| 400         | Dữ liệu đầu vào không hợp lệ |
| 401         | Không có quyền truy cập      |
| 404         | Quiz không tồn tại           |
| 500         | Lỗi server nội bộ            |

## Database Operations

Backend cần thực hiện các thao tác sau:

1. **Validation:**

   - Kiểm tra quiz_id có tồn tại
   - Kiểm tra user có quyền làm quiz này
   - Validate tất cả dữ liệu đầu vào

2. **Cập nhật Gamification:**

   - Cộng EXP vào tài khoản người dùng
   - Kiểm tra và xử lý lên cấp
   - Cập nhật bảng `user_gamification`

3. **Cập nhật Currency:**

   - Cộng SynCoin vào tài khoản
   - Cập nhật bảng `user_currencies`

4. **Cập nhật Inventory:**

   - Thêm các vật phẩm từ trứng vào kho đồ
   - Cập nhật bảng `user_inventory`

5. **Lưu Performance Data:**

   - Tạo record trong `quiz_results`
   - Lưu chi tiết từng câu trả lời vào `quiz_result_details`

6. **Transaction Safety:**
   - Tất cả operations phải được thực hiện trong một database transaction
   - Rollback nếu có bất kỳ lỗi nào xảy ra
