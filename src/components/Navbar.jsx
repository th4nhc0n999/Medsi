import React, { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Activity,
  User,
  Calendar,
  LogOut,
  LogIn,
  Menu,
  X,
  ShieldCheck,
  Stethoscope,
  Building2,
  ChevronDown,
  Search,
} from 'lucide-react';
import { STORAGE_KEYS, getStorage, removeStorage } from '../utils/storage';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentUser = getStorage(STORAGE_KEYS.CURRENT_USER, null);
  const isAdmin = currentUser?.role === 'admin';
  const isDoctor = currentUser?.role === 'doctor';

  const currentTab = searchParams.get('tab');
  const isExploreDoctors = location.pathname === '/explore' && currentTab !== 'hospitals';
  const isExploreHospitals = location.pathname === '/explore' && currentTab === 'hospitals';

  const handleLogout = () => {
    removeStorage(STORAGE_KEYS.CURRENT_USER);
    setMobileMenuOpen(false);
    navigate('/auth');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            to={currentUser ? (isAdmin ? '/admin' : isDoctor ? '/doctor' : '/explore') : '/auth'}
            className="flex items-center gap-2.5 group focus:outline-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-sky-600 transition-colors">
                  Med<span className="text-sky-600">Si</span>
                </span>
                {isAdmin && (
                  <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-sky-100 text-sky-800 rounded">
                    Admin
                  </span>
                )}
                {isDoctor && (
                  <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800 rounded">
                    Bác sĩ
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-medium -mt-1 hidden sm:block">
                Hệ thống đặt lịch khám bệnh
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {isAdmin ? (
              // Admin Navigation
              <>
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive('/admin')
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  Dashboard & Quản lý Lịch
                </Link>
                <Link
                  to="/explore"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive('/explore')
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Stethoscope className="w-4 h-4 text-slate-400" />
                  Xem giao diện Patient
                </Link>
              </>
            ) : isDoctor ? (
              // Doctor Navigation
              <>
                <Link
                  to="/doctor"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive('/doctor')
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Quản lý Lịch & Ca khám
                </Link>
                <Link
                  to="/explore"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive('/explore')
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Stethoscope className="w-4 h-4 text-slate-400" />
                  Xem giao diện Đặt khám
                </Link>
              </>
            ) : (
              // Patient / Public Navigation
              <>
                <Link
                  to="/explore?tab=doctors"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isExploreDoctors
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Stethoscope className="w-4 h-4 text-sky-600" />
                  Khám bác sĩ
                </Link>
                <Link
                  to="/explore?tab=hospitals"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isExploreHospitals
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-cyan-600" />
                  Khám bệnh viện
                </Link>
                <Link
                  to="/lookup"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive('/lookup')
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Search className="w-4 h-4 text-amber-600" />
                  Tra cứu lịch hẹn
                </Link>
                {currentUser && (
                  <Link
                    to="/account?tab=bookings"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
                  >
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Lịch khám của tôi
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Desktop Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <Link
                  to={isDoctor ? '/doctor' : '/account'}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all ${
                    isActive(isDoctor ? '/doctor' : '/account')
                      ? 'border-sky-300 bg-sky-50/70 text-sky-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-bold text-slate-900 leading-tight max-w-[120px] truncate">
                      {currentUser.fullName || 'Tài khoản'}
                    </p>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {isAdmin ? 'Quản trị viên' : isDoctor ? 'Bác sĩ' : 'Bệnh nhân'}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  type="button"
                  title="Đăng xuất"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-sky-600 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 rounded-xl shadow-md shadow-sky-500/20 hover:shadow-lg transition-all"
              >
                <LogIn className="w-4 h-4" />
                Đăng nhập / Đăng ký
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center md:hidden gap-2">
            {currentUser && (
              <Link
                to="/account"
                className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold"
              >
                {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-2 animate-fade-in shadow-xl">
          {isAdmin ? (
            <>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700"
              >
                <ShieldCheck className="w-5 h-5 text-sky-600" />
                Dashboard & Quản lý Lịch
              </Link>
              <Link
                to="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700"
              >
                <Stethoscope className="w-5 h-5 text-slate-400" />
                Xem giao diện Bệnh nhân
              </Link>
            </>
          ) : isDoctor ? (
            <>
              <Link
                to="/doctor"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-emerald-800 bg-emerald-50"
              >
                <Calendar className="w-5 h-5 text-emerald-600" />
                Quản lý Lịch & Ca khám
              </Link>
              <Link
                to="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700"
              >
                <Stethoscope className="w-5 h-5 text-slate-400" />
                Xem giao diện Đặt khám
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/explore?tab=doctors"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isExploreDoctors
                    ? 'bg-sky-50 text-sky-700 font-bold'
                    : 'text-slate-700 hover:bg-sky-50 hover:text-sky-700'
                }`}
              >
                <Stethoscope className="w-5 h-5 text-sky-600" />
                Khám bác sĩ
              </Link>
              <Link
                to="/explore?tab=hospitals"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isExploreHospitals
                    ? 'bg-sky-50 text-sky-700 font-bold'
                    : 'text-slate-700 hover:bg-sky-50 hover:text-sky-700'
                }`}
              >
                <Building2 className="w-5 h-5 text-cyan-600" />
                Khám bệnh viện
              </Link>
              <Link
                to="/lookup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700"
              >
                <Search className="w-5 h-5 text-amber-600" />
                Tra cứu lịch hẹn
              </Link>
              {currentUser && (
                <Link
                  to="/account?tab=bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                >
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  Lịch khám của tôi
                </Link>
              )}
            </>
          )}

          <div className="pt-3 border-t border-slate-100">
            {currentUser ? (
              <div className="space-y-2">
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 bg-slate-50"
                >
                  <User className="w-5 h-5 text-indigo-600" />
                  Hồ sơ tài khoản: <span className="font-bold">{currentUser.fullName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  type="button"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-sky-600 bg-gradient-to-r from-sky-600 to-cyan-600 rounded-xl shadow-md"
              >
                <LogIn className="w-4 h-4" />
                Đăng nhập / Đăng ký
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
