import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Calendar, 
  Award, 
  Clock, 
  ChevronRight, 
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Building2,
  Stethoscope,
  Info
} from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { SPECIALTIES } from '../services/mockData';

export const DoctorListPage = ({ 
  doctors = [], 
  onSelectDoctor, 
  initialSpecialty = '', 
  initialSearch = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty);
  const [priceRange, setPriceRange] = useState('all'); // all, under-350, 350-450, above-450
  const [sortBy, setSortBy] = useState('rating'); // rating, exp, price-asc, price-desc
  const [viewingDoctor, setViewingDoctor] = useState(null);

  // Filter & Sort Logic
  const filteredDoctors = useMemo(() => {
    return doctors
      .filter((doc) => {
        // Search filter
        if (searchTerm) {
          const q = searchTerm.toLowerCase().trim();
          const matchName = doc.name.toLowerCase().includes(q);
          const matchHospital = doc.hospital.toLowerCase().includes(q);
          const matchTitle = doc.title.toLowerCase().includes(q);
          const matchSpecialty = doc.specialtyName.toLowerCase().includes(q);
          if (!matchName && !matchHospital && !matchTitle && !matchSpecialty) return false;
        }

        // Specialty filter
        if (selectedSpecialty && selectedSpecialty !== 'all') {
          if (doc.specialtyId !== selectedSpecialty) return false;
        }

        // Price range filter
        if (priceRange === 'under-350') {
          if (doc.consultationFee >= 350000) return false;
        } else if (priceRange === '350-450') {
          if (doc.consultationFee < 350000 || doc.consultationFee > 450000) return false;
        } else if (priceRange === 'above-450') {
          if (doc.consultationFee <= 450000) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'exp') return b.experienceYears - a.experienceYears;
        if (sortBy === 'price-asc') return a.consultationFee - b.consultationFee;
        if (sortBy === 'price-desc') return b.consultationFee - a.consultationFee;
        return 0;
      });
  }, [doctors, searchTerm, selectedSpecialty, priceRange, sortBy]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('');
    setPriceRange('all');
    setSortBy('rating');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Page Title & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-medical-600 mb-2">
          <span>Trang chủ</span>
          <span>/</span>
          <span className="text-slate-500">Đội ngũ Bác sĩ</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Danh Sách Bác Sĩ Chuyên Khoa
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Lựa chọn bác sĩ giỏi, xem hồ sơ kinh nghiệm, giá khám công khai và đặt hẹn tức thì
        </p>
      </div>

      {/* Control Panel: Search & Filters */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-soft space-y-4">
        {/* Row 1: Search and Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên bác sĩ, bệnh viện, chuyên khoa..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-medical-500/20 focus:border-medical-500 transition-all"
            />
          </div>

          <div className="sm:col-span-4 flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-medical-500/20 focus:border-medical-500"
            >
              <option value="rating">Đánh giá cao nhất</option>
              <option value="exp">Kinh nghiệm nhiều nhất</option>
              <option value="price-asc">Giá khám: Thấp đến Cao</option>
              <option value="price-desc">Giá khám: Cao đến Thấp</option>
            </select>
          </div>
        </div>

        {/* Row 2: Specialty Pills */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Lọc theo Chuyên khoa:
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSpecialty('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                !selectedSpecialty
                  ? 'bg-medical-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              Tất cả chuyên khoa ({doctors.length})
            </button>
            {SPECIALTIES.map((spec) => (
              <button
                key={spec.id}
                onClick={() => setSelectedSpecialty(spec.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedSpecialty === spec.id
                    ? 'bg-medical-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }`}
              >
                {spec.name}
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: Price Filter & Reset */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Mức giá:</span>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'under-350', label: '< 350.000đ' },
              { id: '350-450', label: '350.000đ - 450.000đ' },
              { id: 'above-450', label: '> 450.000đ' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPriceRange(p.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  priceRange === p.id
                    ? 'bg-medical-100 text-medical-800 font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 text-slate-500 hover:text-medical-600 font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại bộ lọc</span>
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Tìm thấy <strong className="text-slate-900">{filteredDoctors.length}</strong> bác sĩ phù hợp
        </p>
      </div>

      {/* Doctors Grid */}
      {filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-soft hover:shadow-card hover:border-medical-400 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Doctor Header & Avatar */}
                <div className="p-5 pb-0 flex gap-4">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-slate-100 shadow-sm">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-1.5 left-1.5 bg-white/95 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-amber-600 flex items-center gap-0.5 shadow-sm">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{doc.rating}</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-medical-50 text-medical-700 border border-medical-200/70 mb-1">
                      {doc.specialtyName}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-medical-600 transition-colors">
                      {doc.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{doc.title}</p>
                    
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 font-medium">
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-medical-600" />
                        {doc.experienceYears} năm KN
                      </span>
                      <span>•</span>
                      <span>{doc.reviewCount} đánh giá</span>
                    </div>
                  </div>
                </div>

                {/* Doctor Bio and Clinic */}
                <div className="p-5 space-y-3">
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "{doc.bio}"
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-700 truncate">{doc.hospital}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-slate-500 truncate">{doc.address}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-slate-500 truncate">Lịch khám: {doc.workingDays.join(', ')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Price & Action */}
              <div className="p-5 pt-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-slate-500 block">Giá khám:</span>
                  <span className="text-base font-extrabold text-medical-700">
                    {new Intl.NumberFormat('vi-VN').format(doc.consultationFee)} đ
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewingDoctor(doc)}
                  >
                    Chi tiết
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Calendar}
                    onClick={() => onSelectDoctor(doc)}
                  >
                    Đặt hẹn
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Không tìm thấy bác sĩ phù hợp</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Rất tiếc, không có bác sĩ nào khớp với tiêu chí tìm kiếm của bạn. Hãy thử đổi từ khóa hoặc đặt lại bộ lọc.
          </p>
          <Button variant="secondary" size="md" icon={RotateCcw} onClick={handleResetFilters}>
            Xóa bộ lọc tìm kiếm
          </Button>
        </div>
      )}

      {/* Doctor Detail Modal */}
      {viewingDoctor && (
        <Modal
          isOpen={!!viewingDoctor}
          onClose={() => setViewingDoctor(null)}
          title="Thông tin chi tiết Bác sĩ"
          subtitle={viewingDoctor.specialtyName}
        >
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
              <img
                src={viewingDoctor.avatar}
                alt={viewingDoctor.name}
                className="w-28 h-28 rounded-2xl object-cover shadow-md border-2 border-medical-100"
              />
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-medical-50 text-medical-700 border border-medical-200">
                  {viewingDoctor.specialtyName}
                </span>
                <h3 className="text-xl font-bold text-slate-900">{viewingDoctor.name}</h3>
                <p className="text-sm font-medium text-slate-600">{viewingDoctor.title}</p>
                <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 font-semibold">
                  <span className="flex items-center gap-1 text-amber-600">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    {viewingDoctor.rating} / 5.0 ({viewingDoctor.reviewCount} đánh giá)
                  </span>
                  <span>•</span>
                  <span>{viewingDoctor.experienceYears} năm kinh nghiệm</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 text-sm">
              <h4 className="font-bold text-slate-800">Giới thiệu chuyên môn:</h4>
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {viewingDoctor.bio}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1 font-semibold">Nơi công tác:</span>
                <strong className="text-slate-800 block">{viewingDoctor.hospital}</strong>
                <span className="text-slate-500">{viewingDoctor.address}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1 font-semibold">Lịch nhận khám bệnh:</span>
                <strong className="text-slate-800 block">{viewingDoctor.workingDays.join(', ')}</strong>
                <span className="text-slate-500">Giờ khám: 08:00 - 16:30</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-medical-50 border border-medical-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-medical-700 block">Chi phí khám tư vấn ban đầu:</span>
                <span className="text-lg font-black text-medical-800">
                  {new Intl.NumberFormat('vi-VN').format(viewingDoctor.consultationFee)} VNĐ
                </span>
              </div>
              <Button
                variant="primary"
                size="md"
                icon={Calendar}
                onClick={() => {
                  const doc = viewingDoctor;
                  setViewingDoctor(null);
                  onSelectDoctor(doc);
                }}
              >
                Đặt khám ngay
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DoctorListPage;
