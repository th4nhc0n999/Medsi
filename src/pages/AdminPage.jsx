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
  Trash2,
  XCircle,
  RotateCcw,
  Download,
  AlertTriangle,
  X,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { STORAGE_KEYS, getStorage, setStorage, resetToInitialStorage } from '../utils/storage';
import { formatCurrency } from '../utils/formatCurrency';

export default function AdminPage() {
  const navigate = useNavigate();

  // Current admin check
  const [currentUser, setCurrentUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'completed' | 'cancelled'
  const [selectedBookingForView, setSelectedBookingForView] = useState(null);

  // Action Modals State
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

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
    return allBookings;
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    const updated = loadBookings();
    setSearchQuery('');
    setStatusFilter('all');
    showToast(`Đã làm mới dữ liệu (${updated.length} lịch khám)`, 'info');
    setTimeout(() => {
      setIsRefreshing(false);
    }, 450);
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
    showToast('Đã cập nhật trạng thái thanh toán thành công');
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
    if (selectedBookingForView && selectedBookingForView.id === bookingId) {
      setSelectedBookingForView((prev) => ({ ...prev, status: 'approved' }));
    }
    showToast('Đã phê duyệt lịch khám thành công');
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
    if (selectedBookingForView && selectedBookingForView.id === bookingId) {
      setSelectedBookingForView((prev) => ({ ...prev, status: 'completed' }));
    }
    showToast('Đã hoàn tất ca khám');
  };

  // 4. Cancel Booking with Reason
  const handleConfirmCancel = () => {
    if (!bookingToCancel) return;
    const finalReason = cancelReason.trim() || 'Hủy theo yêu cầu của Quản trị viên';
    const allBookings = getStorage(STORAGE_KEYS.BOOKINGS, []);
    const updated = allBookings.map((b) => {
      if (b.id === bookingToCancel.id) {
        return {
          ...b,
          status: 'cancelled',
          cancelledAt: new Date().toISOString(),
          cancelReason: finalReason,
        };
      }
      return b;
    });

    setStorage(STORAGE_KEYS.BOOKINGS, updated);
    setBookings(updated);
    if (selectedBookingForView && selectedBookingForView.id === bookingToCancel.id) {
      setSelectedBookingForView((prev) => ({
        ...prev,
        status: 'cancelled',
        cancelReason: finalReason,
      }));
    }
    setBookingToCancel(null);
    setCancelReason('');
    showToast(`Đã hủy lịch hẹn ${bookingToCancel.code}`);
  };

  // 5. Delete Booking Permanently
  const handleConfirmDelete = () => {
    if (!bookingToDelete) return;
    const allBookings = getStorage(STORAGE_KEYS.BOOKINGS, []);
    const updated = allBookings.filter((b) => b.id !== bookingToDelete.id);

    setStorage(STORAGE_KEYS.BOOKINGS, updated);
    setBookings(updated);
    if (selectedBookingForView && selectedBookingForView.id === bookingToDelete.id) {
      setSelectedBookingForView(null);
    }
    setBookingToDelete(null);
    showToast(`Đã xóa hoàn toàn lịch hẹn ${bookingToDelete.code}`);
  };

  // 6. Reset Demo Data
  const handleConfirmReset = () => {
    resetToInitialStorage();
    loadBookings();
    setSearchQuery('');
    setStatusFilter('all');
    setShowResetModal(false);
    showToast('Đã khôi phục toàn bộ dữ liệu mẫu ban đầu thành công!');
  };

  // 7. Export Bookings to CSV
  const handleExportCSV = () => {
    const listToExport = filteredBookings.length > 0 ? filteredBookings : bookings;
    if (listToExport.length === 0) {
      showToast('Không có dữ liệu lịch khám để xuất', 'warning');
      return;
    }

    const headers = [
      'Mã lịch hẹn',
      'Họ tên bệnh nhân',
      'Số điện thoại',
      'Bác sĩ / Cơ sở y tế',
      'Chuyên khoa',
      'Ngày khám',
      'Khung giờ',
      'Tổng chi phí (VND)',
      'Thanh toán',
      'Trạng thái',
      'Lý do hủy (nếu có)',
      'Ngày tạo',
    ];

    const rows = listToExport.map((b) => [
      `"${b.code || ''}"`,
      `"${b.patientName || ''}"`,
      `"${b.patientPhone || ''}"`,
      `"${(b.providerName || '').replace(/"/g, '""')}"`,
      `"${(b.specialtyName || '').replace(/"/g, '""')}"`,
      `"${b.date || ''}"`,
      `"${b.startTime || ''} - ${b.endTime || ''}"`,
      `"${b.totalAmount || 0}"`,
      `"${b.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}"`,
      `"${
        b.status === 'approved'
          ? 'Đã duyệt'
          : b.status === 'completed'
          ? 'Hoàn thành'
          : b.status === 'cancelled'
          ? 'Đã hủy'
          : 'Chờ duyệt'
      }"`,
      `"${(b.cancelReason || '').replace(/"/g, '""')}"`,
      `"${b.createdAt || ''}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `medsi_danh_sach_lich_kham_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Đã xuất file CSV với ${listToExport.length} lịch khám`);
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
        {/* Toast Alert Notification */}
        {toastMessage && (
          <div
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-bold transition-all animate-bounce ${
              toastMessage.type === 'warning'
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-emerald-50 text-emerald-900 border-emerald-300'
            }`}
          >
            {toastMessage.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
            <span>{toastMessage.message}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="ml-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

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

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              title="Xuất file danh sách lịch hẹn ra Excel / CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Xuất CSV</span>
            </button>

            <button
              onClick={() => setShowResetModal(true)}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              title="Khôi phục lại toàn bộ dữ liệu mẫu ban đầu để chấm bài / demo"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>Khôi phục dữ liệu mẫu</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 active:scale-95 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60"
              title="Làm mới lại dữ liệu và đặt lại bộ lọc"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Đang làm mới...' : 'Làm mới'}</span>
            </button>
          </div>
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
                    const canCancel = b.status !== 'cancelled' && b.status !== 'completed';

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
                          {b.status === 'cancelled' && b.cancelReason && (
                            <div className="text-[10px] text-rose-600 mt-1 max-w-[120px] truncate mx-auto" title={b.cancelReason}>
                              {b.cancelReason}
                            </div>
                          )}
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
                                title="Phê duyệt lịch khám"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Duyệt</span>
                              </button>
                            )}

                            {/* Approved -> Completed */}
                            {isApproved && (
                              <button
                                onClick={() => handleCompleteBooking(b.id)}
                                type="button"
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                                title="Hoàn tất ca khám"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Hoàn tất</span>
                              </button>
                            )}

                            {/* Cancel Button */}
                            {canCancel && (
                              <button
                                onClick={() => {
                                  setBookingToCancel(b);
                                  setCancelReason('');
                                }}
                                type="button"
                                className="p-1.5 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                title="Hủy lịch hẹn"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}

                            {/* Delete Button */}
                            <button
                              onClick={() => setBookingToDelete(b)}
                              type="button"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Xóa lịch hẹn vĩnh viễn"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500">Trạng thái duyệt:</span>
                <StatusBadge status={selectedBookingForView.status} type="booking" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Thanh toán:</span>
                <StatusBadge status={selectedBookingForView.paymentStatus} type="payment" />
              </div>
            </div>

            {selectedBookingForView.status === 'cancelled' && (
              <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-rose-900">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  Lịch hẹn đã bị hủy:
                </span>
                <p className="text-xs text-rose-700">
                  Lý do: {selectedBookingForView.cancelReason || 'Không có lý do cụ thể'}
                </p>
                {selectedBookingForView.cancelledAt && (
                  <p className="text-[11px] text-rose-500">
                    Thời điểm hủy: {new Date(selectedBookingForView.cancelledAt).toLocaleString('vi-VN')}
                  </p>
                )}
              </div>
            )}

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

            {/* Admin actions inside detail */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200">
              <div className="flex items-center gap-1.5">
                {selectedBookingForView.paymentStatus !== 'paid' && (
                  <button
                    type="button"
                    onClick={() => handleMarkPaid(selectedBookingForView.id)}
                    className="px-2.5 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-300 font-bold rounded-xl text-xs transition-colors"
                  >
                    Xác nhận đã trả tiền
                  </button>
                )}

                {selectedBookingForView.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => handleApproveBooking(selectedBookingForView.id)}
                    className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    Duyệt lịch
                  </button>
                )}

                {selectedBookingForView.status === 'approved' && (
                  <button
                    type="button"
                    onClick={() => handleCompleteBooking(selectedBookingForView.id)}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    Hoàn tất
                  </button>
                )}

                {selectedBookingForView.status !== 'cancelled' &&
                  selectedBookingForView.status !== 'completed' && (
                    <button
                      type="button"
                      onClick={() => {
                        setBookingToCancel(selectedBookingForView);
                        setCancelReason('');
                      }}
                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold rounded-xl text-xs transition-colors"
                    >
                      Hủy lịch
                    </button>
                  )}

                <button
                  type="button"
                  onClick={() => setBookingToDelete(selectedBookingForView)}
                  className="px-2.5 py-1.5 text-slate-500 hover:text-rose-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Xóa
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBookingForView(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* CANCEL BOOKING MODAL */}
      <Modal
        isOpen={Boolean(bookingToCancel)}
        onClose={() => setBookingToCancel(null)}
        title="Xác nhận hủy lịch khám"
        subtitle={`Mã lịch hẹn: ${bookingToCancel?.code} - ${bookingToCancel?.patientName}`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <p className="text-slate-600">
            Bạn có chắc chắn muốn hủy lịch hẹn này? Vui lòng chọn hoặc nhập lý do hủy lịch:
          </p>

          <div className="flex flex-wrap gap-1.5">
            {[
              'Bác sĩ bận lịch đột xuất',
              'Bệnh nhân liên hệ xin hủy',
              'Trùng khung giờ khám khác',
              'Thông tin bệnh nhân chưa hợp lệ',
            ].map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => setCancelReason(reason)}
                className={`px-2.5 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
                  cancelReason === reason
                    ? 'bg-rose-100 border-rose-400 text-rose-800 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {reason}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Lý do chi tiết:
            </label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Nhập lý do hủy lịch hẹn..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-rose-500 focus:bg-white resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setBookingToCancel(null)}
              className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleConfirmCancel}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs"
            >
              Xác nhận hủy lịch
            </button>
          </div>
        </div>
      </Modal>

      {/* DELETE BOOKING PERMANENTLY MODAL */}
      <Modal
        isOpen={Boolean(bookingToDelete)}
        onClose={() => setBookingToDelete(null)}
        title="Xác nhận xóa vĩnh viễn"
        subtitle={`Mã lịch hẹn: ${bookingToDelete?.code}`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 flex items-start gap-2 text-rose-800">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              <strong>Cảnh báo:</strong> Lịch khám mã <strong>{bookingToDelete?.code}</strong> của bệnh nhân{' '}
              <strong>{bookingToDelete?.patientName}</strong> sẽ bị xóa vĩnh viễn khỏi hệ thống và không thể phục hồi.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setBookingToDelete(null)}
              className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs"
            >
              Xác nhận xóa
            </button>
          </div>
        </div>
      </Modal>

      {/* RESET DEMO DATA MODAL */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Khôi phục dữ liệu mẫu ban đầu"
        subtitle="Dành cho giám khảo / test đồ án"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-2 text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              Hệ thống sẽ nạp lại toàn bộ tài khoản mẫu, hồ sơ bệnh nhân, lịch hẹn mẫu và giao dịch ban đầu.
              Mọi lịch khám bạn vừa tạo mới sẽ được thay thế bằng dữ liệu demo chuẩn.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowResetModal(false)}
              className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleConfirmReset}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs"
            >
              Khôi phục ngay
            </button>
          </div>
        </div>
      </Modal>

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900/95 text-white text-xs font-semibold rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md animate-fade-in transition-all">
          {toastMessage.type === 'error' ? (
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : toastMessage.type === 'warning' ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          ) : toastMessage.type === 'info' ? (
            <RefreshCw className="w-4 h-4 text-sky-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage.message}</span>
        </div>
      )}
    </div>
  );
}
