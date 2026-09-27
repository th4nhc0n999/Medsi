import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  Star, 
  Stethoscope, 
  Building2, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import Button from '../components/Button';
import { Input, Select, Textarea } from '../components/Input';
import { TIME_SLOTS, SPECIALTIES } from '../services/mockData';
import { useToast } from '../hooks/useToast';

export const BookingModalOrPage = ({ 
  doctors = [], 
  selectedDoctorInitial = null, 
  onBookingSuccess,
  onNavigate
}) => {
  const toast = useToast();

  // Wizard Steps: 1: Doctor -> 2: Date & Time -> 3: Patient Info -> 4: Review
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDoctorId, setSelectedDoctorId] = useState(selectedDoctorInitial?.id || '');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState(selectedDoctorInitial?.specialtyId || '');

  // Tomorrow as default date (YYYY-MM-DD)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [appointmentDate, setAppointmentDate] = useState(defaultDateStr);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  // Patient Info
  const [patientData, setPatientData] = useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    patientDob: '1995-01-01',
    patientGender: 'Nam',
    patientAddress: '',
    symptoms: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState(null);

  // Update if selectedDoctorInitial changed from props
  useEffect(() => {
    if (selectedDoctorInitial) {
      setSelectedDoctorId(selectedDoctorInitial.id);
      setSelectedSpecialtyId(selectedDoctorInitial.specialtyId);
      // Auto advance to step 2 if doctor already pre-selected
      setCurrentStep(2);
    }
  }, [selectedDoctorInitial]);

  const selectedDoctor = useMemo(() => {
    return doctors.find((d) => d.id === selectedDoctorId) || null;
  }, [doctors, selectedDoctorId]);

  // Filter doctors by selected specialty if any
  const availableDoctors = useMemo(() => {
    if (!selectedSpecialtyId) return doctors;
    return doctors.filter((d) => d.specialtyId === selectedSpecialtyId);
  }, [doctors, selectedSpecialtyId]);

  // Check occupied slots
  const occupiedSlots = useMemo(() => {
    if (!selectedDoctorId || !appointmentDate) return [];
    try {
      const stored = JSON.parse(
        localStorage.getItem('medsi_appointments_v1') || 
        localStorage.getItem('medibook_appointments_v1') || 
        '[]'
      );
      return stored
        .filter(
          (item) =>
            item.doctorId === selectedDoctorId &&
            item.appointmentDate === appointmentDate &&
            item.status !== 'cancelled'
        )
        .map((item) => item.timeSlot);
    } catch {
      return [];
    }
  }, [selectedDoctorId, appointmentDate]);

  // Step 1 Validation
  const validateStep1 = () => {
    if (!selectedDoctorId) {
      toast.error('Vui lòng chọn Bác sĩ khám!');
      return false;
    }
    return true;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (!appointmentDate) {
      toast.error('Vui lòng chọn ngày khám!');
      return false;
    }
    // Check if date is in past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosen = new Date(appointmentDate);
    if (chosen < today) {
      toast.error('Ngày khám không thể ở trong quá khứ!');
      return false;
    }
    if (!selectedTimeSlot) {
      toast.error('Vui lòng chọn khung giờ khám!');
      return false;
    }
    return true;
  };

  // Step 3 Validation
  const validateStep3 = () => {
    const errors = {};
    if (!patientData.patientName.trim()) {
      errors.patientName = 'Họ và tên bệnh nhân không được để trống';
    }

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!patientData.patientPhone.trim()) {
      errors.patientPhone = 'Số điện thoại không được để trống';
    } else if (!phoneRegex.test(patientData.patientPhone.trim())) {
      errors.patientPhone = 'Số điện thoại không hợp lệ (VD: 0912345678)';
    }

    if (patientData.patientEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(patientData.patientEmail.trim())) {
        errors.patientEmail = 'Email không đúng định dạng';
      }
    }

    if (!patientData.symptoms.trim()) {
      errors.symptoms = 'Vui lòng mô tả ngắn triệu chứng hoặc lý do khám';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) setCurrentStep(2);
    else if (currentStep === 2 && validateStep2()) setCurrentStep(3);
    else if (currentStep === 3 && validateStep3()) setCurrentStep(4);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmitBooking = async () => {
    setIsSubmitting(true);
    try {
      const bookingPayload = {
        ...patientData,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        specialtyName: selectedDoctor.specialtyName,
        consultationFee: selectedDoctor.consultationFee,
        appointmentDate,
        timeSlot: selectedTimeSlot,
      };

      const result = onBookingSuccess(bookingPayload);
      setCreatedAppointment(result);
      toast.success('Đặt lịch khám thành công! Mã số hẹn: ' + result.id);
    } catch (err) {
      toast.error(err.message || 'Đã có lỗi xảy ra khi lưu lịch hẹn');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setCurrentStep(1);
    setSelectedDoctorId('');
    setSelectedSpecialtyId('');
    setSelectedTimeSlot('');
    setCreatedAppointment(null);
    setPatientData({
      patientName: '',
      patientPhone: '',
      patientEmail: '',
      patientDob: '1995-01-01',
      patientGender: 'Nam',
      patientAddress: '',
      symptoms: '',
    });
  };

  // SUCCESS SCREEN
  if (createdAppointment) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-in">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              ĐẶT LỊCH THÀNH CÔNG
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              Cảm ơn bạn đã tin chọn Medsi!
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Hệ thống phòng khám đã tiếp nhận yêu cầu đặt hẹn và sẽ liên hệ xác nhận trong thời gian sớm nhất.
            </p>
          </div>

          {/* Ticket Summary Card */}
          <div className="rounded-2xl bg-gradient-to-br from-medical-50 to-slate-50 p-6 border border-medical-200/80 text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-medical-200/70">
              <span className="text-xs text-slate-500 font-semibold">Mã phiếu hẹn khám:</span>
              <span className="text-base sm:text-lg font-black tracking-wider text-medical-800 bg-white px-3 py-1 rounded-lg border border-medical-200 shadow-sm">
                {createdAppointment.id}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Bác sĩ phụ trách:</span>
                <strong className="text-slate-800 text-sm">{createdAppointment.doctorName}</strong>
                <span className="text-medical-600 block font-semibold">{createdAppointment.specialtyName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Thời gian hẹn:</span>
                <strong className="text-slate-800 text-sm">
                  {createdAppointment.timeSlot}
                </strong>
                <span className="text-slate-600 block">
                  Ngày {new Date(createdAppointment.appointmentDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Bệnh nhân:</span>
                <strong className="text-slate-800">{createdAppointment.patientName}</strong>
                <span className="text-slate-600 block">SĐT: {createdAppointment.patientPhone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Phí khám dự kiến:</span>
                <strong className="text-medical-700 text-sm font-black">
                  {new Intl.NumberFormat('vi-VN').format(createdAppointment.consultationFee)} VNĐ
                </strong>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                Vui lòng đến trước giờ hẹn 10-15 phút và xuất trình <strong>Mã phiếu hẹn</strong> tại quầy tiếp đón Lễ tân.
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => onNavigate('history', { phone: createdAppointment.patientPhone })}
            >
              Tra cứu lịch hẹn này ngay
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={handleResetForm}
            >
              Đặt thêm lịch hẹn khác
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-medical-600 bg-medical-50 px-3 py-1 rounded-full border border-medical-200">
          Quy trình 4 bước
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
          Đăng Ký Lịch Khám Trực Tuyến
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm mt-1">
          Nhanh chóng, tiện lợi, không mất phí đặt hẹn, nhận mã lịch khám ngay tức thì
        </p>
      </div>

      {/* Stepper Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-soft">
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { num: 1, title: 'Bác sĩ', icon: Stethoscope },
            { num: 2, title: 'Ngày & Giờ', icon: Clock },
            { num: 3, title: 'Thông tin', icon: User },
            { num: 4, title: 'Xác nhận', icon: CheckCircle2 },
          ].map((step) => {
            const Icon = step.icon;
            const isPassed = currentStep > step.num;
            const isCurrent = currentStep === step.num;
            return (
              <div key={step.num} className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                    isCurrent
                      ? 'bg-medical-600 text-white shadow-md shadow-medical-600/30 ring-4 ring-medical-100'
                      : isPassed
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isPassed ? <Check className="w-5 h-5" /> : step.num}
                </div>
                <span
                  className={`mt-2 text-xs font-semibold hidden sm:block ${
                    isCurrent ? 'text-medical-700' : isPassed ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-soft">
        {/* STEP 1: CHỌN CHUYÊN KHOA & BÁC SĨ */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800">Bước 1: Chọn Chuyên khoa & Bác sĩ khám</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Vui lòng lựa chọn chuyên khoa phù hợp với nhu cầu khám bệnh của bạn
              </p>
            </div>

            {/* Specialty Filter */}
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide block mb-2">
                1. Lọc theo Chuyên khoa:
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSpecialtyId('')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    !selectedSpecialtyId
                      ? 'bg-medical-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Tất cả ({doctors.length})
                </button>
                {SPECIALTIES.map((spec) => (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => setSelectedSpecialtyId(spec.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedSpecialtyId === spec.id
                        ? 'bg-medical-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {spec.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Doctors Radio Cards */}
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide block mb-3">
                2. Chọn Bác sĩ mong muốn (*):
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableDoctors.map((doc) => {
                  const isSelected = selectedDoctorId === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctorId(doc.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex gap-3.5 items-start ${
                        isSelected
                          ? 'border-medical-600 bg-medical-50/50 shadow-md ring-2 ring-medical-500/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <img
                        src={doc.avatar}
                        alt={doc.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-medical-700 bg-medical-100/70 px-2 py-0.5 rounded-md">
                            {doc.specialtyName}
                          </span>
                          <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {doc.rating}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1 truncate">{doc.name}</h4>
                        <p className="text-xs text-slate-500 truncate">{doc.hospital}</p>
                        <div className="mt-2 text-xs font-extrabold text-medical-700">
                          {new Intl.NumberFormat('vi-VN').format(doc.consultationFee)} VNĐ
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CHỌN NGÀY & KHUNG GIỜ */}
        {currentStep === 2 && selectedDoctor && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Bước 2: Chọn Ngày & Khung giờ khám</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chọn thời gian thích hợp theo lịch làm việc của bác sĩ
                </p>
              </div>
              <div className="text-right text-xs">
                <span className="text-slate-400">Bác sĩ: </span>
                <strong className="text-medical-700">{selectedDoctor.name}</strong>
              </div>
            </div>

            {/* Date Selection */}
            <div className="max-w-xs">
              <Input
                label="Ngày hẹn khám"
                id="appointmentDate"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={appointmentDate}
                onChange={(e) => {
                  setAppointmentDate(e.target.value);
                  setSelectedTimeSlot('');
                }}
                icon={CalendarIcon}
                required
              />
            </div>

            {/* Working days hint */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
              <Clock className="w-4 h-4 text-medical-600 shrink-0" />
              <span>
                Lịch làm việc của bác sĩ: <strong>{selectedDoctor.workingDays.join(', ')}</strong> (08:00 - 16:30)
              </span>
            </div>

            {/* Time Slot Picker */}
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide block mb-3">
                Chọn Khung giờ khám (*):
              </label>

              {/* Morning slots */}
              <div className="space-y-2 mb-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  ☀️ Buổi sáng:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                  {TIME_SLOTS.filter((t) => t.session === 'morning').map((slot) => {
                    const isOccupied = occupiedSlots.includes(slot.time);
                    const isSelected = selectedTimeSlot === slot.time;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => setSelectedTimeSlot(slot.time)}
                        className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                          isOccupied
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-medical-600 text-white border-medical-600 shadow-md ring-2 ring-medical-200'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-medical-400 hover:bg-medical-50/50'
                        }`}
                      >
                        {slot.time}
                        {isOccupied && <span className="block text-[9px] no-underline font-normal text-rose-500">Đã kín</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Afternoon slots */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  🌤️ Buổi chiều:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                  {TIME_SLOTS.filter((t) => t.session === 'afternoon').map((slot) => {
                    const isOccupied = occupiedSlots.includes(slot.time);
                    const isSelected = selectedTimeSlot === slot.time;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => setSelectedTimeSlot(slot.time)}
                        className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                          isOccupied
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-medical-600 text-white border-medical-600 shadow-md ring-2 ring-medical-200'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-medical-400 hover:bg-medical-50/50'
                        }`}
                      >
                        {slot.time}
                        {isOccupied && <span className="block text-[9px] no-underline font-normal text-rose-500">Đã kín</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: THÔNG TIN BỆNH NHÂN */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800">Bước 3: Thông tin Bệnh nhân</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Vui lòng điền thông tin chính xác để phòng khám làm hồ sơ tiếp đón
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Họ và tên bệnh nhân"
                id="patientName"
                placeholder="Ví dụ: Nguyễn Văn An"
                value={patientData.patientName}
                onChange={(e) => setPatientData({ ...patientData, patientName: e.target.value })}
                error={formErrors.patientName}
                icon={User}
                required
              />

              <Input
                label="Số điện thoại liên hệ"
                id="patientPhone"
                type="tel"
                placeholder="Ví dụ: 0912345678"
                value={patientData.patientPhone}
                onChange={(e) => setPatientData({ ...patientData, patientPhone: e.target.value })}
                error={formErrors.patientPhone}
                helperText="Dùng số này để tra cứu lại lịch hẹn sau khi đặt"
                icon={Phone}
                required
              />

              <Input
                label="Địa chỉ Email"
                id="patientEmail"
                type="email"
                placeholder="an.nguyen@example.com"
                value={patientData.patientEmail}
                onChange={(e) => setPatientData({ ...patientData, patientEmail: e.target.value })}
                error={formErrors.patientEmail}
                icon={Mail}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Ngày sinh"
                  id="patientDob"
                  type="date"
                  value={patientData.patientDob}
                  onChange={(e) => setPatientData({ ...patientData, patientDob: e.target.value })}
                />

                <Select
                  label="Giới tính"
                  id="patientGender"
                  value={patientData.patientGender}
                  onChange={(e) => setPatientData({ ...patientData, patientGender: e.target.value })}
                  options={[
                    { value: 'Nam', label: 'Nam' },
                    { value: 'Nữ', label: 'Nữ' },
                    { value: 'Khác', label: 'Khác' },
                  ]}
                />
              </div>
            </div>

            <Input
              label="Địa chỉ thường trú"
              id="patientAddress"
              placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
              value={patientData.patientAddress}
              onChange={(e) => setPatientData({ ...patientData, patientAddress: e.target.value })}
              icon={MapPin}
            />

            <Textarea
              label="Lý do khám / Triệu chứng lâm sàng"
              id="symptoms"
              rows={3}
              placeholder="Mô tả cụ thể cảm giác đau nhức, thời gian xuất hiện triệu chứng, các thuốc đang dùng nếu có..."
              value={patientData.symptoms}
              onChange={(e) => setPatientData({ ...patientData, symptoms: e.target.value })}
              error={formErrors.symptoms}
              required
            />
          </div>
        )}

        {/* STEP 4: REVIEW & CONFIRM */}
        {currentStep === 4 && selectedDoctor && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800">Bước 4: Kiểm tra & Xác nhận thông tin</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Vui lòng rà soát lại thông tin trước khi hoàn tất đăng ký lịch hẹn
              </p>
            </div>

            {/* Doctor & Clinic Summary */}
            <div className="p-4 rounded-2xl bg-medical-50/70 border border-medical-200/80 flex flex-col sm:flex-row items-center gap-4">
              <img
                src={selectedDoctor.avatar}
                alt={selectedDoctor.name}
                className="w-20 h-20 rounded-2xl object-cover shadow-sm"
              />
              <div className="flex-1 text-center sm:text-left space-y-1">
                <span className="text-[11px] font-bold text-medical-700 bg-white px-2 py-0.5 rounded-md border border-medical-200">
                  {selectedDoctor.specialtyName}
                </span>
                <h4 className="text-base font-bold text-slate-900">{selectedDoctor.name}</h4>
                <p className="text-xs text-slate-500">{selectedDoctor.hospital} - {selectedDoctor.address}</p>
                <div className="text-xs font-semibold text-slate-700">
                  Phí khám: <strong className="text-medical-800">{new Intl.NumberFormat('vi-VN').format(selectedDoctor.consultationFee)} VNĐ</strong>
                </div>
              </div>
            </div>

            {/* Appointment Schedule & Patient details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider block">Thời gian đã chọn:</span>
                <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                  <CalendarIcon className="w-4 h-4 text-medical-600" />
                  <span>Ngày {new Date(appointmentDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                  <Clock className="w-4 h-4 text-medical-600" />
                  <span>Khung giờ: {selectedTimeSlot}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider block">Thông tin bệnh nhân:</span>
                <div>Họ tên: <strong className="text-slate-800">{patientData.patientName}</strong></div>
                <div>SĐT: <strong className="text-slate-800">{patientData.patientPhone}</strong></div>
                {patientData.patientEmail && <div>Email: <span className="text-slate-600">{patientData.patientEmail}</span></div>}
                <div>Giới tính: <span className="text-slate-600">{patientData.patientGender}</span> | Ngày sinh: <span className="text-slate-600">{patientData.patientDob}</span></div>
              </div>
            </div>

            {/* Symptoms note */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider block">Lý do / Triệu chứng:</span>
              <p className="text-slate-700 leading-relaxed italic">
                "{patientData.symptoms}"
              </p>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              size="md"
              icon={ChevronLeft}
              onClick={handlePrevStep}
              disabled={isSubmitting}
            >
              Quay lại
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <Button
              variant="primary"
              size="md"
              onClick={handleNextStep}
            >
              Tiếp tục <ChevronRight className="w-4 h-4 ml-1 inline" />
            </Button>
          ) : (
            <Button
              variant="success"
              size="lg"
              loading={isSubmitting}
              icon={CheckCircle2}
              onClick={handleSubmitBooking}
            >
              Xác nhận Đặt lịch khám
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModalOrPage;
