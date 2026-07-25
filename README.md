# 🎓 Adaptive English LMS - Tự Động Hóa Học Tập Thích Ứng Bằng AI & MongoDB Atlas

Hệ thống quản lý học tập tiếng Anh cá nhân hóa thế hệ mới (**Adaptive English LMS**). Dự án sử dụng mô hình trí tuệ nhân tạo **Google Gemini AI** kết hợp cơ sở dữ liệu đám mây **MongoDB Atlas** để tự động hóa toàn bộ quy trình: Đánh giá năng lực đầu vào, chấm điểm tự luận chi tiết, tự biên soạn học liệu thích ứng định kỳ, và đưa ra quyết định nâng/bảo lưu trình độ học viên theo thời gian thực.

---

## 🌟 Tính Năng Nổi Bật (Key Features)

### 1. Phân Lớp Thích Ứng Bằng AI (AI Placement Test)
- Đề thi đầu vào gồm **10 câu trắc nghiệm** ngữ pháp/từ vựng cùng **phần đọc hiểu & viết luận**.
- Gemini AI chấm điểm trắc nghiệm và phân tích bài luận theo các tiêu chí học thuật để phân loại học sinh vào các lớp: **Basic** (A1-A2), **Intermediate** (B1-B2), hoặc **Advanced** (C1-C2).
- **Màn hình Review chi tiết**: Học viên xem lại từng đáp án trắc nghiệm kèm giải thích tiếng Việt từ AI và nhận xét chi tiết cho bài viết luận.
- **Màn hình Kết quả Phân lớp**: Giao diện trực quan mô tả lộ trình tương ứng với trình độ được xếp.

### 2. Thi Đánh Giá Năng Lực Định Kỳ & Tự Động Nâng Cấp (AI Progress Assessment)
- Học viên có thể yêu cầu AI sinh bài Progress Test định kỳ bất kỳ lúc nào. Gemini AI sẽ tự động soạn đề thi (5 trắc nghiệm + 1 viết luận) thích ứng chính xác theo trình độ hiện tại của học viên.
- Gemini AI đóng vai trò Giám đốc Học thuật chấm điểm và ra quyết định: **Thăng cấp lớp (Promoted)** hoặc **Bảo lưu trình độ (Retained)** kèm giải thích.
- **Giao diện chúc mừng (Promoted)** rực rỡ với huy chương thăng cấp và **giao diện khích lệ (Retained)** hỗ trợ tinh thần.

### 3. Trang Quản Trị Hợp Nhất (System Admin Portal)
- Hỗ trợ tài khoản Admin mặc định (`admin` / `admin123`).
- **Thống kê Lớp học**: Đếm số lượng học viên thuộc các nhóm Basic, Intermediate, Advanced.
- **Quản lý danh sách học viên**: Đổi nhóm trình độ thủ công, xem bài làm, và Reset bài thi đầu vào để học viên làm lại.
- **AI Lesson Generator**: Admin có thể gõ một chủ đề bất kỳ để AI tự động soạn bài giảng mới lưu vào MongoDB.
- **Bảng điều khiển hệ thống (System Logs)**: Theo dõi trực quan lịch sử hoạt động thời gian thực.

### 4. Quản Lý Phiên Làm Việc Cô Lập (Secure Session Storage)
- Áp dụng cơ chế **`sessionStorage`** bảo mật:
  - Cho phép làm mới trang (**F5**) trong tab hiện tại mà không bị mất đăng nhập.
  - Khi mở tab mới, khởi động lại trình duyệt hoặc truy cập từ trình duyệt khác, học viên bắt buộc phải đăng nhập lại từ đầu để bảo mật dữ liệu.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons.
- **Backend**: Node.js + Express.js (Hỗ trợ cấu hình chạy Serverless trên Vercel).
- **Cơ sở dữ liệu**: MongoDB Atlas đám mây + Mongoose ODM.
- **AI Core**: API Google Gemini (Mô hình `gemini-1.5-flash`).

---

## 📂 Cấu Trúc Thư Mục (Project Structure)

```text
├── backend/
│   ├── api/
│   │   ├── data/
│   │   │   └── lessons.json     # File dữ liệu học liệu mẫu để tự động Seed
│   │   ├── gemini.js            # Module tích hợp gọi trực tiếp API Gemini
│   │   ├── models.js            # Các Schema Mongoose (User, Lesson, Submission)
│   │   └── index.js             # Máy chủ Express chính & các API endpoints
│   ├── package.json
│   └── .env                     # Biến môi trường CSDL & API Key Gemini
├── frontend/
│   ├── src/
│   │   ├── components/          # Các component dùng chung
│   │   ├── context/
│   │   │   └── AppContext.jsx   # State management & luồng gọi API backend
│   │   ├── pages/
│   │   │   ├── Home.jsx         # Trang đăng nhập & đăng ký
│   │   │   ├── PlacementTest.jsx# Thi đầu vào, Review & Nhận lớp
│   │   │   ├── StudentDashboard.jsx# Lộ trình học sinh & Thi định kỳ AI
│   │   │   └── AdminDashboard.jsx  # Quản trị viên điều hành hệ thống
│   │   ├── App.jsx              # Cấu hình Router & Smart Guards
│   │   └── index.css
│   └── package.json
├── package.json                 # File root để chạy song song 2 server bằng concurrently
└── README.md
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Cấu hình biến môi trường
Tạo file `.env` tại thư mục `/backend/` với nội dung sau:
```text
MONGODB_URI=mongodb+srv://doannguyenduykha08_db_user:Kha.0804@englishadaptivelms.6dtqe9l.mongodb.net/lms_adaptive?appName=EnglishAdaptiveLMS
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
PORT=3001
```

### 2. Cài đặt các thư viện
Mở Terminal tại thư mục gốc của dự án và cài đặt:
```bash
# Cài đặt thư viện toàn cục
npm install

# Cài đặt thư viện backend
cd backend
npm install

# Cài đặt thư viện frontend
cd ../frontend
npm install
```

### 3. Chạy dự án ở môi trường cục bộ (Local Development)
Quay lại thư mục gốc của dự án và khởi chạy lệnh duy nhất để kích hoạt song song cả Backend và Frontend:
```bash
npm run dev
```

- **Frontend (React)** chạy tại: [http://localhost:5173](http://localhost:5173)
- **Backend (API)** chạy tại: [http://localhost:3001](http://localhost:3001)

---

## 🔑 Tài Khoản Thử Nghiệm

1. **Quản trị viên (Admin)**:
   - **Tên đăng nhập**: `admin`
   - **Mật khẩu**: `admin123`
2. **Học viên (Student)**:
   - Sử dụng tab **Đăng ký** trên trang chủ để tạo tài khoản học viên mới, sau đó quay lại tab **Đăng nhập** để kiểm tra luồng thi đầu vào cá nhân hóa.
