import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  LogIn,
  UserPlus,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { STORAGE_KEYS, getStorage, setStorage } from '../utils/storage';
import { generateUniqueId } from '../utils/generateCode';
import { validateEmail, validatePhoneNumber, validateFullName } from '../utils/validators';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoginTab, setIsLoginTab] = useState(true);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regErrors, setRegErrors] = useState({});
  const [regSuccess, setRegSuccess] = useState('');

  // Target destination if redirected from a protected route
  const from = location.state?.from?.pathname || '';

  // If already logged in, redirect
  useEffect(() => {
    const currentUser = getStorage(STORAGE_KEYS.CURRENT_USER, null);
    if (currentUser) {
      if (from) {
        navigate(from, { replace: true });
      } else if (currentUser.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/explore', { replace: true });
      }
    }
  }, [navigate, from]);

  // Quick Demo account fill
  const handleQuickLogin = (email, password) => {
    setLoginEmail(email);
    setLoginPassword(password);
    setLoginError('');
  };

  // Handle Login
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim()) {
      setLoginError('Vui lòng nhập địa chỉ email');
      return;
    }
    if (!loginPassword) {
      setLoginError('Vui lòng nhập mật khẩu');
      return;
    }

    const users = getStorage(STORAGE_KEYS.USERS, []);
    const foundUser = users.find(
      (u) =>
        u.email.toLowerCase() === loginEmail.trim().toLowerCase() &&
        u.password === loginPassword
    );

    if (!foundUser) {
      setLoginError('Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!');
      return;
    }

    // Set currentUser
    setStorage(STORAGE_KEYS.CURRENT_USER, foundUser);

    if (from) {
      navigate(from, { replace: true });
    } else if (foundUser.role === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/explore', { replace: true });
    }
  };

  // Handle Register
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    const nameCheck = validateFullName(regFullName);
    if (!nameCheck.isValid) {
      errors.fullName = nameCheck.error;
    }

    const emailCheck = validateEmail(regEmail);
    if (!emailCheck.isValid) {
      errors.email = emailCheck.error;
    }

    const phoneCheck = validatePhoneNumber(regPhone);
    if (!phoneCheck.isValid) {
      errors.phone = phoneCheck.error;
    }

    if (!regPassword) {
      errors.password = 'Mật khẩu là bắt buộc';
    } else if (regPassword.length < 6) {
      errors.password = 'Mật khẩu phải từ 6 ký tự';
    }
    if (regPassword !== regConfirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setRegErrors(errors);

    if (Object.keys(errors).length > 0) return;

    const users = getStorage(STORAGE_KEYS.USERS, []);
    const existing = users.find(
      (u) => u.email.toLowerCase() === regEmail.trim().toLowerCase()
    );
    if (existing) {
      setRegErrors({ email: 'Email này đã được đăng ký trong hệ thống' });
      return;
    }

    const normalizedPhone = phoneCheck.normalized || regPhone.trim();

    // Create new user
    const newUser = {
      id: generateUniqueId('usr'),
      fullName: regFullName.trim(),
      email: regEmail.trim().toLowerCase(),
      phone: normalizedPhone,
      password: regPassword,
      role: 'patient',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    setStorage(STORAGE_KEYS.USERS, users);

    // Also auto create initial patient profile for the user
    const profiles = getStorage(STORAGE_KEYS.PATIENT_PROFILES, []);
    const newProfile = {
      id: generateUniqueId('prof'),
      userId: newUser.id,
      fullName: newUser.fullName,
      dob: '1995-01-01',
      gender: 'Nam',
      phone: normalizedPhone,
      relationship: 'Bản thân',
      createdAt: new Date().toISOString(),
    };
    profiles.push(newProfile);
    setStorage(STORAGE_KEYS.PATIENT_PROFILES, profiles);

    // Auto login
    setStorage(STORAGE_KEYS.CURRENT_USER, newUser);
    setRegSuccess('Đăng ký tài khoản thành công! Đang chuyển hướng...');
    setTimeout(() => {
      navigate(from || '/explore', { replace: true });
    }, 800);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-50/80">
      <div className="w-full max-w-md">
        {/* Top Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 items-center justify-center text-white shadow-lg shadow-sky-500/25 mb-3">
            <Activity className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Chào mừng bạn đến với <span className="text-sky-600">MedSi</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Đặt lịch khám bệnh dễ dàng - Chăm sóc sức khỏe thông minh
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
            <button
              onClick={() => {
                setIsLoginTab(true);
                setLoginError('');
              }}
              type="button"
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isLoginTab
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Đăng nhập
            </button>
            <button
              onClick={() => {
                setIsLoginTab(false);
                setRegErrors({});
              }}
              type="button"
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                !isLoginTab
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Đăng ký
            </button>
          </div>

          {/* TAB 1: LOGIN FORM */}
          {isLoginTab ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 transition-all text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 transition-all text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-sky-600 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 shadow-md shadow-sky-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Đăng nhập</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Demo Accounts Quick Selection */}
              <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                  Tài khoản dùng thử (1-Click điền)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('demo@medsi.vn', '123456')}
                    className="p-2 text-left rounded-xl border border-sky-100 bg-sky-50/60 hover:bg-sky-100 text-sky-900 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <User className="w-3.5 h-3.5 text-sky-600" />
                      <span>Bệnh nhân</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">demo@medsi.vn</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@medsi.vn', 'admin123')}
                    className="p-2 text-left rounded-xl border border-indigo-100 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-900 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Quản trị viên</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">admin@medsi.vn</p>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* TAB 2: REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {regSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span>{regSuccess}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Nguyễn Văn An"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-sky-500 focus:bg-white text-slate-800"
                  />
                </div>
                {regErrors.fullName && (
                  <p className="text-rose-500 text-xs mt-1">{regErrors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email / Gmail <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="nguyenvanan@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-sky-500 focus:bg-white text-slate-800"
                  />
                </div>
                {regErrors.email && (
                  <p className="text-rose-500 text-xs mt-1">{regErrors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Số điện thoại <span className="text-rose-500">*</span> <span className="text-[11px] font-normal text-slate-400 lowercase">(9 - 11 chữ số)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-sky-500 focus:bg-white text-slate-800"
                  />
                </div>
                {regErrors.phone && (
                  <p className="text-rose-500 text-xs mt-1">{regErrors.phone}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mật khẩu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-sky-500 focus:bg-white text-slate-800"
                  />
                </div>
                {regErrors.password && (
                  <p className="text-rose-500 text-xs mt-1">{regErrors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Xác nhận mật khẩu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-sky-500 focus:bg-white text-slate-800"
                  />
                </div>
                {regErrors.confirmPassword && (
                  <p className="text-rose-500 text-xs mt-1">{regErrors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-sky-600 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 shadow-md shadow-sky-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Tạo tài khoản</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
