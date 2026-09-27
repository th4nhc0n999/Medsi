import React from 'react';
import { Activity, Phone, Mail, MapPin, Shield, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-md">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Med<span className="text-sky-400">Si</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nền tảng công nghệ y tế kết nối người bệnh với mạng lưới bác sĩ chuyên khoa và bệnh viện uy tín hàng đầu trên toàn quốc.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Bảo mật thông tin y tế theo chuẩn HIPAA</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Dịch vụ khám
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/explore?tab=doctors" className="hover:text-sky-400 transition-colors">
                  Đặt khám Bác sĩ chuyên khoa
                </Link>
              </li>
              <li>
                <Link to="/explore?tab=hospitals" className="hover:text-sky-400 transition-colors">
                  Đặt khám Bệnh viện & Phòng khám
                </Link>
              </li>
              <li>
                <Link to="/account?tab=bookings" className="hover:text-sky-400 transition-colors">
                  Tra cứu & Quản lý lịch hẹn
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Tư vấn sức khỏe từ xa (Sắp ra mắt)</span>
              </li>
            </ul>
          </div>

          {/* Specialities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Chuyên khoa tiêu biểu
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {['Tim mạch', 'Da liễu', 'Nhi khoa', 'Tai Mũi Họng', 'Nội tổng quát', 'Cơ xương khớp'].map(
                (spec) => (
                  <span
                    key={spec}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60"
                  >
                    {spec}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Hỗ trợ 24/7
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="font-semibold text-slate-200">1900 2805 (Tư vấn miễn phí)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>hotro@medsi.vn</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>128 Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Làm việc: 07:00 - 21:00 (Thứ 2 - CN)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} MedSi Healthcare Platform. Bản quyền thuộc về MedSi.</p>
          <p className="text-[11px] text-slate-500">
            * Hệ thống thử nghiệm prototype frontend - Dữ liệu minh họa lưu trữ cục bộ.
          </p>
        </div>
      </div>
    </footer>
  );
}
