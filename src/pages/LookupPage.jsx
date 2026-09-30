import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Phone, 
  Calendar, 
  Clock, 
  User, 
  AlertCircle, 
  Sparkles, 
  FileText,
  ChevronRight,
  ShieldCheck,
  X,
  RefreshCw,
} from 'lucide-react';
import BookingCard from '../components/BookingCard';
import Modal from '../components/Modal';
import { STORAGE_KEYS, getStorage, setStorage } from '../utils/storage';
import { validatePhoneNumber } from '../utils/validators';

export default function LookupPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const phoneParam = searchParams.get('phone') || '';

  const [phoneInput, setPhoneInput] = useState(phoneParam);
  const [searchedPhone, setSearchedPhone] = useState(phoneParam);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Cancellation modal
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelBookingCode, setCancelBookingCode] = useState('');
  const [cancelReason, setCancelReason] = useState('Bận việc đột xuất không thể đến khám');
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  const samplePhones = [
    { label: 'Nguyễn Văn An', phone: '0901234567' },
    { label: 'Trần Thị Mai', phone: '0987654321' },
    { label: 'Lê Hoàng Nam', phone: '0912345678' },
  ];

  const handleSearch = (phoneToSearch) => {
    const clean = (phoneToSearch || '').trim();
    if (!clean) {
      setActionMessage({ text: 'Vui lòng nhập số điện thoại cần tra cứu', type: 'error' });
      return;
    }

    const phoneValidation = validatePhoneNumber(clean);
    if (!phoneValidation.isValid) {
      setActionMessage({
        text: phoneValidation.error || 'Vui lòng nhập đầy đủ số điện thoại từ 9 đến 11 chữ số để tra cứu chính xác',
        type: 'error',
      });
      return;
    }

    const normalizedQuery = phoneValidation.normalized;

    setActionMessage({ text: '', type: '' });
    const allBookings = getStorage(STORAGE_KEYS.BOOKINGS, []);

    const matched = allBookings.filter((b) => {
      const bPhoneRaw = (b.patientPhone || '').trim();
      const bNormalized = validatePhoneNumber(bPhoneRaw).normalized || bPhoneRaw.replace(/\D/g, '');
      return bNormalized === normalizedQuery;
    });

    setResults(matched);
    setSearchedPhone(clean);
    setHasSearched(true);
    setSearchParams({ phone: clean });
  };

  useEffect(() => {
    if (phoneParam) {
      setPhoneInput(phoneParam);
      handleSearch(phoneParam);
    }
  }, [phoneParam]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(phoneInput);
  };

  const handleConfirmCancel = () => {
    if (!cancellingBooking) return;
    const inputCode = cancelBookingCode.trim().toUpperCase();
    const expectedCode = (cancellingBooking.code || cancellingBooking.id || '').toUpperCase();
    if (!inputCode || inputCode !== expectedCode) {
      alert(`Mã lịch hẹn không chính xác. Vui lòng nhập đúng mã "${expectedCode}" để xác thực quyền hủy lịch.`);
      return;
    }
    if (!cancelReason.trim()) {
      alert('Vui lòng nhập lý do hủy lịch');
      return;
    }

    const allBookings = getStorage(STORAGE_KEYS.BOOKINGS, []);
    const updated = allBookings.map((b) => {
      if (b.id === cancellingBooking.id) {
        return {
          ...b,
          status: 'cancelled',
          cancelReason: cancelReason.trim(),
          cancelledAt: new Date().toISOString(),
        };
      }
      return b;
    });

    setStorage(STORAGE_KEYS.BOOKINGS, updated);
    setResults((prev) =>
      prev.map((b) =>
        b.id === cancellingBooking.id
          ? { ...b, status: 'cancelled', cancelReason: cancelReason.trim() }
          : b
      )
    );

    setActionMessage({
      text: `Đã hủy lịch hẹn ${cancellingBooking.code} thành công!`,
      type: 'success',
    });
    setCancellingBooking(null);
    setCancelBookingCode('');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Tra cứu hồ sơ không cần đăng nhập</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Tra Cứu Lịch Hẹn Khám Bệnh
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Nhập số điện thoại đã dùng khi đăng ký lịch để theo dõi trạng thái tiếp nhận và xem chi tiết phiếu khám.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs max-w-2xl mx-auto space-y-4">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="Nhập số điện thoại (VD: 0901234567)..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm font-medium text-slate-800 focus:outline-hidden focus:border-sky-500 focus:bg-white transition-all"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-sky-500/20 transition-all cursor-pointer shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Tra cứu ngay</span>
            </button>
            {(phoneInput || hasSearched) && (
              <button
                type="button"
                onClick={() => {
                  setPhoneInput('');
                  setSearchedPhone('');
                  setResults([]);
                  setHasSearched(false);
                  setSearchParams({});
                  setActionMessage({ text: '', type: '' });
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition-all cursor-pointer shrink-0"
                title="Xóa và làm mới tra cứu"
              >
                <X className="w-4 h-4" />
                <span>Làm mới</span>
              </button>
            )}
          </form>

          {/* Quick Click Sample Phones */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              SĐT thử nhanh:
            </span>
            {samplePhones.map((p) => (
              <button
                key={p.phone}
                type="button"
                onClick={() => {
                  setPhoneInput(p.phone);
                  handleSearch(p.phone);
                }}
                className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold border border-sky-200/70 transition-colors cursor-pointer"
              >
                {p.label} ({p.phone})
              </button>
            ))}
          </div>

          {actionMessage.text && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                actionMessage.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{actionMessage.text}</span>
            </div>
          )}
        </div>

        {/* Results */}
        {hasSearched && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                Kết quả tra cứu cho SĐT: <span className="text-sky-700">{searchedPhone}</span>
              </h3>
              <span className="text-xs text-slate-500">
                Tìm thấy <strong>{results.length}</strong> lịch hẹn
              </span>
            </div>

            {results.length > 0 ? (
              <div className="space-y-4">
                {results.map((b) => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    onCancelRequest={(item) => {
                      setCancellingBooking(item);
                      setCancelBookingCode('');
                      setCancelReason('Bận việc đột xuất không thể đến khám');
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 max-w-md mx-auto space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-800">Không tìm thấy lịch hẹn nào</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Số điện thoại <strong>{searchedPhone}</strong> chưa có lịch hẹn trong hệ thống hoặc đã nhập chưa chính xác.
                </p>
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/20"
                >
                  <span>Khám phá bác sĩ & Đặt lịch</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Cancel Modal */}
        {cancellingBooking && (
          <Modal
            isOpen={Boolean(cancellingBooking)}
            onClose={() => {
              setCancellingBooking(null);
              setCancelBookingCode('');
            }}
            title="Xác thực & Hủy Lịch Khám"
          >
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Bạn đang yêu cầu hủy lịch hẹn <strong>{cancellingBooking.code}</strong> với{' '}
                  <strong>{cancellingBooking.providerName}</strong> ngày <strong>{cancellingBooking.date}</strong>.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase">
                  Mã lịch hẹn để xác thực (*):
                </label>
                <input
                  type="text"
                  value={cancelBookingCode}
                  onChange={(e) => setCancelBookingCode(e.target.value)}
                  placeholder={`Nhập mã lịch hẹn (VD: ${cancellingBooking.code || cancellingBooking.id})...`}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm focus:outline-hidden focus:border-sky-500 text-slate-800 font-mono font-bold uppercase"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Vui lòng nhập đúng mã lịch hẹn để xác thực bạn là chủ sở hữu phiếu khám này trước khi hủy.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase">
                  Lý do hủy lịch (*):
                </label>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do bạn muốn hủy lịch hẹn..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm focus:outline-hidden focus:border-sky-500 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setCancellingBooking(null);
                    setCancelBookingCode('');
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Giữ lại lịch
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
                >
                  Xác nhận Hủy lịch
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
