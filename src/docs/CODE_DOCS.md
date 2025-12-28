Chào bạn đồng nghiệp (Backend/Frontend Team),

Với tư cách là một **Giảng viên Đại học** đang phụ trách môn "Kỹ thuật Lập trình", tôi hiểu rất rõ nỗi đau đầu khi quản lý lớp học đồ án/code. Tôi không chỉ cần biết ai qua môn, tôi cần biết:
1.  **Ai đang "giãy chết"?** (Nộp 20 lần mà vẫn sai, cần cứu gấp).
2.  **Ai đang "học vẹt"?** (Copy code đâu đó paste vào 1 lần ăn ngay mà không chạy thử lần nào).
3.  **Bài nào tôi ra đề "ngáo"?** (Cả lớp đều sai ở Test Case số 5 -> Đề có vấn đề hoặc tôi dạy chưa kỹ).

Dựa trên nhu cầu thực tế này, tôi đã thiết kế bộ **API Specs** dưới đây. Đề nghị team Backend triển khai đúng format này để team Frontend có thể vẽ Dashboard xịn xò cho giảng viên.

---

# 📘 TEACHER ANALYTICS API SPECIFICATION
**Version:** 2.1.0
**Context:** Code Exercise Analytics

## 1. API Tổng Quan & Danh Sách Sinh Viên (Dashboard)
API này là màn hình đầu tiên Giảng viên nhìn thấy khi vào xem một bài Quiz Code.

*   **Endpoint:** `GET /api/teacher/code-analytics/course/:quizId/overview`
*   **Query Params:** `?type=quiz`
*   **Mục đích:**
    *   Hiển thị **ngay lập tức** danh sách sinh viên cần trợ giúp (Priority High).
    *   Cung cấp dữ liệu vẽ biểu đồ phân phối điểm (để xem phổ điểm lớp lệch trái hay phải).
    *   Danh sách toàn bộ sinh viên kèm thống kê sơ bộ.

**Response Body (JSON):**

```json
{
  "success": true,
  "data": {
    "quiz_info": {
      "quiz_id": 243,
      "name": "Bài tập C++: Mảng và Con trỏ",
      "total_students": 60
    },

    // 🔴 DATA QUAN TRỌNG 1: SINH VIÊN CẦN TRỢ GIÚP (Hiển thị đầu trang)
    // Logic: Pass rate < 50% HOẶC số lần nộp > 10 mà chưa qua
    "students_needing_help": [
      {
        "user_id": 105,
        "name": "Nguyễn Văn Stuck",
        "email": "stuck@st.edu.vn",
        "avg_pass_rate": 0.2,  // Chỉ đúng 20%
        "total_submissions": 15, // Nộp 15 lần vẫn sai -> Cần cứu gấp
        "status": "critical", // critical | warning
        "last_active": "10 phút trước"
      }
    ],

    // 📊 DATA QUAN TRỌNG 2: DỮ LIỆU VẼ BIỂU ĐỒ
    "charts": {
      // Biểu đồ tròn: Phân loại trình độ
      "mastery_distribution": {
        "beginner": 10,      // Yếu
        "intermediate": 30,  // Trung bình
        "advanced": 15,      // Khá
        "expert": 5          // Giỏi (Làm 1 lần ăn ngay)
      },
      // Biểu đồ cột: Phổ điểm (Score Distribution)
      "score_distribution": [
        { "range": "0-20", "count": 5 },
        { "range": "20-40", "count": 8 },
        { "range": "40-60", "count": 20 },
        { "range": "60-80", "count": 15 },
        { "range": "80-100", "count": 12 }
      ]
    },

    // 📋 DATA QUAN TRỌNG 3: DANH SÁCH SINH VIÊN CHI TIẾT
    "all_students": [
      {
        "user_id": 101,
        "name": "Trần Văn Giỏi",
        "email": "gioi@st.edu.vn",
        "progress_status": "completed", // completed | in_progress | not_started
        "score": 100,
        "total_attempts": 2, // Số lần submit
        "time_spent": "35 phút"
      },
      {
        "user_id": 102,
        "name": "Lê Thị Khá",
        "email": "kha@st.edu.vn",
        "progress_status": "in_progress",
        "score": 60,
        "total_attempts": 5,
        "time_spent": "1 giờ"
      }
      // ... các sinh viên khác
    ]
  }
}
```

---

## 2. API Chi Tiết Sinh Viên & Log Bài Làm (Deep Dive)
Khi giảng viên bấm vào một sinh viên cụ thể, API này sẽ trả về "hành trình" làm bài của họ.

*   **Endpoint:** `GET /api/teacher/code-analytics/student/:userId`
*   **Query Params:** `?quiz_id=243` (Bắt buộc để lọc theo bài quiz đó)
*   **Mục đích:**
    *   Xem lịch sử nộp bài: Nộp lần 1 sai đâu, lần 2 sửa được gì, lần 3 mới đúng hết.
    *   Phát hiện lỗi tư duy thông qua các lỗi biên dịch/runtime thường gặp.

**Response Body (JSON):**

```json
{
  "success": true,
  "data": {
    "student_info": {
      "user_id": 105,
      "name": "Nguyễn Văn Stuck",
      "final_score": 40,
      "status": "stuck" // Đang gặp khó khăn
    },

    // 🔍 DATA QUAN TRỌNG: LOG LỊCH SỬ LÀM BÀI
    "submission_history": [
      {
        "submission_id": 1001,
        "attempt_number": 1, // Lần nộp thứ 1
        "submitted_at": "2025-11-18T09:00:00Z",
        "status": "compile_error",
        "score": 0,
        "passed_test_cases": 0,
        "total_test_cases": 5,
        "error_detail": "Missing semicolon at line 5" // Giảng viên biết ngay nó sai cú pháp
      },
      {
        "submission_id": 1005,
        "attempt_number": 2, // Lần nộp thứ 2
        "submitted_at": "2025-11-18T09:15:00Z",
        "status": "wrong_answer",
        "score": 40,
        "passed_test_cases": 2, // Pass 2/5
        "total_test_cases": 5,
        "failed_test_cases": [3, 4, 5] // Giảng viên biết nó đang chết ở test case nào
      },
      {
        "submission_id": 1010,
        "attempt_number": 3, // Lần nộp thứ 3
        "submitted_at": "2025-11-18T09:30:00Z",
        "status": "accepted", // Cuối cùng cũng đúng
        "score": 100,
        "passed_test_cases": 5,
        "total_test_cases": 5
      }
    ],

    // 🧠 DATA PHÂN TÍCH HÀNH VI (Để cải thiện dạy học)
    "behavior_analysis": {
      "total_test_runs": 25, // Chạy thử 25 lần (rất chịu khó test)
      "average_time_between_submissions": "15 phút", // Có suy nghĩ giữa các lần nộp
      "most_common_error": "Time Limit Exceeded", // Lỗi hay gặp nhất -> Cần dạy lại về độ phức tạp thuật toán
      "recommendation_for_teacher": "Sinh viên này hiểu logic nhưng code chưa tối ưu. Cần hướng dẫn thêm về Big O."
    }
  }
}
```

---

## 3. API Cải Thiện Chương Trình Học (Question Quality)
Giúp giảng viên biết câu hỏi nào "có vấn đề".

*   **Endpoint:** `GET /api/teacher/code-analytics/question/:questionId/difficulty`
*   **Mục đích:**
    *   Nếu 80% sinh viên sai ở Test Case #3 -> Test case đó có thể là "Edge Case" (trường hợp biên) mà giảng viên quên dạy.
    *   Nếu pass rate chung của câu hỏi quá thấp -> Câu hỏi quá khó, cần điều chỉnh đề.

**Response Body (JSON):**

```json
{
  "success": true,
  "data": {
    "question_id": 430,
    "question_text": "Tìm số lớn nhất",
    "difficulty_rating": "hard", // Đánh giá thực tế từ kết quả sinh viên
    
    // 🔥 DATA QUAN TRỌNG: TỶ LỆ PASS TỪNG TEST CASE
    "test_cases_analytics": [
      {
        "test_case_id": 1,
        "description": "Số dương cơ bản",
        "pass_rate": 95, // 95% làm được -> Dễ
        "status": "good"
      },
      {
        "test_case_id": 3,
        "description": "Số âm cực lớn (Edge case)",
        "pass_rate": 15, // Chỉ 15% làm được -> Quá khó hoặc chưa dạy
        "status": "problematic", 
        "common_error": "Wrong Answer"
      }
    ],
    
    "teacher_action_item": "Test case #3 gây khó khăn cho 85% sinh viên. Cân nhắc thêm gợi ý (hint) về xử lý số âm."
  }
}
```

---

### 💡 Tóm tắt cho Dev Team:
1.  **Dashboard:** Cần show list sinh viên, nhưng tách riêng nhóm `students_needing_help` lên đầu. Thêm data cho biểu đồ `mastery_distribution`.
2.  **Student Detail:** Cần show `submission_history` dạng list theo thời gian. Quan trọng là số liệu `pass X/Y test cases` ở mỗi lần nộp.
3.  **Logic "Needing Help":** Backend tự định nghĩa rule (ví dụ: Pass rate < 50% hoặc Attempts > 10) để flag sinh viên này.

Tài liệu này giúp tôi (Giảng viên) không chỉ chấm điểm mà còn **can thiệp kịp thời** để cứu sinh viên trước khi quá muộn. Thanks team! 🚀