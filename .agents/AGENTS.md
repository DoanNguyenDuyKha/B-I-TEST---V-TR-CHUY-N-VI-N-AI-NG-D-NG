# Quy tắc Dự án (Project Rules) - Adaptive English LMS

Tài liệu này chứa các hướng dẫn thiết lập, tiêu chuẩn mã nguồn và nguyên tắc hoạt động dành cho Agent AI phát triển dự án này.

---

## 1. Công nghệ Sử dụng (Tech Stack)
- **Frontend**: React.js (khởi tạo qua Vite) + TailwindCSS.
- **Backend**: Node.js + Express.js (được định tuyến phục vụ chạy serverless trên Vercel qua thư mục `/api`).
- **State Management**: React Context / Hooks kết hợp lưu trữ cục bộ (`localStorage`) để duy trì trạng thái đăng nhập và kết quả bài làm giả lập.

---

## 2. Tiêu chuẩn Thiết kế Giao diện (UI/UX Guidelines)
Để mang lại trải nghiệm chuyên nghiệp và ấn tượng (Premium UI):
- **Phối màu**: Sử dụng hệ màu tối (sleek dark mode) kết hợp với Glassmorphism (hiệu ứng kính mờ `backdrop-blur`).
- **Màu sắc chủ đạo**: Slate/Zinc cho nền, Indigo/Violet cho các yếu tố nhấn mạnh (buttons, active states, gradients).
- **Hoạt ảnh (Micro-animations)**: Sử dụng các chuyển động mượt mà khi hover nút bấm, chuyển tab hoặc khi mở lộ trình học tập.
- **Phông chữ**: Sử dụng phông chữ không chân hiện đại như *Inter* hoặc *Outfit*.

---

## 3. Cấu trúc thư mục thống nhất
Tất cả các thành phần trong dự án phải được phân chia rõ ràng:
- `/api/` : Toàn bộ mã nguồn backend (chạy trên Vercel).
- `/src/components/` : Các component giao diện dùng chung (Card, Button, Navigation, Charts).
- `/src/pages/` : Các trang giao diện chính.
- `/src/context/` : Quản lý trạng thái người dùng (Học viên/Giáo viên, Nhóm học viên, Bài học đã hoàn thành).

---

## 4. Nguyên tắc Phát triển và Xác minh
- Luôn viết code sạch, giữ lại các chú thích rõ ràng.
- Đảm bảo các component React có tính tái sử dụng cao.
- Không sử dụng thư viện bên ngoài không cần thiết trừ các thư viện vẽ biểu đồ nhẹ như Lucide Icons hoặc Recharts để vẽ tiến độ học tập.
