import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  Sun,
  Sunset,
  Check,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Building2,
  MapPin,
  Save,
  Copy,
  Users,
  Eye,
  CheckCircle,
  RefreshCw,
  Sparkles,
  Info,
  CalendarCheck,
  Award,
  ChevronRight,
  Phone,
  User,
  FileText,
  AlertTriangle,
  Wallet,
  QrCode,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { TIME_SLOTS, getUpcomingDates, isSlotPast } from '../data/slots';
import { DOCTORS } from '../data/doctors';
import { VIETQR_BANKS } from '../data/banks';
import {
  STORAGE_KEYS,
  getStorage,
  setStorage,
  getDoctorSchedule,
  saveDoctorSchedule,
  getDoctorPaymentAccount,
  saveDoctorPaymentAccount,
} from '../utils/storage';
import { formatCurrency } from '../utils/formatCurrency';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

export default function DoctorDashboardPage() {
  const navigate = useNavigate();

  // 1. Current logged-in Doctor
  const [currentUser, setCurrentUser] = useState(() =>
    getStorage(STORAGE_KEYS.CURRENT_USER, null)
  );

  // Link to doctor profile
  const doctorId = currentUser?.doctorId || 'doc_1';
  const doctorInfo = DOCTORS.find((d) => d.id === doctorId) || DOCTORS[0];

  // Up to 14 days in advance (today + 13 days)
  const upcomingDates = getUpcomingDates(14);

  // 2. Active Tab & Selection State
  const [activeTab, setActiveTab] = useState('schedule'); // 'schedule' | 'patients' | 'payment'
  const [selectedDate, setSelectedDate] = useState(() => upcomingDates[0]?.dateStr || '');
  const [registeredSlots, setRegisteredSlots] = useState([]);
  const [allBookings, setAllBookings] = useState([]);

  // Payment Configuration State
  const [paymentBankId, setPaymentBankId] = useState('MB');
  const [paymentAccountNumber, setPaymentAccountNumber] = useState('');
  const [paymentAccountName, setPaymentAccountName] = useState('');
  const [paymentMomoPhone, setPaymentMomoPhone] = useState('');
  const [paymentMomoName, setPaymentMomoName] = useState('');
  const [previewTab, setPreviewTab] = useState('vietqr'); // 'vietqr' | 'momo'

  // Filter for Appointments tab
  const [patientDateFilter, setPatientDateFilter] = useState('all');
  const [patientStatusFilter, setPatientStatusFilter] = useState('all');
  const [selectedBookingDetail, setSelectedBookingDetail] = useState(null);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [doctorCancelReason, setDoctorCancelReason] = useState('Bác sĩ có ca phẫu thuật khẩn cấp');

  // Feedback State
  const [toastMessage, setToastMessage] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Auth verification
  useEffect(() => {
    const user = getStorage(STORAGE_KEYS.CURRENT_USER, null);
    if (!user || user.role !== 'doctor') {
      navigate('/auth', { replace: true });
      return;
    }
    setCurrentUser(user);
    loadBookings();
  }, [navigate]);

  // Load registered slots whenever selectedDate or doctorId changes
  useEffect(() => {
    if (selectedDate && doctorId) {
      const slots = getDoctorSchedule(doctorId, selectedDate);
      setRegisteredSlots(slots || []);
      setHasUnsavedChanges(false);
    }
  }, [selectedDate, doctorId]);

  // Load payment configuration for this doctor
  useEffect(() => {
    if (doctorId) {
      const savedConfig = getDoctorPaymentAccount(doctorId);
      const defaultDoctor = DOCTORS.find((d) => d.id === doctorId)?.paymentAccount;

      const bank = savedConfig?.bankAccount || defaultDoctor?.bankAccount || {
        bankId: 'MB',
        bankName: 'Ngân hàng Quân Đội (MBBank)',
        accountNumber: '0345678999',
        accountName: doctorInfo?.name ? doctorInfo.name.toUpperCase() : 'BAC SI MEDSI',
      };

      const momo = savedConfig?.momoAccount || defaultDoctor?.momoAccount || {
        phoneNumber: doctorInfo?.phone || currentUser?.phone || '0987654321',
        accountName: doctorInfo?.name ? doctorInfo.name.toUpperCase() : 'BAC SI MEDSI',
      };

      setPaymentBankId(bank.bankId || 'MB');
      setPaymentAccountNumber(bank.accountNumber || '');
      setPaymentAccountName(bank.accountName || '');
      setPaymentMomoPhone(momo.phoneNumber || '');
      setPaymentMomoName(momo.accountName || '');
    }
  }, [doctorId, doctorInfo, currentUser]);

  const handleSavePaymentAccount = (e) => {
    e?.preventDefault();
    if (!paymentAccountNumber.trim() || !paymentAccountName.trim() || !paymentMomoPhone.trim()) {
      showToast('Vui lòng điền đầy đủ số tài khoản ngân hàng, tên chủ thẻ và số điện thoại MoMo!', 'error');
      return;
    }

    const bankObj = VIETQR_BANKS.find((b) => b.id === paymentBankId) || {
      id: paymentBankId,
      name: paymentBankId,
    };

    const accountData = {
      doctorId,
      bankAccount: {
        bankId: paymentBankId,
        bankName: bankObj.name,
        accountNumber: paymentAccountNumber.trim(),
        accountName: paymentAccountName.trim().toUpperCase(),
      },
      momoAccount: {
        phoneNumber: paymentMomoPhone.trim(),
        accountName: (paymentMomoName.trim() || paymentAccountName.trim()).toUpperCase(),
      },
    };

    saveDoctorPaymentAccount(doctorId, accountData);
    showToast('Đã lưu cấu hình tài khoản VietQR & Ví MoMo thành công!');
  };

  const loadBookings = () => {
    const bookings = getStorage(STORAGE_KEYS.BOOKINGS, []);
    setAllBookings(bookings);
  };

  // Appointments specifically booked with this doctor
  const doctorBookings = allBookings.filter((b) => b.doctorId === doctorId);

  // Booked slots on the selected date (status not cancelled)
  const bookedSlotsOnDate = doctorBookings.filter(
    (b) => b.date === selectedDate && b.status !== 'cancelled'
  );
  const bookedTimeSlotsMap = new Map();
  bookedSlotsOnDate.forEach((b) => {
    bookedTimeSlotsMap.set(b.startTime, b);
  });

  // Toggle a slot
  const handleToggleSlot = (time) => {
    // If the slot already has a patient booking, prevent disabling directly
    if (bookedTimeSlotsMap.has(time) && registeredSlots.includes(time)) {
      const booking = bookedTimeSlotsMap.get(time);
      showToast(
        `Khung giờ ${time} đã có bệnh nhân ${booking.patientName} đặt khám (Mã: ${booking.code}). Không thể đóng khung giờ này!`,
        'error'
      );
      return;
    }

    let updated;
    if (registeredSlots.includes(time)) {
      updated = registeredSlots.filter((t) => t !== time);
    } else {
      updated = [...registeredSlots, time].sort();
    }
    setRegisteredSlots(updated);
    setHasUnsavedChanges(true);
  };

  // Save current date's schedule
  const handleSaveSchedule = () => {
    saveDoctorSchedule(doctorId, selectedDate, registeredSlots);
    setHasUnsavedChanges(false);
    showToast(`Đã lưu ${registeredSlots.length} khung giờ trống cho ngày ${selectedDate}!`);
  };

  // Quick Action: Select All Morning
  const handleSelectAllMorning = () => {
    const morningTimes = TIME_SLOTS.morning.map((s) => s.time);
    const combined = Array.from(new Set([...registeredSlots, ...morningTimes])).sort();
    setRegisteredSlots(combined);
    setHasUnsavedChanges(true);
    showToast('Đã chọn toàn bộ khung giờ buổi sáng');
  };

  // Quick Action: Select All Afternoon
  const handleSelectAllAfternoon = () => {
    const afternoonTimes = TIME_SLOTS.afternoon.map((s) => s.time);
    const combined = Array.from(new Set([...registeredSlots, ...afternoonTimes])).sort();
    setRegisteredSlots(combined);
    setHasUnsavedChanges(true);
    showToast('Đã chọn toàn bộ khung giờ buổi chiều');
  };

  // Quick Action: Clear all (except booked slots)
  const handleClearAll = () => {
    const bookedTimes = Array.from(bookedTimeSlotsMap.keys());
    setRegisteredSlots(bookedTimes);
    setHasUnsavedChanges(true);
    if (bookedTimes.length > 0) {
      showToast('Đã bỏ chọn các khung giờ chưa có người đặt', 'info');
    } else {
      showToast('Đã xóa tất cả khung giờ của ngày này', 'info');
    }
  };

  // Quick Action: Copy to Next 7 Days
  const handleCopyToNextDays = (daysCount = 7) => {
    const todayIndex = upcomingDates.findIndex((d) => d.dateStr === selectedDate);
    const startIndex = todayIndex >= 0 ? todayIndex + 1 : 1;
    const targetDates = upcomingDates.slice(startIndex, startIndex + daysCount);

    let countSaved = 0;
    targetDates.forEach((d) => {
      saveDoctorSchedule(doctorId, d.dateStr, registeredSlots);
      countSaved++;
    });

    setCopyModalOpen(false);
    showToast(`Đã sao chép lịch làm việc sang ${countSaved} ngày tiếp theo thành công!`);
  };

  // Handle appointment status update
  const handleUpdateBookingStatus = (bookingId, newStatus) => {
    const updated = allBookings.map((b) => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return b;
    });
    setStorage(STORAGE_KEYS.BOOKINGS, updated);
    setAllBookings(updated);
    showToast(
      `Đã cập nhật trạng thái lịch khám sang "${
        newStatus === 'completed' ? 'Hoàn thành khám' : newStatus === 'approved' ? 'Đã duyệt' : newStatus
      }"!`
    );
    if (selectedBookingDetail && selectedBookingDetail.id === bookingId) {
      setSelectedBookingDetail((prev) => ({ ...prev, status: newStatus }));
    }
  };

  // Handle appointment cancellation/rejection by doctor
  const handleConfirmCancelBooking = () => {
    if (!cancellingBooking) return;
    const reason = doctorCancelReason.trim() || 'Bác sĩ có ca phẫu thuật khẩn cấp / bận đột xuất';
    const updated = allBookings.map((b) => {
      if (b.id === cancellingBooking.id) {
        return {
          ...b,
          status: 'cancelled',
          cancelReason: reason,
          cancelledBy: 'doctor',
          cancelledAt: new Date().toISOString(),
        };
      }
      return b;
    });
    setStorage(STORAGE_KEYS.BOOKINGS, updated);
    setAllBookings(updated);
    showToast(`Đã từ chối/hủy lịch khám #${cancellingBooking.code} thành công!`, 'info');
    if (selectedBookingDetail && selectedBookingDetail.id === cancellingBooking.id) {
      setSelectedBookingDetail((prev) => ({
        ...prev,
        status: 'cancelled',
        cancelReason: reason,
      }));
    }
    setCancellingBooking(null);
  };

  // Filtered appointments for Tab 2
  const filteredAppointments = doctorBookings.filter((b) => {
    if (patientDateFilter !== 'all' && b.date !== patientDateFilter) return false;
    if (patientStatusFilter !== 'all' && b.status !== patientStatusFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold flex items-center gap-2.5 animate-slide-up ${
            toastMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : toastMessage.type === 'info'
              ? 'bg-sky-50 border-sky-200 text-sky-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : toastMessage.type === 'info' ? (
            <Info className="w-5 h-5 text-sky-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Top Banner / Doctor Identity Card */}
      <div className="bg-white border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={doctorInfo.avatar}
                  alt={doctorInfo.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80';
                  }}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shadow-emerald-500/10"
                />
                <span className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-extrabold uppercase rounded-lg shadow-xs">
                  Bác sĩ
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {doctorInfo.name}
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium mt-1">
                  <span className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                    <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                    {doctorInfo.specialtyName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {doctorInfo.workplace}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {doctorInfo.city}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex-1 md:flex-initial p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center min-w-[120px]">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide block">
                  Lịch hẹn đã đặt
                </span>
                <span className="text-xl font-black text-emerald-950 mt-0.5 block">
                  {doctorBookings.filter((b) => b.status !== 'cancelled').length}
                </span>
              </div>
              <div className="flex-1 md:flex-initial p-3 rounded-2xl bg-sky-50/70 border border-sky-100 text-center min-w-[120px]">
                <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wide block">
                  Ca khám hôm nay
                </span>
                <span className="text-xl font-black text-sky-950 mt-0.5 block">
                  {
                    doctorBookings.filter(
                      (b) => b.date === upcomingDates[0]?.dateStr && b.status !== 'cancelled'
                    ).length
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Đăng ký khung giờ làm việc</span>
            </button>

            <button
              onClick={() => setActiveTab('patients')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'patients'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Danh sách bệnh nhân hẹn khám</span>
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-md text-xs font-bold ${
                  activeTab === 'patients'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {doctorBookings.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('payment')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'payment'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Tài khoản thanh toán</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* ================= TAB 1: SCHEDULE CONFIGURATION ================= */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            {/* Guide Info Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-100/90 flex items-start gap-3 shadow-xs">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-950 leading-relaxed">
                <span className="font-bold text-sm block mb-0.5">
                  Quy tắc đăng ký lịch làm việc:
                </span>
                Quý Bác sĩ vui lòng chọn ngày và bấm chọn các khung giờ có thể tiếp nhận bệnh nhân.
                Khi Bệnh nhân vào trang đặt lịch khám,{' '}
                <strong>hệ thống sẽ chỉ hiển thị những khung giờ mà Bác sĩ đã kích hoạt</strong>.
                Các khung giờ đã có bệnh nhân đặt hẹn sẽ được bảo vệ tự động.
              </div>
            </div>

            {/* 1. Date Selector Pills */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between mb-3.5">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <CalendarIcon className="w-4 h-4 text-emerald-600" />
                  <span>Chọn ngày làm việc cần thiết lập (14 ngày tới)</span>
                </label>
                <span className="text-xs text-slate-500 font-medium hidden sm:block">
                  Chỉ cho phép thiết lập từ hôm nay trở đi
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {upcomingDates.map((d) => {
                  const isSelected = selectedDate === d.dateStr;
                  const dateSchedule = getDoctorSchedule(doctorId, d.dateStr);
                  const slotCount = dateSchedule.length;
                  const bookedCount = doctorBookings.filter(
                    (b) => b.date === d.dateStr && b.status !== 'cancelled'
                  ).length;

                  return (
                    <button
                      key={d.dateStr}
                      type="button"
                      onClick={() => setSelectedDate(d.dateStr)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/90 text-emerald-950 shadow-md shadow-emerald-500/15 ring-2 ring-emerald-500'
                          : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span
                        className={`text-[11px] font-bold ${
                          isSelected ? 'text-emerald-700' : 'text-slate-500'
                        }`}
                      >
                        {d.label}
                      </span>
                      <span
                        className={`text-base font-extrabold mt-0.5 ${
                          isSelected ? 'text-emerald-950' : 'text-slate-800'
                        }`}
                      >
                        {d.displayDate}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-medium mt-0.5">
                        {d.dayShort}
                      </span>

                      {/* Pill Badge of Active Slots */}
                      <div className="mt-1.5 flex items-center gap-1">
                        {slotCount > 0 ? (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {slotCount} slot
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Trống</span>
                        )}
                        {bookedCount > 0 && (
                          <span className="w-2 h-2 rounded-full bg-sky-500" title={`${bookedCount} bệnh nhân đặt`} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Slot Matrix & Actions */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
              {/* Header Bar of Slot Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    <span>
                      Khung giờ tiếp nhận ngày: <span className="text-emerald-700 font-black">{selectedDate}</span>
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Đã chọn <strong className="text-emerald-600">{registeredSlots.length}</strong> khung giờ khả dụng ({bookedSlotsOnDate.length} ca đã có người đặt)
                  </p>
                </div>

                {/* Batch Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllMorning}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    + Chọn tất cả sáng
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectAllAfternoon}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    + Chọn tất cả chiều
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    Bỏ chọn
                  </button>
                  <button
                    type="button"
                    onClick={() => setCopyModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép lịch...</span>
                  </button>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-600" />
                  Đang mở nhận lịch
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-sky-500" />
                  Đã có bệnh nhân đặt hẹn
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-200 border border-slate-300" />
                  Chưa mở (Đóng)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-300 opacity-60" />
                  Đã qua giờ khám
                </span>
              </div>

              {/* MORNING SLOTS */}
              <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 mb-3">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Buổi sáng (08:00 - 11:30)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                  {TIME_SLOTS.morning.map((slot) => {
                    const isPast = isSlotPast(selectedDate, slot.time);
                    const isBooked = bookedTimeSlotsMap.has(slot.time);
                    const isRegistered = registeredSlots.includes(slot.time);
                    const booking = bookedTimeSlotsMap.get(slot.time);

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => handleToggleSlot(slot.time)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 select-none cursor-pointer ${
                          isPast
                            ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
                            : isBooked
                            ? 'bg-sky-50 border-sky-400 text-sky-900 shadow-sm ring-2 ring-sky-300'
                            : isRegistered
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-300'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50'
                        }`}
                        title={
                          isBooked
                            ? `Bệnh nhân: ${booking.patientName} (${booking.code})`
                            : isRegistered
                            ? 'Bấm để tắt khung giờ này'
                            : 'Bấm để mở khung giờ này'
                        }
                      >
                        <span className="text-sm">{slot.time}</span>
                        {isPast ? (
                          <span className="text-[9px] font-normal text-slate-400">Đã qua</span>
                        ) : isBooked ? (
                          <span className="text-[9px] font-extrabold text-sky-700 truncate max-w-[85px]">
                            {booking.patientName}
                          </span>
                        ) : isRegistered ? (
                          <span className="text-[9px] font-normal flex items-center gap-0.5 text-emerald-100">
                            <Check className="w-3 h-3 text-white" /> Mở lịch
                          </span>
                        ) : (
                          <span className="text-[9px] font-normal text-slate-400">Chưa mở</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AFTERNOON SLOTS */}
              <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 mb-3">
                  <Sunset className="w-4 h-4 text-indigo-500" />
                  <span>Buổi chiều (13:30 - 16:30)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {TIME_SLOTS.afternoon.map((slot) => {
                    const isPast = isSlotPast(selectedDate, slot.time);
                    const isBooked = bookedTimeSlotsMap.has(slot.time);
                    const isRegistered = registeredSlots.includes(slot.time);
                    const booking = bookedTimeSlotsMap.get(slot.time);

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => handleToggleSlot(slot.time)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 select-none cursor-pointer ${
                          isPast
                            ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
                            : isBooked
                            ? 'bg-sky-50 border-sky-400 text-sky-900 shadow-sm ring-2 ring-sky-300'
                            : isRegistered
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-300'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50'
                        }`}
                        title={
                          isBooked
                            ? `Bệnh nhân: ${booking.patientName} (${booking.code})`
                            : isRegistered
                            ? 'Bấm để tắt khung giờ này'
                            : 'Bấm để mở khung giờ này'
                        }
                      >
                        <span className="text-sm">{slot.time}</span>
                        {isPast ? (
                          <span className="text-[9px] font-normal text-slate-400">Đã qua</span>
                        ) : isBooked ? (
                          <span className="text-[9px] font-extrabold text-sky-700 truncate max-w-[85px]">
                            {booking.patientName}
                          </span>
                        ) : isRegistered ? (
                          <span className="text-[9px] font-normal flex items-center gap-0.5 text-emerald-100">
                            <Check className="w-3 h-3 text-white" /> Mở lịch
                          </span>
                        ) : (
                          <span className="text-[9px] font-normal text-slate-400">Chưa mở</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Save Button Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  {hasUnsavedChanges ? (
                    <span className="text-amber-600 font-bold flex items-center gap-1.5 animate-pulse">
                      <AlertTriangle className="w-4 h-4" />
                      Có thay đổi chưa lưu cho ngày {selectedDate}
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Lịch khám ngày này đã được lưu vào hệ thống
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSaveSchedule}
                  className="px-6 py-3 rounded-xl bg-emerald-600 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu lịch làm việc ngày {selectedDate}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PATIENT APPOINTMENTS ================= */}
        {activeTab === 'patients' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Lọc theo ngày khám
                  </label>
                  <select
                    value={patientDateFilter}
                    onChange={(e) => setPatientDateFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="all">Tất cả các ngày ({doctorBookings.length})</option>
                    {upcomingDates.map((d) => (
                      <option key={d.dateStr} value={d.dateStr}>
                        {d.label} ({d.displayDate})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={patientStatusFilter}
                    onChange={(e) => setPatientStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ xác nhận</option>
                    <option value="approved">Đã xác nhận</option>
                    <option value="completed">Đã hoàn thành khám</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Tìm thấy <strong>{filteredAppointments.length}</strong> ca khám phù hợp
              </div>
            </div>

            {/* Appointment Cards List */}
            {filteredAppointments.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200/90 text-center shadow-sm">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">Chưa có lịch hẹn nào</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Hiện chưa có bệnh nhân nào đặt lịch khám với tiêu chí lọc đã chọn. Hãy mở thêm khung giờ trống để bệnh nhân đặt hẹn!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAppointments.map((bk) => (
                  <div
                    key={bk.id}
                    className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
                  >
                    <div>
                      {/* Top Info Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-mono font-bold">
                            {bk.code}
                          </span>
                          <StatusBadge status={bk.status} />
                        </div>
                        <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
                          {bk.date} ({bk.startTime} - {bk.endTime || '30p'})
                        </span>
                      </div>

                      {/* Patient Info */}
                      <div className="space-y-1.5">
                        <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                          <User className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{bk.patientName}</span>
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{bk.patientPhone}</span>
                        </p>
                        {bk.symptoms && (
                          <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                            <span className="font-bold text-slate-900 block mb-0.5">Triệu chứng ban đầu:</span>
                            {bk.symptoms}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedBookingDetail(bk)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem chi tiết</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {(bk.status === 'pending' || bk.status === 'approved') && (
                          <button
                            type="button"
                            onClick={() => {
                              setCancellingBooking(bk);
                              setDoctorCancelReason('Bác sĩ có ca phẫu thuật khẩn cấp');
                            }}
                            className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                          >
                            {bk.status === 'pending' ? 'Từ chối' : 'Hủy ca'}
                          </button>
                        )}
                        {bk.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateBookingStatus(bk.id, 'approved')}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                          >
                            Xác nhận lịch
                          </button>
                        )}
                        {bk.status === 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateBookingStatus(bk.id, 'completed')}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Hoàn thành khám</span>
                          </button>
                        )}
                        {bk.status === 'completed' && (
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Đã xong
                          </span>
                        )}
                        {bk.status === 'cancelled' && (
                          <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                            Đã hủy
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: PAYMENT ACCOUNTS CONFIGURATION ================= */}
        {activeTab === 'payment' && (
          <div className="space-y-6">
            {/* Guide Info Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-sky-50 to-teal-50 border border-emerald-100 flex items-start gap-3 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-sm text-slate-900 block mb-0.5">
                  Cấu hình nhận thanh toán trực tiếp (VietQR & Ví MoMo bên thứ 3)
                </span>
                Khi bệnh nhân đặt lịch hẹn khám với Bác sĩ, hệ thống sẽ sử dụng trực tiếp tài khoản Ngân hàng (chuẩn VietQR) và Ví điện tử MoMo dưới đây để bệnh nhân quét mã chuyển tiền. Vui lòng kiểm tra kỹ số tài khoản và số điện thoại trước khi lưu.
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Form Input (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <form onSubmit={handleSavePaymentAccount} className="space-y-6">
                  {/* Section 1: VietQR Bank Account */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                      <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">
                          1. Tài khoản Ngân hàng nhận tiền (VietQR 24/7)
                        </h4>
                        <p className="text-xs text-slate-500">
                          Tự động sinh mã VietQR chuyển tiền vào tài khoản ngân hàng
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3.5 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Ngân hàng thụ hưởng <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={paymentBankId}
                          onChange={(e) => setPaymentBankId(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-colors"
                        >
                          {VIETQR_BANKS.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name} ({b.id})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Số tài khoản ngân hàng <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={paymentAccountNumber}
                          onChange={(e) => setPaymentAccountNumber(e.target.value)}
                          placeholder="Ví dụ: 0345678999"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Tên chủ tài khoản (In hoa không dấu) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={paymentAccountName}
                          onChange={(e) => setPaymentAccountName(e.target.value.toUpperCase())}
                          placeholder="Ví dụ: NGUYEN THI BAY"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-colors uppercase"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: MoMo Wallet Account */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                      <div className="w-9 h-9 rounded-xl bg-pink-50 text-[#d82d8b] flex items-center justify-center">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">
                          2. Tài khoản Ví Điện Tử MoMo nhận tiền
                        </h4>
                        <p className="text-xs text-slate-500">
                          Hỗ trợ bệnh nhân quét mã và chuyển tiền nhanh qua ứng dụng MoMo
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3.5 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Số điện thoại đăng ký MoMo <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={paymentMomoPhone}
                          onChange={(e) => setPaymentMomoPhone(e.target.value)}
                          placeholder="Ví dụ: 0987654321"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Tên hiển thị chủ Ví MoMo (In hoa)
                        </label>
                        <input
                          type="text"
                          value={paymentMomoName}
                          onChange={(e) => setPaymentMomoName(e.target.value.toUpperCase())}
                          placeholder="Ví dụ: NGUYEN THI BAY"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Action */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-emerald-600 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Lưu cấu hình thanh toán</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Live Preview (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      <span>Xem trước mã thanh toán thực tế</span>
                    </h4>
                  </div>

                  {/* Toggle Preview View */}
                  <div className="flex p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPreviewTab('vietqr')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        previewTab === 'vietqr'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Mã VietQR Ngân Hàng
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('momo')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        previewTab === 'momo'
                          ? 'bg-white text-[#d82d8b] shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Mã Cổng Ví MoMo
                    </button>
                  </div>

                  {/* VietQR Preview */}
                  {previewTab === 'vietqr' && (
                    <div className="space-y-4 text-center animate-fade-in">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100 inline-block mb-3">
                          VietQR Chuẩn Napas 24/7
                        </span>

                        <div className="inline-block p-2 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-[220px]">
                          <img
                            src={`https://img.vietqr.io/image/${paymentBankId}-${paymentAccountNumber || '0345678999'}-compact2.png?accountName=${encodeURIComponent(
                              paymentAccountName || doctorInfo.name
                            )}`}
                            alt="VietQR Bác sĩ"
                            className="w-48 h-auto mx-auto rounded-lg"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=VIETQR_${paymentBankId}_${paymentAccountNumber}`;
                            }}
                          />
                        </div>

                        <div className="mt-3 text-xs space-y-1 text-slate-600">
                          <p>
                            Ngân hàng:{' '}
                            <strong className="text-slate-900">
                              {VIETQR_BANKS.find((b) => b.id === paymentBankId)?.name || paymentBankId}
                            </strong>
                          </p>
                          <p>
                            STK:{' '}
                            <strong className="font-mono text-slate-900">
                              {paymentAccountNumber || 'Chưa nhập'}
                            </strong>
                          </p>
                          <p>
                            Chủ TK:{' '}
                            <strong className="text-slate-900 uppercase">
                              {paymentAccountName || doctorInfo.name}
                            </strong>
                          </p>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400">
                        Bác sĩ có thể dùng ứng dụng ngân hàng bất kỳ trên điện thoại để quét thử kiểm tra thông tin.
                      </p>
                    </div>
                  )}

                  {/* MoMo QR Preview */}
                  {previewTab === 'momo' && (
                    <div className="space-y-4 text-center animate-fade-in">
                      <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100">
                        <span className="text-[11px] font-bold text-[#d82d8b] bg-pink-100/70 px-2.5 py-0.5 rounded-full border border-pink-200 inline-block mb-3">
                          Ví Điện Tử MoMo (Quét App MoMo Thật)
                        </span>

                        <div className="inline-block p-2 bg-white rounded-2xl shadow-sm border border-pink-200 max-w-[220px]">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                              `2|99|${paymentMomoPhone || '0987654321'}|${paymentMomoName || paymentAccountName || 'BAC SI MEDSI'}||0|0|0|MEDSI_BACSI_TEST`
                            )}`}
                            alt="MoMo QR Bác sĩ"
                            className="w-48 h-48 mx-auto rounded-lg"
                          />
                        </div>

                        <div className="mt-3 text-xs space-y-1 text-slate-600">
                          <p>
                            Ví điện tử: <strong className="text-[#d82d8b]">MoMo</strong>
                          </p>
                          <p>
                            Số điện thoại:{' '}
                            <strong className="font-mono text-slate-900">
                              {paymentMomoPhone || 'Chưa nhập'}
                            </strong>
                          </p>
                          <p>
                            Chủ ví:{' '}
                            <strong className="text-slate-900 uppercase">
                              {paymentMomoName || paymentAccountName || doctorInfo.name}
                            </strong>
                          </p>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400">
                        Bác sĩ mở ứng dụng MoMo trên điện thoại và dùng tính năng quét mã QR để quét thử kiểm tra.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Copy Modal */}
      {copyModalOpen && (
        <Modal
          isOpen={copyModalOpen}
          onClose={() => setCopyModalOpen(false)}
          title="Sao chép khung giờ làm việc"
        >
          <div className="space-y-4 text-xs text-slate-600">
            <p>
              Bạn đang chọn sao chép <strong className="text-emerald-700">{registeredSlots.length} khung giờ</strong>{' '}
              của ngày <strong>{selectedDate}</strong> sang các ngày tiếp theo:
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleCopyToNextDays(1)}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 font-bold text-slate-800 hover:text-emerald-900 transition-colors text-center cursor-pointer"
              >
                Sao chép sang Ngày mai
              </button>
              <button
                type="button"
                onClick={() => handleCopyToNextDays(3)}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 font-bold text-slate-800 hover:text-emerald-900 transition-colors text-center cursor-pointer"
              >
                Sao chép 3 ngày tới
              </button>
              <button
                type="button"
                onClick={() => handleCopyToNextDays(7)}
                className="col-span-2 p-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 font-extrabold text-emerald-900 transition-colors text-center cursor-pointer"
              >
                Sao chép toàn bộ 7 ngày tiếp theo
              </button>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              Lưu ý: Thao tác này sẽ áp dụng các khung giờ đã chọn cho các ngày tới. Các lịch hẹn bệnh nhân đã đặt trước đó vẫn được bảo toàn.
            </p>
          </div>
        </Modal>
      )}

      {/* Appointment Detail Modal */}
      {selectedBookingDetail && (
        <Modal
          isOpen={Boolean(selectedBookingDetail)}
          onClose={() => setSelectedBookingDetail(null)}
          title={`Chi tiết lịch khám #${selectedBookingDetail.code}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Mã cuộc hẹn</span>
                <span className="text-sm font-mono font-extrabold text-slate-900">{selectedBookingDetail.code}</span>
              </div>
              <StatusBadge status={selectedBookingDetail.status} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Bệnh nhân:</span>
                <span className="font-bold text-slate-900">{selectedBookingDetail.patientName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Số điện thoại:</span>
                <span className="font-bold text-slate-900">{selectedBookingDetail.patientPhone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Ngày khám:</span>
                <span className="font-bold text-slate-900">{selectedBookingDetail.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Khung giờ:</span>
                <span className="font-bold text-emerald-700">
                  {selectedBookingDetail.startTime} - {selectedBookingDetail.endTime}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Chi phí khám:</span>
                <span className="font-bold text-slate-900">{formatCurrency(selectedBookingDetail.totalAmount || 330000)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Thanh toán:</span>
                <span className="font-bold text-slate-900">
                  {selectedBookingDetail.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán (Tại viện)'}
                </span>
              </div>
            </div>

            {selectedBookingDetail.symptoms && (
              <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-amber-950">
                <span className="font-bold block mb-1">Mô tả triệu chứng bệnh nhân:</span>
                {selectedBookingDetail.symptoms}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              {(selectedBookingDetail.status === 'pending' || selectedBookingDetail.status === 'approved') && (
                <button
                  type="button"
                  onClick={() => {
                    setCancellingBooking(selectedBookingDetail);
                    setDoctorCancelReason('Bác sĩ có ca phẫu thuật khẩn cấp');
                  }}
                  className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl"
                >
                  {selectedBookingDetail.status === 'pending' ? 'Từ chối lịch' : 'Hủy ca khám'}
                </button>
              )}
              {selectedBookingDetail.status === 'pending' && (
                <button
                  type="button"
                  onClick={() => handleUpdateBookingStatus(selectedBookingDetail.id, 'approved')}
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs"
                >
                  Xác nhận lịch
                </button>
              )}
              {selectedBookingDetail.status === 'approved' && (
                <button
                  type="button"
                  onClick={() => handleUpdateBookingStatus(selectedBookingDetail.id, 'completed')}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                >
                  Xác nhận đã khám xong
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedBookingDetail(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Doctor Cancel / Reject Modal */}
      {cancellingBooking && (
        <Modal
          isOpen={Boolean(cancellingBooking)}
          onClose={() => setCancellingBooking(null)}
          title="Từ chối / Hủy Lịch Khám"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Bạn đang thực hiện từ chối / hủy lịch hẹn <strong>#{cancellingBooking.code}</strong> của bệnh nhân{' '}
                <strong>{cancellingBooking.patientName}</strong> ngày <strong>{cancellingBooking.date}</strong> lúc{' '}
                <strong>{cancellingBooking.startTime}</strong>.
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5 uppercase">
                Lý do từ chối / hủy lịch (*):
              </label>
              <textarea
                rows={3}
                value={doctorCancelReason}
                onChange={(e) => setDoctorCancelReason(e.target.value)}
                placeholder="Nhập lý do bác sĩ không thể tiếp nhận ca khám này..."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm focus:outline-hidden focus:border-sky-500 text-slate-800"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelBooking}
                className="px-4 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
              >
                Xác nhận Hủy lịch
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
