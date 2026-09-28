# Kế Hoạch Triển Khai Prototype Frontend MedSi - Đặt Lịch Khám Bệnh Trực Tuyến

> **Tài liệu đặc tả kiến trúc và kế hoạch triển khai (Implementation Plan)**  
> **Dự án:** MedSi Healthcare Booking Prototype (Frontend-Only)  
> **Phiên bản:** 1.0.0  
> **Tác giả:** Mai Đào Hoài Bảo
> **Môi trường:** React 18, Vite, Tailwind CSS, React Router, Web Storage (localStorage)  

---

## 1. TỔNG QUAN & MỤC TIÊU DỰ ÁN

### 1.1 Mục Tiêu
Xây dựng một website Single Page Application (SPA) hoàn chỉnh chạy thuần frontend (Frontend-only prototype) mô phỏng luồng nghiệp vụ đặt lịch khám bệnh trực tuyến:
- **Trải nghiệm người dùng:** Lấy cảm hứng từ các nền tảng y tế hàng đầu (như YouMed) về sự tiện lợi, rõ ràng, minh bạch nhưng **tuyệt đối không clone nguyên xi layout, logo hay thương hiệu**.
- **Thương hiệu:** **MedSi** (Tone màu xanh y tế `Medical Sky/Cyan`, trắng sáng, sạch sẽ, chuẩn giao diện chăm sóc sức khỏe hiện đại).
- **Phạm vi kỹ thuật:** 100% Client-side. Toàn bộ cơ chế xác thực, dữ liệu bác sĩ/bệnh viện, hồ sơ bệnh nhân, quy trình tạo booking và quản trị admin được lưu trữ bền vững qua `localStorage`.
- **Giới hạn số trang:** Tối đa đúng 6 trang chính, giảm thiểu phân mảnh giao diện bằng cách tích hợp modal, tabs và progressive steppers.

### 1.2 Luồng Nghiệp Vụ Khép Kín (End-to-End Workflow)
```
[1. Đăng ký / Đăng nhập] (AuthPage)
       │
       ▼
[2. Khám phá & Lọc Bác sĩ / Bệnh viện] (ExplorePage)
       │
       ▼
[3. Chọn Provider & Dịch vụ]
       │
       ▼
[4. Đặt lịch 3 bước: Chọn Ngày/Giờ -> Hồ sơ bệnh nhân -> Triệu chứng] (BookingPage)
       │
       ▼
[5. Xác nhận chi phí & Thanh toán giả lập (QR/ATM/Ví/Offline)] (PaymentPage)
       │
       ▼
[6. Quản lý lịch khám & Lịch sử trong tài khoản / Yêu cầu hủy] (AccountPage)
       │
       ▼
[7. Admin Portal: Duyệt lịch Pending -> Approved -> Completed / Mark Paid] (AdminPage)
```

---

## 2. CÔNG NGHỆ & GIỚI HẠN KIẾN TRÚC

| Thành phần | Công nghệ / Thư viện | Ghi chú kiến trúc |
| :--- | :--- | :--- |
| **Core Framework** | React 18+ (Functional Components & Hooks) | Quản lý state cục bộ, reactivity tức thì |
| **Bundler & Dev Server** | Vite 6+ | Tốc độ biên dịch cực nhanh, HMR mượt mà |
| **Routing** | React Router DOM v6+ | Cấu hình Route lồng, Dynamic Route params, Protected Routes |
| **Styling** | Tailwind CSS v3 | Design System chuẩn y tế, Responsive mobile-first |
| **Icons** | Lucide React | Bộ icon hiện đại, tối giản, ngữ nghĩa y khoa cao |
| **Data Persistence** | HTML5 Web Storage (`localStorage`) | Mock Database phân tầng, helper hóa tránh JSON syntax error |

### Các Ràng Buộc Nghiêm Ngặt ("KHÔNG SỬ DỤNG"):
- ❌ Không dùng backend PHP, Laravel, Node.js API, Express.
- ❌ Không dùng MySQL, MongoDB, PostgreSQL hay Database server ngoài.
- ❌ Không tích hợp Payment Gateway thật (VNPAY, MoMo SDK thật) - chỉ mô phỏng flow thanh toán.
- ❌ Không dùng OTP SMS, gửi email thật, pessimistic lock/concurrency backend.

---

## 3. CẤU TRÚC ĐỊNH TUYẾN (ROUTES)

Dự án giới hạn tối đa **6 trang chính**:

| Đường dẫn (Route) | Trang (Page Component) | Quyền truy cập (Auth Guard) | Chức năng chính |
| :--- | :--- | :--- | :--- |
| `/auth` | `AuthPage.jsx` | Public | Đăng nhập, Đăng ký, 1-Click Demo Login (Admin / Patient) |
| `/explore` | `ExplorePage.jsx` | Public | Danh sách Bác sĩ & Bệnh viện, Tabs lọc, Tìm kiếm từ khóa, Chuyên khoa, Tỉnh thành |
| `/booking/:type/:id` | `BookingPage.jsx` | Authenticated (`RequireAuth`) | Step 1: Chọn ngày/khung giờ; Step 2: Chọn/Tạo hồ sơ bệnh nhân; Step 3: Triệu chứng & Chi phí |
| `/payment` | `PaymentPage.jsx` | Authenticated (`RequireAuth`) | Chi tiết viện phí + phí tiện ích, chọn phương thức (QR Code/ATM/Ví/Offline), thanh toán giả lập |
| `/account` | `AccountPage.jsx` | Authenticated (`RequireAuth`) | 4 Tabs: Thông tin cá nhân, Hồ sơ người khám (CRUD), Lịch khám hiện tại (Hủy lịch), Lịch sử khám |
| `/admin` | `AdminPage.jsx` | Admin only (`RequireAdmin`) | Dashboard thống kê (Total, Pending, Approved, Completed, Paid), Table quản lý, Duyệt lịch & Mark Paid |

**Cơ chế điều hướng mặc định (`/`):**
- Chưa đăng nhập (`currentUser == null`) $\rightarrow$ Điều hướng về `/auth`.
- Đã đăng nhập với quyền `admin` $\rightarrow$ Điều hướng về `/admin`.
- Đã đăng nhập với quyền `patient` $\rightarrow$ Điều hướng về `/explore`.

---

## 4. THIẾT KẾ CSDL CLIENT (LOCALSTORAGE SCHEMAS)

Tất cả thao tác lưu trữ được chuẩn hóa tập trung qua module [src/utils/storage.js](file:///c:/mnpr/src/utils/storage.js) với các keys:

### 4.1 Schema Bảng Dữ Liệu

#### 1. `users` (Danh sách tài khoản hệ thống)
```json
[
  {
    "id": "usr_admin",
    "fullName": "Quản Trị Viên MedSi",
    "email": "admin@medsi.vn",
    "phone": "0988889999",
    "password": "admin123",
    "role": "admin",
    "createdAt": "2026-09-27T00:00:00.000Z"
  },
  {
    "id": "usr_demo_patient",
    "fullName": "Nguyễn Văn An",
    "email": "demo@medsi.vn",
    "phone": "0901234567",
    "password": "123456",
    "role": "patient",
    "createdAt": "2026-09-27T00:00:00.000Z"
  }
]
```

#### 2. `currentUser` (Phiên đăng nhập hiện tại)
Lưu trực tiếp object của user đang đăng nhập (hoặc `null` nếu đã đăng xuất).

#### 3. `patientProfiles` (Hồ sơ người khám bệnh)
```json
[
  {
    "id": "prof_1",
    "userId": "usr_demo_patient",
    "fullName": "Nguyễn Văn An",
    "dob": "1992-05-14",
    "gender": "Nam",
    "phone": "0901234567",
    "relationship": "Bản thân",
    "address": "Quận 1, TP.HCM",
    "createdAt": "2026-09-27T00:00:00.000Z"
  },
  {
    "id": "prof_2",
    "userId": "usr_demo_patient",
    "fullName": "Nguyễn Minh Khang",
    "dob": "2019-10-20",
    "gender": "Nam",
    "phone": "0901234567",
    "relationship": "Con",
    "address": "Quận 1, TP.HCM",
    "createdAt": "2026-09-27T00:00:00.000Z"
  }
]
```

#### 4. `bookings` (Phiếu đặt lịch khám)
```json
[
  {
    "id": "bk_1727450000_abcde",
    "code": "BK2026849102",
    "userId": "usr_demo_patient",
    "patientProfileId": "prof_1",
    "patientName": "Nguyễn Văn An",
    "patientPhone": "0901234567",
    "patientDob": "1992-05-14",
    "patientGender": "Nam",
    "relationship": "Bản thân",
    "bookingType": "doctor",
    "doctorId": "doc_1",
    "hospitalId": null,
    "examTypeId": null,
    "providerName": "BS. CKII Trần Quốc Huy",
    "providerAvatar": "https://...",
    "providerAddress": "128 Trần Hưng Đạo, Quận 1, TP.HCM",
    "specialtyName": "Tim mạch",
    "city": "TP.HCM",
    "date": "2026-10-02",
    "startTime": "09:00",
    "endTime": "09:30",
    "symptoms": "Đau tức ngực trái khi gắng sức",
    "examFee": 350000,
    "serviceFee": 30000,
    "totalAmount": 380000,
    "paymentMethod": "qr",
    "paymentStatus": "paid",
    "status": "pending",
    "createdAt": "2026-09-27T10:00:00.000Z"
  }
]
```
- `status`: `pending` (Chờ duyệt) | `approved` (Đã xác nhận) | `completed` (Đã hoàn thành) | `cancelled` (Đã hủy).
- `paymentStatus`: `paid` (Đã thanh toán) | `unpaid` (Chưa thanh toán).

#### 5. `payments` (Lịch sử thanh toán giao dịch)
```json
[
  {
    "id": "pay_1727450000_xyz12",
    "bookingId": "bk_1727450000_abcde",
    "bookingCode": "BK2026849102",
    "method": "QR Code (VietQR/MoMo)",
    "examFee": 350000,
    "serviceFee": 30000,
    "totalAmount": 380000,
    "status": "paid",
    "createdAt": "2026-09-27T10:00:00.000Z"
  }
]
```

#### 6. `bookingDraft` (Bản nháp đặt lịch giữa BookingPage $\rightarrow$ PaymentPage)
Lưu tạm toàn bộ thông tin đã chọn ở `BookingPage` để chuyển sang `PaymentPage`. Sau khi thanh toán thành công, key này được xóa sạch.

---

## 5. CHI TIẾT 6 TRANG GIAO DIỆN & LUỒNG TƯƠNG TÁC

### 5.1 Trang 1: `AuthPage` (`/auth`)
- **Hai chế độ:** Tab "Đăng nhập" và "Đăng ký".
- **Form Đăng nhập:**
  - Nhập Email & Password $\rightarrow$ Đối soát dữ liệu trong `users`.
  - Nếu hợp lệ: Cập nhật `currentUser` và chuyển hướng (`/admin` nếu là Admin, `/explore` nếu là Bệnh nhân).
  - Có sẵn 2 nút **1-Click Demo Login**:
    - *Bệnh nhân Demo:* `demo@medsi.vn` / `123456`
    - *Quản trị viên Demo:* `admin@medsi.vn` / `admin123`
- **Form Đăng ký:**
  - Họ và tên, Email, Số điện thoại, Mật khẩu, Xác nhận mật khẩu.
  - Validation: Email hợp lệ, SĐT 9-11 số, password $\ge$ 6 ký tự, mật khẩu khớp nhau.
  - Tự động tạo bản ghi `user` mới (`role: "patient"`) và tự động tạo 1 `patientProfile` mặc định "Bản thân".

### 5.2 Trang 2: `ExplorePage` (`/explore`)
- **Banner Hero:** Thông điệp y tế số hóa, các chỉ số tin cậy.
- **Bộ lọc chuyên dụng (`FilterBar`):**
  - **Tabs chuyển đổi:** Bác sĩ chuyên khoa (hiển thị số lượng) vs Bệnh viện & Cơ sở y tế (hiển thị số lượng).
  - **Tìm kiếm đa năng:** Theo tên bác sĩ, tên bệnh viện, địa chỉ, thế mạnh khám.
  - **Lọc Chuyên khoa:** Tim mạch, Da liễu, Tai Mũi Họng, Nhi khoa, Nội tổng quát, Cơ xương khớp, v.v.
  - **Lọc Khu vực / Tỉnh thành:** TP.HCM, Hà Nội, Đà Nẵng, Cần Thơ.
- **Danh sách Provider:**
  - Card Bác sĩ: Avatar, tên, học vị, chuyên khoa, kinh nghiệm, rating, địa chỉ phòng khám, giá khám, nút "Đặt lịch" $\rightarrow$ `/booking/doctor/:id`.
  - Card Bệnh viện: Hình ảnh cơ sở, tên, địa chỉ, rating, chuyên khoa nổi bật dạng pills, giá khám từ... $\rightarrow$ `/booking/hospital/:id`.

### 5.3 Trang 3: `BookingPage` (`/booking/:type/:id`)
- **Phần 1 - Khung giờ & Dịch vụ:**
  - Nếu là Bệnh viện: Cho phép chọn gói dịch vụ khám (Tổng quát, Khám chuyên gia, Gói tầm soát).
  - Hiển thị 7 ngày khám tiếp theo (Hôm nay, Ngày mai, Thứ...).
  - Chia khung giờ Sáng (08:00 - 11:30) và Chiều (13:30 - 16:30).
  - **Slot Booking Protection:** Slot đã có người đặt trong localStorage sẽ tự động bị `disable` và gạch ngang.
- **Phần 2 - Hồ sơ người khám:**
  - Hiển thị danh sách hồ sơ có sẵn của user kèm radio selection.
  - Có nút "Tạo hồ sơ mới" mở Modal nhập nhanh thông tin (Tên, ngày sinh, giới tính, SĐT, quan hệ).
- **Phần 3 - Triệu chứng & Lý do khám:**
  - Textarea ghi chú tình trạng sức khỏe cho bác sĩ.
- **Cột Tóm Tắt & Thanh Điều Hướng Cuối Trang:**
  - **Nút "Quay lại danh sách":** Điều hướng an toàn về `/explore`.
  - **Nút "Tiếp tục thanh toán":** Kiểm tra điều kiện trực tiếp từ React State:
    ```javascript
    const canContinue = Boolean(selectedDate && selectedSlot && selectedProfileId);
    ```
    - Khi chưa chọn đủ: Button disabled rõ ràng với màu xám chuẩn, có dòng nhắc nhở bên dưới.
    - Khi chọn đủ: Button kích hoạt màu xanh y tế nổi bật ngay lập tức (không cần reload).
    - Khi bấm: Lưu `bookingDraft` và chuyển sang `/payment`.

### 5.4 Trang 4: `PaymentPage` (`/payment`)
- **Chi tiết viện phí (Breakdown):**
  - Phí khám bác sĩ / dịch vụ: e.g. 350.000 đ
  - Phí tiện ích đặt lịch trực tuyến: 30.000 đ
  - Tổng thanh toán: 380.000 đ
- **Phương thức thanh toán giả lập:**
  1. Quét mã VietQR / MoMo (có ảnh QR Code mô phỏng trực quan)
  2. Thẻ ATM nội địa / Internet Banking Napas
  3. Ví điện tử (ZaloPay, VNPay, ShopeePay)
  4. Thanh toán tại cơ sở y tế (Offline)
- **Xác nhận thanh toán:**
  - Giả lập độ trễ kết nối 800ms.
  - Sinh mã Code đặt lịch dạng `BK2026xxxxxx`.
  - Nếu thanh toán Online $\rightarrow$ `paymentStatus = "paid"`.
  - Nếu thanh toán Offline $\rightarrow$ `paymentStatus = "unpaid"`.
  - Tạo record `booking` (status: `pending`) và record `payment`.
  - Modal thông báo thành công $\rightarrow$ Nút xem lịch trong `/account`.

### 5.5 Trang 5: `AccountPage` (`/account`)
- **Header:** Thông tin người dùng, avatar chữ cái đầu, role badge.
- **Tab 1 - Lịch khám hiện tại:**
  - Hiển thị các lịch có trạng thái `pending` hoặc `approved`.
  - Hiển thị mã code, tên bác sĩ/bệnh viện, ngày giờ, số tiền, badge thanh toán, badge trạng thái.
  - **Nghiệp vụ Hủy lịch:** Chỉ các lịch `pending` mới hiển thị nút "Hủy lịch". Khi bấm $\rightarrow$ Modal xác nhận lý do hủy $\rightarrow$ Chuyển trạng thái sang `cancelled`.
- **Tab 2 - Lịch sử khám:**
  - Lưu trữ các lịch `completed` và `cancelled`.
  - Có bộ lọc nhanh theo trạng thái.
- **Tab 3 - Quản lý hồ sơ bệnh nhân:**
  - Danh sách hồ sơ gia đình (Bản thân, con, bố mẹ...).
  - Thao tác đầy đủ: Thêm mới hồ sơ, Sửa thông tin hồ sơ, Xóa hồ sơ (kèm confirm).
- **Tab 4 - Thông tin tài khoản:**
  - Xem thông tin tài khoản, email, số điện thoại, ngày tham gia.

### 5.6 Trang 6: `AdminPage` (`/admin`)
- **Bảo mật:** Chỉ user có `role === "admin"` mới được truy cập; người khác tự động bị chuyển về `/explore`.
- **Dashboard Thống kê (5 thẻ chỉ số):**
  1. Tổng số lịch hẹn
  2. Số lịch chờ duyệt (`pending`)
  3. Số lịch đã duyệt (`approved`)
  4. Số lịch hoàn tất (`completed`)
  5. Số lịch đã thanh toán (`paid`)
- **Bảng Quản Lý Lịch Hẹn (Bookings Table):**
  - Cột: Mã Code, Bệnh nhân, Đơn vị/Bác sĩ, Ngày & Giờ, Tổng tiền, Trạng thái Thanh toán, Trạng thái Lịch, Hành động.
  - **Hành động 1 - Duyệt lịch:** Nút chuyển trạng thái `pending` $\rightarrow$ `approved`.
  - **Hành động 2 - Hoàn tất:** Nút chuyển trạng thái `approved` $\rightarrow$ `completed`.
  - **Hành động 3 - Mark Paid:** Đối với các lịch chưa thanh toán (`unpaid`), Admin bấm "Mark Paid" để cập nhật ngay thành `paid`.
  - **Xem chi tiết:** Modal hiển thị toàn bộ hồ sơ bệnh nhân, lý do khám và breakdown tài chính.

---

## 6. MOCK DATA ĐẶC TẢ CHI TIẾT

Toàn bộ dữ liệu khởi tạo nằm trong thư mục [src/data/](file:///c:/mnpr/src/data/):
- **Chuyên khoa (`specialties.js`):** 8 chuyên khoa phổ biến (Tim mạch, Da liễu, Tai Mũi Họng, Nhi khoa, Nội tổng quát, Cơ xương khớp, Tiêu hóa - Gan mật, Mắt).
- **Khu vực (`CITIES`):** TP.HCM, Hà Nội, Đà Nẵng, Cần Thơ.
- **Bác sĩ (`doctors.js`):** 8 bác sĩ với hình ảnh chân dung y tế sắc nét từ Unsplash, thông tin số năm kinh nghiệm, học hàm/học vị (BS. CKII, TS. BS, PGS. TS), bệnh viện công tác và giá khám.
- **Bệnh viện (`hospitals.js`):** 4 bệnh viện/phòng khám chuẩn quốc tế (MedSi Sài Gòn, MedSi Thăng Long, MedSi Sông Hàn, MedSi Ninh Kiều) kèm các gói khám lâm sàng chuyên biệt.
- **Khung giờ (`slots.js`):** 13 khung giờ chuẩn (7 slot sáng, 6 slot chiều) và hàm tính toán động 7 ngày tiếp theo `getUpcomingDates()`.

---

## 7. CẤU TRÚC THƯ MỤC DỰ ÁN

```text
c:\mnpr\
├── public/
├── src/
│   ├── components/            # UI Components tái sử dụng
│   │   ├── Navbar.jsx         # Header điều hướng chính (Patient & Admin mode)
│   │   ├── Footer.jsx         # Chân trang chuẩn nhận diện thương hiệu MedSi
│   │   ├── DoctorCard.jsx     # Card hiển thị bác sĩ, rating, giá, nút đặt lịch
│   │   ├── HospitalCard.jsx   # Card bệnh viện, ảnh cơ sở, chuyên khoa nổi bật
│   │   ├── FilterBar.jsx      # Thanh lọc tìm kiếm, tabs Bác sĩ/Bệnh viện, khu vực
│   │   ├── SlotPicker.jsx     # Bộ chọn ngày khám và khung giờ sáng/chiều
│   │   ├── PatientProfileCard.jsx # Card thông tin bệnh nhân (Selectable & Manage mode)
│   │   ├── BookingCard.jsx    # Card lịch hẹn trong AccountPage kèm nút hủy lịch
│   │   ├── StatusBadge.jsx    # Badge màu trạng thái lịch hẹn & thanh toán
│   │   └── Modal.jsx          # Modal hộp thoại dùng chung (Backdrop blur)
│   │
│   ├── pages/                 # Đúng 6 trang chính theo yêu cầu
│   │   ├── AuthPage.jsx       # 1. Đăng ký / Đăng nhập / 1-Click demo
│   │   ├── ExplorePage.jsx    # 2. Khám phá bác sĩ & bệnh viện
│   │   ├── BookingPage.jsx    # 3. Đặt lịch khám đa bước
│   │   ├── PaymentPage.jsx    # 4. Xác nhận chi phí & Thanh toán giả lập
│   │   ├── AccountPage.jsx    # 5. Quản lý tài khoản, hồ sơ & lịch khám
│   │   └── AdminPage.jsx      # 6. Dashboard quản trị duyệt lịch & đối soát
│   │
│   ├── data/                  # Mock data nguồn
│   │   ├── doctors.js         # Dữ liệu 8 bác sĩ
│   │   ├── hospitals.js       # Dữ liệu 4 bệnh viện
│   │   ├── specialties.js     # Danh mục chuyên khoa & tỉnh thành
│   │   └── slots.js           # Khung giờ & bộ tạo ngày
│   │
│   ├── utils/                 # Utilities
│   │   ├── storage.js         # Quản trị an toàn localStorage & Seed data
│   │   ├── formatCurrency.js  # Format tiền tệ VND (e.g. 350.000 đ)
│   │   └── generateCode.js    # Sinh mã đặt lịch BK2026xxxxxx & Unique ID
│   │
│   ├── App.jsx                # Bộ định tuyến React Router & Route Guards
│   ├── main.jsx               # Entry point
│   └── index.css              # Tailwind Base & Custom Styles
│
├── package.json
├── tailwind.config.js
├── vite.config.js
└── plan.md                    # File kế hoạch chi tiết này
```

---

## 8. LỘ TRÌNH TRIỂN KHAI & TIÊU CHÍ HOÀN THÀNH

### Giai đoạn 1: Thiết lập nền tảng & Dữ liệu
- [x] Cài đặt `react-router-dom` và cấu hình bộ định tuyến SPA trong `App.jsx`.
- [x] Tạo các helper `storage.js`, `formatCurrency.js`, `generateCode.js`.
- [x] Xây dựng bộ mock data chuẩn y tế trong `src/data/`.
- [x] Khởi tạo hạt giống dữ liệu ban đầu (`initInitialStorage`): Admin demo, Patient demo, hồ sơ mẫu.

### Giai đoạn 2: Xây dựng UI Components tái sử dụng
- [x] Hoàn thiện `Navbar` phân quyền: Khám bác sĩ, Khám bệnh viện, Lịch khám, Hồ sơ, Admin badge.
- [x] Hoàn thiện `DoctorCard`, `HospitalCard`, `FilterBar`.
- [x] Hoàn thiện `SlotPicker`, `PatientProfileCard`, `BookingCard`, `StatusBadge`, `Modal`.
- [x] Đảm bảo 100% sử dụng cú pháp Tailwind CSS v3 (`bg-gradient-to-*`), không dùng `bg-linear-*` để tránh lỗi mất chữ/trắng nút.

### Giai đoạn 3: Hiện thực hóa 6 trang cốt lõi
- [x] `AuthPage`: Đăng nhập, đăng ký, validate, 1-click demo login.
- [x] `ExplorePage`: Tabs Bác sĩ / Bệnh viện, tìm kiếm từ khóa, lọc chuyên khoa, lọc khu vực.
- [x] `BookingPage`: Hiển thị thông tin provider, chọn ngày, slot, chọn/tạo hồ sơ, triệu chứng, điều kiện `canContinue` tức thì.
- [x] `PaymentPage`: Breakdown viện phí, chọn phương thức thanh toán, delay giả lập, tạo booking & payment.
- [x] `AccountPage`: 4 Tabs thông tin, lịch hẹn, lịch sử, CRUD hồ sơ bệnh nhân, hủy lịch pending.
- [x] `AdminPage`: Thống kê dashboard, bảng duyệt lịch `pending` $\rightarrow$ `approved` $\rightarrow$ `completed`, Mark Paid.

### Giai đoạn 4: Debugging & Tối ưu hóa UI/UX
- [x] Khắc phục triệt để lỗi button trắng / mất chữ trên các trình duyệt.
- [x] Đảm bảo navigation `BookingPage` $\rightarrow$ `PaymentPage` $\rightarrow$ `AccountPage` diễn ra mượt mà không reload.
- [x] Kiểm tra responsive 100% trên Mobile (375px), Tablet (768px) và Desktop (1280px).

### Giai đoạn 5: Đóng gói & Quản lý Source Control
- [x] Kiểm tra `npm run build` thành công, không phát sinh cảnh báo linter.
- [x] Tạo commit local theo quy chuẩn Conventional Commits:  
  `feat(booking): implement end-to-end medical appointment booking prototype and fix UI issues`
- [x] Tạo branch `mini-ai` và đẩy toàn bộ mã nguồn lên GitHub:  
  `origin/mini-ai` (PR ready).

---

## 9. KỊCH BẢN KIỂM THỬ MẪU (TEST CASE SCENARIOS)

| STT | Luồng kiểm thử (Test Scenario) | Các bước thực hiện | Kết quả kỳ vọng |
| :---: | :--- | :--- | :--- |
| **TC-01** | Đăng nhập tài khoản Bệnh nhân | Vào `/auth` $\rightarrow$ bấm nút demo "Bệnh nhân" $\rightarrow$ bấm "Đăng nhập" | Chuyển sang `/explore`, Navbar hiển thị tên "Nguyễn Văn An" |
| **TC-02** | Tìm kiếm & Lọc dữ liệu | Tại `/explore` $\rightarrow$ chọn chuyên khoa "Tim mạch" $\rightarrow$ chuyển Tab "Bệnh viện" | Danh sách lọc tức thì theo đúng tiêu chí đã chọn |
| **TC-03** | Khởi động đặt lịch Bác sĩ | Bấm "Đặt lịch" tại Bác sĩ Trần Quốc Huy | Điều hướng sang `/booking/doctor/doc_1`, hiển thị ảnh, tên, chuyên khoa và giá khám |
| **TC-04** | Trạng thái nút "Tiếp tục thanh toán" | Quan sát nút khi chưa chọn slot $\rightarrow$ click chọn slot "09:00" | Ban đầu nút disabled (màu xám rõ chữ); khi chọn slot nút bật xanh sáng tức thì |
| **TC-05** | Tạo hồ sơ bệnh nhân tại chỗ | Bấm "Tạo hồ sơ mới" $\rightarrow$ nhập thông tin con/người thân $\rightarrow$ Lưu | Hồ sơ mới xuất hiện trong danh sách và được tự động chọn |
| **TC-06** | Quy trình thanh toán giả lập | Bấm "Tiếp tục thanh toán" $\rightarrow$ chọn VietQR $\rightarrow$ bấm "Thanh toán ngay" | Chuyển sang `/payment`, hiển thị viện phí 350.000đ + 30.000đ = 380.000đ, hiện modal thành công với mã `BK...` |
| **TC-07** | Xem lịch khám tại Account | Bấm "Xem danh sách lịch hẹn" từ modal | Chuyển sang `/account?tab=bookings`, lịch hẹn mới nằm ở đầu với trạng thái "Chờ xác nhận" |
| **TC-08** | Hủy lịch khám Pending | Bấm "Hủy lịch" tại phiếu khám vừa tạo $\rightarrow$ xác nhận lý do | Lịch chuyển trạng thái "Đã hủy" và chuyển sang tab "Lịch sử khám" |
| **TC-09** | Quản trị viên duyệt lịch | Đăng xuất $\rightarrow$ Đăng nhập "Quản trị viên" $\rightarrow$ vào `/admin` $\rightarrow$ bấm "Duyệt lịch" | Trạng thái chuyển `pending` $\rightarrow$ `approved`. Bấm tiếp "Hoàn tất" chuyển sang `completed` |
| **TC-10** | Quản trị viên Mark Paid | Tại booking có trạng thái "Chưa thanh toán" $\rightarrow$ bấm "Mark Paid" | Trạng thái thanh toán đổi thành "Đã thanh toán", nút bị vô hiệu hóa |
