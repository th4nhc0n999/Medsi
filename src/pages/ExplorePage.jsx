import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import FilterBar from '../components/FilterBar';
import DoctorCard from '../components/DoctorCard';
import HospitalCard from '../components/HospitalCard';
import { DOCTORS } from '../data/doctors';
import { HOSPITALS } from '../data/hospitals';
import { SPECIALTIES } from '../data/specialties';
import { Stethoscope, Building2, Search, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'hospitals' ? 'hospitals' : 'doctors';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');

  // Tab switch handler
  const handleTabChange = (newTab) => {
    if (newTab === 'hospitals') {
      setSearchParams({ tab: 'hospitals' });
    } else {
      setSearchParams({ tab: 'doctors' });
    }
  };

  // Filter Doctors
  const filteredDoctors = DOCTORS.filter((doc) => {
    // Keyword
    const matchesKeyword =
      !searchQuery.trim() ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialtyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.workplace && doc.workplace.toLowerCase().includes(searchQuery.toLowerCase()));

    // Specialty
    const matchesSpecialty =
      selectedSpecialty === 'all' || doc.specialtyId === selectedSpecialty;

    // City
    const matchesCity =
      selectedCity === 'all' || selectedCity === 'Tất cả khu vực' || doc.city === selectedCity;

    return matchesKeyword && matchesSpecialty && matchesCity;
  });

  // Filter Hospitals
  const filteredHospitals = HOSPITALS.filter((hosp) => {
    // Keyword
    const matchesKeyword =
      !searchQuery.trim() ||
      hosp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hosp.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hosp.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    // Specialty
    let matchesSpecialty = true;
    if (selectedSpecialty !== 'all') {
      const specObj = SPECIALTIES.find((s) => s.id === selectedSpecialty);
      if (specObj) {
        matchesSpecialty = hosp.specialties.includes(specObj.name);
      }
    }

    // City
    const matchesCity =
      selectedCity === 'all' || selectedCity === 'Tất cả khu vực' || hosp.city === selectedCity;

    return matchesKeyword && matchesSpecialty && matchesCity;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-sky-50 via-white to-slate-50/60 border-b border-slate-200/80 pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Nền tảng đặt khám thông minh 4.0</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Tìm bác sĩ & Đặt lịch khám <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
                nhanh chóng, tin cậy
              </span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              Khám phá danh sách các Giáo sư, Bác sĩ chuyên khoa đầu ngành và hệ thống bệnh viện, phòng khám đạt chuẩn y khoa quốc tế.
            </p>

            {/* Quick feature bullets */}
            <div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Không cần bốc số chờ đợi</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Chi phí minh bạch, niêm yết rõ ràng</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Nhắc lịch khám tự động</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Filter Bar Component */}
        <FilterBar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedSpecialty={selectedSpecialty}
          setSelectedSpecialty={setSelectedSpecialty}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          doctorCount={filteredDoctors.length}
          hospitalCount={filteredHospitals.length}
        />

        {/* Results Section */}
        {activeTab === 'doctors' ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-sky-600" />
                <span>Danh sách Bác sĩ chuyên khoa ({filteredDoctors.length})</span>
              </h2>
            </div>

            {filteredDoctors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {filteredDoctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center my-6">
                <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700">
                  Không tìm thấy bác sĩ phù hợp
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Hãy thử thay đổi từ khóa tìm kiếm, chuyên khoa hoặc chọn lại thành phố.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-600" />
                <span>Danh sách Bệnh viện & Cơ sở y tế ({filteredHospitals.length})</span>
              </h2>
            </div>

            {filteredHospitals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {filteredHospitals.map((hospital) => (
                  <HospitalCard key={hospital.id} hospital={hospital} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center my-6">
                <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700">
                  Không tìm thấy bệnh viện phù hợp
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Hãy thử thay đổi bộ lọc tìm kiếm hoặc khu vực để xem thêm kết quả.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
