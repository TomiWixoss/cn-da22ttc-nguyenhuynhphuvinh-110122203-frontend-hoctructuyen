# Phát triển Giao diện Frontend cho Nền tảng học trực tuyến có yếu tố trò chơi

## Thông tin đề tài

| Thông tin       | Chi tiết                    |
| --------------- | --------------------------- |
| **Khoa**        | Kỹ thuật và Công nghệ       |
| **Bộ môn**      | Công nghệ Thông tin         |
| **Loại đề tài** | Thực tập Đồ án Chuyên ngành |
| **Thời gian**   | 03/11/2025 - 28/12/2025     |

## Người thực hiện

- **Họ tên:** Nguyễn Huỳnh Phú Vinh
- **MSSV:** 110122203
- **Lớp:** DA22TTC

## Giảng viên hướng dẫn

- ThS. Nguyễn Ngọc Đan Thanh

---

## Mô tả đề tài

Trong bối cảnh giáo dục hiện đại và xu hướng chuyển đổi số, đề tài tập trung phát triển hoàn chỉnh giao diện người dùng cho hệ thống học tập trực tuyến, với mục tiêu mang lại trải nghiệm hấp dẫn và tăng động lực cho sinh viên thông qua tích hợp các yếu tố trò chơi.

### Hai thành phần chính

1. **Giao diện quản lý học thuật:** Cung cấp công cụ cho quản trị viên và giảng viên quản lý chương trình đào tạo, khóa học, ngân hàng câu hỏi, sinh viên, bài đánh giá và luyện tập.

2. **Giao diện luyện tập và đánh giá có tích hợp trò chơi:** Người học có thể theo dõi kết quả học tập, so sánh năng lực với kết quả trung bình và xuất sắc nhất của lớp.

### Tính năng nổi bật

- Trực quan hóa dữ liệu với đa dạng biểu đồ
- Phân tích tiến độ học tập và hiệu suất
- So sánh kết quả cá nhân với trung bình lớp
- Theo dõi hiệu suất tổng thể cho giảng viên

---

## Công nghệ sử dụng

| Công nghệ            | Mục đích                                          |
| -------------------- | ------------------------------------------------- |
| **Next.js**          | Framework xây dựng giao diện với SSR, tối ưu SEO  |
| **Tailwind CSS**     | Thiết kế giao diện responsive                     |
| **Shadcn/ui**        | Bộ thành phần UI hiện đại, nhất quán              |
| **TanStack Query**   | Quản lý trạng thái dữ liệu từ server              |
| **Phaser.js**        | Framework game 2D cho bài luyện tập/đánh giá      |
| **Chart.js**         | Trực quan hóa điểm số và thống kê học tập         |
| **Socket.IO Client** | Kết nối thời gian thực (bảng xếp hạng, phòng chờ) |

---

## Cài đặt và Chạy

```bash
# Di chuyển vào thư mục source
cd src

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build
```

Truy cập [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

---

## Cấu trúc dự án

```
src/
├── src/              # Source code chính (components, pages, hooks, ...)
├── phaser/           # Game engine và scenes
├── public/           # Static assets
├── docs/             # Tài liệu API và hướng dẫn
└── ...
```

---

## Kết quả đạt được

- ✅ Giao diện quản lý cho Admin (Chương trình đào tạo, Khóa đào tạo, Môn học, Ma trận liên kết)
- ✅ Giao diện quản lý cho Giảng viên (Câu hỏi, Sinh viên, Quiz, Khóa học)
- ✅ Giao diện Sinh viên (Tổng quan, Luyện tập, Lịch sử, Hồ sơ)
- ✅ Môi trường game tích hợp cho bài luyện tập và đánh giá
