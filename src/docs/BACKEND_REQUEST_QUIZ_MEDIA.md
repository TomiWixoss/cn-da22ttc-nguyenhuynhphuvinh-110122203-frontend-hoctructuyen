# YÊU CẦU BACKEND: Thêm MediaFiles vào Quiz API Response

## 📋 Tổng quan

Frontend đã cập nhật UI để hiển thị hình ảnh trong câu hỏi và câu trả lời. Cần backend cập nhật API để trả về thông tin media files.

## 🎯 Mục tiêu

Cập nhật endpoint `GET /quizzes/{id}` để trả về `MediaFiles` cho mỗi câu hỏi trong quiz.

## 📍 Endpoint cần cập nhật

### `GET /quizzes/{id}` - Lấy chi tiết quiz

**Hiện tại:** API trả về quiz với questions nhưng không có MediaFiles

**Yêu cầu:** Thêm field `MediaFiles` vào mỗi question trong response

## 📦 Cấu trúc Response mong muốn

```json
{
  "success": true,
  "data": {
    "quiz_id": 213,
    "name": "Quiz về JavaScript",
    "duration": 60,
    "questions": [
      {
        "question_id": 456,
        "question_text": "Câu hỏi về JavaScript?",
        "question_type": {
          "question_type_id": 1,
          "name": "Multiple Choice"
        },
        "level": {
          "level_id": 2,
          "name": "Trung bình"
        },
        "lo_id": 10,
        "lo_name": "Hiểu về JavaScript",
        "explanation": "Giải thích...",
        "answers": [
          {
            "answer_id": 789,
            "answer_text": "Đáp án A",
            "iscorrect": true
          },
          {
            "answer_id": 790,
            "answer_text": "Đáp án B",
            "iscorrect": false
          }
        ],
        "MediaFiles": [
          {
            "media_id": 1,
            "file_type": "image",
            "file_name": "diagram.png",
            "file_url": "/uploads/questions/diagram.png",
            "owner_type": "question",
            "owner_id": 456,
            "alt_text": "Sơ đồ minh họa",
            "description": "Mô tả hình ảnh"
          },
          {
            "media_id": 2,
            "file_type": "image",
            "file_name": "answer_image.png",
            "file_url": "/uploads/answers/answer_image.png",
            "owner_type": "answer",
            "owner_id": 789,
            "alt_text": "Hình ảnh đáp án",
            "description": null
          }
        ]
      }
    ]
  }
}
```

## 🔑 Các trường trong MediaFile

| Field         | Type   | Required | Mô tả                                |
| ------------- | ------ | -------- | ------------------------------------ |
| `media_id`    | number | ✅       | ID của media file                    |
| `file_type`   | string | ✅       | Loại file: "image", "audio", "video" |
| `file_name`   | string | ✅       | Tên file gốc                         |
| `file_url`    | string | ✅       | Đường dẫn URL đến file               |
| `owner_type`  | string | ✅       | "question" hoặc "answer"             |
| `owner_id`    | number | ✅       | ID của question hoặc answer          |
| `alt_text`    | string | ❌       | Text thay thế cho hình ảnh           |
| `description` | string | ❌       | Mô tả chi tiết                       |

## 🔍 Logic Backend cần implement

### 1. Trong Quiz Controller/Service

Khi lấy quiz detail, cần:

```javascript
// Pseudo code
async function getQuizById(quizId) {
  // 1. Lấy thông tin quiz
  const quiz = await Quiz.findByPk(quizId, {
    include: [
      {
        model: Question,
        include: [
          { model: QuestionType },
          { model: Level },
          { model: Answer },
          {
            model: MediaFile, // ← THÊM INCLUDE NÀY
            as: "MediaFiles",
          },
        ],
      },
    ],
  });

  return quiz;
}
```

### 2. Quan hệ Database cần có

Đảm bảo các quan hệ sau đã được định nghĩa:

```javascript
// Question Model
Question.hasMany(MediaFile, {
  foreignKey: "owner_id",
  constraints: false,
  scope: {
    owner_type: "question",
  },
  as: "MediaFiles",
});

// Answer Model
Answer.hasMany(MediaFile, {
  foreignKey: "owner_id",
  constraints: false,
  scope: {
    owner_type: "answer",
  },
  as: "MediaFiles",
});
```

## 📊 Bảng MediaFiles

Đảm bảo bảng `media_files` có cấu trúc:

```sql
CREATE TABLE media_files (
  media_id INT PRIMARY KEY AUTO_INCREMENT,
  file_type ENUM('image', 'audio', 'video') NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  owner_type ENUM('question', 'answer') NOT NULL,
  owner_id INT NOT NULL,
  alt_text VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_owner (owner_type, owner_id)
);
```

## ✅ Checklist cho Backend

- [ ] Cập nhật Quiz model để include MediaFiles
- [ ] Cập nhật Quiz controller/service để trả về MediaFiles
- [ ] Test endpoint `GET /quizzes/{id}` với quiz có media
- [ ] Test endpoint `GET /quizzes/{id}` với quiz không có media
- [ ] Đảm bảo performance (sử dụng eager loading, không N+1 query)
- [ ] Cập nhật API documentation

## 🧪 Test Cases

### Test 1: Quiz có media files

```bash
GET /api/quizzes/213
```

**Expected:** Response chứa MediaFiles array cho mỗi question

### Test 2: Quiz không có media files

```bash
GET /api/quizzes/214
```

**Expected:** Response có MediaFiles = [] hoặc undefined (frontend sẽ handle)

### Test 3: Question có nhiều media files

```bash
GET /api/quizzes/215
```

**Expected:** MediaFiles array chứa tất cả media của cả question và answers

## 📝 Ghi chú

1. **Performance:** Sử dụng eager loading để tránh N+1 query problem
2. **Backward Compatibility:** Nếu MediaFiles không tồn tại, trả về empty array hoặc undefined
3. **File URL:** Đảm bảo `file_url` là đường dẫn tương đối hoặc tuyệt đối có thể truy cập từ frontend
4. **Security:** Kiểm tra quyền truy cập file media

## 🔗 API đã có sẵn (tham khảo)

Endpoint `/questions/enhanced/{id}` đã implement logic tương tự, có thể tham khảo:

```javascript
// Tham khảo từ question.service.js
const question = await Question.findByPk(questionId, {
  include: [
    { model: QuestionType },
    { model: Level },
    { model: Answer },
    { model: MediaFile, as: "MediaFiles" },
  ],
});
```

## 📞 Liên hệ

Nếu có thắc mắc về yêu cầu này, vui lòng liên hệ Frontend Team.

---

**Ngày tạo:** 2025-01-15  
**Người yêu cầu:** Frontend Team  
**Ưu tiên:** High  
**Deadline:** ASAP
