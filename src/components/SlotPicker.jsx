import React from 'react';
import { Calendar as CalendarIcon, Clock, Sun, Sunset, Check, AlertCircle, Stethoscope, Sparkles } from 'lucide-react';
import { TIME_SLOTS, getUpcomingDates, isSlotPast } from '../data/slots';

export default function SlotPicker({
  selectedDate,
  onSelectDate,
  selectedSlot,
  onSelectSlot,
  bookedSlots = [], // e.g. ['08:30', '14:00']
  isDoctorBooking = false,
  doctorAvailableSlots = [],
  doctorName = '',
}) {
  const dates = getUpcomingDates(7);

  // If doctor booking, strictly show only the slots the doctor has registered as available
  const morningSlots = isDoctorBooking
    ? TIME_SLOTS.morning.filter((s) => doctorAvailableSlots.includes(s.time))
    : TIME_SLOTS.morning;

  const afternoonSlots = isDoctorBooking
    ? TIME_SLOTS.afternoon.filter((s) => doctorAvailableSlots.includes(s.time))
    : TIME_SLOTS.afternoon;

  const totalSlotsCount = morningSlots.length + afternoonSlots.length;
  const hasNoDoctorSlots = isDoctorBooking && totalSlotsCount === 0;

  // Check if all slots in the selected day have passed
  const allMorningPast =
    morningSlots.length > 0 && morningSlots.every((s) => isSlotPast(selectedDate, s.time));
  const allAfternoonPast =
    afternoonSlots.length > 0 && afternoonSlots.every((s) => isSlotPast(selectedDate, s.time));
  const allSlotsPast =
    !hasNoDoctorSlots &&
    totalSlotsCount > 0 &&
    (morningSlots.length === 0 || allMorningPast) &&
    (afternoonSlots.length === 0 || allAfternoonPast);

  return (
    <div className="space-y-6">
      {/* 1. Date Selector (Horizontal Scroll/Pill List) */}
      <div>
        <label className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
          <CalendarIcon className="w-4 h-4 text-sky-600" />
          <span>Chọn ngày khám</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {dates.map((d) => {
            const isSelected = selectedDate === d.dateStr;
            return (
              <button
                key={d.dateStr}
                type="button"
                onClick={() => onSelectDate(d.dateStr)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50/90 text-sky-950 shadow-md shadow-sky-500/10 ring-2 ring-sky-500'
                    : 'border-slate-200 bg-white hover:border-sky-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className={`text-[11px] font-bold ${isSelected ? 'text-sky-700' : 'text-slate-500'}`}>
                  {d.label}
                </span>
                <span className={`text-base font-extrabold mt-0.5 ${isSelected ? 'text-sky-900' : 'text-slate-800'}`}>
                  {d.displayDate}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-medium mt-0.5">
                  {d.dayShort}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notice if all slots today are past */}
      {allSlotsPast && (
        <div className="p-3.5 bg-amber-50 border border-amber-200/90 rounded-2xl flex items-start sm:items-center gap-2.5 text-amber-900 text-xs font-semibold animate-fade-in shadow-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
          <span>
            Các khung giờ khám trong ngày hôm nay đã kết thúc. Quý khách vui lòng chọn <strong>ngày mai</strong> hoặc các ngày tiếp theo để đặt lịch!
          </span>
        </div>
      )}

      {/* Doctor Slot Information Tag */}
      {isDoctorBooking && !hasNoDoctorSlots && (
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-100">
          <Stethoscope className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Hệ thống chỉ hiển thị các khung giờ mà <strong>{doctorName || 'Bác sĩ'}</strong> đã đăng ký sẵn sàng tiếp nhận bệnh nhân.
          </span>
        </div>
      )}

      {/* 2. Time Slot Selector */}
      <div>
        <label className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
          <Clock className="w-4 h-4 text-sky-600" />
          <span>Chọn khung giờ khám</span>
        </label>

        {hasNoDoctorSlots ? (
          /* Empty state when Doctor hasn't registered any slots for this date */
          <div className="p-8 bg-slate-50/80 border border-slate-200/90 rounded-3xl text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              {doctorName ? `${doctorName} chưa mở lịch khám vào ngày này` : 'Bác sĩ chưa mở lịch khám vào ngày này'}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Bác sĩ chưa đăng ký khung giờ trống tiếp nhận bệnh nhân vào ngày <strong>{selectedDate}</strong>.
              Quý khách vui lòng chọn ngày khác (như ngày mai hoặc các ngày tiếp theo) để đặt lịch!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Morning Slots */}
            {morningSlots.length > 0 && (
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between text-xs font-bold text-amber-700 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Buổi sáng (08:00 - 11:30)</span>
                  </div>
                  {allMorningPast && (
                    <span className="text-[11px] font-medium text-slate-400">Đã hết giờ sáng</span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {morningSlots.map((slot) => {
                    const isPast = isSlotPast(selectedDate, slot.time);
                    const isBooked = bookedSlots.includes(slot.time);
                    const isDisabled = isPast || isBooked;
                    const isSelected = selectedSlot === slot.time && !isDisabled;

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => onSelectSlot(slot.time)}
                        title={
                          isPast
                            ? 'Khung giờ này trong ngày đã qua, không thể đặt'
                            : isBooked
                            ? 'Khung giờ này đã có bệnh nhân đặt'
                            : `Chọn khung giờ ${slot.time}`
                        }
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-0.5 select-none ${
                          isPast
                            ? 'bg-slate-100/90 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                            : isBooked
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-sky-600 border-sky-600 text-white shadow-md shadow-sky-500/25 ring-2 ring-sky-300'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-sky-300 hover:bg-sky-50/50 cursor-pointer'
                        }`}
                      >
                        <span>{slot.time}</span>
                        {isPast ? (
                          <span className="text-[9px] font-normal text-slate-400">Đã qua giờ</span>
                        ) : isBooked ? (
                          <span className="text-[9px] font-normal text-slate-400">Đã đầy</span>
                        ) : isSelected ? (
                          <Check className="w-3 h-3 text-white" />
                        ) : (
                          <span className="text-[9px] font-normal text-emerald-600">Còn chỗ</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Afternoon Slots */}
            {afternoonSlots.length > 0 && (
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-700 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Sunset className="w-4 h-4 text-indigo-500" />
                    <span>Buổi chiều (13:30 - 16:30)</span>
                  </div>
                  {allAfternoonPast && (
                    <span className="text-[11px] font-medium text-slate-400">Đã hết giờ chiều</span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {afternoonSlots.map((slot) => {
                    const isPast = isSlotPast(selectedDate, slot.time);
                    const isBooked = bookedSlots.includes(slot.time);
                    const isDisabled = isPast || isBooked;
                    const isSelected = selectedSlot === slot.time && !isDisabled;

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => onSelectSlot(slot.time)}
                        title={
                          isPast
                            ? 'Khung giờ này trong ngày đã qua, không thể đặt'
                            : isBooked
                            ? 'Khung giờ này đã có bệnh nhân đặt'
                            : `Chọn khung giờ ${slot.time}`
                        }
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-0.5 select-none ${
                          isPast
                            ? 'bg-slate-100/90 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                            : isBooked
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-sky-600 border-sky-600 text-white shadow-md shadow-sky-500/25 ring-2 ring-sky-300'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-sky-300 hover:bg-sky-50/50 cursor-pointer'
                        }`}
                      >
                        <span>{slot.time}</span>
                        {isPast ? (
                          <span className="text-[9px] font-normal text-slate-400">Đã qua giờ</span>
                        ) : isBooked ? (
                          <span className="text-[9px] font-normal text-slate-400">Đã đầy</span>
                        ) : isSelected ? (
                          <Check className="w-3 h-3 text-white" />
                        ) : (
                          <span className="text-[9px] font-normal text-emerald-600">Còn chỗ</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
