---
name: lms-assistant
description: Hướng dẫn chấm điểm tiếng Anh, phân loại học sinh và thiết kế tài liệu học tập thích ứng trong dự án LMS.
---

# Kỹ năng Quản lý Học tập Thích ứng (Adaptive LMS Skill)

Kỹ năng này giúp AI thực hiện chấm điểm bài kiểm tra tiếng Anh, phân nhóm học viên và tự động sinh bài giảng thích ứng.

## 1. Logic Chấm Điểm & Phân Loại Đầu Vào (Placement Evaluation & Grading)
Khi nhận câu trả lời bài kiểm tra từ học viên, hãy phân tích dựa trên 3 trụ cột:
- **Ngữ pháp & Từ vựng**: Số câu đúng trên tổng số câu trắc nghiệm.
- **Đọc hiểu**: Khả năng nắm bắt đại ý và chi tiết trong bài đọc.
- **Viết luận (Tự luận)**:
  - Điểm cấu trúc câu và sự phong phú của từ vựng.
  - Số lượng lỗi ngữ pháp cơ bản (chia động từ, mạo từ, giới từ).

### Tiêu chí phân nhóm học viên:
- **Xuất sắc (Advanced)**: 
  - Điểm tổng quan bài test > 80%.
  - Tự luận viết trôi chảy, sử dụng được câu ghép/câu phức, từ vựng đa dạng (CEFR B2-C1).
- **Trung bình (Intermediate)**:
  - Điểm tổng quan bài test từ 50% đến 80%.
  - Tự luận viết được ý chính nhưng cấu trúc câu còn đơn giản, lặp từ, có một vài lỗi ngữ pháp nhỏ.
- **Cần hỗ trợ (Basic/Mất gốc)**:
  - Điểm tổng quan bài test < 50%.
  - Tự luận viết rất ngắn, mắc nhiều lỗi chính tả hoặc ngữ pháp cơ bản nghiêm trọng.

---

## 2. Quy Tắc Sinh Bài Giảng Thích Ứng (Adaptive Content Generation Rules)
Khi giáo viên yêu cầu tạo bài giảng mới cho một chủ đề cụ thể, AI cần tạo ra 3 biến thể nội dung đáp ứng chính xác 3 mức độ:

### A. Nhóm Cần Hỗ Trợ (Basic)
- **Từ vựng**: Tối đa 5 từ đơn giản nhất kèm phát âm, từ loại và định nghĩa dịch nghĩa tiếng Việt chi tiết.
- **Ngữ pháp**: Tập trung vào 1 cấu trúc ngữ pháp cốt lõi cực kỳ cơ bản.
- **Bài đọc**: Đoạn văn ngắn (50-80 từ) sử dụng cấu trúc cực đơn giản, từ ngữ quen thuộc.
- **Bài tập**: Trắc nghiệm điền vào chỗ trống hoặc chọn từ đúng.

### B. Nhóm Trung Bình (Intermediate)
- **Từ vựng**: 8-10 từ kèm định nghĩa tiếng Anh đơn giản và ví dụ ngữ cảnh thực hành.
- **Ngữ pháp**: Các cấu trúc trung cấp (thì hoàn thành, câu điều kiện loại 1-2, mệnh đề quan hệ).
- **Bài đọc**: Đoạn văn trung bình (120-180 từ), chứa các cụm từ ghép phổ biến.
- **Bài tập**: Kết hợp trắc nghiệm đọc hiểu và câu hỏi viết lại câu cơ bản.

### C. Nhóm Xuất Sắc (Advanced)
- **Từ vựng**: 10-12 từ vựng học thuật, idioms, collocations nâng cao.
- **Ngữ pháp**: Các cấu trúc nâng cao (đảo ngữ, câu giả định, mệnh đề rút gọn).
- **Bài đọc**: Đoạn văn học thuật hoặc phân tích chuyên sâu (250-350 từ).
- **Bài tập**: Đọc hiểu suy luận nâng cao và một đề bài viết luận phản biện (Writing prompt) yêu cầu lập luận logic.
