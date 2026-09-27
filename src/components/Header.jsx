import React, { useState } from 'react';
import { 
  HeartPulse, 
  Calendar, 
  UserCheck, 
  History, 
  LayoutDashboard, 
  PhoneCall, 
  Menu, 
  X,
  Stethoscope,
  ChevronRight
} from 'lucide-react';
import Button from './Button';

export const Header = ({ currentTab, onNavigate, pendingCount = 0 }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Trang chủ', icon: HeartPulse },
    { id: 'doctors', label: 'Đội ngũ Bác sĩ', icon: Stethoscope },
    { id: 'booking', label: 'Đặt lịch khám', icon: Calendar },
    { id: 'history', label: 'Tra cứu lịch hẹn', icon: History },
    { 
      id: 'admin', 
      label: 'Quản trị phòng khám', 
      icon: LayoutDashboard,
      badge: pendingCount > 0 ? pendingCount : null
    },
  ];

  const handleNavClick = (tabId) => {
    onNavigate(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav border-b border-slate-200/80 shadow-soft">
      {/* Top Banner Contact Bar */}
      <div className="hidden lg:block bg-gradient-to-r from-medical-900 to-medical-800 text-white text-xs py-1.5 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Hệ thống tiếp nhận đặt lịch 24/7 trực tuyến
            </span>
            <span className="text-slate-300">|</span>
            <span>Địa chỉ: 215 Hồng Bàng, P.11, Q.5, TP. Hồ Chí Minh</span>
          </div>
          <div className="flex items-center gap-4 font-medium">
            <a href="tel:19008888" className="flex items-center gap-1.5 hover:text-medical-200 transition-colors">
              <PhoneCall className="w-3.5 h-3.5 text-medical-300" />
              Tổng đài tư vấn: <strong className="text-white">1900 8888</strong>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-medical-500 to-medical-700 flex items-center justify-center text-white shadow-md shadow-medical-600/30 group-hover:scale-105 transition-transform duration-200">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-medical-700 to-medical-500 bg-clip-text text-transparent">
                  Medsi
                </span>
                <span className="bg-medical-50 text-medical-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-medical-200">
                  MVP
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 tracking-wider uppercase">
                Đặt khám y tế thông minh
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-medical-50 text-medical-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-medical-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge !== null && (
                    <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-rose-500 text-white shadow-sm">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-medical-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="primary"
              size="md"
              icon={Calendar}
              onClick={() => handleNavClick('booking')}
              className="shadow-md shadow-medical-600/25"
            >
              Đặt lịch khám ngay
            </Button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-slide-down">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-medical-50 text-medical-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-medical-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge !== undefined && item.badge !== null && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </button>
            );
          })}
          <div className="pt-3">
            <Button
              variant="primary"
              size="md"
              icon={Calendar}
              onClick={() => handleNavClick('booking')}
              className="w-full"
            >
              Đặt lịch khám ngay
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
