import React from 'react';
import { Search, MapPin, Stethoscope, Building2, X, SlidersHorizontal } from 'lucide-react';
import { SPECIALTIES, CITIES } from '../data/specialties';

export default function FilterBar({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  selectedSpecialty,
  setSelectedSpecialty,
  selectedCity,
  setSelectedCity,
  doctorCount = 0,
  hospitalCount = 0,
}) {
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedSpecialty !== 'all' ||
    (selectedCity !== 'Tất cả khu vực' && selectedCity !== 'all');

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSpecialty('all');
    setSelectedCity('all');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs mb-8 space-y-4">
      {/* Top row: Tab Switcher (Doctors vs Hospitals) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="inline-flex p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('doctors')}
            type="button"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'doctors'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-sky-600" />
            <span>Bác sĩ chuyên khoa</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === 'doctors' ? 'bg-sky-100 text-sky-800' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {doctorCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('hospitals')}
            type="button"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'hospitals'
                ? 'bg-white text-cyan-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-cyan-600" />
            <span>Bệnh viện & Cơ sở</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === 'hospitals'
                  ? 'bg-cyan-100 text-cyan-800'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {hospitalCount}
            </span>
          </button>
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            type="button"
            className="self-end sm:self-center text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Filter controls row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Keyword Search */}
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'doctors'
                ? 'Tìm theo tên bác sĩ, chuyên môn hoặc phòng khám...'
                : 'Tìm theo tên bệnh viện, địa chỉ, chuyên khoa...'
            }
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 transition-all text-slate-800 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Specialty Filter */}
        <div className="md:col-span-3 relative">
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 transition-all text-slate-700 cursor-pointer appearance-none"
          >
            <option value="all">Tất cả chuyên khoa</option>
            {SPECIALTIES.map((spec) => (
              <option key={spec.id} value={spec.id}>
                {spec.name}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
            ▼
          </div>
        </div>

        {/* City Filter */}
        <div className="md:col-span-3 relative">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full pl-8 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 transition-all text-slate-700 cursor-pointer appearance-none"
          >
            <option value="all">Tất cả khu vực / Thành phố</option>
            {CITIES.filter((c) => c !== 'Tất cả khu vực').map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
            ▼
          </div>
        </div>
      </div>
    </div>
  );
}
