import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  QrCode,
  CreditCard,
  Wallet,
  Building,
  CheckCircle2,
  ShieldCheck,
  Clock,
  ArrowRight,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  Lock,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  STORAGE_KEYS,
  getStorage,
  setStorage,
  removeStorage,
  getDoctorPaymentAccount,
} from '../utils/storage';
import { DOCTORS } from '../data/doctors';
import { formatCurrency } from '../utils/formatCurrency';
import { generateBookingCode, generateUniqueId } from '../utils/generateCode';
import { isSlotPast } from '../data/slots';

export default function PaymentPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('qr');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [conflictError, setConflictError] = useState('');

  // 120s Countdown Timer (2 minutes) for VietQR and MoMo
  const [timeLeft, setTimeLeft] = useState(120);
  const [isExpired, setIsExpired] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  // Load draft from localStorage
  useEffect(() => {
    const savedDraft = getStorage(STORAGE_KEYS.BOOKING_DRAFT, null);
    if (!savedDraft) {
      navigate('/explore');
      return;
    }
    setDraft(savedDraft);
  }, [navigate]);

  // Countdown Timer Effect for 'qr' and 'ewallet'
  useEffect(() => {
    if ((selectedMethod !== 'qr' && selectedMethod !== 'ewallet') || isExpired || isSuccessModalOpen) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedMethod, isExpired, isSuccessModalOpen]);

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleResetTimer = () => {
    setTimeLeft(120);
    setIsExpired(false);
  };

  const handleCopyText = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  if (!draft) return null;

  // Retrieve Doctor Payment configuration (Customized in storage > DOCTORS default > Fallback clinic)
  const savedConfig = draft.doctorId ? getDoctorPaymentAccount(draft.doctorId) : null;
  const defaultDoctor = draft.doctorId ? DOCTORS.find((d) => d.id === draft.doctorId)?.paymentAccount : null;

  const activeBank = savedConfig?.bankAccount || defaultDoctor?.bankAccount || {
    bankId: 'MB',
    bankName: 'Ngân hàng Quân Đội (MBBank)',
    accountNumber: '0345678999',
    accountName: draft.providerName ? draft.providerName.toUpperCase() : 'PHONG KHAM MEDSI',
  };

  const activeMomo = savedConfig?.momoAccount || defaultDoctor?.momoAccount || {
    phoneNumber: '0987654321',
    accountName: draft.providerName ? draft.providerName.toUpperCase() : 'PHONG KHAM MEDSI',
  };

  // Generate transfer memo & URLs
  const cleanPhone = (draft.patientPhone || 'KHAM').replace(/\D/g, '');
  const cleanDate = (draft.date || '').replace(/-/g, '');
  const transferContent = `MEDSI ${cleanPhone || 'KHAM'} ${cleanDate}`;

  const vietQrUrl = `https://img.vietqr.io/image/${activeBank.bankId}-${activeBank.accountNumber}-compact2.png?amount=${draft.totalAmount}&addInfo=${encodeURIComponent(
    transferContent
  )}&accountName=${encodeURIComponent(activeBank.accountName)}`;

  const momoPayload = `2|99|${activeMomo.phoneNumber}|${activeMomo.accountName}||0|0|${draft.totalAmount}|MEDSI_${cleanDate}`;
  const momoQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(momoPayload)}`;
  const momoDeepLink = `momo://?action=pay&amount=${draft.totalAmount}&phone=${activeMomo.phoneNumber}`;

  const paymentMethods = [
    {
      id: 'qr',
      title: 'Quét mã VietQR (Ngân hàng)',
      desc: 'Quét bằng app của hơn 40 ngân hàng, chuyển khoản tức thì 24/7.',
      icon: QrCode,
      color: 'text-sky-600 bg-sky-50',
    },
    {
      id: 'ewallet',
      title: 'Ví điện tử MoMo (Bên thứ 3)',
      desc: 'Cổng thanh toán MoMo P2P: Quét mã QR hoặc mở ứng dụng MoMo.',
      icon: Wallet,
      color: 'text-[#d82d8b] bg-pink-50',
    },
    {
      id: 'atm',
      title: 'Thẻ ATM nội địa / Internet Banking',
      desc: 'Hỗ trợ thẻ ATM của hơn 40 ngân hàng tại Việt Nam qua cổng Napas.',
      icon: CreditCard,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      id: 'onsite',
      title: 'Thanh toán tại cơ sở khám (Offline)',
      desc: 'Đến quầy tiếp nhận tại bệnh viện/phòng khám để thanh toán trực tiếp.',
      icon: Building,
      color: 'text-amber-600 bg-amber-50',
    },
  ];

  const handleProcessPayment = () => {
    const isQrOrWallet = selectedMethod === 'qr' || selectedMethod === 'ewallet';
    if (isQrOrWallet && isExpired) {
      return;
    }

    setIsProcessing(true);
    setConflictError('');

    // Simulate 900ms payment gateway verification
    setTimeout(() => {
      // Re-verify that the slot has not passed
      if (isSlotPast(draft.date, draft.startTime)) {
        setIsProcessing(false);
        setConflictError(
          `Khung giờ khám ${draft.startTime} ngày ${draft.date} đã trôi qua. Vui lòng quay lại để chọn khung giờ khác!`
        );
        return;
      }

      // Re-verify that the slot is not taken before creating booking
      const existingBookings = getStorage(STORAGE_KEYS.BOOKINGS, []);
      const isSlotConflict = existingBookings.some(
        (b) =>
          b.date === draft.date &&
          b.startTime === draft.startTime &&
          b.status !== 'cancelled' &&
          ((draft.doctorId && b.doctorId === draft.doctorId) ||
            (draft.hospitalId &&
              b.hospitalId === draft.hospitalId &&
              (!draft.examTypeId || !b.examTypeId || b.examTypeId === draft.examTypeId)))
      );

      if (isSlotConflict) {
        setIsProcessing(false);
        setConflictError(
          `Rất tiếc! Khung giờ ${draft.startTime} ngày ${draft.date} vừa có người khác đặt trước. Vui lòng quay lại để chọn khung giờ khác!`
        );
        return;
      }

      const isPaidOnline = selectedMethod !== 'onsite';
      const newBookingId = generateUniqueId('bk');
      const bookingCode = generateBookingCode();

      // Determine human-readable payment method name
      const paymentMethodName =
        selectedMethod === 'qr'
          ? 'Mã VietQR'
          : selectedMethod === 'ewallet'
          ? 'Ví điện tử MoMo'
          : selectedMethod === 'atm'
          ? 'Thẻ ATM Nội địa'
          : 'Thanh toán tại cơ sở';

      // 1. Create Booking Object
      const newBooking = {
        id: newBookingId,
        code: bookingCode,
        userId: draft.userId,
        patientProfileId: draft.patientProfileId,
        patientName: draft.patientName,
        patientPhone: draft.patientPhone,
        patientDob: draft.patientDob,
        patientGender: draft.patientGender,
        relationship: draft.relationship,
        bookingType: draft.bookingType,
        doctorId: draft.doctorId,
        hospitalId: draft.hospitalId,
        examTypeId: draft.examTypeId,
        providerName: draft.providerName,
        providerAddress: draft.providerAddress,
        specialtyName: draft.specialtyName,
        city: draft.city,
        date: draft.date,
        startTime: draft.startTime,
        endTime: draft.endTime,
        symptoms: draft.symptoms,
        examFee: draft.examFee,
        serviceFee: draft.serviceFee,
        totalAmount: draft.totalAmount,
        paymentMethod: selectedMethod,
        paymentMethodName,
        paymentStatus: isPaidOnline ? 'paid' : 'unpaid',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage: bookings
      existingBookings.unshift(newBooking);
      setStorage(STORAGE_KEYS.BOOKINGS, existingBookings);

      // 2. Create Payment Object
      const newPayment = {
        id: generateUniqueId('pay'),
        bookingId: newBookingId,
        bookingCode: bookingCode,
        method: paymentMethodName,
        examFee: draft.examFee,
        serviceFee: draft.serviceFee,
        totalAmount: draft.totalAmount,
        status: isPaidOnline ? 'paid' : 'pending',
        recipientBank: selectedMethod === 'qr' ? activeBank : null,
        recipientMomo: selectedMethod === 'ewallet' ? activeMomo : null,
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage: payments
      const existingPayments = getStorage(STORAGE_KEYS.PAYMENTS, []);
      existingPayments.unshift(newPayment);
      setStorage(STORAGE_KEYS.PAYMENTS, existingPayments);

      // Clear draft
      removeStorage(STORAGE_KEYS.BOOKING_DRAFT);

      setIsProcessing(false);
      setCreatedBooking(newBooking);
      setIsSuccessModalOpen(true);
    }, 950);
  };

  const handleGoToAccount = () => {
    setIsSuccessModalOpen(false);
    navigate('/account?tab=bookings');
  };

  const bookingBackUrl =
    draft.bookingType === 'doctor'
      ? `/booking/doctor/${draft.doctorId}`
      : `/booking/hospital/${draft.hospitalId}`;

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100 inline-block mb-2">
            Bước cuối: Thanh toán an toàn
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Xác nhận & Hoàn tất đặt lịch
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Giao dịch mã hóa an toàn • Đặt chỗ được giữ trong thời gian thanh toán
          </p>
        </div>

        {/* Conflict Error Message */}
        {conflictError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 animate-fade-in shadow-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{conflictError}</span>
            </div>
            <Link
              to={bookingBackUrl}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors"
            >
              Chọn lại giờ
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* LEFT: Choose Payment Method & Gateways (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-sky-600" />
                <span>Phương thức thanh toán</span>
              </h3>

              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedMethod === method.id;

                  return (
                    <label
                      key={method.id}
                      className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? method.id === 'ewallet'
                            ? 'border-[#d82d8b] bg-pink-50/40 ring-2 ring-[#d82d8b] shadow-xs'
                            : 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-500 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={isSelected}
                        onChange={() => setSelectedMethod(method.id)}
                        className={`mt-1 cursor-pointer ${
                          method.id === 'ewallet'
                            ? 'text-[#d82d8b] focus:ring-[#d82d8b]'
                            : 'text-sky-600 focus:ring-sky-500'
                        }`}
                      />

                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${method.color}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold text-slate-900 block">
                          {method.title}
                        </span>
                        <span className="text-xs text-slate-500 leading-relaxed block mt-0.5">
                          {method.desc}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* ================= METHOD 1: VIETQR GATEWAY ================= */}
              {selectedMethod === 'qr' && (
                <div className="mt-6 pt-5 border-t border-slate-100 animate-fade-in space-y-4">
                  {/* Countdown Timer Header */}
                  <div
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${
                      isExpired
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : timeLeft <= 30
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-sky-50 border-sky-100 text-sky-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <Clock
                        className={`w-4 h-4 ${
                          isExpired
                            ? 'text-rose-600'
                            : timeLeft <= 30
                            ? 'text-amber-600 animate-pulse'
                            : 'text-sky-600'
                        }`}
                      />
                      <span>
                        {isExpired ? 'Đã hết thời hạn thanh toán' : 'Thời gian giữ chỗ & thanh toán:'}
                      </span>
                    </div>
                    <div
                      className={`font-mono text-base font-black px-2.5 py-0.5 rounded-lg ${
                        isExpired
                          ? 'bg-rose-200 text-rose-950'
                          : timeLeft <= 30
                          ? 'bg-amber-200 text-amber-950 animate-bounce'
                          : 'bg-sky-200/80 text-sky-950'
                      }`}
                    >
                      {formatTime(timeLeft)}
                    </div>
                  </div>

                  {/* Expired State Warning */}
                  {isExpired ? (
                    <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3 animate-fade-in">
                      <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                        <Lock className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-black text-rose-900">
                        Giao dịch thất bại / Đã hết thời hạn thanh toán (2 phút)
                      </h4>
                      <p className="text-xs text-rose-700 leading-relaxed max-w-md mx-auto">
                        Thời gian giữ chỗ và hiệu lực của mã thanh toán đã kết thúc để đảm bảo tính khả dụng cho các bệnh nhân khác. Vui lòng tạo lại mã hoặc chọn khung giờ khác.
                      </p>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={handleResetTimer}
                          className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Thử lại / Lấy mã mới</span>
                        </button>
                        <Link
                          to={bookingBackUrl}
                          className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors text-center"
                        >
                          Chọn lại khung giờ khác
                        </Link>
                      </div>
                    </div>
                  ) : (
                    /* Active QR View */
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
                        <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100 inline-block mb-3">
                          VietQR Napas 24/7 • Chuyển vào tài khoản Bác sĩ
                        </span>

                        <div className="inline-block p-2 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-[210px]">
                          <img
                            src={vietQrUrl}
                            alt="VietQR Chuyển khoản"
                            className="w-48 h-auto mx-auto rounded-lg"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=VIETQR_${activeBank.bankId}_${activeBank.accountNumber}_${draft.totalAmount}`;
                            }}
                          />
                        </div>

                        <p className="text-[11px] text-slate-500 mt-2">
                          Mở ứng dụng ngân hàng bất kỳ để quét mã thanh toán tự động
                        </p>
                      </div>

                      {/* Banking Details with Instant Copy */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                          <span className="text-slate-500">Ngân hàng thụ hưởng:</span>
                          <span className="font-bold text-slate-900">
                            {activeBank.bankName} ({activeBank.bankId})
                          </span>
                        </div>

                        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                          <span className="text-slate-500">Số tài khoản Bác sĩ:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-sm text-sky-800">
                              {activeBank.accountNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyText(activeBank.accountNumber, 'accNum')}
                              className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                              title="Sao chép số tài khoản"
                            >
                              {copiedField === 'accNum' ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                          <span className="text-slate-500">Tên người thụ hưởng:</span>
                          <span className="font-bold text-slate-900 uppercase">
                            {activeBank.accountName}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                          <span className="text-slate-500">Số tiền:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-sm text-slate-900">
                              {formatCurrency(draft.totalAmount)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyText(String(draft.totalAmount), 'amount')}
                              className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                              title="Sao chép số tiền"
                            >
                              {copiedField === 'amount' ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Nội dung chuyển khoản:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {transferContent}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyText(transferContent, 'memo')}
                              className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                              title="Sao chép nội dung"
                            >
                              {copiedField === 'memo' ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Quick Confirm Button */}
                      <button
                        type="button"
                        onClick={handleProcessPayment}
                        disabled={isProcessing || isExpired}
                        className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Đang kiểm tra giao dịch chuyển khoản...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Tôi đã chuyển khoản xong</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ================= METHOD 2: MOMO GATEWAY (BÊN THỨ 3) ================= */}
              {selectedMethod === 'ewallet' && (
                <div className="mt-6 pt-5 border-t border-slate-100 animate-fade-in space-y-4">
                  {/* MoMo Gateway Banner with Countdown */}
                  <div className="rounded-2xl overflow-hidden border border-pink-200 shadow-xs">
                    <div className="bg-gradient-to-r from-[#a50064] to-[#d82d8b] p-3 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-black text-xs">
                          M
                        </div>
                        <div>
                          <span className="text-xs font-extrabold uppercase tracking-wide block leading-none">
                            Cổng thanh toán Ví MoMo
                          </span>
                          <span className="text-[10px] text-pink-100 block mt-0.5">
                            Chuyển tiền trực tiếp đến Bác sĩ
                          </span>
                        </div>
                      </div>

                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-black ${
                          isExpired
                            ? 'bg-rose-900/60 text-white'
                            : timeLeft <= 30
                            ? 'bg-amber-400 text-slate-900 animate-pulse'
                            : 'bg-white/20 text-white'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatTime(timeLeft)}</span>
                      </div>
                    </div>

                    {/* Expired State Warning for MoMo */}
                    {isExpired ? (
                      <div className="p-6 bg-pink-50/50 text-center space-y-3 animate-fade-in">
                        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                          <Lock className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-black text-rose-900">
                          Giao dịch MoMo đã hết thời hạn thanh toán (2 phút)
                        </h4>
                        <p className="text-xs text-rose-700 leading-relaxed max-w-md mx-auto">
                          Phiên giao dịch MoMo đã hết hạn để đảm bảo an toàn. Vui lòng lấy mã mới để tiếp tục thanh toán.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={handleResetTimer}
                            className="w-full sm:w-auto px-4 py-2 bg-[#d82d8b] hover:bg-[#b01e6e] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Thử lại / Lấy mã mới</span>
                          </button>
                          <Link
                            to={bookingBackUrl}
                            className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors text-center"
                          >
                            Chọn lại khung giờ khác
                          </Link>
                        </div>
                      </div>
                    ) : (
                      /* Active MoMo View */
                      <div className="p-5 bg-pink-50/30 space-y-4">
                        <div className="text-center">
                          <span className="text-[11px] font-bold text-[#d82d8b] bg-pink-100/70 px-3 py-1 rounded-full border border-pink-200 inline-block mb-3">
                            Mở App MoMo quét mã để thanh toán
                          </span>

                          <div className="inline-block p-2.5 bg-white rounded-2xl shadow-sm border border-pink-200 max-w-[210px]">
                            <img
                              src={momoQrUrl}
                              alt="MoMo QR Code"
                              className="w-48 h-48 mx-auto rounded-lg"
                            />
                          </div>

                          <p className="text-[11px] text-slate-500 mt-2">
                            Mã QR chuẩn MoMo P2P: Chuyển thẳng đến ví Bác sĩ
                          </p>
                        </div>

                        {/* MoMo Account Summary */}
                        <div className="p-4 bg-white rounded-2xl border border-pink-100 space-y-2 text-xs">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <span className="text-slate-500">Chủ ví MoMo nhận tiền:</span>
                            <span className="font-bold text-slate-900 uppercase">
                              {activeMomo.accountName}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <span className="text-slate-500">Số điện thoại MoMo:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-black text-sm text-[#d82d8b]">
                                {activeMomo.phoneNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyText(activeMomo.phoneNumber, 'momoPhone')}
                                className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors"
                                title="Sao chép SĐT MoMo"
                              >
                                {copiedField === 'momoPhone' ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <span className="text-slate-500">Số tiền:</span>
                            <span className="font-black text-sm text-slate-900">
                              {formatCurrency(draft.totalAmount)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Lời nhắn:</span>
                            <span className="font-mono font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                              MEDSI_{cleanDate}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="space-y-2 pt-1">
                          <a
                            href={momoDeepLink}
                            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-[#d82d8b] bg-white border border-[#d82d8b]/40 hover:bg-pink-50 transition-colors flex items-center justify-center gap-2 text-center"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Mở ứng dụng MoMo trên điện thoại</span>
                          </a>

                          <button
                            type="button"
                            onClick={handleProcessPayment}
                            disabled={isProcessing || isExpired}
                            className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#a50064] to-[#d82d8b] hover:from-[#900057] hover:to-[#be257a] shadow-md shadow-pink-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Đang xác thực thanh toán với MoMo...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Tôi đã thanh toán trên MoMo</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ATM / Napas Mode info */}
              {selectedMethod === 'atm' && (
                <div className="mt-4 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 space-y-1.5 animate-fade-in">
                  <p className="font-bold flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    Cổng thanh toán thẻ ATM Nội địa Napas
                  </p>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Hệ thống sẽ chuyển tiếp sang cổng xác thực One-Time Password (OTP) của ngân hàng phát hành thẻ. Bấm &quot;Thanh toán ngay&quot; bên phải để hoàn tất xác thực.
                  </p>
                </div>
              )}

              {/* Onsite Mode info */}
              {selectedMethod === 'onsite' && (
                <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1.5 animate-fade-in">
                  <p className="font-bold flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-amber-600" />
                    Thanh toán trực tiếp tại quầy tiếp nhận
                  </p>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Bạn chỉ cần lưu mã đặt lịch và đến quầy tiếp đón tại cơ sở y tế trước giờ khám 15 phút để thanh toán và nhận số thứ tự khám.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Cost Breakdown & Confirm Button (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Chi tiết thanh toán</h3>
                {(selectedMethod === 'qr' || selectedMethod === 'ewallet') && (
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                      isExpired
                        ? 'bg-rose-100 text-rose-800'
                        : timeLeft <= 30
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : 'bg-sky-100 text-sky-800'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTime(timeLeft)}</span>
                  </span>
                )}
              </div>

              {/* Provider info brief */}
              <div className="text-xs space-y-1.5 pb-3 border-b border-slate-100">
                <p className="text-slate-400 font-medium">Bác sĩ / Cơ sở khám:</p>
                <p className="text-sm font-bold text-slate-900">{draft.providerName}</p>
                <p className="text-sky-700 font-semibold">{draft.specialtyName}</p>
                <p className="text-slate-600">
                  Lịch hẹn: <strong>{draft.startTime}</strong> • Ngày <strong>{draft.date}</strong>
                </p>
                <p className="text-slate-600">
                  Người khám: <strong>{draft.patientName}</strong> ({draft.relationship})
                </p>
              </div>

              {/* Clear cost breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Phí khám:</span>
                  <span className="font-semibold text-slate-800">
                    {formatCurrency(draft.examFee)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Phí tiện ích đặt lịch:</span>
                  <span className="font-semibold text-slate-800">
                    {formatCurrency(draft.serviceFee)}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-900">Tổng cộng:</span>
                  <span className="font-black text-xl text-sky-700">
                    {formatCurrency(draft.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="button"
                disabled={isProcessing || ((selectedMethod === 'qr' || selectedMethod === 'ewallet') && isExpired)}
                onClick={handleProcessPayment}
                className="w-full mt-4 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-sky-600 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý giao dịch...</span>
                  </>
                ) : isExpired && (selectedMethod === 'qr' || selectedMethod === 'ewallet') ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Mã thanh toán đã hết hạn</span>
                  </>
                ) : (
                  <>
                    <span>
                      {selectedMethod === 'onsite'
                        ? 'Xác nhận đặt lịch'
                        : selectedMethod === 'qr'
                        ? 'Xác nhận đã chuyển khoản'
                        : selectedMethod === 'ewallet'
                        ? 'Xác nhận đã thanh toán MoMo'
                        : 'Thanh toán ngay'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Thanh toán mã hóa bảo mật chuẩn Napas & MoMo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SUCCESS CONFIRMATION MODAL ================= */}
      {isSuccessModalOpen && createdBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl border border-slate-100 animate-slide-down">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <h3 className="text-xl font-black text-slate-900">Đặt lịch khám thành công!</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              Hệ thống đã xác nhận thanh toán và gửi thông tin lịch hẹn đến tài khoản của bạn.
            </p>

            {/* Ticket Info Card */}
            <div className="my-5 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-left text-xs space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-400 font-medium">Mã đặt lịch:</span>
                <span className="font-mono font-extrabold text-sm text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-100">
                  {createdBooking.code}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bác sĩ / Cơ sở:</span>
                <span className="font-bold text-slate-800 truncate max-w-[210px]">
                  {createdBooking.providerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thời gian khám:</span>
                <span className="font-semibold text-slate-800">
                  {createdBooking.startTime} • {createdBooking.date}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bệnh nhân:</span>
                <span className="font-semibold text-slate-800">{createdBooking.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phương thức:</span>
                <span className="font-semibold text-slate-800">
                  {createdBooking.paymentMethodName || 'Trực tuyến'}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 items-center">
                <span className="text-slate-500">Trạng thái thanh toán:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  {createdBooking.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </span>
              </div>
            </div>

            <button
              onClick={handleGoToAccount}
              type="button"
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-sky-600 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 shadow-md shadow-sky-500/25 transition-all cursor-pointer"
            >
              Xem danh sách lịch hẹn trong tài khoản
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
