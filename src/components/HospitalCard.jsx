import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Building2, Calendar, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

export default function HospitalCard({ hospital }) {
  const navigate = useNavigate();

  // Find lowest price among examTypes
  const minPrice =
    hospital.examTypes && hospital.examTypes.length > 0
      ? Math.min(...hospital.examTypes.map((et) => et.fee))
      : 300000;

  const handleBook = () => {
    navigate(`/booking/hospital/${hospital.id}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-cyan-300 shadow-xs hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Hospital Hero Image */}
        <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100">
          <img
            src={hospital.image}
            alt={hospital.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>

          {/* City Pill */}
          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1">
            <MapPin className="w-3 h-3 text-cyan-600" />
            {hospital.city}
          </span>

          {/* Rating */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 text-xs text-white font-bold bg-slate-900/70 backdrop-blur-xs px-2.5 py-0.5 rounded-md">
            <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
            <span>{hospital.rating}</span>
            <span className="text-slate-300 font-normal">({hospital.reviewCount})</span>
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-cyan-700 transition-colors line-clamp-1">
            {hospital.name}
          </h3>

          <p className="mt-1.5 text-xs text-slate-500 flex items-start gap-1 line-clamp-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>{hospital.address}</span>
          </p>

          {hospital.description && (
            <p className="mt-2.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {hospital.description}
            </p>
          )}

          {/* Prominent Specialties */}
          <div className="mt-3.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Chuyên khoa nổi bật
            </span>
            <div className="flex flex-wrap gap-1.5">
              {hospital.specialties.slice(0, 4).map((spec) => (
                <span
                  key={spec}
                  className="px-2 py-0.5 text-[11px] rounded-md bg-cyan-50 text-cyan-800 font-medium border border-cyan-100/80"
                >
                  {spec}
                </span>
              ))}
              {hospital.specialties.length > 4 && (
                <span className="px-1.5 py-0.5 text-[11px] rounded-md bg-slate-100 text-slate-600 font-medium">
                  +{hospital.specialties.length - 4}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Price & CTA */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-[11px] text-slate-400 font-medium block">Giá khám từ</span>
          <span className="text-base font-extrabold text-cyan-800">
            {formatCurrency(minPrice)}
          </span>
        </div>

        <button
          onClick={handleBook}
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-cyan-600 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-700 hover:to-sky-700 rounded-xl shadow-md shadow-cyan-500/20 hover:shadow-lg transition-all cursor-pointer group-hover:gap-2"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Đặt lịch</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
