import React from 'react';
import { Clock, CheckCircle2, CheckCircle, XCircle, CreditCard, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status, type = 'booking', className = '' }) {
  if (type === 'payment') {
    if (status === 'paid') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}
        >
          <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
          Đã thanh toán
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}
      >
        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
        Chưa thanh toán
      </span>
    );
  }

  // Booking statuses: pending, approved, completed, cancelled
  switch (status) {
    case 'pending':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          Chờ xác nhận
        </span>
      );

    case 'approved':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200 ${className}`}
        >
          <CheckCircle className="w-3.5 h-3.5 text-sky-600" />
          Đã duyệt lịch
        </span>
      );

    case 'completed':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Đã hoàn thành
        </span>
      );

    case 'cancelled':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 ${className}`}
        >
          <XCircle className="w-3.5 h-3.5 text-rose-500" />
          Đã hủy
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
        >
          {status}
        </span>
      );
  }
}
