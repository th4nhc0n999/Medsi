import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  Calendar,
  History,
  Users,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Filter,
  RefreshCw,
} from 'lucide-react';
import BookingCard from '../components/BookingCard';
import PatientProfileCard from '../components/PatientProfileCard';
import Modal from '../components/Modal';
import { STORAGE_KEYS, getStorage, setStorage } from '../utils/storage';
import { generateUniqueId } from '../utils/generateCode';
import { validatePatientDob, validatePhoneNumber, validateFullName } from '../utils/validators';

export default function AccountPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab: 'bookings' | 'history' | 'profiles' | 'info'
  const tabFromQuery = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromQuery || 'bookings');

  // Load Current User
  const [currentUser, setCurrentUser] = useState(null);

  // Data states
  const [bookings, setBookings] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    const user = getStorage(STORAGE_KEYS.CURRENT_USER, null);
    if (user) {
      const allBookings = getStorage(STORAGE_KEYS.BOOKINGS, []);
      setBookings(allBookings.filter((b) => b.userId === user.id));
      const allProfiles = getStorage(STORAGE_KEYS.PATIENT_PROFILES, []);
      setProfiles(allProfiles.filter((p) => p.userId === user.id));
    }
    showToast('Đã làm mới dữ liệu tài khoản');
    setTimeout(() => setIsRefreshing(false), 450);
  };

  // Profile Modal State (Add or Edit)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState(null);
  const [profileFullName, setProfileFullName] = useState('');
  const [profileDob, setProfileDob] = useState('');
  const [profileGender, setProfileGender] = useState('Nam');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileRelationship, setProfileRelationship] = useState('Bản thân');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileError, setProfileError] = useState('');

  // Cancel Booking Modal State
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('Bận việc đột xuất');

  // History Filter
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all' | 'completed' | 'cancelled'

  // Load user data on mount
  useEffect(() => {
    const user = getStorage(STORAGE_KEYS.CURRENT_USER, null);
    if (!user) {
      navigate('/auth');
      return;
    }
    setCurrentUser(user);

    // Load bookings for current user
    const allBookings = getStorage(STORAGE_KEYS.BOOKINGS, []);
    const userBookings = allBookings.filter((b) => b.userId === user.id);
    setBookings(userBookings);

    // Load profiles for current user
    const allProfiles = getStorage(STORAGE_KEYS.PATIENT_PROFILES, []);
    const userProfiles = allProfiles.filter((p) => p.userId === user.id);
    setProfiles(userProfiles);
  }, [navigate]);

  // Sync tab with query params
  useEffect(() => {
    if (tabFromQuery && ['bookings', 'history', 'profiles', 'info'].includes(tabFromQuery)) {
      setActiveTab(tabFromQuery);
    }
  }, [tabFromQuery]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // Open Add Profile Modal
  const handleOpenAddProfile = () => {
    setEditingProfileId(null);
    setProfileFullName('');
    setProfileDob('');
    setProfileGender('Nam');
    setProfilePhone(currentUser?.phone || '');
    setProfileRelationship('Người thân');
    setProfileAddress('');
    setProfileError('');
    setIsProfileModalOpen(true);
  };

  // Open Edit Profile Modal
  const handleOpenEditProfile = (profile) => {
    setEditingProfileId(profile.id);
    setProfileFullName(profile.fullName);
    setProfileDob(profile.dob);
    setProfileGender(profile.gender || 'Nam');
    setProfilePhone(profile.phone);
    setProfileRelationship(profile.relationship || 'Bản thân');
    setProfileAddress(profile.address || '');
    setProfileError('');
    setIsProfileModalOpen(true);
  };

  // Delete Profile
  const handleDeleteProfile = (profile) => {
    if (window.confirm(`Bạn có chắc muốn xóa hồ sơ bệnh nhân "${profile.fullName}" không?`)) {
      const allProfiles = getStorage(STORAGE_KEYS.PATIENT_PROFILES, []);
      const updated = allProfiles.filter((p) => p.id !== profile.id);
      setStorage(STORAGE_KEYS.PATIENT_PROFILES, updated);
      setProfiles((prev) => prev.filter((p) => p.id !== profile.id));
    }
  };

  // Save Profile (Add or Edit)
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileError('');

    const nameCheck = validateFullName(profileFullName);
    if (!nameCheck.isValid) {
      setProfileError(nameCheck.error);
      return;
    }

    const dobCheck = validatePatientDob(profileDob);
    if (!dobCheck.isValid) {
      setProfileError(dobCheck.error);
      return;
    }

    const phoneCheck = validatePhoneNumber(profilePhone);
    if (!phoneCheck.isValid) {
      setProfileError(phoneCheck.error);
      return;
    }

    const normalizedPhone = phoneCheck.normalized;
    const allProfiles = getStorage(STORAGE_KEYS.PATIENT_PROFILES, []);

    if (editingProfileId) {
      // Update
      const updated = allProfiles.map((p) => {
        if (p.id === editingProfileId) {
          return {
            ...p,
            fullName: profileFullName.trim(),
            dob: profileDob,
            gender: profileGender,
            phone: normalizedPhone,
            relationship: profileRelationship,
            address: profileAddress.trim(),
          };
        }
        return p;
      });
      setStorage(STORAGE_KEYS.PATIENT_PROFILES, updated);
      setProfiles(updated.filter((p) => p.userId === currentUser.id));
    } else {
      // Create new
      const newProf = {
        id: generateUniqueId('prof'),
        userId: currentUser.id,
        fullName: profileFullName.trim(),
        dob: profileDob,
        gender: profileGender,
        phone: normalizedPhone,
        relationship: profileRelationship,
        address: profileAddress.trim(),
        createdAt: new Date().toISOString(),
      };
      const updated = [...allProfiles, newProf];
      setStorage(STORAGE_KEYS.PATIENT_PROFILES, updated);
      setProfiles((prev) => [...prev, newProf]);
    }

    setIsProfileModalOpen(false);
  };

  // Cancel Booking
  const handleConfirmCancelBooking = () => {
    if (!cancellingBooking) return;

    const allBookings = getStorage(STORAGE_KEYS.BOOKINGS, []);
    const updated = allBookings.map((b) => {
      if (b.id === cancellingBooking.id) {
        return {
          ...b,
          status: 'cancelled',
          cancelReason: cancelReason,
          cancelledAt: new Date().toISOString(),
        };
      }
      return b;
    });

    setStorage(STORAGE_KEYS.BOOKINGS, updated);
    setBookings(updated.filter((b) => b.userId === currentUser.id));
    setCancellingBooking(null);
  };

  // Filter Bookings: Current (pending, approved) vs History (completed, cancelled)
  const currentBookings = bookings.filter(
    (b) => b.status === 'pending' || b.status === 'approved'
  );

  const historyBookings = bookings.filter((b) => {
    const isHistory = b.status === 'completed' || b.status === 'cancelled';
    if (!isHistory) return false;
    if (historyFilter === 'all') return true;
    return b.status === historyFilter;
  });

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* User Hero Header */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center text-2xl font-black shadow-md shadow-sky-500/20">
                {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                    {currentUser.fullName}
                  </h1>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                    {currentUser.role === 'admin'
                      ? 'Quản trị viên'
                      : currentUser.role === 'doctor'
                      ? 'Bác sĩ'
                      : 'Bệnh nhân'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {currentUser.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {currentUser.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick stats badge & Refresh */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-lg font-extrabold text-sky-700 block">
                  {currentBookings.length}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Lịch hẹn sắp tới</span>
              </div>
              <div className="px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-lg font-extrabold text-slate-700 block">
                  {profiles.length}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Hồ sơ người khám</span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 active:scale-95 text-slate-700 text-xs font-bold rounded-2xl shadow-xs transition-all cursor-pointer disabled:opacity-60"
                title="Cập nhật lại lịch khám và hồ sơ"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Đang tải...' : 'Làm mới'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Account Page Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-6 overflow-x-auto gap-2">
          <button
            onClick={() => handleTabChange('bookings')}
            type="button"
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Lịch khám hiện tại</span>
            {currentBookings.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                {currentBookings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange('history')}
            type="button"
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Lịch sử khám</span>
          </button>

          <button
            onClick={() => handleTabChange('profiles')}
            type="button"
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profiles'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Hồ sơ bệnh nhân</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {profiles.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('info')}
            type="button"
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Thông tin tài khoản</span>
          </button>
        </div>

        {/* TAB 1: CURRENT BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {currentBookings.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {currentBookings.map((b) => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    onCancelRequest={(bk) => setCancellingBooking(bk)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center shadow-xs">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">
                  Bạn không có lịch khám nào đang chờ
                </h3>
                <p className="text-xs text-slate-500 mt-1 mb-5 max-w-sm mx-auto">
                  Hãy chọn bác sĩ hoặc cơ sở y tế uy tín trên MedSi để đặt lịch khám nhanh chóng.
                </p>
                <button
                  onClick={() => navigate('/explore')}
                  type="button"
                  className="px-5 py-2.5 bg-sky-600 bg-gradient-to-r from-sky-600 to-cyan-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer hover:bg-sky-700"
                >
                  Khám phá Bác sĩ & Bệnh viện
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: APPOINTMENT HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {/* History Filter Bar */}
            <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200/90 text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                Lọc trạng thái lịch cũ:
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setHistoryFilter('all')}
                  type="button"
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    historyFilter === 'all'
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả ({bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled').length})
                </button>
                <button
                  onClick={() => setHistoryFilter('completed')}
                  type="button"
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    historyFilter === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Đã hoàn thành
                </button>
                <button
                  onClick={() => setHistoryFilter('cancelled')}
                  type="button"
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    historyFilter === 'cancelled'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Đã hủy
                </button>
              </div>
            </div>

            {historyBookings.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {historyBookings.map((b) => (
                  <BookingCard key={b.id} booking={b} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center shadow-xs">
                <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">
                  Chưa có lịch sử khám bệnh nào
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Các lịch khám đã hoàn tất hoặc đã hủy sẽ hiển thị lưu trữ tại đây.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PATIENT PROFILES MANAGEMENT */}
        {activeTab === 'profiles' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Hồ sơ bệnh nhân ({profiles.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Quản lý thông tin y tế của bản thân và các thành viên trong gia đình
                </p>
              </div>
              <button
                onClick={handleOpenAddProfile}
                type="button"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm hồ sơ mới</span>
              </button>
            </div>

            {profiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profiles.map((profile) => (
                  <PatientProfileCard
                    key={profile.id}
                    profile={profile}
                    onEdit={handleOpenEditProfile}
                    onDelete={handleDeleteProfile}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">Chưa có hồ sơ người khám</h4>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Tạo hồ sơ để điền nhanh thông tin trong quá trình đặt lịch khám.
                </p>
                <button
                  onClick={handleOpenAddProfile}
                  type="button"
                  className="px-4 py-2 bg-sky-600 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Thêm hồ sơ đầu tiên
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ACCOUNT INFO */}
        {activeTab === 'info' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs max-w-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
              <User className="w-5 h-5 text-sky-600" />
              <span>Thông tin cá nhân & Tài khoản</span>
            </h3>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-3 py-2 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Họ và tên:</span>
                <span className="col-span-2 font-bold text-slate-900">{currentUser.fullName}</span>
              </div>

              <div className="grid grid-cols-3 py-2 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Địa chỉ Email:</span>
                <span className="col-span-2 font-semibold text-slate-800">{currentUser.email}</span>
              </div>

              <div className="grid grid-cols-3 py-2 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Số điện thoại:</span>
                <span className="col-span-2 font-semibold text-slate-800">{currentUser.phone}</span>
              </div>

              <div className="grid grid-cols-3 py-2 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Vai trò hệ thống:</span>
                <span className="col-span-2 font-semibold text-sky-700 capitalize">
                  {currentUser.role === 'admin' ? 'Quản trị viên (Admin)' : 'Bệnh nhân (Patient)'}
                </span>
              </div>

              <div className="grid grid-cols-3 py-2">
                <span className="text-slate-500 font-medium">Ngày gia nhập:</span>
                <span className="col-span-2 text-slate-600">
                  {new Date(currentUser.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT PATIENT PROFILE */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title={editingProfileId ? 'Chỉnh sửa hồ sơ bệnh nhân' : 'Thêm hồ sơ bệnh nhân mới'}
        subtitle="Thông tin sẽ được sử dụng khi đăng ký khám tại các cơ sở y tế"
      >
        <form onSubmit={handleSaveProfile} className="space-y-3.5">
          {profileError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {profileError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Họ và tên bệnh nhân <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={profileFullName}
              onChange={(e) => setProfileFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-sky-500 focus:bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Mối quan hệ
            </label>
            <select
              value={profileRelationship}
              onChange={(e) => setProfileRelationship(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-sky-500 focus:bg-white text-slate-800 cursor-pointer"
            >
              <option value="Bản thân">Bản thân</option>
              <option value="Con">Con</option>
              <option value="Cha">Cha</option>
              <option value="Mẹ">Mẹ</option>
              <option value="Người thân">Người thân</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ngày sinh <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={profileDob}
                max={new Date().toISOString().slice(0, 10)}
                min="1900-01-01"
                onChange={(e) => setProfileDob(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-sky-500 focus:bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Giới tính
              </label>
              <select
                value={profileGender}
                onChange={(e) => setProfileGender(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-sky-500 focus:bg-white text-slate-800 cursor-pointer"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Số điện thoại liên hệ <span className="text-rose-500">*</span> <span className="text-[11px] font-normal text-slate-400 lowercase">(9 - 11 chữ số)</span>
            </label>
            <input
              type="tel"
              value={profilePhone}
              onChange={(e) => setProfilePhone(e.target.value)}
              placeholder="0901234567"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-sky-500 focus:bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Địa chỉ nơi ở
            </label>
            <input
              type="text"
              value={profileAddress}
              onChange={(e) => setProfileAddress(e.target.value)}
              placeholder="Quận 1, TP. Hồ Chí Minh"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-sky-500 focus:bg-white text-slate-800"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md cursor-pointer"
            >
              {editingProfileId ? 'Lưu thay đổi' : 'Tạo hồ sơ'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CONFIRM CANCEL APPOINTMENT */}
      <Modal
        isOpen={Boolean(cancellingBooking)}
        onClose={() => setCancellingBooking(null)}
        title="Xác nhận hủy lịch khám"
        subtitle="Hành động này không thể hoàn tác sau khi xác nhận"
      >
        {cancellingBooking && (
          <div className="space-y-4">
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-800 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Bạn đang yêu cầu hủy lịch khám mã{' '}
                <strong>{cancellingBooking.code}</strong> tại{' '}
                <strong>{cancellingBooking.providerName}</strong> ({cancellingBooking.date}).
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Lý do hủy lịch:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 cursor-pointer"
              >
                <option value="Bận việc đột xuất">Bận việc đột xuất không thể sắp xếp</option>
                <option value="Đã khám tại cơ sở khác">Đã khám tại cơ sở khác</option>
                <option value="Đặt nhầm ngày giờ">Đặt nhầm ngày hoặc khung giờ</option>
                <option value="Sức khỏe đã ổn định">Sức khỏe đã ổn định</option>
                <option value="Khác">Lý do khác</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
              >
                Không, giữ lịch
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelBooking}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md cursor-pointer"
              >
                Đồng ý hủy lịch
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900/95 text-white text-xs font-semibold rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md animate-fade-in transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
