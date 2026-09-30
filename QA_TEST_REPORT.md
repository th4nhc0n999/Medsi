# BÁO CÁO KIỂM THỬ PHẦN MỀM (QA TEST REPORT)
## CÁC LỖI TRỌNG YẾU CẦN KHẮC PHỤC (CRITICAL DEFECTS)

> **Dự án:** MedSi - Hệ thống Đặt lịch khám bệnh trực tuyến (MiniProject môn IS207)  
> **Phạm vi kiểm thử:** Thuần Frontend (React 18, Vite 6, TailwindCSS, LocalStorage Mock Engine)  
> **Tiêu chí tinh gọn:** Chỉ tập trung vào các lỗi ảnh hưởng trực tiếp đến luồng nghiệp vụ chính, tính toàn vẹn dữ liệu và kịch bản chấm điểm của giảng viên.  
> **Ngày cập nhật:** 30/09/2026  

---

## 1. TỔNG HỢP CÁC LỖI TRỌNG YẾU (CORE DEFECT MATRIX)

| Mã lỗi | Cấp độ | Phân loại | Tệp tin liên quan | Mô tả ngắn gọn lỗi | Trạng thái |
|:---:|:---:|:---|:---|:---|:---:|
| **BUG-01** | **P1 (High)** | Thanh toán / Logic Flow | [src/pages/PaymentPage.jsx](file:///d:/HOCKY5/Web/Mini_Project_IS207/src/pages/PaymentPage.jsx) | Hết hạn VietQR (120s) rồi chuyển sang thanh toán Offline/ATM thì nút xác nhận bị "treo". | ✅ **ĐÃ FIX** |
| **BUG-02** | **P1 (High)** | Bảo mật / Tra cứu | [src/pages/LookupPage.jsx](file:///d:/HOCKY5/Web/Mini_Project_IS207/src/pages/LookupPage.jsx) | Tra cứu SĐT dùng `includes` chuỗi con làm lộ hồ sơ; người lạ tùy tiện hủy lịch. | ✅ **ĐÃ FIX** |
| **BUG-03** | **P1 (High)** | Nghiệp vụ / Double-Booking | [src/pages/BookingPage.jsx](file:///d:/HOCKY5/Web/Mini_Project_IS207/src/pages/BookingPage.jsx) | Giữ nguyên khung giờ đã có người khác đặt ở ngày mới, dẫn đến xung đột đặt trùng giờ. | ✅ **ĐÃ FIX** |
| **BUG-04** | **P2 (Med)** | Điều hướng / UX Routing | [src/components/Navbar.jsx](file:///d:/HOCKY5/Web/Mini_Project_IS207/src/components/Navbar.jsx) | Khách vãng lai bấm vào Logo MedSi bị ép chuyển hướng vào `/auth` thay vì về `/explore`. | ✅ **ĐÃ FIX** |
| **BUG-05** | **P2 (Med)** | Phân quyền / Hiển thị | [src/pages/AccountPage.jsx](file:///d:/HOCKY5/Web/Mini_Project_IS207/src/pages/AccountPage.jsx) | Bác sĩ hiển thị nhãn role mặc định là "Bệnh nhân" thay vì "Bác sĩ". | ✅ **ĐÃ FIX** |
| **BUG-06** | **P1 (High)** | Bảo mật / CSV Injection | [src/utils/csvExport.js](file:///d:/HOCKY5/Web/Mini_Project_IS207/src/utils/csvExport.js) | CSV Export dễ bị tấn công Formula Injection với các tiền tố `=`, `+`, `-`, `@`. | ✅ **ĐÃ FIX** |
| **BUG-07** | **P1 (High)** | Nghiệp vụ / Bác sĩ | [src/pages/DoctorDashboardPage.jsx](file:///d:/HOCKY5/Web/Mini_Project_IS207/src/pages/DoctorDashboardPage.jsx) | Bác sĩ thiếu tính năng Từ chối / Hủy ca khám kèm lý do trên Dashboard. | ✅ **ĐÃ FIX** |
| **BUG-08** | **P2 (Med)** | Giao diện / UI Resiliency | [src/components/DoctorCard.jsx](file:///d:/HOCKY5/Web/Mini_Project_IS207/src/components/DoctorCard.jsx) | Ảnh đại diện bác sĩ / cơ sở khám bị vỡ khi đường dẫn Unsplash lỗi. | ✅ **ĐÃ FIX** |

---

## 2. CHI TIẾT TỪNG LỖI & MÃ NGUỒN KHẮC PHỤC

---

### 🔴 [BUG-01] Nút xác nhận thanh toán bị khóa ngầm khi đổi phương thức sau khi VietQR hết hạn

* **Vị trí code:** [src/pages/PaymentPage.jsx: dòng 161 - 165](file:///c:/Users/HUY0406/OneDrive/Desktop/HK5/Web-IS207/MiniProject_IS207_AI/src/pages/PaymentPage.jsx#L161-L165)
* **Tác động nghiệp vụ:** Khách hàng thấy mã QR hết hạn 120s nên chuyển sang *"Thanh toán tại cơ sở khám (Offline)"* hoặc *"Thẻ ATM"*. Trên giao diện nút *"Xác nhận đặt lịch"* sáng lên cho bấm, nhưng khi click thì **hoàn toàn không có phản hồi**, không tạo được lịch hẹn.
* **Các bước tái hiện:**
  1. Tiến hành đặt lịch đến bước `/payment`.
  2. Để đồng hồ đếm ngược 120s của VietQR chạy về `00:00` (hết hạn).
  3. Chọn phương thức *"Thanh toán tại cơ sở khám (Offline)"*.
  4. Bấm nút *"Xác nhận đặt lịch khám"*.
  5. **Kết quả:** Nút không phản hồi, bị kẹt lại màn hình thanh toán.
* **Nguyên nhân gốc rễ:**
  Trong hàm `handleProcessPayment`, điều kiện thoát không phân biệt phương thức:
  ```javascript
  const handleProcessPayment = () => {
    if (isExpired) {
      return; // <-- Chặn tất cả các phương thức khi timer QR hết hạn
    }
  ```
* **Cách khắc phục:** Chỉ chặn khi phương thức đang chọn là QR hoặc Ví điện tử:
  ```diff
  - const handleProcessPayment = () => {
  -   if (isExpired) {
  -     return;
  -   }
  + const handleProcessPayment = () => {
  +   const isQrOrWallet = selectedMethod === 'qr' || selectedMethod === 'ewallet';
  +   if (isQrOrWallet && isExpired) {
  +     return;
  +   }
  ```

---

### 🔴 [BUG-02] Lộ toàn bộ hồ sơ bệnh nhân & cho phép hủy lịch tùy tiện trên trang Tra cứu công khai

* **Vị trí code:** [src/pages/LookupPage.jsx: dòng 50 - 55](file:///c:/Users/HUY0406/OneDrive/Desktop/HK5/Web-IS207/MiniProject_IS207_AI/src/pages/LookupPage.jsx#L50-L55)
* **Tác động nghiệp vụ:** Người lạ không cần đăng nhập có thể xem thông tin cá nhân, triệu chứng bệnh lý riêng tư của tất cả bệnh nhân và tùy ý bấm nút "Hủy lịch khám" của người khác.
* **Các bước tái hiện:**
  1. Mở trang `/lookup`.
  2. Gõ đúng một chữ số `"0"` vào ô SĐT rồi nhấn **"Tra cứu ngay"**.
  3. **Kết quả:** Toàn bộ lịch khám trong hệ thống (vì SĐT VN đều có số 0) bị hiển thị công khai.
  4. Bấm nút *"Hủy lịch khám"* -> Lịch hẹn của người khác bị hủy ngay lập tức mà không cần mã xác nhận hay mã phiếu đặt.
* **Nguyên nhân gốc rễ:**
  Hàm lọc sử dụng `includes()` chuỗi con:
  ```javascript
  const matched = allBookings.filter((b) => {
    const bPhone = (b.patientPhone || '').replace(/\D/g, '');
    return bPhone.includes(normalizedQuery); // Nhập 1 số cũng khớp tất cả
  });
  ```
* **Cách khắc phục:**
  1. Bắt buộc nhập đủ số điện thoại (từ 9 đến 11 số) và đổi sang so sánh bằng chính xác (`===`).
  2. Khi hủy lịch trên `/lookup`, yêu cầu nhập kèm **Mã đặt lịch** (ví dụ: `BK202610892`) để xác minh đúng chủ sở hữu phiếu khám.
  ```diff
  + if (normalizedQuery.length < 9) {
  +   setActionMessage({ text: 'Vui lòng nhập đầy đủ số điện thoại (từ 9 đến 11 chữ số)', type: 'error' });
  +   return;
  + }
  - return bPhone.includes(normalizedQuery);
  + return bPhone === normalizedQuery;
  ```

---

### 🔴 [BUG-03] Slot đã bị người khác đặt vẫn được giữ nguyên khi chuyển ngày khám (Double-Booking)

* **Vị trí code:** [src/pages/BookingPage.jsx: dòng 403 - 413](file:///c:/Users/HUY0406/OneDrive/Desktop/HK5/Web-IS207/MiniProject_IS207_AI/src/pages/BookingPage.jsx#L403-L413)
* **Tác động nghiệp vụ:** Gây lỗi đặt trùng lịch (Double Booking). Người dùng đặt được vào một khung giờ mà bệnh nhân khác đã thanh toán trước đó.
* **Các bước tái hiện:**
  1. Chọn Ngày A, chọn khung giờ `08:30` (còn trống).
  2. Khung giờ `08:30` ở Ngày B đã có người đặt trước (`booked`).
  3. Bấm đổi sang Ngày B.
  4. **Kết quả:** `selectedSlot` vẫn giữ nguyên là `'08:30'`, nút *"Tiếp tục thanh toán"* vẫn sáng cho phép bấm chuyển tiếp.
* **Nguyên nhân gốc rễ:**
  Trong hàm `onSelectDate`, hệ thống chỉ kiểm tra slot có nằm trong ca trực của bác sĩ hay không, mà quên kiểm tra slot đó **đã có người đặt ở ngày mới hay chưa**.
* **Cách khắc phục:**
  Tính danh sách các slot đã bị đặt ở ngày mới và tự động reset `selectedSlot` về rỗng nếu bị trùng:
  ```javascript
  onSelectDate={(newDate) => {
    setSelectedDate(newDate);

    // Lọc danh sách khung giờ đã có người đặt tại ngày mới
    const bookedOnNewDate = allBookings
      .filter((b) => 
        b.date === newDate && 
        b.status !== 'cancelled' && 
        ((isDoctor && b.doctorId === id) || (!isDoctor && b.hospitalId === id))
      )
      .map((b) => b.startTime);

    if (isDoctor) {
      const slotsForDate = getDoctorSchedule(id, newDate);
      if (!slotsForDate.includes(selectedSlot) || bookedOnNewDate.includes(selectedSlot) || isSlotPast(newDate, selectedSlot)) {
        setSelectedSlot('');
      }
    } else if (bookedOnNewDate.includes(selectedSlot) || (selectedSlot && isSlotPast(newDate, selectedSlot))) {
      setSelectedSlot('');
    }
  }}
  ```

---

### 🟡 [BUG-04] Khách vãng lai bấm Logo MedSi bị ép chuyển hướng vào `/auth`

* **Vị trí code:** [src/components/Navbar.jsx: dòng 48 - 50](file:///c:/Users/HUY0406/OneDrive/Desktop/HK5/Web-IS207/MiniProject_IS207_AI/src/components/Navbar.jsx#L48-L50)
* **Tác động nghiệp vụ:** Trải nghiệm người dùng không tự nhiên. Khách chưa đăng nhập vào xem trang web, khi bấm vào Logo thương hiệu ở góc trên bên trái bị ép nhảy sang màn hình Đăng nhập thay vì giữ ở trang xem danh sách bác sĩ.
* **Các bước tái hiện:**
  1. Mở trình duyệt ẩn danh vào `http://localhost:5173/explore`.
  2. Click vào biểu tượng Logo **MedSi** trên thanh điều hướng đầu trang.
  3. **Kết quả:** URL bị nhảy sang `http://localhost:5173/auth`.
* **Nguyên nhân gốc rễ:**
  Đường link của logo gán giá trị mặc định khi chưa login là `'/auth'`:
  ```javascript
  <Link
    to={currentUser ? (isAdmin ? '/admin' : isDoctor ? '/doctor' : '/explore') : '/auth'}
  ```
* **Cách khắc phục:** Đổi điểm đến mặc định cho khách vãng lai thành `/explore`:
  ```diff
  - to={currentUser ? (isAdmin ? '/admin' : isDoctor ? '/doctor' : '/explore') : '/auth'}
  + to={currentUser ? (isAdmin ? '/admin' : isDoctor ? '/doctor' : '/explore') : '/explore'}
  ```

---

## 3. CHECKLIST SỬA NHANH CHO NHÓM PHÁT TRIỂN (100% HOÀN THÀNH)

- [x] **Sửa BUG-01:** Cập nhật điều kiện `isQrOrWallet && isExpired` trong `src/pages/PaymentPage.jsx`, gỡ bỏ reset timer ngầm khi chuyển radio phương thức thanh toán.
- [x] **Sửa BUG-02:** Ràng buộc số điện thoại 9-11 chữ số, tích hợp `validatePhoneNumber()` chuẩn hóa đầu số quốc tế `+84` và yêu cầu nhập mã đặt lịch để xác thực hủy khám trong `src/pages/LookupPage.jsx`.
- [x] **Sửa BUG-03:** Reset `selectedSlot` khi chuyển sang ngày có khung giờ đã bị đặt trước, bổ sung chốt chặn 2 lớp (defense-in-depth) tại `handleProceedToPayment` trong `src/pages/BookingPage.jsx`.
- [x] **Sửa BUG-04:** Sửa fallback `to` của Logo MedSi thành `'/explore'` trong `src/components/Navbar.jsx`.
- [x] **Sửa BUG-05:** Cập nhật nhãn phân quyền tài khoản bác sĩ trong `src/pages/AccountPage.jsx`.
- [x] **Sửa BUG-06:** Vô hiệu hóa CSV Formula Injection cho các ô ký tự đặc biệt và bổ sung unit test kiểm chứng trong `src/utils/csvExport.js` & `src/utils/validators.test.js`.
- [x] **Sửa BUG-07:** Bổ sung tính năng Từ chối / Hủy ca khám kèm lý do xác nhận cho Bác sĩ trong `src/pages/DoctorDashboardPage.jsx`.
- [x] **Sửa BUG-08:** Thêm fallback `onError` cho toàn bộ ảnh đại diện bác sĩ, phòng khám, bệnh viện trên toàn hệ thống.
