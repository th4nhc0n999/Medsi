import React from 'react';
import { Calendar as CalendarIcon, Clock, Sun, Sunset, Check } from 'lucide-react';
import { TIME_SLOTS, getUpcomingDates } from '../data/slots';

export default function SlotPicker({
  selectedDate,
  onSelectDate,
  selectedSlot,
  onSelectSlot,
  bookedSlots = [], // e.g. ['08:30', '14:00']
}) {
  const dates = getUpcomingDates(7);

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

      {/* 2. Time Slot Selector */}
      <div>
        <label className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
          <Clock className="w-4 h-4 text-sky-600" />
          <span>Chọn khung giờ khám</span>
        </label>

        <div className="space-y-4">
          {/* Morning Slots */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 mb-3">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Buổi sáng (08:00 - 11:30)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {TIME_SLOTS.morning.map((slot) => {
                const isSelected = selectedSlot === slot.time;
                const isBooked = bookedSlots.includes(slot.time);

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={isBooked}
                    onClick={() => onSelectSlot(slot.time)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-0.5 ${
                      isBooked
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                        : isSelected
                        ? 'bg-sky-600 border-sky-600 text-white shadow-md shadow-sky-500/25 ring-2 ring-sky-300'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-sky-300 hover:bg-sky-50/50 cursor-pointer'
                    }`}
                  >
                    <span>{slot.time}</span>
                    {isBooked ? (
                      <span className="text-[9px] font-normal text-slate-400">Đã đầy</span>
                    ) : isSelected ? (
                      <Check className="w-3 h-3 text-white" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Afternoon Slots */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 mb-3">
              <Sunset className="w-4 h-4 text-indigo-500" />
              <span>Buổi chiều (13:30 - 16:30)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {TIME_SLOTS.afternoon.map((slot) => {
                const isSelected = selectedSlot === slot.time;
                const isBooked = bookedSlots.includes(slot.time);

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={isBooked}
                    onClick={() => onSelectSlot(slot.time)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-0.5 ${
                      isBooked
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                        : isSelected
                        ? 'bg-sky-600 border-sky-600 text-white shadow-md shadow-sky-500/25 ring-2 ring-sky-300'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-sky-300 hover:bg-sky-50/50 cursor-pointer'
                    }`}
                  >
                    <span>{slot.time}</span>
                    {isBooked ? (
                      <span className="text-[9px] font-normal text-slate-400">Đã đầy</span>
                    ) : isSelected ? (
                      <Check className="w-3 h-3 text-white" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
