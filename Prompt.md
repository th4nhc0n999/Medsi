# PROMPT: XÂY DỰNG TOÀN DIỆN ỨNG DỤNG FRONTEND "CLINIC MINI-BOOKING" (REACTJS + LOCALSTORAGE)

### 1. BỐI CẢNH & MỤC TIÊU DỰ ÁN
Bạn là một Senior Frontend Engineer và UI/UX Designer. Hãy giúp tôi xây dựng từ đầu một ứng dụng Web dạng Single Page Application (SPA) hoàn chỉnh, chạy độc lập, mang tên: **"MediBook - Hệ thống Đặt lịch khám bệnh trực tuyến (Mini Project MVP)"**.

Dự án này là bài tập môn Phát triển Ứng dụng Web theo tiêu chuẩn đồ án:
- **Mục tiêu:** Xây dựng một sản phẩm khả dụng tối thiểu (MVP) có độ hoàn thiện cao, UI/UX hiện đại, luồng nghiệp vụ khép kín từ đầu đến cuối.
- **Kiến trúc:** Frontend-only (Không cần backend server hay database ngoài). Toàn bộ dữ liệu được quản lý và lưu trữ bền vững qua **`localStorage` (Web Storage)**.
- **Tiêu chuẩn:** Giao diện Responsive 100% (Mobile/Tablet/Desktop), không lỗi runtime, có sẵn dữ liệu mẫu (seed data) phong phú để giảng viên mở lên là có thể trải nghiệm và chấm điểm ngay lập tức.

---

### 2. TECH STACK & CẤU TRÚC THƯ MỤC
- **Framework:** React 18+ (Vite).
- **Styling:** CSS Modules / Vanilla CSS hiện đại hoặc Tailwind CSS (Giao diện chuẩn y tế: tone xanh dương y tế `Medical Blue #0284c7`, trắng sạch sẽ, xám nhạt cao cấp, bo góc mềm mại, đổ bóng mịn).
- **Icons:** `lucide-react`.
- **Cấu trúc mã nguồn sạch sẽ (Clean Code):**
  ```text
  src/
  ├── assets/          # Hình ảnh, logo y tế placeholder SVG
  ├── components/      # UI components tái sử dụng (Header, Footer, Toast, Modal, Badge, Button, Input)
  ├── services/        # Tầng thao tác dữ liệu localStorage (Mock API Service)
  │   ├── mockData.js          # Dữ liệu ban đầu (bác sĩ, chuyên khoa, khung giờ, lịch hẹn mẫu)
  │   └── appointmentService.js # Các hàm CRUD localStorage (getAll, create, updateStatus, delete, filter)
  ├── pages/           # 4-5 màn hình chính theo quy định
  │   ├── HomePage.jsx          # Trang chủ giới thiệu, chuyên khoa nổi bật, tìm kiếm nhanh
  │   ├── DoctorListPage.jsx    # Danh sách bác sĩ có bộ lọc theo Chuyên khoa, Tìm kiếm tên, Giá khám
  │   ├── BookingModalOrPage.jsx# Form đặt lịch từng bước (Step-by-step: Chọn ngày/giờ -> Điền thông tin -> Xác nhận)
  │   ├── PatientHistoryPage.jsx# Bệnh nhân tra cứu lịch hẹn theo SĐT, xem chi tiết, yêu cầu hủy lịch
  │   └── AdminDashboardPage.jsx# Dashboard quản trị: Xem tổng quan thống kê, bộ lọc trạng thái, duyệt/hủy/hoàn thành lịch
  ├── hooks/           # Custom hooks (useAppointments, useToast)
  ├── App.jsx          # Định tuyến (Routing SPA bằng React Router DOM hoặc State Tab Switching mượt mà)
  └── index.css
