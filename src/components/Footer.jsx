import React from 'react';
import { 
  HeartPulse, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck, 
  Award, 
  Sparkles,
  ExternalLink 
} from 'lucide-react';

export const Footer = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1 & 2: Brand & About */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-medical-500 to-medical-600 flex items-center justify-center text-white shadow-md">
                <HeartPulse className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Med<span className="text-medical-400">si</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed pr-6">
              Hệ thống kết nối người bệnh và đội ngũ chuyên gia, bác sĩ đầu ngành tại các bệnh viện uy tín. Đặt hẹn chủ động, tiết kiệm thời gian chờ đợi, nâng cao chất lượng chăm sóc sức khỏe cộng đồng.
            </p>
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Bảo mật y tế 100%</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Award className="w-4 h-4 text-sky-400" />
                <span>Bác sĩ đầu ngành</span>
              </div>
            </div>
          </div>

          {/* Col 3: Điều hướng nhanh */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Khám phá nhanh
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => onNavigate('home')} 
                  className="hover:text-medical-400 transition-colors text-left"
                >
                  Trang chủ giới thiệu
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('doctors')} 
                  className="hover:text-medical-400 transition-colors text-left"
                >
                  Danh sách Bác sĩ
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('booking')} 
                  className="hover:text-medical-400 transition-colors text-left"
                >
                  Đặt lịch khám bệnh
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('history')} 
                  className="hover:text-medical-400 transition-colors text-left"
                >
                  Tra cứu hồ sơ lịch hẹn
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('admin')} 
                  className="hover:text-medical-400 transition-colors text-left"
                >
                  Trang Quản trị phòng khám
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Chuyên khoa chính */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Chuyên khoa tiêu biểu
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Tim Mạch can thiệp</li>
              <li>Da Liễu & Thẩm mỹ</li>
              <li>Nhi Khoa toàn diện</li>
              <li>Cơ Xương Khớp</li>
              <li>Thần Kinh & Giấc ngủ</li>
              <li>Nha Khoa Thẩm mỹ</li>
            </ul>
          </div>

          {/* Col 5: Liên hệ & Hỗ trợ */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Hỗ trợ 24/7
            </h4>
            <div className="space-y-2.5 text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-medical-400 shrink-0 mt-0.5" />
                <span>215 Hồng Bàng, P.11, Q.5, TP.HCM</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-white font-semibold">1900 8888 / 028 3855 4269</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>support@medsi.vn</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Thứ 2 - Thứ 7: 07:30 - 17:30<br/>Chủ Nhật: 07:30 - 12:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Medsi Clinic Booking MVP. Đồ án môn Phát triển Ứng dụng Web (IS207).</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400">Frontend-Only (React + LocalStorage)</span>
            <span>•</span>
            <span className="hover:text-slate-400">Thiết kế bởi Vũ Tuấn Anh</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
