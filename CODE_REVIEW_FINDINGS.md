# BÁO CÁO REVIEW CODE & KIỂM ĐỊNH CHẤT LƯỢNG MÃ NGUỒN

> **Dự án:** Medsi - Hệ thống Đặt lịch khám bệnh trực tuyến (Mini Project IS207)  
> **Nhánh rà soát:** `mini-ai` (Commit: `2955c3d` — *feat(booking): implement end-to-end medical appointment booking prototype and fix UI issues*)  
> **Nhánh cơ sở (Target Base):** `main`  
> **Tài liệu tham chiếu:** [Prompt.md](file:///d:/HOCKY5/Web/Mini_Project_IS207/Prompt.md) & [README.md](file:///d:/HOCKY5/Web/Mini_Project_IS207/README.md)  
> **Vai trò:** Senior Frontend Architect / Tech Lead (Reviewer Độc lập)  
> **Ngày thực hiện:** 27/09/2026  

---

## 1. PHÂN QUYẾT TỔNG THỂ (EXECUTIVE VERDICT)

### ✅ QUYẾT ĐỊNH: **APPROVED (ĐÃ KIỂM ĐỊNH & THÔNG QUA CHO MERGE)**

**Tóm tắt cập nhật sau rà soát & khắc phục:**  
Toàn bộ 9 lỗi và điểm nghẽn nghiêm trọng (F-01 đến F-09) trên nhánh `mini-ai` đã được lập trình khắc phục hoàn chỉnh, kiểm tra build môi trường production (`npm run build`) thành công 100% không cảnh báo lỗi:
1. **Mở khóa trang chủ (F-01 - Đã xử lý):** Khách vãng lai truy cập tự do tại `/` và `/explore`, duyệt danh sách bệnh viện, bác sĩ, bảng giá và chuyên khoa không cần đăng nhập.
2. **Khôi phục tra cứu bằng SĐT (F-03 - Đã xử lý):** Trang `/lookup` công khai, hỗ trợ tìm theo SĐT với các số mẫu nhanh, xem chi tiết và hủy lịch kèm lý do.
3. **Admin hoàn thiện quyền lực (F-02, F-04 - Đã xử lý):** Đã bổ sung tính năng Hủy lịch kèm lý do, Xóa lịch vĩnh viễn, Xuất báo cáo CSV chuẩn UTF-8 Excel và Nút "Khôi phục dữ liệu mẫu" (Reset Demo Data).
4. **Bảo toàn Slot & Dữ liệu (F-07, F-08, F-09 - Đã xử lý):** Cơ chế chặn race condition / double-booking trước khi lưu, cho phép bệnh nhân hủy lịch `approved`, và chuẩn hóa namespace `medsi_` cho LocalStorage.
5. **Dọn sạch 100% Dead Code (F-06 - Đã xử lý):** Xóa sạch 13 tệp mồ côi (giảm hơn 3.700 dòng mã thừa), kiến trúc dự án trở nên gọn gàng, trong sáng.

---

## 2. BẢNG TỔNG HỢP DANH SÁCH LỖI & KẾT QUẢ KHẮC PHỤC

| ID | Cấp độ | Phân loại | Tệp tin & Dòng liên quan | Mô tả ngắn gọn | Trạng thái |
|:---:|:---:|:---|:---|:---|:---:|
| **F-01** | **P0** | Business / UX | [src/App.jsx](file:///d:/HOCKY5/Web/Mini_Project_IS207/src/App.jsx) | Ép khách vãng lai phải đăng nhập ngay khi mở trang chủ (`/` -> `/auth`). | **✅ ĐÃ FIX** |
| **F-02** | **P0** | Missing Feature | [src/pages/AdminPage.jsx](file:///d:/HOCKY5/Web/Mini_Project_IS207/src/pages/AdminPage.jsx) | Admin thiếu tính năng Hủy lịch, Xóa lịch và Xuất dữ liệu CSV. | **✅ ĐÃ FIX** |
| **F-03** | **P0** | Contract Drift | [src/pages/LookupPage.jsx](file:///d:/HOCKY5/Web/Mini_Project_IS207/src/pages/LookupPage.jsx) | Mất tính năng bệnh nhân tra cứu lịch hẹn công khai bằng Số điện thoại. | **✅ ĐÃ FIX** |
| **F-04** | **P0** | Testing / Grading | [src/pages/AdminPage.jsx](file:///d:/HOCKY5/Web/Mini_Project_IS207/src/pages/AdminPage.jsx), [src/utils/storage.js](file:///d:/HOCKY5/Web/Mini_Project_IS207/src/utils/storage.js) | Thiếu nút "Khôi phục dữ liệu mẫu ban đầu" để giảng viên test lại hệ thống. | **✅ ĐÃ FIX** |
| **F-05** | **P1** | Routing / State | [src/App.jsx](file:///d:/HOCKY5/Web/Mini_Project_IS207/src/App.jsx), [src/pages/AuthPage.jsx](file:///d:/HOCKY5/Web/Mini_Project_IS207/src/pages/AuthPage.jsx) | Mất tham số điều hướng sau đăng nhập (Login xong không quay lại luồng đặt lịch). | **✅ ĐÃ FIX** |
| **F-06** | **P1** | Code Hygiene | Toàn bộ cây thư mục `src/` | Hơn 3.700 dòng code mồ côi (13 files không được import bất cứ đâu trong App). | **✅ ĐÃ FIX** |
| **F-07** | **P1** | Data Integrity | [src/pages/PaymentPage.jsx](file:///d:/HOCKY5/Web/Mini_Project_IS207/src/pages/PaymentPage.jsx) | Thiếu kiểm tra trùng khung giờ (Double booking) ở bước xác nhận thanh toán. | **✅ ĐÃ FIX** |
| **F-08** | **P1** | Permission / Flow | [src/components/BookingCard.jsx](file:///d:/HOCKY5/Web/Mini_Project_IS207/src/components/BookingCard.jsx) | Bệnh nhân bị khóa quyền hủy lịch khi lịch đã được Admin duyệt (`approved`). | **✅ ĐÃ FIX** |
| **F-09** | **P2** | Architecture | [src/utils/storage.js](file:///d:/HOCKY5/Web/Mini_Project_IS207/src/utils/storage.js) | Khóa LocalStorage dùng tên quá chung chung, không có tiền tố namespace dự án. | **✅ ĐÃ FIX** |

---

## 3. PHÂN TÍCH CHI TIẾT TỪNG LỖI VÀ HƯỚNG XỬ LÝ

### 🔴 LỖI CẤP ĐỘ P0 (NGHIÊM TRỌNG - PHẢI SỬA MỚI ĐƯỢC MERGE)

---

#### 1. [F-01] Chặn truy cập trang chủ - Ép đăng nhập ngay tại Root (`/`)
- **Vị trí code:** [src/App.jsx: dòng 30 - 39](file:///d:/HOCKY5/Web/Mini_Project_IS207/src/App.jsx#L30-L39)
```javascript
function RootRedirect() {
  const currentUser = getStorage(STORAGE_KEYS.CURRENT_USER, null);
  if (!currentUser) {
    return <Navigate to="/auth" replace />; // <-- LỖI: Chưa đăng nhập bị đá thẳng sang /auth
  }
  if (currentUser.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/explore" replace />;
}
```
- **Hậu quả nghiệp vụ:** Khách hàng hoặc giảng viên khi mở domain `http://localhost:3000/` không hề nhìn thấy trang giới thiệu, không thấy danh sách bác sĩ hay bảng giá mà bị chặn ngay bởi form đăng nhập. Đối với web dịch vụ y tế, việc bắt buộc login trước khi duyệt dịch vụ là sai quy chuẩn UX nghiêm trọng.
- **Cách tái hiện:**
  1. Mở trình duyệt ở chế độ Ẩn danh (Incognito) hoặc xóa localStorage.
  2. Truy cập `http://localhost:3000/`.
  3. Kết quả: Màn hình tự động chuyển sang `http://localhost:3000/auth`.
- **Giải pháp bắt buộc:** Đổi `RootRedirect` để khách vãng lai mặc định được vào xem `/explore` hoặc khôi phục lại trang `HomePage` giới thiệu. Chỉ yêu cầu đăng nhập khi họ tiến hành bấm đặt lịch.

---

#### 2. [F-02] Admin bị tước quyền Hủy và Xóa lịch hẹn khám
- **Vị trí code:** [src/pages/AdminPage.jsx: dòng 52 - 113](file:///d:/HOCKY5/Web/Mini_Project_IS207/src/pages/AdminPage.jsx#L52-L113)
- **Hậu quả nghiệp vụ:** Trong [Prompt.md](file:///d:/HOCKY5/Web/Mini_Project_IS207/Prompt.md), trang Admin được yêu cầu: *"Dashboard quản trị: Xem tổng quan thống kê, bộ lọc trạng thái, duyệt/hủy/hoàn thành lịch"*. Tuy nhiên, trong code chỉ có:
  - `handleMarkPaid` (Thu tiền)
  - `handleApproveBooking` (Duyệt lịch)
  - `handleCompleteBooking` (Hoàn thành)
  Hoàn toàn **KHÔNG CÓ** hàm hay nút bấm để Admin HỦY lịch khi bác sĩ bận đột xuất hoặc bệnh nhân báo hủy qua điện thoại, và **KHÔNG CÓ** nút XÓA lịch rác.
- **Cách tái hiện:**
  1. Đăng nhập với tư cách Admin (`admin@medsi.vn` / `admin123`).
  2. Vào trang `/admin`.
  3. Tìm một lịch hẹn muốn hủy hoặc muốn xóa.
  4. Kết quả: Bảng dữ liệu chỉ có nút "Duyệt" và "Hoàn thành", không có tùy chọn Hủy hay Xóa.
- **Giải pháp bắt buộc:** Thêm hàm `handleCancelBooking(id, reason)` và `handleDeleteBooking(id)`, hiển thị modal xác nhận lý do hủy và nút thùng rác xóa hồ sơ.

---

#### 3. [F-03] Đánh mất tính năng Bệnh nhân tra cứu lịch hẹn theo Số điện thoại
- **Vị trí code:** [src/pages/AccountPage.jsx: dòng 58 - 75](file:///d:/HOCKY5/Web/Mini_Project_IS207/src/pages/AccountPage.jsx#L58-L75)
```javascript
useEffect(() => {
  const user = getStorage(STORAGE_KEYS.CURRENT_USER, null);
  if (!user) {
    navigate('/auth'); // Bắt buộc đăng nhập
    return;
  }
  ...
  const userBookings = allBookings.filter((b) => b.userId === user.id);
  setBookings(userBookings);
}, [navigate]);
```
- **Hậu quả nghiệp vụ:** [Prompt.md](file:///d:/HOCKY5/Web/Mini_Project_IS207/Prompt.md) quy định rõ: *"PatientHistoryPage.jsx: Bệnh nhân tra cứu lịch hẹn theo SĐT, xem chi tiết, yêu cầu hủy lịch"*. Code mới ép bệnh nhân phải tạo tài khoản và chỉ lọc theo `userId`. Nếu người bệnh đặt khám giúp người nhà hoặc không muốn tạo tài khoản, họ hoàn toàn không có cách nào nhập SĐT để tra cứu lại phiếu khám.
- **Cách tái hiện:**
  1. Đăng xuất tài khoản.
  2. Bấm vào mục "Lịch khám" trên thanh điều hướng.
  3. Bị đá văng về `/auth` thay vì hiển thị ô nhập Số điện thoại tra cứu.
- **Giải pháp bắt buộc:** Cung cấp trang hoặc tab tra cứu công khai cho phép nhập Số điện thoại bất kỳ để truy xuất danh sách lịch hẹn của số điện thoại đó (kèm nút test nhanh các SĐT mẫu).

---

#### 4. [F-04] Thiếu nút "Khôi phục dữ liệu mẫu ban đầu" (Reset Demo Data)
- **Vị trí code:** [src/pages/AdminPage.jsx](file:///d:/HOCKY5/Web/Mini_Project_IS207/src/pages/AdminPage.jsx), [src/utils/storage.js](file:///d:/HOCKY5/Web/Mini_Project_IS207/src/utils/storage.js)
- **Hậu quả nghiệp vụ:** Hàm `initInitialStorage()` chỉ chạy khi storage chưa có dữ liệu. Sau khi giảng viên hoặc người chấm bài tạo 5-10 lịch hẹn, đổi trạng thái qua lại làm xáo trộn dữ liệu, họ không có bất kỳ nút nào trên UI để bấm reset về dữ liệu mẫu sạch đẹp ban đầu.
- **Cách tái hiện:**
  1. Thao tác đặt thêm 3 lịch hẹn mới, duyệt 2 lịch.
  2. Tìm kiếm nút "Khôi phục dữ liệu mẫu" trên thanh Admin.
  3. Kết quả: Không tìm thấy tính năng này, phải tự xóa LocalStorage thủ công bằng F12.
- **Giải pháp bắt buộc:** Thêm nút **"Khôi phục dữ liệu mẫu ban đầu"** trên AdminPage để ghi đè lại bộ mock data chuẩn.

---

### 🟡 LỖI CẤP ĐỘ P1 (ẢNH HƯỞNG TRẢI NGHIỆM VÀ ĐỘ ỔN ĐỊNH)

---

#### 5. [F-05] Mất tham số điều hướng sau khi RequireAuth
- **Vị trí code:** [src/App.jsx:44-50](file:///d:/HOCKY5/Web/Mini_Project_IS207/src/App.jsx#L44-L50) và [src/pages/AuthPage.jsx:85-89](file:///d:/HOCKY5/Web/Mini_Project_IS207/src/pages/AuthPage.jsx#L85-L89)
- **Hậu quả:** Khách vãng lai xem danh sách ở `/explore`, thấy Bác sĩ A rất phù hợp và bấm "Đặt lịch". Hệ thống đá về `/auth`. Khi khách đăng nhập thành công, hệ thống lại điều hướng họ về `/explore`, làm mất đường dẫn `/booking/doctor/doc_x` mà họ vừa chọn.
- **Giải pháp:** Truyền `state: { from: location }` qua `Navigate` trong `RequireAuth`, và sau khi login thì kiểm tra `location.state?.from` để redirect đúng về trang đặt bác sĩ đó.

---

#### 6. [F-06] Tồn tại hơn 3.700 dòng Code rác mồ côi (Dead / Orphan Code)
- **Danh sách file mồ côi không được sử dụng:**
  - `src/services/appointmentService.js` (230 dòng)
  - `src/services/mockData.js` (350 dòng)
  - `src/hooks/useAppointments.js` (86 dòng)
  - `src/hooks/useToast.jsx` (81 dòng)
  - `src/pages/HomePage.jsx` (426 dòng)
  - `src/pages/DoctorListPage.jsx` (390 dòng)
  - `src/pages/BookingModalOrPage.jsx` (751 dòng)
  - `src/pages/PatientHistoryPage.jsx` (402 dòng)
  - `src/pages/AdminDashboardPage.jsx` (652 dòng)
  - `src/components/Header.jsx` (190 dòng)
  - `src/components/Badge.jsx` (50 dòng)
  - `src/components/Button.jsx` (53 dòng)
  - `src/components/Input.jsx` (128 dòng)
- **Hậu quả:** Gây nhầm lẫn nghiêm trọng cho bất kỳ thành viên nào khác trong nhóm khi mở code. Tồn tại song song cả `Header.jsx` lẫn `Navbar.jsx`, cả `AdminDashboardPage.jsx` lẫn `AdminPage.jsx`.
- **Giải pháp:** Xóa bỏ triệt để các file cũ không còn được kết nối trong `App.jsx`.

---

#### 7. [F-07] Thiếu Double-check Slot Collision tại bước submit thanh toán
- **Vị trí code:** [src/pages/PaymentPage.jsx: dòng 71 - 125](file:///d:/HOCKY5/Web/Mini_Project_IS207/src/pages/PaymentPage.jsx#L71-L125)
- **Hậu quả:** Trong `BookingPage.jsx` có disable slot đã chọn, nhưng ở `PaymentPage.jsx` lúc bấm "Xác nhận & Thanh toán" thì code ghi thẳng vào `STORAGE_KEYS.BOOKINGS` mà không re-check xem slot đó trong tích tắc vừa qua đã bị ai khác đặt trước chưa.
- **Giải pháp:** Trước khi `existingBookings.unshift(newBooking)`, gọi hàm kiểm tra: nếu slot của bác sĩ trong ngày đó đã có `status !== 'cancelled'` thì báo lỗi và hủy giao dịch.

---

#### 8. [F-08] Khóa quyền Hủy lịch của bệnh nhân khi lịch đã được duyệt (`approved`)
- **Vị trí code:** [src/components/BookingCard.jsx: dòng 8](file:///d:/HOCKY5/Web/Mini_Project_IS207/src/components/BookingCard.jsx#L8)
```javascript
const canCancel = booking.status === 'pending'; // Chỉ cho phép hủy khi đang pending
```
- **Hậu quả:** Khi lễ tân đã duyệt lịch (`approved`), bệnh nhân đột xuất bận việc hoặc khỏi bệnh không thể đến khám thì nút "Hủy lịch khám" biến mất, khiến bệnh nhân không thể hủy hẹn được.
- **Giải pháp:** Sửa điều kiện thành:
```javascript
const canCancel = booking.status === 'pending' || booking.status === 'approved';
```

---

### ⚪ KHUYẾN NGHỊ CẤP ĐỘ P2 (HOÀN THIỆN KIẾN TRÚC)

---

#### 9. [F-09] Thêm tiền tố định danh (Namespace) cho khóa LocalStorage
- **Vị trí code:** [src/utils/storage.js: dòng 3 - 10](file:///d:/HOCKY5/Web/Mini_Project_IS207/src/utils/storage.js#L3-L10)
- **Mô tả:** Các key hiện tại là `'users'`, `'currentUser'`, `'patientProfiles'`, `'bookings'`. Nên đổi thành `'medsi_users'`, `'medsi_currentUser'`, `'medsi_bookings'` để tránh ghi đè dữ liệu nếu trình duyệt chạy song song nhiều dự án khác nhau trên localhost.

---

## 4. CHECKLIST HÀNH ĐỘNG ĐÃ HOÀN TẤT (VERIFICATION PASS)

Toàn bộ các tiêu chí nghiệm thu đã được hoàn thành và kiểm tra thành công:

- [x] **Task 1:** Mở khóa trang `/` để khách vãng lai xem được `/explore` mà không bị ép login.
- [x] **Task 2:** Bổ sung tính năng Bệnh nhân tra cứu lịch theo Số điện thoại công khai (`/lookup`) với các số mẫu và hủy lịch trực tiếp.
- [x] **Task 3:** Thêm đầy đủ nút **Hủy lịch kèm lý do**, **Xóa lịch vĩnh viễn** và **Xuất CSV** vào trang Quản trị `AdminPage.jsx`.
- [x] **Task 4:** Thêm nút **"Khôi phục dữ liệu mẫu" (Reset Demo Data)** trên giao diện Admin.
- [x] **Task 5:** Sửa `canCancel` trong `BookingCard.jsx` cho phép hủy cả lịch `approved`.
- [x] **Task 6:** Thêm validation chống trùng slot ở bước submit cuối cùng trong `PaymentPage.jsx`.
- [x] **Task 7:** Xóa sạch 13 tệp tin dead code cũ để làm sạch cây thư mục dự án.
- [x] **Task 8:** Chuẩn hóa namespace LocalStorage `medsi_` có fallback tương thích ngược.
- [x] **Task 9:** Khắc phục mất state điều hướng sau khi Login / Register trong `AuthPage.jsx`.
- [x] **Task 10:** Build production (`npm run build`) vượt qua kiểm tra 100% không phát sinh lỗi.
