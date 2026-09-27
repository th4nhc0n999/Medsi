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
} from 'lucide-react';
import { STORAGE_KEYS, getStorage, setStorage, removeStorage } from '../utils/storage';
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

  // Load draft from localStorage
  useEffect(() => {
    const savedDraft = getStorage(STORAGE_KEYS.BOOKING_DRAFT, null);
    if (!savedDraft) {
      // If no draft exists, redirect back to explore
      navigate('/explore');
      return;
    }
    setDraft(savedDraft);
  }, [navigate]);

  if (!draft) return null;

  const paymentMethods = [
    {
      id: 'qr',
      title: 'Quét mã VietQR / MoMo',
      desc: 'Quét tức thì qua app ngân hàng hoặc MoMo, không mất phí giao dịch.',
      icon: QrCode,
      color: 'text-sky-600 bg-sky-50',
    },
    {
      id: 'atm',
      title: 'Thẻ ATM nội địa / Internet Banking',
      desc: 'Hỗ trợ thẻ ATM của hơn 40 ngân hàng tại Việt Nam qua Napas.',
      icon: CreditCard,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      id: 'ewallet',
      title: 'Ví điện tử (ZaloPay / ShopeePay / VNPay)',
      desc: 'Thanh toán nhanh qua ví điện tử liên kết.',
      icon: Wallet,
      color: 'text-emerald-600 bg-emerald-50',
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
    setIsProcessing(true);
    setConflictError('');

    // Simulate 800ms payment gateway verification
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
           (draft.hospitalId && b.hospitalId === draft.hospitalId))
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
        method:
          selectedMethod === 'qr'
            ? 'QR Code (VietQR/MoMo)'
            : selectedMethod === 'atm'
            ? 'Thẻ ATM Nội địa'
            : selectedMethod === 'ewallet'
            ? 'Ví điện tử'
            : 'Thanh toán tại cơ sở',
        examFee: draft.examFee,
        serviceFee: draft.serviceFee,
        totalAmount: draft.totalAmount,
        status: isPaidOnline ? 'paid' : 'pending',
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
    }, 850);
  };

  const handleGoToAccount = () => {
    setIsSuccessModalOpen(false);
    navigate('/account?tab=bookings');
  };

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
            Mã tham chiếu tạm thời sẽ được cấp ngay sau khi giao dịch thành công
          </p>
        </div>

        {conflictError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 animate-fade-in shadow-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{conflictError}</span>
            </div>
            <Link
              to={draft.bookingType === 'doctor' ? `/booking/doctor/${draft.doctorId}` : `/booking/hospital/${draft.hospitalId}`}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors"
            >
              Chọn lại giờ
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* LEFT: Choose Payment Method (7 cols) */}
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
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-500 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={isSelected}
                        onChange={() => setSelectedMethod(method.id)}
                        className="mt-1 text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />

                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${method.color}`}>
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

              {/* QR Mock preview if QR selected */}
              {selectedMethod === 'qr' && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center animate-fade-in">
                  <span className="text-xs font-bold text-slate-700 block mb-2">
                    Mã QR VietQR mẫu (Chế độ demo)
                  </span>
                  <div className="inline-block p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=MEDSI_PAYMENT_${draft.totalAmount}`}
                      alt="VietQR Demo"
                      className="w-32 h-32 mx-auto"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Bấm &quot;Thanh toán ngay&quot; để hệ thống tự động xác nhận giao dịch thành công.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Cost Breakdown & Confirm Button (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                Chi tiết thanh toán
              </h3>

              {/* Provider info brief */}
              <div className="text-xs space-y-1.5 pb-3 border-b border-slate-100">
                <p className="text-slate-500">Đơn vị khám:</p>
                <p className="text-sm font-bold text-slate-900">{draft.providerName}</p>
                <p className="text-sky-700 font-semibold">{draft.specialtyName}</p>
                <p className="text-slate-600">
                  Lịch hẹn: <strong>{draft.startTime}</strong> • Ngày <strong>{draft.date}</strong>
                </p>
                <p className="text-slate-600">
                  Người khám: <strong>{draft.patientName}</strong> ({draft.relationship})
                </p>
              </div>

              {/* Clear breakdown required by spec */}
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
                disabled={isProcessing}
                onClick={handleProcessPayment}
                className="w-full mt-4 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-sky-600 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 disabled:opacity-70 shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý giao dịch...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {selectedMethod === 'onsite' ? 'Xác nhận đặt lịch' : 'Thanh toán ngay'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Thanh toán giả lập an toàn (Chế độ Demo)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS CONFIRMATION MODAL */}
      {isSuccessModalOpen && createdBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl border border-slate-100 animate-slide-down">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <h3 className="text-xl font-black text-slate-900">Đặt lịch khám thành công!</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              Hệ thống đã ghi nhận lịch hẹn và gửi xác nhận vào tài khoản của bạn.
            </p>

            {/* Ticket Info Card */}
            <div className="my-5 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-left text-xs space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-400 font-medium">Mã đặt lịch:</span>
                <span className="font-mono font-extrabold text-sm text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                  {createdBooking.code}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Đơn vị:</span>
                <span className="font-bold text-slate-800 truncate max-w-[200px]">
                  {createdBooking.providerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thời gian:</span>
                <span className="font-semibold text-slate-800">
                  {createdBooking.startTime} • {createdBooking.date}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bệnh nhân:</span>
                <span className="font-semibold text-slate-800">{createdBooking.patientName}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-100">
                <span className="text-slate-500">Trạng thái:</span>
                <span className="font-bold text-amber-600">Chờ xác nhận (Pending)</span>
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
