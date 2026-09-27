import React, { useState } from 'react';
import { 
  HeartPulse, 
  Calendar, 
  ShieldCheck, 
  Stethoscope, 
  Clock, 
  Users, 
  Award, 
  Star, 
  ArrowRight, 
  CheckCircle2, 
  Search, 
  MapPin, 
  Sparkles, 
  Activity, 
  Baby, 
  Brain, 
  Eye, 
  Ear, 
  Smile, 
  ChevronRight,
  PhoneCall,
  CheckCircle
} from 'lucide-react';
import Button from '../components/Button';
import { SPECIALTIES } from '../services/mockData';

const iconMap = {
  HeartPulse,
  Sparkles,
  Baby,
  Activity,
  Brain,
  Eye,
  Ear,
  Smile,
};

export const HomePage = ({ onNavigate, onSelectDoctor, doctors = [] }) => {
  const [quickSearch, setQuickSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onNavigate('doctors', { search: quickSearch, specialty: selectedSpecialty });
  };

  const featuredDoctors = doctors.slice(0, 4);

  return (
    <div className="space-y-20 pb-20 animate-fade-in">
      {/* 1. HERO BANNER SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-medical-50/70 via-white to-slate-50 pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-medical-100 text-medical-800 text-xs font-bold tracking-wide border border-medical-200 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-medical-600" />
                <span>NỀN TẢNG ĐẶT LỊCH KHÁM CHUYÊN KHOA HÀNG ĐẦU</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Chăm sóc sức khỏe <br />
                <span className="bg-gradient-to-r from-medical-600 via-sky-600 to-teal-500 bg-clip-text text-transparent">
                  Chủ động & Tiện lợi
                </span>{' '}
                ngay tại nhà
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Kết nối trực tiếp với hơn 50+ Giáo sư, Tiến sĩ, Bác sĩ chuyên khoa đầu ngành. Đặt hẹn nhanh chóng trong 60 giây, không phải bốc số chờ đợi, nhắc lịch khám tự động.
              </p>

              {/* Quick Search Box */}
              <form 
                onSubmit={handleSearchSubmit}
                className="p-2 sm:p-2.5 bg-white rounded-2xl shadow-xl shadow-medical-900/5 border border-slate-200/90 flex flex-col sm:flex-row gap-2 max-w-xl"
              >
                <div className="flex-1 flex items-center gap-2.5 px-3 py-2">
                  <Search className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={quickSearch}
                    onChange={(e) => setQuickSearch(e.target.value)}
                    placeholder="Tìm tên bác sĩ, bệnh viện, triệu chứng..."
                    className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={Search}
                  className="rounded-xl shrink-0"
                >
                  Tìm kiếm
                </Button>
              </form>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  icon={Calendar}
                  onClick={() => onNavigate('booking')}
                  className="shadow-lg shadow-medical-600/30"
                >
                  Đặt lịch khám ngay
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onNavigate('history')}
                >
                  Tra cứu lịch hẹn của tôi
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 max-w-xl">
                <div>
                  <div className="text-2xl font-black text-medical-700">10,000+</div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">Lượt khám thành công</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-medical-700">50+</div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">Bác sĩ chuyên khoa giỏi</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-medical-700">99.2%</div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">Bệnh nhân hài lòng</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md">
                {/* Glow Backdrop */}
                <div className="absolute -inset-4 bg-gradient-to-r from-medical-400 to-teal-400 rounded-3xl opacity-20 blur-2xl -z-10" />

                {/* Main Card */}
                <div className="rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-6">
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-md group">
                    <img 
                      src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80" 
                      alt="Doctor Consultation" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-4">
                      <div className="text-white">
                        <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-500/90 rounded-md">
                          Trực tuyến 24/7
                        </span>
                        <h4 className="text-base font-bold mt-1">PGS.TS.BS Trần Minh Đức</h4>
                        <p className="text-xs text-slate-200">Trưởng khoa Tim Mạch Can Thiệp</p>
                      </div>
                    </div>
                  </div>

                  {/* Micro features list */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <div className="font-bold text-slate-800">Không phải bốc số chờ đợi</div>
                        <div className="text-slate-500">Đến đúng khung giờ hẹn được vào khám ngay</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-8 h-8 rounded-lg bg-medical-100 text-medical-600 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <div className="font-bold text-slate-800">Dữ liệu lưu trữ bảo mật</div>
                        <div className="text-slate-500">Tra cứu nhanh lịch sử khám bằng SĐT</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating pill badge */}
                <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">4.9 / 5.0 Sao</div>
                    <div className="text-xs text-slate-500">Từ hơn 2,500+ đánh giá thực tế</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CHUYÊN KHOA NỔI BẬT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-medical-600 bg-medical-50 px-3 py-1 rounded-full border border-medical-200">
            Dịch vụ chuyên sâu
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Chuyên Khoa Y Tế Nổi Bật
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Đa dạng các chuyên khoa khám chữa bệnh với thiết bị hiện đại cùng phác đồ điều trị chuẩn y khoa
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {SPECIALTIES.map((spec) => {
            const Icon = iconMap[spec.iconName] || Stethoscope;
            return (
              <div
                key={spec.id}
                onClick={() => onNavigate('doctors', { specialty: spec.id })}
                className="group bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft hover:shadow-card hover:border-medical-300 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-200 ${spec.bgColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 group-hover:text-medical-600 transition-colors">
                    {spec.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {spec.description}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-medical-600">
                  <span>{spec.doctorCount} Bác sĩ</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. BÁC SĨ TIÊU BIỂU */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-medical-600 bg-medical-50 px-3 py-1 rounded-full border border-medical-200">
              Chuyên gia đầu ngành
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
              Đội Ngũ Bác Sĩ Tiêu Biểu
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Đội ngũ bác sĩ giàu kinh nghiệm, tận tụy vì sức khỏe người bệnh
            </p>
          </div>
          <Button
            variant="outline"
            size="md"
            icon={ArrowRight}
            onClick={() => onNavigate('doctors')}
            className="self-start sm:self-auto"
          >
            Xem tất cả bác sĩ
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDoctors.map((doc) => (
            <div 
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-soft hover:shadow-card hover:border-medical-300 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-amber-600 flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{doc.rating}</span>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="text-[11px] font-semibold bg-medical-600/90 text-white px-2.5 py-1 rounded-md backdrop-blur-sm">
                      {doc.specialtyName}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h4 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-medical-600 transition-colors">
                    {doc.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {doc.title}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Giá khám:</span>
                    <span className="font-extrabold text-medical-700 text-sm">
                      {new Intl.NumberFormat('vi-VN').format(doc.consultationFee)} đ
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => onSelectDoctor(doc)}
                >
                  Đặt lịch khám
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. QUY TRÌNH ĐẶT LỊCH 4 BƯỚC */}
      <section className="bg-gradient-to-r from-medical-900 to-medical-800 text-white rounded-3xl max-w-7xl mx-auto px-6 sm:px-12 py-16 shadow-2xl relative overflow-hidden">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-medical-300 bg-white/10 px-3.5 py-1 rounded-full">
            Dễ dàng & Nhanh chóng
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-3 tracking-tight">
            Quy Trình Đặt Khám 4 Bước
          </h2>
          <p className="text-medical-100 text-sm mt-2">
            Chỉ với vài thao tác đơn giản trên điện thoại hoặc máy tính để hoàn tất lịch hẹn
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              step: '01',
              title: 'Chọn Chuyên Khoa & Bác Sĩ',
              desc: 'Lựa chọn bác sĩ theo kinh nghiệm, chuyên khoa hoặc bệnh viện bạn mong muốn.',
            },
            {
              step: '02',
              title: 'Chọn Ngày & Khung Giờ',
              desc: 'Xem lịch trống theo thời gian thực và chọn khung giờ phù hợp nhất với bạn.',
            },
            {
              step: '03',
              title: 'Điền Thông Tin Bệnh Nhân',
              desc: 'Cung cấp họ tên, SĐT và triệu chứng sơ bộ để bác sĩ chuẩn bị trước hồ sơ khám.',
            },
            {
              step: '04',
              title: 'Nhận Mã Hẹn & Đến Khám',
              desc: 'Nhận mã lịch hẹn tức thì. Đến phòng khám đúng giờ là được ưu tiên vào khám.',
            },
          ].map((item, idx) => (
            <div key={idx} className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
              <span className="text-4xl font-black text-medical-300/40">{item.step}</span>
              <h4 className="text-base font-bold text-white mt-3 mb-2">{item.title}</h4>
              <p className="text-xs text-medical-100/80 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            variant="primary"
            size="lg"
            icon={Calendar}
            onClick={() => onNavigate('booking')}
            className="bg-white text-medical-800 hover:bg-medical-50 shadow-xl"
          >
            Trải nghiệm đặt khám ngay
          </Button>
        </div>
      </section>

      {/* 5. VÌ SAO CHỌN MEDSI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-soft">
            <div className="w-12 h-12 rounded-xl bg-medical-50 text-medical-600 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">Tiết kiệm 80% thời gian chờ</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Không còn nỗi ám ảnh xếp hàng từ 5 giờ sáng. Chủ động chọn ngày giờ khám phù hợp với lịch làm việc cá nhân.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-soft">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">Bác sĩ kiểm định uy tín</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              100% bác sĩ có học hàm, học vị rõ ràng, chứng chỉ hành nghề hợp pháp và nhiều năm kinh nghiệm tại các bệnh viện tuyến đầu.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-soft">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">Bảo mật & Quản lý dễ dàng</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mọi lịch sử khám được lưu trữ an toàn, tra cứu tức thì bằng số điện thoại bất kỳ lúc nào mà không cần đăng nhập phức tạp.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
