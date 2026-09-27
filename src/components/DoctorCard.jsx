import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Briefcase, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

export default function DoctorCard({ doctor }) {
  const navigate = useNavigate();

  const handleBook = () => {
    navigate(`/booking/doctor/${doctor.id}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-sky-300 shadow-xs hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      <div className="p-5 sm:p-6">
        {/* Top: Avatar, Rating & Basic Info */}
        <div className="flex gap-4 items-start">
          <div className="relative shrink-0">
            <img
              src={doctor.avatar}
              alt={doctor.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover object-top border-2 border-slate-100 shadow-xs group-hover:scale-[1.02] transition-transform"
              loading="lazy"
            />
            <span className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white p-0.5 rounded-full ring-2 ring-white">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="flex-1 min-w-0">
            {/* Specialty tag */}
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-100 mb-1.5">
              {doctor.specialtyName}
            </span>

            {/* Doctor Name */}
            <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate group-hover:text-sky-600 transition-colors">
              {doctor.name}
            </h3>

            {/* Rating & reviews */}
            <div className="flex items-center gap-1.5 text-xs mt-1">
              <div className="flex items-center text-amber-500 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400 mr-0.5" />
                {doctor.rating}
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">({doctor.reviewCount} đánh giá)</span>
            </div>

            {/* Experience & City */}
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-600">
              <div className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>{doctor.experienceYears} năm kinh nghiệm</span>
              </div>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <div className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{doctor.city}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio summary */}
        {doctor.bio && (
          <p className="mt-3.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {doctor.bio}
          </p>
        )}

        {/* Workplace address */}
        {doctor.workplace && (
          <div className="mt-3 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100/80 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0"></span>
            <span className="truncate">{doctor.workplace}</span>
          </div>
        )}
      </div>

      {/* Bottom Footer: Price & CTA */}
      <div className="px-5 sm:px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-[11px] text-slate-400 font-medium block">Giá khám cơ bản</span>
          <span className="text-base font-extrabold text-sky-700">
            {formatCurrency(doctor.examFee)}
          </span>
        </div>

        <button
          onClick={handleBook}
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-sky-600 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 rounded-xl shadow-md shadow-sky-500/20 hover:shadow-lg transition-all cursor-pointer group-hover:gap-2"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Đặt lịch</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
