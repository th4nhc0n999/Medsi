import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  FileText,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Plus,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Building2,
  MapPin,
  ShieldCheck,
  Star,
  Check,
} from 'lucide-react';
import SlotPicker from '../components/SlotPicker';
import PatientProfileCard from '../components/PatientProfileCard';
import Modal from '../components/Modal';
import { DOCTORS } from '../data/doctors';
import { HOSPITALS } from '../data/hospitals';
import { isSlotPast } from '../data/slots';
import { STORAGE_KEYS, getStorage, setStorage, getDoctorSchedule } from '../utils/storage';
import { formatCurrency } from '../utils/formatCurrency';
import { generateUniqueId } from '../utils/generateCode';
import { validatePatientDob, validatePhoneNumber, validateFullName } from '../utils/validators';

export default function BookingPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();

  // Load current user (state + storage)
  const [currentUser, setCurrentUser] = useState(() =>
    getStorage(STORAGE_KEYS.CURRENT_USER, null)
  );

  // Load provider data based on type
  const isDoctor = type === 'doctor';
  const doctor = isDoctor ? DOCTORS.find((d) => d.id === id) : null;
  const hospital = !isDoctor ? HOSPITALS.find((h) => h.id === id) : null;
  const provider = isDoctor ? doctor : hospital;

  // Selected service if hospital
  const [selectedExamType, setSelectedExamType] = useState(
    hospital?.examTypes?.[0] || null
  );

  // Form selections (React State)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });
  const [selectedSlot, setSelectedSlot] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [stepError, setStepError] = useState('');

  // Modal: New Profile
  const [isNewProfileModalOpen, setIsNewProfileModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newDob, setNewDob] = useState('1995-01-01');
  const [newGender, setNewGender] = useState('Nam');
  const [newPhone, setNewPhone] = useState(currentUser?.phone || '');
  const [newRelationship, setNewRelationship] = useState('Bản thân');
  const [newProfileError, setNewProfileError] = useState('');

  // Load and initialize patient profiles for the user
  useEffect(() => {
    const user = getStorage(STORAGE_KEYS.CURRENT_USER, null);
    if (user) {
      setCurrentUser(user);
      const allProfiles = getStorage(STORAGE_KEYS.PATIENT_PROFILES, []);
      let userProfiles = allProfiles.filter((p) => p.userId === user.id);

      // If user has no profile yet, auto-create a default self profile
      if (userProfiles.length === 0) {
        const defaultProfile = {
          id: generateUniqueId('prof'),
          userId: user.id,
          fullName: user.fullName || 'Bệnh nhân',
          dob: '1995-01-01',
          gender: 'Nam',
          phone: user.phone || '0901234567',
          relationship: 'Bản thân',
          createdAt: new Date().toISOString(),
        };
        allProfiles.push(defaultProfile);
        setStorage(STORAGE_KEYS.PATIENT_PROFILES, allProfiles);
        userProfiles = [defaultProfile];
      }

      setProfiles(userProfiles);
      if (!selectedProfileId && userProfiles.length > 0) {
        setSelectedProfileId(userProfiles[0].id);
      }
    } else {
      // If no currentUser in storage, load demo patient profiles as fallback
      const allProfiles = getStorage(STORAGE_KEYS.PATIENT_PROFILES, []);
      setProfiles(allProfiles);
      if (allProfiles.length > 0) {
        setSelectedProfileId(allProfiles[0].id);
      }
    }
  }, []);

  // Load booked slots from localStorage bookings to disable them
  const allBookings = getStorage(STORAGE_KEYS.BOOKINGS, []);
  const bookedSlots = allBookings
    .filter(
      (b) =>
        b.date === selectedDate &&
        b.status !== 'cancelled' &&
        ((isDoctor && b.doctorId === id) || (!isDoctor && b.hospitalId === id))
    )
    .map((b) => b.startTime);

  // Available slots for doctor from doctorSchedules
  const doctorAvailableSlots = isDoctor ? getDoctorSchedule(id, selectedDate) : [];

  // Pricing calculations
  const examFee = isDoctor
    ? doctor?.examFee || 300000
    : selectedExamType?.fee || 300000;
  const serviceFee = 30000;
  const totalAmount = examFee + serviceFee;

  // Selected Profile
  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);

  // Dynamic state condition: ALL required fields selected in React state
  const canContinue = Boolean(selectedDate && selectedSlot && selectedProfileId);

  // Helper to calculate end time (slot + 30 mins)
  function getEndTime(start) {
    if (!start) return '';
    const [h, m] = start.split(':').map(Number);
    const endMinutes = m + 30;
    const endHour = endMinutes >= 60 ? h + 1 : h;
    const remainingMinutes = endMinutes % 60;
    return `${String(endHour).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`;
  }

  // Create new profile handler
  const handleCreateProfile = (e) => {
    e.preventDefault();
    setNewProfileError('');

    const nameCheck = validateFullName(newFullName);
    if (!nameCheck.isValid) {
      setNewProfileError(nameCheck.error);
      return;
    }

    const dobCheck = validatePatientDob(newDob);
    if (!dobCheck.isValid) {
      setNewProfileError(dobCheck.error);
      return;
    }

    const phoneCheck = validatePhoneNumber(newPhone);
    if (!phoneCheck.isValid) {
      setNewProfileError(phoneCheck.error);
      return;
    }

    const userId = currentUser?.id || 'usr_demo_patient';
    const allProfiles = getStorage(STORAGE_KEYS.PATIENT_PROFILES, []);
    const createdProfile = {
      id: generateUniqueId('prof'),
      userId: userId,
      fullName: newFullName.trim(),
      dob: newDob,
      gender: newGender,
      phone: phoneCheck.normalized,
      relationship: newRelationship,
      createdAt: new Date().toISOString(),
    };

    const updated = [...allProfiles, createdProfile];
    setStorage(STORAGE_KEYS.PATIENT_PROFILES, updated);

    setProfiles((prev) => [...prev, createdProfile]);
    setSelectedProfileId(createdProfile.id);

    setNewFullName('');
    setNewDob('1995-01-01');
    setNewRelationship('Người thân');
    setIsNewProfileModalOpen(false);
  };

  // Main Action: Proceed to Payment
  const handleProceedToPayment = () => {
    setStepError('');

    if (!selectedDate) {
      setStepError('Vui lòng chọn ngày khám bệnh');
      return;
    }
    if (!selectedSlot) {
      setStepError('Vui lòng chọn khung giờ khám');
      return;
    }
    if (isSlotPast(selectedDate, selectedSlot)) {
      setStepError('Khung giờ khám này đã qua. Vui lòng chọn một khung giờ khác còn trống hoặc chọn ngày tiếp theo.');
      return;
    }
    if (!selectedProfileId) {
      setStepError('Vui lòng chọn hoặc tạo ít nhất một hồ sơ bệnh nhân');
      return;
    }

    // Ensure currentUser
    let user = getStorage(STORAGE_KEYS.CURRENT_USER, null);
    if (!user) {
      user = {
        id: 'usr_demo_patient',
        fullName: 'Nguyễn Văn An',
        email: 'demo@medsi.vn',
        phone: '0901234567',
        role: 'patient',
      };
      setStorage(STORAGE_KEYS.CURRENT_USER, user);
      setCurrentUser(user);
    }

    // Ensure selected profile
    let profile = selectedProfile;
    if (!profile) {
      profile = {
        id: selectedProfileId || generateUniqueId('prof'),
        userId: user.id,
        fullName: user.fullName || 'Bệnh nhân',
        phone: user.phone || '0901234567',
        dob: '1995-01-01',
        gender: 'Nam',
        relationship: 'Bản thân',
      };
    }

    // Build booking draft object
    const bookingDraft = {
      bookingType: type, // 'doctor' | 'hospital'
      doctorId: isDoctor ? doctor.id : null,
      hospitalId: !isDoctor ? hospital.id : null,
      examTypeId: !isDoctor ? selectedExamType?.id : null,
      providerName: isDoctor ? doctor.name : hospital.name,
      providerAvatar: isDoctor ? doctor.avatar : hospital.image,
      providerAddress: isDoctor ? doctor.address || doctor.workplace : hospital.address,
      specialtyName: isDoctor ? doctor.specialtyName : selectedExamType?.name || 'Khám tổng quát',
      city: isDoctor ? doctor.city : hospital.city,
      date: selectedDate,
      startTime: selectedSlot,
      endTime: getEndTime(selectedSlot),
      patientProfileId: profile.id,
      patientName: profile.fullName,
      patientPhone: profile.phone,
      patientDob: profile.dob || '1995-01-01',
      patientGender: profile.gender || 'Nam',
      relationship: profile.relationship || 'Bản thân',
      symptoms: symptoms.trim() || 'Không có mô tả triệu chứng cụ thể',
      examFee,
      serviceFee,
      totalAmount,
      userId: user.id,
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage key 'bookingDraft'
    setStorage(STORAGE_KEYS.BOOKING_DRAFT, bookingDraft);

    // Direct React Router navigation to /payment
    navigate('/payment');
  };

  // Not found provider
  if (!provider) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy thông tin đơn vị khám</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          Bác sĩ hoặc bệnh viện này không tồn tại hoặc đã ngừng tiếp nhận trực tuyến.
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-sm shadow-md"
        >
          Quay lại danh sách khám
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Breadcrumb & Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/explore')}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-xs transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" />
            <span>Quay lại danh sách khám</span>
          </button>

          {/* Status checklist pill */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span
              className={`px-2.5 py-1 rounded-full flex items-center gap-1 ${
                selectedDate && selectedSlot
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {selectedDate && selectedSlot ? '✓ Đã chọn lịch' : '1. Lịch khám'}
            </span>
            <span
              className={`px-2.5 py-1 rounded-full flex items-center gap-1 ${
                selectedProfileId
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {selectedProfileId ? '✓ Đã chọn hồ sơ' : '2. Hồ sơ bệnh nhân'}
            </span>
          </div>
        </div>

        {/* Global Error Banner if any */}
        {stepError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{stepError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* MAIN CONTENT COLUMN (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* SECTION 1: KHUNG GIỜ VÀ DỊCH VỤ KHÁM */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
              {/* If Hospital: Select Exam Service Type */}
              {!isDoctor && hospital.examTypes && hospital.examTypes.length > 0 && (
                <div className="pb-5 border-b border-slate-100">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
                    <Building2 className="w-4 h-4 text-cyan-600" />
                    <span>Chọn loại dịch vụ khám tại bệnh viện</span>
                  </label>
                  <div className="space-y-2.5">
                    {hospital.examTypes.map((et) => {
                      const isSelected = selectedExamType?.id === et.id;
                      return (
                        <div
                          key={et.id}
                          onClick={() => setSelectedExamType(et)}
                          className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-cyan-500 bg-cyan-50/70 ring-2 ring-cyan-500'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">{et.name}</h4>
                              <p className="text-xs text-slate-500 mt-0.5">{et.desc}</p>
                            </div>
                            <span className="font-extrabold text-sm text-cyan-800 shrink-0">
                              {formatCurrency(et.fee)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Slot Picker Component */}
              <div className="space-y-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-sky-600" />
                    <span>1. Chọn ngày và khung giờ khám</span>
                  </h3>
                  {selectedDate && selectedSlot && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ✓ {selectedSlot} • {selectedDate}
                    </span>
                  )}
                </div>
                <SlotPicker
                  selectedDate={selectedDate}
                  onSelectDate={(d) => {
                    setSelectedDate(d);
                    if (isDoctor) {
                      const slotsForDate = getDoctorSchedule(id, d);
                      if (!slotsForDate.includes(selectedSlot) || isSlotPast(d, selectedSlot)) {
                        setSelectedSlot('');
                      }
                    } else if (selectedSlot && isSlotPast(d, selectedSlot)) {
                      setSelectedSlot('');
                    }
                  }}
                  selectedSlot={selectedSlot}
                  onSelectSlot={(s) => {
                    if (!isSlotPast(selectedDate, s)) {
                      setSelectedSlot(s);
                      setStepError('');
                    }
                  }}
                  bookedSlots={bookedSlots}
                  isDoctorBooking={isDoctor}
                  doctorAvailableSlots={doctorAvailableSlots}
                  doctorName={doctor?.name || ''}
                />
              </div>
            </div>

            {/* SECTION 2: HỒ SƠ BỆNH NHÂN */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-sky-600" />
                    <span>2. Chọn hồ sơ người khám</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Đặt khám cho bản thân hoặc người thân trong gia đình
                  </p>
                </div>

                <button
                  onClick={() => setIsNewProfileModalOpen(true)}
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo hồ sơ mới</span>
                </button>
              </div>

              {/* Profiles List */}
              {profiles.length > 0 ? (
                <div className="space-y-2.5">
                  {profiles.map((profile) => (
                    <PatientProfileCard
                      key={profile.id}
                      profile={profile}
                      isSelected={selectedProfileId === profile.id}
                      onSelect={(p) => setSelectedProfileId(p.id)}
                      isSelectable={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-700">Chưa có hồ sơ bệnh nhân nào</h4>
                  <p className="text-xs text-slate-500 mt-1 mb-3">
                    Vui lòng tạo một hồ sơ để tiến hành đặt lịch khám.
                  </p>
                  <button
                    onClick={() => setIsNewProfileModalOpen(true)}
                    type="button"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tạo hồ sơ ngay</span>
                  </button>
                </div>
              )}
            </div>

            {/* SECTION 3: TRIỆU CHỨNG / GHI CHÚ KHÁM */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600" />
                <span>3. Triệu chứng hoặc lý do khám (Tùy chọn)</span>
              </h3>
              <textarea
                rows={3}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Mô tả triệu chứng bệnh, lý do khám hoặc lưu ý đặc biệt cho bác sĩ..."
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-hidden focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 transition-all text-slate-800 resize-none"
              ></textarea>
              <span className="text-[11px] text-slate-400 block">
                * Thông tin này sẽ được chuyển trực tiếp đến bác sĩ tiếp nhận thăm khám.
              </span>
            </div>

            {/* BOTTOM ACTION BUTTONS BAR */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Back button */}
              <button
                type="button"
                onClick={() => navigate('/explore')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-xs transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-slate-500" />
                <span>Quay lại danh sách</span>
              </button>

              {/* Status prompt & Continue to Payment button */}
              <div className="w-full sm:w-auto flex flex-col sm:items-end gap-1.5">
                <button
                  type="button"
                  disabled={!canContinue}
                  onClick={handleProceedToPayment}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                    canContinue
                      ? 'bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white shadow-lg shadow-sky-600/25 cursor-pointer hover:shadow-xl'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none'
                  }`}
                >
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span>Tiếp tục thanh toán ({formatCurrency(totalAmount)})</span>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </button>

                {/* Validation helper text under button */}
                {!canContinue ? (
                  <p className="text-[11px] text-amber-700 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>
                      Vui lòng chọn {!selectedDate ? 'ngày, ' : ''}{!selectedSlot ? 'khung giờ khám, ' : ''}{!selectedProfileId ? 'hồ sơ người khám' : ''}
                    </span>
                  </p>
                ) : (
                  <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Đã chọn đủ thông tin. Sẵn sàng thanh toán.</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR: Provider Summary & Breakdown (4 Cols) */}
          <div className="lg:col-span-4 space-y-5 sticky top-20">
            {/* Provider Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex gap-3.5 items-start pb-4 border-b border-slate-100">
                <img
                  src={isDoctor ? doctor.avatar : hospital.image}
                  alt={isDoctor ? doctor.name : hospital.name}
                  className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-100 shadow-xs"
                />
                <div className="min-w-0">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 inline-block mb-1">
                    {isDoctor ? doctor.specialtyName : 'Bệnh viện / Cơ sở'}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {isDoctor ? doctor.name : hospital.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                    <span>{provider.rating}</span>
                    <span className="text-slate-400 font-normal">({provider.reviewCount})</span>
                  </div>
                </div>
              </div>

              {/* Workplace / Address */}
              <div className="py-3 text-xs text-slate-600 space-y-1.5 border-b border-slate-100">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{isDoctor ? doctor.address || doctor.workplace : hospital.address}</span>
                </div>
              </div>

              {/* Selected Booking Info Review */}
              <div className="py-3 text-xs border-b border-slate-100 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Ngày khám:</span>
                  <span className="font-semibold text-slate-800">{selectedDate || 'Chưa chọn'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Giờ khám:</span>
                  <span className={`font-semibold ${selectedSlot ? 'text-sky-700' : 'text-slate-400'}`}>
                    {selectedSlot ? `${selectedSlot} - ${getEndTime(selectedSlot)}` : 'Chưa chọn'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bệnh nhân:</span>
                  <span className={`font-semibold truncate max-w-[150px] ${selectedProfile ? 'text-slate-800' : 'text-slate-400'}`}>
                    {selectedProfile ? selectedProfile.fullName : 'Chưa chọn'}
                  </span>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="pt-3.5 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Phí khám {isDoctor ? 'bác sĩ' : 'dịch vụ'}:</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(examFee)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Phí tiện ích đặt lịch:</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(serviceFee)}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-900">Tổng thanh toán:</span>
                  <span className="font-extrabold text-base text-sky-700">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Sticky Sidebar Action CTA */}
              <button
                type="button"
                disabled={!canContinue}
                onClick={handleProceedToPayment}
                className={`w-full mt-4 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                  canContinue
                    ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Tiếp tục thanh toán</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Guarantees */}
            <div className="bg-sky-50/70 rounded-2xl p-4 border border-sky-100/80 text-xs text-sky-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sky-950">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>Cam kết dịch vụ MedSi</span>
              </div>
              <p className="text-[11px] text-sky-800/80 leading-relaxed">
                Đúng giờ khám đã chọn, bảo lưu thông tin y tế bảo mật và hoàn trả phí tiện ích 100% nếu có thay đổi từ phía bệnh viện.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: TẠO HỒ SƠ BỆNH NHÂN MỚI */}
      <Modal
        isOpen={isNewProfileModalOpen}
        onClose={() => setIsNewProfileModalOpen(false)}
        title="Tạo hồ sơ bệnh nhân mới"
        subtitle="Thông tin sẽ được lưu để dùng cho các lần đặt khám sau"
      >
        <form onSubmit={handleCreateProfile} className="space-y-3.5">
          {newProfileError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{newProfileError}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Họ và tên bệnh nhân <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={newFullName}
              onChange={(e) => setNewFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-sky-500 focus:bg-white text-slate-800"
            />
          </div>

          {/* Relationship */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Mối quan hệ với chủ tài khoản
            </label>
            <select
              value={newRelationship}
              onChange={(e) => setNewRelationship(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-sky-500 focus:bg-white text-slate-800 cursor-pointer"
            >
              <option value="Bản thân">Bản thân</option>
              <option value="Con">Con</option>
              <option value="Cha">Cha</option>
              <option value="Mẹ">Mẹ</option>
              <option value="Người thân">Người thân khác</option>
            </select>
          </div>

          {/* DOB & Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ngày sinh <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={newDob}
                max={new Date().toISOString().slice(0, 10)}
                min="1900-01-01"
                onChange={(e) => setNewDob(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-sky-500 focus:bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Giới tính
              </label>
              <select
                value={newGender}
                onChange={(e) => setNewGender(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-sky-500 focus:bg-white text-slate-800 cursor-pointer"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Số điện thoại liên hệ <span className="text-rose-500">*</span> <span className="text-[11px] font-normal text-slate-400 lowercase">(9 - 11 chữ số)</span>
            </label>
            <input
              type="tel"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="0901234567"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-sky-500 focus:bg-white text-slate-800"
            />
          </div>

          {/* Modal action buttons */}
          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNewProfileModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md cursor-pointer transition-colors"
            >
              Lưu hồ sơ
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
