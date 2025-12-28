# Backend Fix: Emoji Socket Event Missing Image Path

## Vấn đề

Socket event `emoji:sent` hiện tại không bao gồm `emoji_image` (đường dẫn hình ảnh emoji), khiến frontend không thể hiển thị emoji của người khác gửi trong phòng chờ quiz.

## Response hiện tại

```json
{
  "user_id": 122,
  "emoji_type_id": 43,
  "emoji_code": "yawning-face",
  "emoji_name": "Yawning Face",
  "timestamp": "2025-11-09T15:26:18.407Z"
}
```

## Response cần thiết

```json
{
  "user_id": 122,
  "emoji_type_id": 43,
  "emoji_code": "yawning-face",
  "emoji_name": "Yawning Face",
  "emoji_image": "/uploads/emojis/yawning-face.png",
  "target_user_id": null,
  "timestamp": "2025-11-09T15:26:18.407Z"
}
```

## Các trường cần thêm

1. **`emoji_image`** (string, required): Đường dẫn đầy đủ đến hình ảnh emoji

   - Ví dụ: `/uploads/emojis/yawning-face.png`
   - Hoặc: `https://cdn.example.com/emojis/yawning-face.png`

2. **`target_user_id`** (number | null, optional): ID của người nhận emoji (nếu gửi riêng)
   - `null` nếu gửi cho cả phòng
   - `number` nếu gửi cho một người cụ thể

## Kiểm tra

Sau khi sửa, test bằng cách:

1. Mở 2 browser/tab khác nhau
2. Cả 2 vào cùng quiz waiting room (ví dụ: `/quiz-waiting-room/222`)
3. Từ tab 1, gửi emoji
4. Kiểm tra tab 2 có nhận được emoji và hiển thị không

### Console log mong đợi (Frontend)

```javascript
// Tab 1 (người gửi)
Emoji sent result: {
  user_id: 122,
  emoji_type_id: 43,
  emoji_code: "yawning-face",
  emoji_name: "Yawning Face",
  emoji_image: "/uploads/emojis/yawning-face.png",
  target_user_id: null,
  timestamp: "2025-11-09T15:26:18.407Z"
}

// Tab 2 (người nhận)
Received emoji event from socket: {
  user_id: 122,
  emoji_type_id: 43,
  emoji_code: "yawning-face",
  emoji_name: "Yawning Face",
  emoji_image: "/uploads/emojis/yawning-face.png",
  target_user_id: null,
  timestamp: "2025-11-09T15:26:18.407Z"
}
```

## Lưu ý

- Đảm bảo `emoji_image_path` trong database có giá trị hợp lệ
- Path có thể là relative (`/uploads/emojis/...`) hoặc absolute URL
- Frontend sẽ tự động thêm base URL nếu cần
