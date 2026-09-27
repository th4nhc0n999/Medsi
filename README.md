# MediBook - Hệ Thống Đặt Lịch Khám Bệnh Trực Tuyến (Mini Project MVP)

> **Đồ án môn học:** Phát triển Ứng dụng Web (IS207)  
> **Kiến trúc:** Frontend-Only Single Page Application (React 18 + Vite + Tailwind CSS + LocalStorage)  
> **Tác giả:** Vũ Tuấn Anh  
> **GitHub Repository:** [https://github.com/vuttuananh168/MiniProject_IS207_AI.git](https://github.com/vuttuananh168/MiniProject_IS207_AI.git)

---

## 🌟 1. Giới Thiệu Dự Án

**MediBook** là nền tảng đặt lịch khám bệnh trực tuyến được xây dựng theo tiêu chuẩn MVP (Minimum Viable Product) hoàn chỉnh, giao diện hiện đại mang đậm phong cách y tế cao cấp (Tone màu *Medical Blue* `#0284c7`, trắng sạch sẽ, viền bo mềm mại, bóng mịn).

Ứng dụng hoạt động độc lập không phụ thuộc vào backend server, toàn bộ dữ liệu lịch hẹn, bác sĩ, và thống kê doanh thu được quản trị và lưu trữ bền vững qua **`localStorage` (Web Storage)**. Hệ thống có sẵn bộ dữ liệu mẫu (Seed Data) phong phú để giảng viên và người dùng trải nghiệm ngay lập tức.

---

## 🚀 2. Tính Năng Chính

### 🏥 2.1. Trang Chủ (HomePage)
- **Hero Banner:** Giới thiệu dịch vụ, cam kết chất lượng, các chỉ số uy tín (10,000+ lượt khám, 99.2% hài lòng).
- **Thanh tìm kiếm nhanh:** Tra cứu tức thì theo tên bác sĩ, bệnh viện hoặc chuyên khoa.
- **Danh mục Chuyên khoa:** 8 chuyên khoa trọng điểm (Tim Mạch, Da Liễu, Nhi Khoa, Cơ Xương Khớp, Thần Kinh, Mắt, Tai Mũi Họng, Răng Hàm Mặt) với hiệu ứng tương tác trực quan.
- **Bác sĩ tiêu biểu:** Hiển thị học vị, chuyên khoa, số năm kinh nghiệm, đánh giá sao và giá khám niêm yết.
- **Quy trình khám 4 bước:** Trực quan, dễ hiểu cho người mới tiếp cận.

### 👨‍⚕️ 2.2. Danh Sách Bác Sĩ (DoctorListPage)
- **Bộ lọc đa chiều:**
  - Lọc theo từng Chuyên khoa (Pills button).
  - Tìm kiếm theo từ khóa tên bác sĩ, cơ sở y tế.
  - Lọc theo các khoảng giá khám (< 350k, 350k - 450k, > 450k).
  - Sắp xếp linh hoạt: Đánh giá cao nhất, Kinh nghiệm nhiều nhất, Giá tăng dần / giảm dần.
- **Hồ sơ chi tiết Bác sĩ (Modal):** Giới thiệu tiểu sử chuyên môn, học hàm học vị, lịch khám trong tuần, bệnh viện công tác.
- **Nút Đặt hẹn nhanh:** Chuyển ngay đến luồng đặt khám với bác sĩ đã chọn.

### 📅 2.3. Đặt Lịch Khám 4 Bước (BookingModalOrPage)
- **Bước 1 - Chọn Bác sĩ:** Lọc theo khoa và chọn bác sĩ mong muốn.
- **Bước 2 - Chọn Ngày & Giờ:**
  - Chọn ngày khám (ngăn chọn ngày quá khứ).
  - Khung giờ khám chia theo Buổi Sáng / Buổi Chiều.
  - **Kiểm tra thời gian thực (Real-time conflict detection):** Tự động phát hiện và khóa (*disable/line-through*) các khung giờ đã có người đặt trước trong ngày.
- **Bước 3 - Thông tin Bệnh nhân:**
  - Họ tên, Số điện thoại (kiểm tra định dạng 10 số Việt Nam).
  - Email, Ngày sinh, Giới tính, Địa chỉ.
  - Lý do khám / Triệu chứng lâm sàng.
- **Bước 4 - Kiểm tra & Xác nhận:** Tóm tắt hồ sơ phiếu hẹn trước khi lưu vào `localStorage`.
- **Màn hình thành công:** Cấp mã phiếu hẹn duy nhất (VD: `MDB-2026-XXXX`), tóm tắt phiếu khám, nút tra cứu nhanh.

### 🔍 2.4. Tra Cứu Lịch Hẹn Bệnh Nhân (PatientHistoryPage)
- Tra cứu nhanh bằng Số điện thoại bệnh nhân.
- Tích hợp sẵn nút **1-Click Test** với các số điện thoại mẫu:
  - `0912345678` (Nguyễn Văn An)
  - `0987654321` (Trần Thị Mai)
  - `0905123456` (Lê Hoàng Nam)
  - `0945678123` (Vũ Tuấn Anh)
- Xem chi tiết từng phiếu hẹn: Triệu chứng, địa chỉ khám, bác sĩ phụ trách.
- **Yêu cầu hủy lịch:** Cho phép bệnh nhân hủy lịch khám kèm lý do hủy (hệ thống tự động cập nhật trạng thái sang `Đã hủy`).

### 📊 2.5. Bảng Quản Trị Phòng Khám (AdminDashboardPage)
- **KPI Thống kê thời gian thực:**
  - Tổng số lịch hẹn.
  - Chờ duyệt (*Pending*).
  - Đã xác nhận (*Confirmed*).
  - Đã khám xong (*Completed*).
  - Đã hủy (*Cancelled*).
  - Ước tính doanh thu từ các lịch đã xác nhận / hoàn tất.
- **Bảng dữ liệu chi tiết:**
  - Tìm kiếm & lọc đa điều kiện (Trạng thái, Bác sĩ, Ngày khám).
  - **Duyệt lịch hẹn:** Chuyển từ Chờ duyệt -> Đã xác nhận.
  - **Hoàn tất khám:** Đánh dấu đã khám xong.
  - **Hủy lịch quản trị:** Nhập lý do hủy từ phía phòng khám.
  - **Xóa vĩnh viễn:** Xóa hồ sơ khỏi LocalStorage.
  - **Xuất file CSV:** Tải danh sách lịch hẹn về máy tính để báo cáo.
  - **Khôi phục dữ liệu mẫu (Reset Demo Data):** Nút bấm 1 chạm giúp giảng viên đặt lại toàn bộ dữ liệu ban đầu để chấm điểm.

---

## 📂 3. Cấu Trúc Thư Mục

```text
Mini_Project_IS207/
├── index.html                  # HTML entry point kèm SEO meta & Plus Jakarta Sans font
├── package.json                # Cấu hình dependency (React 18, Vite, Tailwind, Lucide)
├── postcss.config.js
├── tailwind.config.js          # Hệ thống Design tokens (Tone Medical Blue #0284c7)
├── vite.config.js
├── Prompt.md                   # Tài liệu đề bài & tiêu chuẩn dự án
├── README.md                   # Hướng dẫn chi tiết dự án
└── src/
    ├── main.jsx                # React DOM render
    ├── App.jsx                 # SPA routing & Quản trị trạng thái chung
    ├── index.css               # Base CSS & Animation
    ├── components/             # UI Components tái sử dụng
    │   ├── Badge.jsx           # Huy hiệu trạng thái màu sắc chuẩn y tế
    │   ├── Button.jsx          # Button với variants, icon và loading spinner
    │   ├── Footer.jsx          # Footer thông tin phòng khám & hotline 24/7
    │   ├── Header.jsx          # Thanh điều hướng có badge đếm lịch chờ duyệt
    │   ├── Input.jsx           # Input, Select, Textarea kèm validate state
    │   └── Modal.jsx           # Hộp thoại Modal backdrop blur
    ├── hooks/                  # Custom Hooks
    │   ├── useAppointments.js  # Đồng bộ hóa dữ liệu localStorage & state
    │   └── useToast.jsx        # Hệ thống thông báo Notification nổi bật
    ├── pages/                  # 5 Màn hình nghiệp vụ chính
    │   ├── HomePage.jsx
    │   ├── DoctorListPage.jsx
    │   ├── BookingModalOrPage.jsx
    │   ├── PatientHistoryPage.jsx
    │   └── AdminDashboardPage.jsx
    └── services/               # Tầng dữ liệu LocalStorage (Mock API)
        ├── mockData.js         # Dữ liệu ban đầu (bác sĩ, chuyên khoa, lịch hẹn)
        └── appointmentService.js# Các hàm CRUD, thống kê, kiểm tra khung giờ
```

---

## 🛠️ 4. Hướng Dẫn Cài Đặt & Chạy Thử

### Yêu cầu môi trường:
- Node.js version 18.x trở lên
- npm (hoặc yarn / pnpm)

### Các bước thực hiện:

1. **Clone repository:**
   ```bash
   git clone https://github.com/vuttuananh168/MiniProject_IS207_AI.git
   cd MiniProject_IS207_AI
   ```

2. **Cài đặt thư viện dependencies:**
   ```bash
   npm install
   ```

3. **Chạy máy chủ phát triển (Development Server):**
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ khả dụng tại địa chỉ: `http://localhost:3000` (hoặc `http://localhost:5173`).

4. **Kiểm tra bản build (Production Build):**
   ```bash
   npm run build
   ```

---

## 📝 5. Dữ Liệu Kiểm Thử (Seed Data)

Hệ thống đã chuẩn bị sẵn:
- **8 Bác sĩ chuyên khoa** đầu ngành với hình ảnh, chức danh, biểu phí khám minh bạch.
- **6 Lịch hẹn mẫu** đầy đủ các trạng thái (`pending`, `confirmed`, `completed`, `cancelled`).
- Khi cần đưa hệ thống về trạng thái sạch ban đầu, tại tab **"Quản trị phòng khám"**, nhấn nút **"Khôi phục dữ liệu mẫu"**.