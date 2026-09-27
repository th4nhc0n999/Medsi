import React from 'react';
import { Clock, CheckCircle2, CheckCheck, XCircle, AlertCircle } from 'lucide-react';

export const StatusBadge = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-medium',
    lg: 'px-3 py-1.5 text-sm gap-2 font-medium',
  };

  switch (status) {
    case 'pending':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 ${sizeClasses[size]}`}>
          <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
          <span>Chờ duyệt</span>
        </span>
      );
    case 'confirmed':
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses[size]}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Đã xác nhận</span>
        </span>
      );
    case 'completed':
      return (
        <span className={`inline-flex items-center rounded-full bg-sky-50 text-sky-700 border border-sky-200/80 ${sizeClasses[size]}`}>
          <CheckCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span>Đã khám xong</span>
        </span>
      );
    case 'cancelled':
      return (
        <span className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 ${sizeClasses[size]}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span>Đã hủy</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses[size]}`}>
          <AlertCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>{status}</span>
        </span>
      );
  }
};

export default StatusBadge;
