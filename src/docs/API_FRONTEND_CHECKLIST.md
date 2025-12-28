# DANH SÁCH API FRONTEND - CHECKLIST KIỂM TRA

> **Ngày tạo**: 15/10/2025  
> **Mục đích**: Kiểm tra từng API trong frontend, đảm bảo đầy đủ và hoạt động tốt

---

## 📋 TỔNG QUAN

### Thống kê API Services

- **Tổng số service files**: 30+
- **Tổng số API endpoints**: 300+
- **Phân loại chính**:
  - Authentication & User Management
  - Program & Curriculum Management
  - Course & Quiz Management
  - Gamification & Shop
  - Analytics & Reports
  - Practice & Recommendations

---

## ✅ CHECKLIST THỰC HIỆN

### Bước 1: Phân loại API theo module

- [x] Liệt kê tất cả service files
- [x] Phân loại theo chức năng
- [ ] Kiểm tra từng API endpoint
- [ ] Ghi chú API nào đã test
- [ ] Ghi chú API nào cần fix

### Bước 2: Kiểm tra từng module

- [ ] Authentication & User Management
- [ ] Program Management
- [ ] Course Management
- [ ] Quiz Management
- [ ] Gamification
- [ ] Analytics
- [ ] Practice Recommendations

### Bước 3: Tài liệu hóa

- [ ] Ghi chú request/response format
- [ ] Ghi chú error handling
- [ ] Ghi chú dependencies giữa các API

---

## 1️⃣ AUTHENTICATION & USER MANAGEMENT

### 📁 File: `auth.service.ts`

#### APIs

- [ ] **POST** `/users/login` - Đăng nhập

  - Request: `{ email, password }`
  - Response: `{ token, user }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/users/createStudent` - Đăng ký sinh viên (public)

  - Request: `{ name, email, password }`
  - Response: `{ user }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/users/createTeacher` - Đăng ký giáo viên (admin only)

  - Request: `{ name, email, password }`
  - Response: `{ user }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/users/:id` - Lấy thông tin user

  - Response: `{ user }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **PUT** `/users/:id` - Cập nhật thông tin user
  - Request: `{ name?, email?, password? }`
  - Response: `{ user }`
  - Status: ⏳ Chưa kiểm tra

### 📁 File: `user.service.ts`

#### APIs

- [ ] **GET** `/users` - Lấy danh sách users (admin)

  - Query: `page, limit`
  - Response: `{ users[], pagination }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/users/createAdmin` - Tạo admin (admin only)

  - Request: `{ name, email, password }`
  - Response: `{ user }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/users/:id` - Xóa user (admin only)

  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/users/importStudents` - Import sinh viên từ Excel
  - Request: `FormData(file)`
  - Response: `{ imported, errors }`
  - Status: ⏳ Chưa kiểm tra

---

## 2️⃣ PROGRAM & CURRICULUM MANAGEMENT

### 📁 File: `program.service.ts`

#### APIs

- [ ] **GET** `/programs` - Lấy danh sách chương trình

  - Query: `page, limit, search, sort_by, sort_order, duration_years`
  - Response: `{ programs[], pagination }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/programs/:id` - Lấy chi tiết chương trình

  - Response: `{ program, POs, PLOs, Subjects }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/programs` - Tạo chương trình mới (admin)

  - Request: `{ name, code, description, duration_years }`
  - Response: `{ program }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **PUT** `/programs/:id` - Cập nhật chương trình (admin)

  - Request: `{ name?, code?, description?, duration_years? }`
  - Response: `{ program }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/programs/:id` - Xóa chương trình (admin)

  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/programs/:id/pos` - Lấy POs của chương trình

  - Response: `{ pos[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/programs/:id/plos` - Lấy PLOs của chương trình

  - Response: `{ plos[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/programs/:id/courses` - Lấy courses của chương trình

  - Response: `{ courses[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/programs/:id/statistics` - Thống kê chương trình
  - Response: `{ stats }`
  - Status: ⏳ Chưa kiểm tra

### 📁 File: `po.service.ts`

#### APIs

- [ ] **GET** `/pos` - Lấy danh sách POs

  - Query: `page, limit, search, program_id`
  - Response: `{ pos[], pagination }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/pos/:id` - Lấy chi tiết PO

  - Response: `{ po, PLOs }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/pos/program/:programId` - Lấy POs theo program

  - Response: `{ pos[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/pos` - Tạo PO mới (admin)

  - Request: `{ name, code, description, program_id }`
  - Response: `{ po }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **PUT** `/pos/:id` - Cập nhật PO (admin)

  - Response: `{ po }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/pos/:id` - Xóa PO (admin)

  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/pos/:id/plos` - Lấy PLOs của PO

  - Response: `{ plos[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/pos/bulk` - Tạo nhiều POs

  - Request: `{ pos[] }`
  - Response: `{ pos[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/pos/bulk` - Xóa nhiều POs
  - Request: `{ po_ids[] }`
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

### 📁 File: `plo.service.ts`

#### APIs

- [ ] **GET** `/plos` - Lấy danh sách PLOs

  - Query: `page, limit, search, program_id, po_id`
  - Response: `{ plos[], pagination }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/plos/:id` - Lấy chi tiết PLO

  - Response: `{ plo, LOs }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/plos/program/:programId` - Lấy PLOs theo program

  - Response: `{ plos[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/plos/po/:poId` - Lấy PLOs theo PO

  - Response: `{ plos[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/plos` - Tạo PLO mới (admin)

  - Request: `{ name, code, description, program_id, po_id }`
  - Response: `{ plo }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **PUT** `/plos/:id` - Cập nhật PLO (admin)

  - Response: `{ plo }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/plos/:id` - Xóa PLO (admin)

  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/plos/:id/los` - Lấy LOs của PLO

  - Response: `{ los[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/plos/:id/link-los` - Liên kết PLO với LOs

  - Request: `{ lo_ids[] }`
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/plos/:id/unlink-los` - Hủy liên kết PLO với LOs

  - Request: `{ lo_ids[] }`
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/programs/:programId/pos/:poId/plos/:ploId` - Liên kết PLO-PO

  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/programs/:programId/pos/:poId/plos/:ploId` - Hủy liên kết PLO-PO

  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/plos/bulk` - Tạo nhiều PLOs

  - Request: `{ plos[] }`
  - Response: `{ plos[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/plos/bulk` - Xóa nhiều PLOs
  - Request: `{ plo_ids[] }`
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

---

## 3️⃣ SUBJECT & CHAPTER MANAGEMENT

### 📁 File: `subject.service.ts`

#### APIs

- [ ] **GET** `/subjects` - Lấy danh sách môn học

  - Query: `page, limit`
  - Response: `{ subjects[], pagination }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/subjects/:id` - Lấy chi tiết môn học

  - Response: `{ subject }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/subjects` - Tạo môn học mới

  - Request: `{ name, code, description, credits }`
  - Response: `{ subject }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **PUT** `/subjects/:id` - Cập nhật môn học

  - Response: `{ subject }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/subjects/:id` - Xóa môn học

  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/subjects/course/:courseId` - Lấy môn học theo course

  - Response: `{ subjects[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/subjects/:id/chapters` - Lấy chapters của môn học

  - Response: `{ chapters[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/programs/:programId/subjects` - Lấy môn học theo program

  - Response: `{ subjects[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/programs/:programId/subjects` - Gán môn học vào program

  - Request: `{ subject_id, order_index, recommended_semester, is_mandatory }`
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **PATCH** `/programs/:programId/subjects/:subjectId` - Cập nhật môn học trong program

  - Request: `{ order_index?, recommended_semester?, is_mandatory?, is_active? }`
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/programs/:programId/subjects/:subjectId` - Xóa môn học khỏi program

  - Query: `force=true`
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/subjects/:id/plos` - Lấy PLOs của môn học

  - Response: `{ plos[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/subjects/:id/plos` - Thêm PLOs vào môn học

  - Request: `{ plo_ids[] }`
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/subjects/:id/plos` - Xóa PLOs khỏi môn học

  - Request: `{ plo_ids[] }`
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/type-subjects` - Lấy danh sách loại môn học

  - Response: `{ typeSubjects[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/type-subjects` - Tạo loại môn học mới

  - Response: `{ typeSubject }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **PUT** `/type-subjects/:id` - Cập nhật loại môn học

  - Response: `{ typeSubject }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/type-subjects/:id` - Xóa loại môn học
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

### 📁 File: `chapter.service.ts`

#### APIs

- [ ] **GET** `/chapters/subject/:subjectId` - Lấy chapters theo môn học

  - Query: `page, limit`
  - Response: `{ chapters[], pagination }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/chapters/:id` - Lấy chi tiết chapter

  - Response: `{ chapter, LOs, Sections }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/chapters` - Tạo chapter mới

  - Request: `{ name, description, subject_id, lo_ids[] }`
  - Response: `{ chapter }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **PUT** `/chapters/:id` - Cập nhật chapter

  - Request: `{ name?, description?, subject_id?, lo_ids[]? }`
  - Response: `{ chapter }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/chapters/:id` - Xóa chapter

  - Query: `force=true`
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/chapters/:id/sections` - Lấy sections của chapter

  - Response: `{ chapter, sections[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/chapters/:id/sections` - Thêm sections vào chapter

  - Request: `{ sections[] }`
  - Response: `{ created_sections[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **PUT** `/chapters/:id/sections/:sectionId` - Cập nhật section

  - Request: `{ title?, content?, order? }`
  - Response: `{ section }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/chapters/:id/sections/:sectionId` - Xóa section
  - Response: `{ deleted_section_id }`
  - Status: ⏳ Chưa kiểm tra

### 📁 File: `lo.service.ts`

#### APIs

- [ ] **GET** `/los` - Lấy danh sách LOs

  - Query: `page, limit, search, subject_id`
  - Response: `{ los[], pagination }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/los/by-subject/:subjectId` - Lấy LOs theo môn học (tối ưu)

  - Query: `page, limit, search, include_questions`
  - Response: `{ los[], subject }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/los/:id` - Lấy chi tiết LO

  - Response: `{ lo, Chapters, Questions }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/learning-outcomes/course/:courseId` - Lấy LOs theo course

  - Response: `{ course_id, learning_outcomes[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/los` - Tạo LO mới

  - Request: `{ subject_id, name, description, chapter_ids[] }`
  - Response: `{ lo }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **PUT** `/los/:id` - Cập nhật LO

  - Request: `{ subject_id?, name?, description?, chapter_ids[]? }`
  - Response: `{ lo }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/los/:id` - Xóa LO

  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/los/:id/plos` - Gán PLOs cho LO

  - Request: `{ plo_ids[] }`
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/los/:id/plos` - Gỡ PLOs khỏi LO

  - Request: `{ plo_ids[] }`
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/learning-outcomes/completion-analysis/:courseId/:userId` - Phân tích LO completion

  - Query: `start_date, end_date`
  - Response: `{ analysis_data }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/learning-outcomes/:id/details` - Lấy chi tiết LO với chapters/sections
  - Response: `{ lo_details, chapters[], prerequisites[], learning_path[] }`
  - Status: ⏳ Chưa kiểm tra

---

## 4️⃣ COURSE MANAGEMENT

### 📁 File: `course.service.ts`

#### APIs

- [ ] **GET** `/courses` - Lấy danh sách courses

  - Query: `page, limit, search, teacher_id, program_id, semester, year, credits`
  - Response: `{ courses[], pagination }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/courses/:id` - Lấy chi tiết course

  - Response: `{ course, Teacher, Program, Students, Quizzes }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/courses/teacher/:teacherId` - Lấy courses theo giáo viên

  - Query: `page, limit, search, semester, year`
  - Response: `{ courses[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/courses/program/:programId` - Lấy courses theo program

  - Query: `page, limit, search, semester, year`
  - Response: `{ courses[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/courses` - Tạo course mới (teacher/admin)

  - Request: `{ name, description, teacher_id, program_id, semester, year, credits }`
  - Response: `{ course }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **PUT** `/courses/:id` - Cập nhật course

  - Request: `{ name?, description?, ... }`
  - Response: `{ course }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/courses/:id` - Xóa course

  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/courses/:id/students` - Lấy danh sách sinh viên trong course

  - Query: `page, limit, search, status`
  - Response: `{ students[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/courses/:id/enroll` - Thêm sinh viên vào course

  - Request: `{ student_id }`
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/courses/:id/unenroll` - Xóa sinh viên khỏi course

  - Request: `{ student_id }`
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/courses/:id/statistics` - Thống kê course

  - Response: `{ stats }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/courses/:id/subjects` - Lấy subjects của course

  - Response: `{ subjects[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/courses/bulk` - Tạo nhiều courses

  - Request: `{ courses[] }`
  - Response: `{ courses[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/courses/bulk` - Xóa nhiều courses

  - Request: `{ course_ids[] }`
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/courses/:id/bulk-enroll` - Thêm nhiều sinh viên vào course
  - Request: `{ student_ids[] }`
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

### 📁 File: `course-grade.service.ts`

#### APIs - Grade Columns

- [ ] **GET** `/courses/:courseId/grade-columns` - Lấy danh sách cột điểm

  - Query: `page, limit, search, sort_by, sort_order`
  - Response: `{ grade_columns[], pagination }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/courses/:courseId/grade-columns` - Tạo cột điểm mới

  - Request: `{ name, weight, max_score, description }`
  - Response: `{ grade_column }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **PUT** `/courses/:courseId/grade-columns/:id` - Cập nhật cột điểm

  - Request: `{ name?, weight?, max_score?, description? }`
  - Response: `{ grade_column }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/courses/:courseId/grade-columns/:id` - Xóa cột điểm
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

#### APIs - Quiz Assignment

- [ ] **POST** `/courses/:courseId/grade-columns/:id/assign-quizzes` - Gán quizzes vào cột điểm

  - Request: `{ quiz_assignments[] }` (với weight)
  - Response: `{ assigned_quizzes[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/courses/:courseId/grade-columns/:id/unassign-quizzes` - Gỡ quizzes khỏi cột điểm

  - Request: `{ quiz_ids[] }`
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/courses/:courseId/grade-columns/:id/unassign-all-quizzes` - Gỡ tất cả quizzes

  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/courses/:courseId/available-quizzes` - Lấy quizzes có thể gán
  - Query: `page, limit, search, status, exclude_assigned`
  - Response: `{ quizzes[] }`
  - Status: ⏳ Chưa kiểm tra

#### APIs - Grade Calculation

- [ ] **POST** `/courses/:courseId/calculate-grade` - Tính điểm cho course

  - Request: `{ student_id?, recalculate? }`
  - Response: `{ calculation_results }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **PUT** `/courses/:courseId/final-exam-score` - Cập nhật điểm thi cuối

  - Request: `{ student_id, final_exam_score }`
  - Response: `{ grade_result }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/courses/:courseId/recalculate-all` - Tính lại tất cả điểm
  - Response: `{ calculation_results }`
  - Status: ⏳ Chưa kiểm tra

#### APIs - Export & Statistics

- [ ] **GET** `/courses/:courseId/export-results` - Export kết quả

  - Query: `format=json|excel`
  - Response: `{ export_data }` hoặc file Excel
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/courses/:courseId/grade-results` - Lấy kết quả điểm

  - Query: `page, limit, student_id, grade_column_id`
  - Response: `{ results[], pagination }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/courses/:courseId/grade-statistics` - Thống kê điểm

  - Response: `{ stats, distribution, column_statistics }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/courses/create-with-grade-columns` - Tạo course với cột điểm
  - Request: `{ course_data, grade_columns[] }`
  - Response: `{ course, grade_columns[] }`
  - Status: ⏳ Chưa kiểm tra

### 📁 File: `student-course.service.ts`

#### APIs

- [ ] **GET** `/student-courses/students/:userId/courses` - Lấy courses của sinh viên
  - Query: `page, limit, search`
  - Response: `{ student_info, courses[], pagination }`
  - Status: ⏳ Chưa kiểm tra

---

## 5️⃣ QUIZ & QUESTION MANAGEMENT

### 📁 File: `quiz.service.ts`

#### APIs - Quiz CRUD

- [ ] **GET** `/quizzes` - Lấy danh sách quizzes

  - Query: `page, limit, status, course_id, search, sort_by, sort_order`
  - Response: `{ quizzes[], pagination }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/quizzes/:id` - Lấy chi tiết quiz

  - Response: `{ quiz, Questions, Course }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/quizzes` - Tạo quiz mới

  - Request: `{ name, description, course_id, time_limit, quiz_mode }`
  - Response: `{ quiz }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **PUT** `/quizzes/:id` - Cập nhật quiz

  - Request: `{ name?, description?, time_limit?, quiz_mode? }`
  - Response: `{ quiz }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/quizzes/:id` - Xóa quiz

  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/quizzes/:id/clone` - Clone quiz
  - Request: `{ new_name?, new_course_id?, clone_questions?, reset_pin? }`
  - Response: `{ cloned_quiz }`
  - Status: ⏳ Chưa kiểm tra

#### APIs - Quiz Mode

- [ ] **GET** `/quiz-modes/:id/info` - Lấy thông tin quiz mode

  - Response: `{ quiz_mode_info }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **PUT** `/quiz-modes/:id/update` - Đổi chế độ quiz

  - Request: `{ quiz_mode }`
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/quizzes/mode/:mode` - Lấy quizzes theo mode

  - Query: `page, limit, course_id, status, search`
  - Response: `{ quizzes[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/quizzes/course/:courseId/mode/:mode` - Lấy quizzes theo course và mode
  - Query: `page, limit, status, search`
  - Response: `{ quizzes[] }`
  - Status: ⏳ Chưa kiểm tra

#### APIs - Quiz Execution

- [ ] **POST** `/quizzes/:id/start` - Bắt đầu quiz

  - Response: `{ session_info }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/quizzes/:id/auto` - Bắt đầu quiz tự động

  - Response: `{ session_info }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/quizzes/:id/questions` - Lấy câu hỏi của quiz

  - Response: `{ questions[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/quizzes/:id/shuffle` - Trộn câu hỏi

  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/quizzes/pin/:pin` - Lấy quiz ID từ PIN

  - Response: `{ quiz_id }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/quizzes/:id/join` - Tham gia quiz

  - Request: `{ user_id, display_name }`
  - Response: `{ session_info }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/quizzes/:id/leave` - Rời quiz

  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/quizzes/:id/submit` - Nộp bài quiz (assessment)
  - Response: `{ result }`
  - Status: ⏳ Chưa kiểm tra

#### APIs - Realtime Quiz

- [ ] **GET** `/quizzes/:id/participants` - Lấy danh sách người tham gia

  - Response: `{ participants[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/quizzes/:id/statistics` - Thống kê quiz realtime

  - Response: `{ stats }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/quizzes/:id/realtime-scores` - Điểm số realtime

  - Response: `{ scores[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/quizzes/:id/students/:userId/realtime` - Chi tiết sinh viên realtime

  - Response: `{ student_data }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/quizzes/realtime/answer` - Gửi đáp án realtime

  - Request: `{ quizId, questionId, answerId, startTime, userId }`
  - Response: `{ result }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/quizzes/:id/next` - Trigger câu hỏi tiếp theo

  - Request: `{ current_question_index }`
  - Response: `{ next_question }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/quizzes/:id/leaderboard` - Lấy bảng xếp hạng

  - Response: `{ leaderboard[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/quizzes/:id/leaderboard` - Trigger hiển thị bảng xếp hạng
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

#### APIs - Quiz Results

- [ ] **GET** `/quiz-results/user/:userId` - Lấy kết quả quiz của user

  - Response: `{ results[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/quiz-results/:id` - Lấy chi tiết kết quả

  - Response: `{ result, answers[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/quiz-results/user/:userId/completed` - Lấy quizzes đã hoàn thành

  - Response: `{ completed_quizzes[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/quiz-results/quiz/:quizId` - Lấy kết quả theo quiz (teacher/admin)

  - Response: `{ results[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/quiz-results/:id/chapters` - Lấy kết quả với chapters/sections

  - Response: `{ result, chapters_analysis }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/quiz-results/quiz-user` - Lấy kết quả theo quiz và user

  - Query: `quiz_id, user_id`
  - Response: `{ result }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/quiz-results/quiz-user/chapters` - Lấy kết quả chi tiết với chapters

  - Query: `quiz_id, user_id`
  - Response: `{ result, chapters_analysis }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/quiz-results/weakest-lo` - Đề xuất điểm yếu theo LO

  - Query: `quiz_id, user_id`
  - Response: `{ weakest_lo, chapters[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/quiz-results/improvement-analysis` - Phân tích cải thiện

  - Query: `quiz_id?, course_id?, user_id?`
  - Response: `{ improvement_suggestions }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/quiz-results/detailed-analysis/:quizId/:userId` - Phân tích chi tiết
  - Response: `{ detailed_analysis }`
  - Status: ⏳ Chưa kiểm tra

#### APIs - Answer Choice Statistics

- [ ] **GET** `/quizzes/:quizId/question/:questionId/choice-stats` - Thống kê lựa chọn đáp án

  - Response: `{ choice_stats[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/quizzes/:quizId/choice-stats-summary` - Tóm tắt thống kê

  - Response: `{ summary }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/quizzes/:quizId/live-choice-stats` - Thống kê realtime

  - Response: `{ live_stats[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/quizzes/:quizId/question/:questionId/choice-stats` - Xóa thống kê câu hỏi

  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/quizzes/:quizId/choice-stats` - Xóa tất cả thống kê
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

#### APIs - Teacher Dashboard

- [ ] **GET** `/quizzes/:id/teacher/dashboard` - Dashboard cho giáo viên
  - Response: `{ dashboard_data }`
  - Status: ⏳ Chưa kiểm tra

### 📁 File: `question.service.ts`

#### APIs - Question CRUD (Enhanced with Media)

- [ ] **GET** `/questions/enhanced` - Lấy danh sách câu hỏi

  - Query: `page, limit, search, lo_id, level_id, question_type_id`
  - Response: `{ questions[], pagination }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/questions/enhanced/:id` - Lấy chi tiết câu hỏi

  - Response: `{ question, Answers, Media }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/questions/enhanced` - Tạo câu hỏi với media

  - Request: `FormData(question_text, answers, media_files, lo_id, level_id)`
  - Response: `{ question }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **PUT** `/questions/enhanced/:id` - Cập nhật câu hỏi với media

  - Request: `FormData(...)`
  - Response: `{ question }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/questions/enhanced/:id` - Xóa câu hỏi
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

#### APIs - Question CRUD (Basic)

- [ ] **POST** `/questions` - Tạo câu hỏi cơ bản

  - Request: `{ question_text, lo_id, level_id, question_type_id }`
  - Response: `{ question }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **PUT** `/questions/:id` - Cập nhật câu hỏi cơ bản

  - Response: `{ question }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/questions/:id` - Lấy câu hỏi với đáp án
  - Response: `{ question, Answers }`
  - Status: ⏳ Chưa kiểm tra

#### APIs - Answer Management

- [ ] **POST** `/answers` - Tạo đáp án

  - Request: `{ question_id, answer_text, iscorrect }`
  - Response: `{ answer }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **PUT** `/answers/:id` - Cập nhật đáp án

  - Request: `{ answer_text, iscorrect }`
  - Response: `{ answer }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/answers/:id` - Xóa đáp án
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

#### APIs - Question Selection

- [ ] **POST** `/questions/bylos` - Lấy câu hỏi theo LOs với phân bố độ khó

  - Request: `{ lo_ids[], difficulty_distribution }`
  - Response: `{ questions[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/questions/bulk` - Xóa nhiều câu hỏi
  - Request: `{ question_ids[] }`
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

#### APIs - Question Types & Levels

- [ ] **GET** `/question-types` - Lấy danh sách loại câu hỏi

  - Query: `page, limit`
  - Response: `{ question_types[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/question-types/:id` - Lấy chi tiết loại câu hỏi

  - Response: `{ question_type }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/question-types` - Tạo loại câu hỏi mới

  - Request: `{ name, description }`
  - Response: `{ question_type }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **PUT** `/question-types/:id` - Cập nhật loại câu hỏi

  - Response: `{ question_type }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/question-types/:id` - Xóa loại câu hỏi

  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/levels` - Lấy danh sách độ khó
  - Query: `page, limit`
  - Response: `{ levels[] }`
  - Status: ⏳ Chưa kiểm tra

#### APIs - Quiz-Question Association

- [ ] **GET** `/quiz-questions` - Lấy tất cả quiz-question associations

  - Response: `{ quiz_questions[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/quiz-questions/:quizId/:questionId` - Lấy association cụ thể

  - Response: `{ quiz_question }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/quizzes/:id/questions` - Thêm câu hỏi vào quiz

  - Request: `{ question_ids[] }`
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/quizzes/:id/questions` - Xóa câu hỏi khỏi quiz

  - Request: `{ question_ids[] }`
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **PUT** `/quizzes/:id/questions/reorder` - Sắp xếp lại câu hỏi

  - Request: `{ question_orders[] }`
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/los/:id/questions` - Lấy câu hỏi theo LO
  - Query: `page, limit`
  - Response: `{ questions[] }`
  - Status: ⏳ Chưa kiểm tra

#### APIs - Teacher Analytics

- [ ] **GET** `/teacher-analytics/quiz/:quizId/lo-questions` - Lấy câu hỏi theo LO với thông tin sinh viên

  - Query: `lo_id, userId?`
  - Response: `{ questions[], student_answers[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/teacher-analytics/quiz/:quizId/difficulty-lo-questions` - Lấy câu hỏi theo độ khó và LO
  - Query: `lo_id?, level_id?`
  - Response: `{ questions[] }`
  - Status: ⏳ Chưa kiểm tra

#### APIs - Import/Export

- [ ] **POST** `/questions/import` - Import câu hỏi từ CSV

  - Request: `FormData(file, subject_id)`
  - Response: `{ totalImported, errors[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/questions/import-excel` - Import câu hỏi từ Excel
  - Request: `FormData(file, subject_id)`
  - Response: `{ totalImported, errors[] }`
  - Status: ⏳ Chưa kiểm tra

#### APIs - Statistics

- [ ] **GET** `/questions/statistics` - Thống kê câu hỏi
  - Response: `{ stats }`
  - Status: ⏳ Chưa kiểm tra

---

## 6️⃣ GAMIFICATION & REWARDS

### 📁 File: `gamification.service.ts`

#### APIs

- [ ] **GET** `/gamification/me` - Lấy thông tin gamification của user hiện tại

  - Response: `{ user_gamification_info }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/gamification/leaderboard` - Lấy bảng xếp hạng

  - Query: `limit, timeframe`
  - Response: `{ leaderboard[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/gamification/user/:userId` - Lấy thông tin gamification của user khác (admin/teacher)

  - Response: `{ user_gamification_info }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/gamification/add-points` - Thêm điểm thủ công (admin)

  - Request: `{ user_id, points, reason }`
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/gamification/stats` - Thống kê gamification (admin)

  - Response: `{ stats }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/gamification-level/my-progress` - Lấy level progress với tier system

  - Response: `{ level_progress, tier_info }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/gamification-level/tiers` - Lấy thông tin tất cả tiers
  - Response: `{ tiers[] }`
  - Status: ⏳ Chưa kiểm tra

### 📁 File: `level-progress.service.ts`

#### APIs

- [ ] **GET** `/level-progress/tracker` - Lấy level progress tracker

  - Response: `{ level_progress_data }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/level-progress/claim-avatar` - Claim avatar theo level
  - Request: `{ level }`
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

### 📁 File: `currency.service.ts`

#### APIs

- [ ] **GET** `/currency/balance` - Lấy số dư tiền tệ

  - Response: `{ SYNC, KRIS }`
  - Status: ⏳ Chưa kiểm tra
  - Note: Cache 5 phút

- [ ] **GET** `/currency/history` - Lấy lịch sử giao dịch

  - Query: `page, limit, type, startDate, endDate`
  - Response: `{ transactions[], pagination }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/currency/transfer` - Chuyển tiền giữa users
  - Request: `{ toUserId, amount, currencyType, reason }`
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

### 📁 File: `shop.service.ts`

#### APIs

- [ ] **GET** `/shop/avatars` - Lấy danh sách avatars trong shop

  - Response: `{ avatars[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/shop/emojis` - Lấy danh sách emojis trong shop

  - Response: `{ emojis[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/shop/purchase` - Mua item từ shop
  - Request: `{ itemType, itemId }`
  - Response: `{ success, newBalance, owned }`
  - Status: ⏳ Chưa kiểm tra

### 📁 File: `avatar.service.ts`

#### APIs

- [ ] **GET** `/avatar/my-data` - Lấy dữ liệu avatar của user hiện tại

  - Response: `{ customization, inventory, collection_progress }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/avatar/available-items` - Lấy items có thể mở khóa

  - Response: `{ available_avatars[], available_emojis[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/avatar/equip` - Trang bị item

  - Request: `{ itemType, itemId }`
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/avatar/collection-progress` - Lấy tiến độ sưu tập
  - Response: `{ collection_progress }`
  - Status: ⏳ Chưa kiểm tra

### 📁 File: `racing.service.ts`

#### APIs

- [ ] **POST** `/racing/complete-round` - Hoàn thành vòng chơi racing
  - Request: `{ user_id, quiz_id, round_number, round_score, skipped_round }`
  - Response: `{ rank_change, total_score, player_position }`
  - Status: ⏳ Chưa kiểm tra

---

## 7️⃣ ANALYTICS & REPORTS

### 📁 File: `chapter-analytics.service.ts`

#### APIs - Chapter-based Analytics

- [ ] **GET** `/quiz-results/detailed-analysis/:quizId/:userId` - Phân tích chi tiết theo chapter

  - Response: `{ chapter_analysis_data }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/reports/course/:courseId/comprehensive-analysis/:userId` - Phân tích tổng hợp theo course

  - Query: `start_date?, end_date?`
  - Response: `{ comprehensive_analysis }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/teacher-analytics/quiz/:quizId/comprehensive-report` - Báo cáo tổng hợp cho giáo viên

  - Query: `include_student_details?, include_recommendations?`
  - Response: `{ teacher_analytics }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/teacher-analytics/quiz/:quizId/student-groups` - Dữ liệu nhóm học sinh

  - Response: `{ student_groups[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/teacher-analytics/quiz/:quizId/student-groups/:groupType` - Phân tích nhóm học sinh

  - Response: `{ group_analysis }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/teacher-analytics/quiz/:quizId/student/:userId/lo-analysis` - Phân tích LO của sinh viên

  - Response: `{ lo_analysis }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/teacher-analytics/quiz/:quizId/lo-questions` - Câu hỏi theo LO

  - Query: `lo_id, userId?`
  - Response: `{ questions[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/teacher-analytics/quiz/:quizId/teaching-insights` - Teaching insights

  - Response: `{ insights }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/teacher-analytics/quiz/:quizId/benchmark` - Quiz benchmark

  - Query: `compare_with_subject?, compare_with_teacher?`
  - Response: `{ benchmark_data }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/teacher-analytics/quiz-comparison` - So sánh quizzes

  - Query: `quiz_ids[]?, course_id?`
  - Response: `{ comparison_data }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/teacher-analytics/quiz/:quizId/learning-outcomes` - Biểu đồ Learning Outcomes

  - Response: `{ learning_outcomes_chart }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/teacher-analytics/quiz/:quizId/learning-outcomes/:loId` - Chi tiết Learning Outcome

  - Response: `{ lo_detail }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/teacher-analytics/quiz/:quizId/difficulty-lo-distribution` - Phân bố độ khó - LO

  - Response: `{ distribution_data }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/teacher-analytics/quiz/:quizId/difficulty-lo-questions` - Câu hỏi theo độ khó và LO
  - Query: `lo_id, level_id`
  - Response: `{ questions[] }`
  - Status: ⏳ Chưa kiểm tra

### 📁 File: `advanced-analytics.service.ts`

#### APIs - Performance Analytics

- [ ] **GET** `/advanced-analytics/performance/time-series` - Phân tích time series

  - Query: `program_id?, course_id?, quiz_id?, user_id?, time_period?, aggregation?`
  - Response: `{ time_series_data }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/advanced-analytics/performance/score-distribution` - Phân bố điểm

  - Query: `program_id?, course_id?, quiz_id?, bins?, comparison_period?`
  - Response: `{ distribution_data }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/advanced-analytics/performance/learning-outcomes` - So sánh Learning Outcomes

  - Query: `program_id?, course_id?, user_id?, comparison_type?`
  - Response: `{ comparison_data }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/advanced-analytics/performance/completion-funnel` - Completion funnel
  - Query: `program_id?, course_id?, quiz_id?`
  - Response: `{ funnel_data }`
  - Status: ⏳ Chưa kiểm tra

#### APIs - Difficulty Analysis

- [ ] **GET** `/advanced-analytics/difficulty/heatmap` - Heatmap độ khó

  - Query: `program_id?, course_id?, quiz_id?, time_period?`
  - Response: `{ heatmap_data }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/advanced-analytics/difficulty/time-score-correlation` - Tương quan thời gian-điểm
  - Query: `program_id?, course_id?, quiz_id?`
  - Response: `{ correlation_data }`
  - Status: ⏳ Chưa kiểm tra

#### APIs - Behavior Analytics

- [ ] **GET** `/advanced-analytics/behavior/activity-timeline` - Timeline hoạt động

  - Query: `program_id?, course_id?, quiz_id?, user_id?, time_period?, granularity?`
  - Response: `{ timeline_data }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/advanced-analytics/behavior/learning-flow` - Learning flow
  - Query: `program_id?, course_id?, user_id?`
  - Response: `{ flow_data }`
  - Status: ⏳ Chưa kiểm tra

#### APIs - Student Analytics

- [ ] **GET** `/advanced-analytics/student/score-analysis` - Phân tích điểm sinh viên

  - Query: `user_id, program_id?, course_id?, time_period?, include_comparison?`
  - Response: `{ score_analysis }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/advanced-analytics/student/learning-outcome-mastery` - Mastery Learning Outcomes

  - Query: `user_id, course_id?, program_id?, mastery_threshold?`
  - Response: `{ mastery_data }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/advanced-analytics/student/improvement-suggestions` - Đề xuất cải thiện

  - Query: `user_id, lo_id?, course_id?, program_id?, suggestion_depth?`
  - Response: `{ suggestions }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/advanced-analytics/quiz/student-performance` - Hiệu suất sinh viên trong quiz
  - Query: `quiz_id, user_id`
  - Response: `{ performance_data }`
  - Status: ⏳ Chưa kiểm tra

#### APIs - Dashboard & Export

- [ ] **GET** `/advanced-analytics/dashboard/overview` - Dashboard tổng quan

  - Query: `program_id?, course_id?, time_period?`
  - Response: `{ overview_data }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/advanced-analytics/export/report` - Export báo cáo
  - Query: `program_id?, course_id?, time_period?, format?`
  - Response: `{ report_data }` hoặc file
  - Status: ⏳ Chưa kiểm tra

#### APIs - Testing

- [ ] **GET** `/advanced-analytics/test/endpoints` - Test endpoints

  - Response: `{ endpoints[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/advanced-analytics/test/sample-data` - Sample data
  - Response: `{ sample_data }`
  - Status: ⏳ Chưa kiểm tra

---

## 8️⃣ PRACTICE & RECOMMENDATIONS

### 📁 File: `practice-recommendation.service.ts`

#### APIs - Practice Recommendations

- [ ] **GET** `/practice/recommendations` - Lấy đề xuất luyện tập

  - Query: `userId, courseId`
  - Response: `{ recommendations[], summary }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/practice/generate` - Sinh bộ câu hỏi luyện tập
  - Request: `{ courseId, userId, loId?, difficulty?, totalQuestions? }`
  - Response: `{ quiz_id, questions[], estimated_time }`
  - Status: ⏳ Chưa kiểm tra

#### APIs - Practice Session (NEW)

- [ ] **POST** `/practice/submit-with-eggs` - Gửi kết quả với đập trứng

  - Request: `{ quizInfo, performanceData, baseRewards, eggsToOpen[] }`
  - Response: `{ session_id, rewards_summary, egg_opening_results[], level_up }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/practice/start-session` - Bắt đầu phiên luyện tập

  - Request: `{ quiz_id, session_type }`
  - Response: `{ session_info }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/practice/end-session` - Kết thúc phiên luyện tập
  - Request: `{ session_id?, quiz_id?, reason }`
  - Response: `{ session_info }`
  - Status: ⏳ Chưa kiểm tra

#### APIs - Practice Session (DEPRECATED)

- [ ] **POST** `/practice/submit-session-results` - Gửi kết quả phiên luyện tập (deprecated)
  - Request: `{ quizInfo, performanceData[], rewardsSummary, itemsFromEggs[] }`
  - Response: `{ updates_summary, new_gamification_state }`
  - Status: ⚠️ DEPRECATED - Sử dụng submit-with-eggs thay thế

---

## 9️⃣ STUDENT MANAGEMENT

### 📁 File: `student-management.service.ts`

#### APIs - User Management

- [ ] **GET** `/users` - Lấy tất cả users (admin)

  - Query: `page, limit, search, role`
  - Response: `{ students[], pagination }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/users/:id` - Lấy user theo ID

  - Response: `{ student }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/users/createAdmin` - Tạo admin (admin)

  - Request: `{ username, email, password, fullName }`
  - Response: `{ user }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/users/createTeacher` - Tạo teacher (admin)

  - Request: `{ username, email, password, fullName }`
  - Response: `{ user }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/users/createStudent` - Tạo student (admin/teacher)

  - Request: `{ name, email, password }`
  - Response: `{ user }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **PUT** `/users/:id` - Cập nhật user

  - Request: `{ username?, email?, fullName?, password? }`
  - Response: `{ user }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/users/:id` - Xóa user (admin)
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

#### APIs - Student Import

- [ ] **POST** `/users/importStudents` - Import sinh viên từ Excel/CSV

  - Request: `FormData(file, courseId?, autoEnroll?)`
  - Response: `{ imported, enrolled?, errors[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/users/importAndEnrollStudents` - Import và enroll sinh viên

  - Request: `FormData(file)`, Query: `course_id`
  - Response: `{ imported, enrolled, errors[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/users/smartImportAndEnrollStudents` - Smart import & enroll
  - Request: `FormData(file)`, Query: `course_id`
  - Response: `{ created, enrolled, skipped, errors[] }`
  - Status: ⏳ Chưa kiểm tra

#### APIs - Student-Course Management

- [ ] **POST** `/student-courses/courses/:courseId/enroll` - Enroll sinh viên vào course

  - Request: `{ user_id }`
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/student-courses/courses/:courseId/enroll-multiple` - Enroll nhiều sinh viên

  - Request: `{ student_ids[] }`
  - Response: `{ enrolled, failed, errors[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/student-courses/courses/:courseId/students` - Lấy sinh viên trong course

  - Query: `page, limit, search`
  - Response: `{ course_info, students[], pagination }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/student-courses/student/:studentId/courses` - Lấy courses của sinh viên

  - Query: `page, limit, search`
  - Response: `{ courses[], pagination }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/student-courses/courses/:courseId/students/:studentId` - Unenroll sinh viên
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

#### APIs - Utilities

- [ ] **GET** `/users/search` - Tìm kiếm sinh viên

  - Query: `search, limit?, excludeCourseId?`
  - Response: `{ students[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/users/import-template` - Download template Excel

  - Response: File Excel
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/users/import-template-csv` - Download template CSV
  - Response: File CSV
  - Status: ⏳ Chưa kiểm tra

---

## 🔟 ASSIGNMENT & SEMESTER MANAGEMENT

### 📁 File: `assignment.service.ts`

#### APIs - Assignment CRUD

- [ ] **GET** `/assignments` - Lấy tất cả phân công (admin)

  - Query: `semester_id?, teacher_id?, subject_id?, page?, limit?`
  - Response: `{ assignments[], pagination }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/assignments/:id` - Lấy phân công theo ID

  - Response: `{ assignment, Teacher, Subject, Semester, Courses }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/assignments/my-assignments` - Lấy phân công của giáo viên hiện tại

  - Response: `{ assignments[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/assignments/available/teachers` - Lấy giáo viên có thể phân công

  - Response: `{ teachers[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/assignments/available/subjects` - Lấy môn học có thể phân công

  - Response: `{ subjects[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/assignments` - Tạo phân công mới

  - Request: `{ teacher_id, subject_id, semester_id?, batch_id, workload_hours?, note? }`
  - Response: `{ assignment }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **PUT** `/assignments/:id` - Cập nhật phân công

  - Request: `{ teacher_id?, subject_id?, ... }`
  - Response: `{ assignment }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/assignments/:id` - Xóa phân công
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

#### APIs - Bulk Assignment

- [ ] **GET** `/training-batches/:batchId/semesters/:semesterId/subjects-teachers` - Lấy dữ liệu cho ma trận phân công

  - Response: `{ batch, semester, subjects[], teachers[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/assignments/bulk-assign` - Phân công hàng loạt
  - Request: `{ batch_id, semester_id, assignments[] }`
  - Response: `{ successful[], failed[] }`
  - Status: ⏳ Chưa kiểm tra

#### APIs - Statistics

- [ ] **GET** `/assignments/statistics/semester/:semesterId` - Thống kê phân công theo học kỳ
  - Response: `{ total_assignments, total_teachers, total_subjects, assignments_by_subject[] }`
  - Status: ⏳ Chưa kiểm tra

### 📁 File: `course-assignment.service.ts`

#### APIs

- [ ] **POST** `/courses/from-assignment/:assignmentId` - Tạo course từ phân công
  - Request: `{ name, description?, batch_id, start_date?, end_date?, clone_from_course_id? }`
  - Response: `{ cloned_course, cloning_summary? }`
  - Status: ⏳ Chưa kiểm tra

### 📁 File: `semester.service.ts`

#### APIs

- [ ] **GET** `/semesters` - Lấy tất cả học kỳ

  - Query: `page?, limit?`
  - Response: `{ semesters[], pagination }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/semesters/:id` - Lấy chi tiết học kỳ

  - Response: `{ semester, TeacherAssignments[], Courses[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/semesters/active` - Lấy học kỳ đang hoạt động

  - Response: `{ semester }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/semesters` - Tạo học kỳ mới

  - Request: `{ name, academic_year, semester_number, description?, start_date, end_date, batch_id }`
  - Response: `{ semester }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/semesters/:id/activate` - Kích hoạt học kỳ

  - Response: `{ semester }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **PUT** `/semesters/:id` - Cập nhật học kỳ

  - Request: `{ name?, academic_year?, ... }`
  - Response: `{ semester }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/semesters/:id` - Xóa học kỳ

  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/semesters/:id/statistics` - Thống kê học kỳ
  - Response: `{ total_assignments, total_courses, active_teachers }`
  - Status: ⏳ Chưa kiểm tra

### 📁 File: `training-batch.service.ts`

#### APIs

- [ ] **GET** `/training-batches` - Lấy danh sách khóa đào tạo

  - Query: `page?, limit?, search?, program_id?`
  - Response: `{ training_batches[], pagination }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/training-batches/:id/full-details` - Lấy chi tiết khóa đào tạo

  - Response: `{ batch, Program, Semesters[], Assignments[], Courses[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/training-batches` - Tạo khóa đào tạo mới

  - Request: `{ name, program_id, start_year, end_year, description? }`
  - Response: `{ batch }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **PUT** `/training-batches/:id` - Cập nhật khóa đào tạo

  - Request: `{ name?, program_id?, ... }`
  - Response: `{ batch }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/training-batches/:id` - Xóa khóa đào tạo

  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/training-batches/:id/semesters` - Lấy học kỳ của khóa đào tạo

  - Response: `{ semesters[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/training-batches/:id/assignments` - Lấy phân công của khóa đào tạo

  - Response: `{ assignments[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/training-batches/:id/courses` - Lấy courses của khóa đào tạo
  - Response: `{ courses[] }`
  - Status: ⏳ Chưa kiểm tra

---

## 1️⃣1️⃣ MISCELLANEOUS APIS

### 📁 File: `role.service.ts`

#### APIs

- [ ] **GET** `/roles` - Lấy danh sách vai trò

  - Query: `page, limit`
  - Response: `{ roles[] }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/roles/:id` - Lấy vai trò theo ID

  - Response: `{ role }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **POST** `/roles` - Tạo vai trò mới

  - Request: `{ name }`
  - Response: `{ role }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **PUT** `/roles/:id` - Cập nhật vai trò

  - Request: `{ name }`
  - Response: `{ role }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **DELETE** `/roles/:id` - Xóa vai trò
  - Response: `{ success }`
  - Status: ⏳ Chưa kiểm tra

### 📁 File: `judge0.service.ts`

#### APIs

- [ ] **POST** `/judge0/submit` - Submit code để chấm

  - Request: `{ source_code, language_id, stdin?, expected_output? }`
  - Response: `{ token }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/judge0/submission/:token` - Lấy kết quả submission
  - Response: `{ status, stdout, stderr, compile_output, time, memory }`
  - Status: ⏳ Chưa kiểm tra

### 📁 File: `code-submission.service.ts`

#### APIs

- [ ] **POST** `/code-submissions` - Tạo code submission

  - Request: `{ question_id, user_id, source_code, language_id }`
  - Response: `{ submission }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/code-submissions/:id` - Lấy chi tiết submission

  - Response: `{ submission, result }`
  - Status: ⏳ Chưa kiểm tra

- [ ] **GET** `/code-submissions/user/:userId` - Lấy submissions của user
  - Query: `page, limit`
  - Response: `{ submissions[], pagination }`
  - Status: ⏳ Chưa kiểm tra

---

---

## 📊 TỔNG KẾT THỐNG KÊ

### Tổng số API theo module

| Module                                | Số lượng API | Trạng thái        |
| ------------------------------------- | ------------ | ----------------- |
| Authentication & User Management      | 12           | ⏳ Chưa kiểm tra  |
| Program Management (Program, PO, PLO) | 45           | ⏳ Chưa kiểm tra  |
| Subject & Chapter Management          | 35           | ⏳ Chưa kiểm tra  |
| Course Management                     | 30           | ⏳ Chưa kiểm tra  |
| Quiz & Question Management            | 85+          | ⏳ Chưa kiểm tra  |
| Gamification & Rewards                | 20           | ⏳ Chưa kiểm tra  |
| Analytics & Reports                   | 35           | ⏳ Chưa kiểm tra  |
| Practice & Recommendations            | 5            | ⏳ Chưa kiểm tra  |
| Student Management                    | 18           | ⏳ Chưa kiểm tra  |
| Assignment & Semester Management      | 30           | ⏳ Chưa kiểm tra  |
| Miscellaneous                         | 8            | ⏳ Chưa kiểm tra  |
| **TỔNG CỘNG**                         | **320+**     | **0% hoàn thành** |

---

## 🎯 KẾ HOẠCH KIỂM TRA

### Phase 1: Core APIs (Ưu tiên cao)

1. Authentication & User Management
2. Course Management
3. Quiz & Question Management (cơ bản)
4. Student Management

### Phase 2: Curriculum APIs

1. Program Management
2. Subject & Chapter Management
3. Assignment & Semester Management

### Phase 3: Advanced Features

1. Gamification & Rewards
2. Analytics & Reports
3. Practice & Recommendations

### Phase 4: Specialized APIs

1. Quiz Advanced Features (realtime, modes, statistics)
2. Advanced Analytics
3. Miscellaneous APIs

---

## 📝 GHI CHÚ QUAN TRỌNG

### API Deprecated

- `POST /practice/submit-session-results` - Thay bằng `/practice/submit-with-eggs`
- `GET /quiz-results/quiz/:quizId/radar/*` - Thay bằng chapter-analytics APIs

### API có Cache

- `GET /currency/balance` - Cache 5 phút
- `GET /avatar/my-data` - Nên cache ở client

### API yêu cầu FormData

- `POST /questions/enhanced` - Upload media
- `PUT /questions/enhanced/:id` - Upload media
- `POST /users/importStudents` - Upload Excel/CSV
- `POST /questions/import` - Upload CSV
- `POST /questions/import-excel` - Upload Excel

### API có Pagination

- Hầu hết GET APIs có query params: `page, limit`
- Response format: `{ data[], pagination: { page, limit, total, totalPages } }`

### API có Filter/Search

- Hầu hết GET APIs hỗ trợ: `search, sort_by, sort_order`
- Một số có filter đặc biệt: `status, role, difficulty, etc.`

---

## 🔧 HƯỚNG DẪN SỬ DỤNG CHECKLIST

### Cách đánh dấu hoàn thành

1. Thay đổi `[ ]` thành `[x]` khi đã kiểm tra
2. Cập nhật Status từ `⏳ Chưa kiểm tra` thành:
   - `✅ Hoạt động tốt` - API hoạt động đúng
   - `⚠️ Có vấn đề` - API có lỗi nhỏ
   - `❌ Lỗi nghiêm trọng` - API không hoạt động
   - `🔄 Cần refactor` - API cần cải thiện

### Ghi chú khi kiểm tra

Thêm ghi chú sau mỗi API nếu cần:

```markdown
- [ ] **GET** `/api/endpoint` - Mô tả
  - Status: ✅ Hoạt động tốt
  - Note: Response time ~200ms, cần optimize query
  - Tested: 15/10/2025
```

### Báo cáo vấn đề

Khi phát hiện lỗi, ghi rõ:

- Request đã gửi
- Response nhận được
- Expected behavior
- Actual behavior
- Error message (nếu có)

---

## 📚 TÀI LIỆU THAM KHẢO

### Service Files Location

- `src/lib/services/api/*.service.ts`

### Type Definitions

- `src/lib/types/*.ts`

### API Client

- `src/lib/services/api/client.ts`

### Constants

- `src/lib/constants/api.ts`
- `src/lib/constants/index.ts`

---

## ✨ CẬP NHẬT

- **15/10/2025**: Tạo checklist ban đầu với 320+ APIs
- **Tiếp theo**: Bắt đầu kiểm tra Phase 1

---

**Người tạo**: Kiro AI Assistant  
**Ngày tạo**: 15/10/2025  
**Phiên bản**: 1.0.0
