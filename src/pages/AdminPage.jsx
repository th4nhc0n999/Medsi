import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Check,
  ArrowRight,
  User,
  Building2,
  Stethoscope,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { STORAGE_KEYS, getStorage, setStorage } from '../utils/storage';
import { formatCurrency } from '../utils/formatCurrency';

export default function AdminPage() {
  const navigate = useNavigate();

  // Current admin check
  const [currentUser, setCurrentUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'completed' | 'cancelled'
  const [selectedBookingForView, setSelectedBookingForView] = useState(null);

  // Check auth & role
  useEffect(() => {
    const user = getStorage(STORAGE_KEYS.CURRENT_USER, null);
    if (!user || user.role !== 'admin') {
      navigate('/explore');
      return;
    }
    setCurrentUser(user);
    loadBookings();
  }, [navigate]);

  const loadBookings = () => {
    const allBookings = getStorage(STORAGE_KEYS.BOOKINGS, []);
    setBookings(allBookings);
  };

  // 1. Mark Paid: unpaid -> paid
  const handleMarkPaid = (bookingId) => {
    const allBookings = getStorage(STORAGE_KEYS.BOOKINGS, []);
    const updated = allBookings.map((b) => {
      if (b.id === bookingId) {
        return {
          ...b,
          paymentStatus: 'paid',
          updatedAt: new Date().toISOString(),
        };
      }
      return b;
    });

    setStorage(STORAGE_KEYS.BOOKINGS, updated);
    setBookings(updated);

    // Also update or add to payments table
    const allPayments = getStorage(STORAGE_KEYS.PAYMENTS, []);
    const existingPayment = allPayments.find((p) => p.bookingId === bookingId);
    if (existingPayment) {
      existingPayment.status = 'paid';
      setStorage(STORAGE_KEYS.PAYMENTS, allPayments);
    }
  };

  // 2. Approve Booking: pending -> approved
  const handleApproveBooking = (bookingId) => {
    const allBookings = getStorage(STORAGE_KEYS.BOOKINGS, []);
    const updated = allBookings.map((b) => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'approved',
          approvedAt: new Date().toISOString(),
        };
      }
      return b;
    });

    setStorage(STORAGE_KEYS.BOOKINGS, updated);
    setBookings(updated);
  };

  // 3. Complete Booking: approved -> completed
  const handleCompleteBooking = (bookingId) => {
    const allBookings = getStorage(STORAGE_KEYS.BOOKINGS, []);
    const updated = allBookings.map((b) => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'completed',
          completedAt: new Date().toISOString(),
        };
      }
      return b;
    });

    setStorage(STORAGE_KEYS.BOOKINGS, updated);
    setBookings(updated);
  };

  // Stats calculation
  const totalCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const approvedCount = bookings.filter((b) => b.status === 'approved').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const paidCount = bookings.filter((b) => b.paymentStatus === 'paid').length;

  // Filtered list
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      !searchQuery.trim() ||
      b.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.providerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.patientPhone?.includes(searchQuery.trim());

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              <span>Cổng Quản Trị Hệ Thống MedSi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Bảng điều khiển & Quản lý Lịch khám
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Duyệt lịch hẹn khám, kiểm tra trạng thái thanh toán và cập nhật tiến độ
            </p>
          </div>

          <button
            onClick={loadBookings}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
            <span>Làm mới dữ liệu</span>
          </button>
        </div>

        {/* Dashboard 5 Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {/* 1. Total */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Tổng số lịch
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {totalCount}
              </span>
              <Calendar className="w-5 h-5 text-slate-400" />
            </div>
          </div>

          {/* 2. Pending */}
          <div className="bg-amber-50/60 p-4 sm:p-5 rounded-2xl border border-amber-200/80 shadow-xs">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
              Chờ duyệt
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-900">
                {pendingCount}
              </span>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>

          {/* 3. Approved */}
          <div className="bg-sky-50/60 p-4 sm:p-5 rounded-2xl border border-sky-200/80 shadow-xs">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">
              Đã duyệt
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-sky-900">
                {approvedCount}
              </span>
              <CheckCircle className="w-5 h-5 text-sky-600" />
            </div>
          </div>

          {/* 4. Completed */}
          <div className="bg-emerald-50/60 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 shadow-xs">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Hoàn thành
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-900">
                {completedCount}
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          {/* 5. Paid */}
          <div className="bg-cyan-50/60 p-4 sm:p-5 rounded-2xl border border-cyan-200/80 shadow-xs col-span-2 sm:col-span-1">
            <span className="text-xs font-bold text-cyan-800 uppercase tracking-wider block">
              Đã thanh toán
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-cyan-900">
                {paidCount}
              </span>
              <CreditCard className="w-5 h-5 text-cyan-600" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Keyword Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mã lịch, tên bệnh nhân, bác sĩ..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-sky-500 focus:bg-white text-slate-800"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-500 mr-1 hidden sm:inline">Trạng thái:</span>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'pending', label: 'Chờ duyệt' },
              { id: 'approved', label: 'Đã duyệt' },
              { id: 'completed', label: 'Hoàn thành' },
              { id: 'cancelled', label: 'Đã hủy' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                type="button"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Data Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Mã Code</th>
                  <th className="py-3.5 px-4">Bệnh nhân</th>
                  <th className="py-3.5 px-4">Đơn vị / Bác sĩ</th>
                  <th className="py-3.5 px-4">Ngày & Giờ</th>
                  <th className="py-3.5 px-4 text-right">Tổng tiền</th>
                  <th className="py-3.5 px-4 text-center">Thanh toán</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((b) => {
                    const isPaid = b.paymentStatus === 'paid';
                    const isPending = b.status === 'pending';
                    const isApproved = b.status === 'approved';

                    return (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Code */}
                        <td className="py-4 px-4 font-mono font-bold text-sky-700">
                          {b.code}
                        </td>

                        {/* Patient */}
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900">{b.patientName}</div>
                          <div className="text-[11px] text-slate-500">{b.patientPhone}</div>
                        </td>

                        {/* Provider */}
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-800 line-clamp-1">
                            {b.providerName}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">
                            {b.specialtyName}
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-800">{b.date}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {b.startTime} - {b.endTime}
                          </div>
                        </td>

                        {/* Total Amount */}
                        <td className="py-4 px-4 text-right font-extrabold text-slate-900 whitespace-nowrap">
                          {formatCurrency(b.totalAmount)}
                        </td>

                        {/* Payment Status + Action */}
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <div className="flex flex-col items-center gap-1.5">
                            <StatusBadge status={b.paymentStatus} type="payment" />
                            {!isPaid && (
                              <button
                                onClick={() => handleMarkPaid(b.id)}
                                type="button"
                                className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer"
                              >
                                Mark Paid
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Booking Status */}
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <StatusBadge status={b.status} type="booking" />
                        </td>

                        {/* Admin Workflow Actions */}
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View detail button */}
                            <button
                              onClick={() => setSelectedBookingForView(b)}
                              type="button"
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Pending -> Approved */}
                            {isPending && (
                              <button
                                onClick={() => handleApproveBooking(b.id)}
                                type="button"
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Duyệt lịch</span>
                              </button>
                            )}

                            {/* Approved -> Completed */}
                            {isApproved && (
                              <button
                                onClick={() => handleCompleteBooking(b.id)}
                                type="button"
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Hoàn tất</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Không có lịch khám nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL FOR ADMIN */}
      <Modal
        isOpen={Boolean(selectedBookingForView)}
        onClose={() => setSelectedBookingForView(null)}
        title="Chi tiết phiếu đặt lịch khám"
        subtitle={`Mã tham chiếu: ${selectedBookingForView?.code}`}
        maxWidth="max-w-lg"
      >
        {selectedBookingForView && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Đơn vị tiếp nhận:</span>
                <strong className="text-slate-900">{selectedBookingForView.providerName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Chuyên khoa:</span>
                <span className="text-sky-700 font-semibold">{selectedBookingForView.specialtyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thời gian hẹn:</span>
                <span className="font-semibold text-slate-800">
                  {selectedBookingForView.startTime} - {selectedBookingForView.endTime} ngày {selectedBookingForView.date}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Bệnh nhân:</span>
                <strong className="text-slate-900">{selectedBookingForView.patientName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số điện thoại:</span>
                <span className="font-semibold text-slate-800">{selectedBookingForView.patientPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quan hệ với chủ tài khoản:</span>
                <span className="text-slate-700">{selectedBookingForView.relationship || 'Bản thân'}</span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 block mb-1">Mô tả triệu chứng / Lý do khám:</span>
                <p className="text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200 leading-relaxed">
                  {selectedBookingForView.symptoms || 'Không có triệu chứng ghi nhận'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Phí khám cơ bản:</span>
                <span>{formatCurrency(selectedBookingForView.examFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phí tiện ích đặt lịch:</span>
                <span>{formatCurrency(selectedBookingForView.serviceFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-200">
                <span>Tổng chi phí:</span>
                <span className="text-sky-700 font-black">{formatCurrency(selectedBookingForView.totalAmount)}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedBookingForView(null)}
                className="px-4 py-2 bg-slate-800 text-white font-bold rounded-xl text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
