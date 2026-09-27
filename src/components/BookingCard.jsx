import React from 'react';
import { Calendar, Clock, MapPin, User, Stethoscope, Building2, AlertTriangle } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatCurrency } from '../utils/formatCurrency';

export default function BookingCard({ booking, onCancelRequest = null }) {
  const isDoctor = booking.bookingType === 'doctor';
  const canCancel = booking.status === 'pending' || booking.status === 'approved';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all p-5 sm:p-6">
      {/* Top Header: Code, Badges, and Type */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs sm:text-sm font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
            {booking.code}
          </span>
          <span className="text-xs text-slate-400">
            Đặt ngày {new Date(booking.createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={booking.paymentStatus} type="payment" />
          <StatusBadge status={booking.status} type="booking" />
        </div>
      </div>

      {/* Main Info */}
      <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Doctor / Hospital */}
        <div className="space-y-2">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
              {isDoctor ? <Stethoscope className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                {isDoctor ? 'Bác sĩ chuyên khoa' : 'Bệnh viện / Cơ sở'}
              </span>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                {booking.providerName}
              </h4>
              <p className="text-xs text-sky-700 font-medium">
                {booking.specialtyName}
              </p>
            </div>
          </div>

          {/* Schedule Date & Time */}
          <div className="flex items-center gap-4 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5 font-semibold">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>{booking.date}</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Clock className="w-4 h-4 text-sky-600" />
              <span>{booking.startTime} - {booking.endTime}</span>
            </div>
          </div>
        </div>

        {/* Right: Patient & Symptoms */}
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Bệnh nhân khám
              </span>
              <p className="text-sm font-bold text-slate-900">
                {booking.patientName}
              </p>
              <p className="text-slate-500">SĐT: {booking.patientPhone}</p>
            </div>
          </div>

          {booking.symptoms && (
            <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-700">Lý do khám:</span> {booking.symptoms}
            </div>
          )}
        </div>
      </div>

      {/* Footer: Fee & Action */}
      <div className="pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Tổng thanh toán:</span>
          <span className="text-base font-extrabold text-slate-900">
            {formatCurrency(booking.totalAmount)}
          </span>
          <span className="text-[11px] text-slate-400">
            (gồm {formatCurrency(booking.serviceFee)} phí tiện ích)
          </span>
        </div>

        {canCancel && onCancelRequest && (
          <button
            onClick={() => onCancelRequest(booking)}
            type="button"
            className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
          >
            Hủy lịch khám
          </button>
        )}
      </div>
    </div>
  );
}
