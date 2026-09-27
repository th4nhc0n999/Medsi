import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Phone, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  AlertCircle, 
  XCircle, 
  CheckCircle2, 
  FileText, 
  Info, 
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Button from '../components/Button';
import StatusBadge from '../components/Badge';
import Modal from '../components/Modal';
import { useToast } from '../hooks/useToast';

export const PatientHistoryPage = ({ 
  initialPhone = '', 
  onNavigate, 
  getByPhone, 
  onCancelAppointment 
}) => {
  const toast = useToast();
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [searchedPhone, setSearchedPhone] = useState(initialPhone);
  const [appointments, setAppointments] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Modals
  const [detailModalItem, setDetailModalItem] = useState(null);
  const [cancellingItem, setCancellingItem] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('Bận việc đột xuất không thể sắp xếp đến khám');

  const demoPhones = [
    { label: 'Nguyễn Văn An', phone: '0912345678' },
    { label: 'Trần Thị Mai', phone: '0987654321' },
    { label: 'Lê Hoàng Nam', phone: '0905123456' },
    { label: 'Vũ Tuấn Anh', phone: '0945678123' },
  ];

  const performSearch = (phoneToSearch) => {
    const cleanPhone = (phoneToSearch || '').trim();
    if (!cleanPhone) {
      toast.warning('Vui lòng nhập số điện thoại cần tra cứu!');
      return;
    }
    const results = getByPhone(cleanPhone);
    setAppointments(results);
    setSearchedPhone(cleanPhone);
    setHasSearched(true);
  };

  useEffect(() => {
    if (initialPhone) {
      setPhoneNumber(initialPhone);
      performSearch(initialPhone);
    }
  }, [initialPhone]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch(phoneNumber);
  };

  const handleQuickPhoneClick = (phone) => {
    setPhoneNumber(phone);
    performSearch(phone);
  };

  const handleConfirmCancel = () => {
    if (!cancellingItem) return;
    if (!cancellationReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy lịch hẹn!');
      return;
    }

    try {
      onCancelAppointment(cancellingItem.id, cancellationReason);
      toast.success(`Đã hủy lịch hẹn ${cancellingItem.id} thành công!`);
      // Update local view
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === cancellingItem.id
            ? { ...item, status: 'cancelled', cancellationReason }
            : item
        )
      );
      setCancellingItem(null);
      if (detailModalItem && detailModalItem.id === cancellingItem.id) {
        setDetailModalItem(null);
      }
    } catch {
      toast.error('Không thể thực hiện hủy lịch. Vui lòng thử lại!');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-medical-600 bg-medical-50 px-3 py-1 rounded-full border border-medical-200">
          Tra cứu hồ sơ cá nhân
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
          Lịch Sử Đặt Hẹn Của Bệnh Nhân
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm mt-1">
          Nhập số điện thoại đã dùng khi đăng ký khám để xem tiến trình xử lý hoặc yêu cầu hủy hẹn
        </p>
      </div>

      {/* Phone Search Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-soft max-w-2xl mx-auto space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Nhập số điện thoại bệnh nhân..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-medical-500/20 focus:border-medical-500 transition-all font-medium text-slate-800"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={Search}
            className="rounded-2xl shrink-0 px-6 py-3"
          >
            Tra cứu ngay
          </Button>
        </form>

        {/* 1-Click Sample Phone Suggestions */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-medical-600" />
            SĐT mẫu thử nhanh:
          </span>
          {demoPhones.map((dp) => (
            <button
              key={dp.phone}
              type="button"
              onClick={() => handleQuickPhoneClick(dp.phone)}
              className="px-2.5 py-1 rounded-lg bg-medical-50 hover:bg-medical-100 text-medical-700 font-medium border border-medical-200/60 transition-colors"
            >
              {dp.label} ({dp.phone})
            </button>
          ))}
        </div>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">
              Kết quả tra cứu cho SĐT: <span className="text-medical-600">{searchedPhone}</span>
            </h3>
            <span className="text-xs text-slate-500">
              Tìm thấy <strong>{appointments.length}</strong> lịch hẹn
            </span>
          </div>

          {appointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft hover:shadow-card transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-medical-700 bg-medical-50 px-2.5 py-1 rounded-lg border border-medical-200">
                        {item.id}
                      </span>
                      <StatusBadge status={item.status} size="sm" />
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-slate-900">{item.doctorName}</h4>
                      <p className="text-xs text-medical-600 font-medium">{item.specialtyName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block">Ngày khám:</span>
                        <strong className="text-slate-800">
                          {new Date(item.appointmentDate).toLocaleDateString('vi-VN')}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Khung giờ:</span>
                        <strong className="text-slate-800">{item.timeSlot}</strong>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 line-clamp-2">
                      <span className="font-semibold text-slate-700">Triệu chứng: </span>
                      {item.symptoms || 'Không ghi nhận'}
                    </div>

                    {item.status === 'cancelled' && item.cancellationReason && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                        <span className="font-bold">Lý do hủy: </span>
                        {item.cancellationReason}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs font-extrabold text-medical-700">
                      {new Intl.NumberFormat('vi-VN').format(item.consultationFee || 0)} đ
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDetailModalItem(item)}
                      >
                        Chi tiết
                      </Button>

                      {['pending', 'confirmed'].includes(item.status) && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setCancellingItem(item)}
                        >
                          Hủy lịch
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* No appointments found for this phone */
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-800">Chưa có lịch hẹn nào</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Số điện thoại <strong>{searchedPhone}</strong> chưa được đăng ký trong hệ thống hoặc đã nhập chưa chính xác.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => onNavigate('booking')}
              >
                Đặt lịch khám ngay
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Appointment Detail Modal */}
      {detailModalItem && (
        <Modal
          isOpen={!!detailModalItem}
          onClose={() => setDetailModalItem(null)}
          title="Thông tin chi tiết Lịch hẹn khám"
          subtitle={`Mã phiếu hẹn: ${detailModalItem.id}`}
        >
          <div className="space-y-5 text-sm">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-600">Trạng thái hiện tại:</span>
              <StatusBadge status={detailModalItem.status} size="md" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 uppercase font-bold tracking-wider block">Bác sĩ khám:</span>
                <strong className="text-slate-900 text-sm block">{detailModalItem.doctorName}</strong>
                <span className="text-medical-600 font-semibold">{detailModalItem.specialtyName}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 uppercase font-bold tracking-wider block">Thời gian hẹn:</span>
                <strong className="text-slate-900 text-sm block">{detailModalItem.timeSlot}</strong>
                <span className="text-slate-600">
                  Ngày {new Date(detailModalItem.appointmentDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <span className="text-slate-400 uppercase font-bold tracking-wider block">Thông tin bệnh nhân:</span>
              <div className="grid grid-cols-2 gap-2">
                <div>Họ và tên: <strong className="text-slate-800">{detailModalItem.patientName}</strong></div>
                <div>SĐT: <strong className="text-slate-800">{detailModalItem.patientPhone}</strong></div>
                <div>Giới tính: <span className="text-slate-700">{detailModalItem.patientGender || 'Nam'}</span></div>
                <div>Email: <span className="text-slate-700">{detailModalItem.patientEmail || 'Không có'}</span></div>
              </div>
              {detailModalItem.patientAddress && (
                <div>Địa chỉ: <span className="text-slate-700">{detailModalItem.patientAddress}</span></div>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span className="text-slate-400 uppercase font-bold tracking-wider block">Mô tả triệu chứng / Lý do khám:</span>
              <p className="text-slate-700 italic leading-relaxed">
                "{detailModalItem.symptoms || 'Không có ghi chú'}"
              </p>
            </div>

            {detailModalItem.status === 'cancelled' && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                <strong className="block">Lý do hủy lịch:</strong>
                <p>{detailModalItem.cancellationReason || 'Theo yêu cầu của khách hàng'}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-xs text-slate-500 block">Chi phí khám dự kiến:</span>
                <span className="text-base font-extrabold text-medical-700">
                  {new Intl.NumberFormat('vi-VN').format(detailModalItem.consultationFee || 0)} VNĐ
                </span>
              </div>

              {['pending', 'confirmed'].includes(detailModalItem.status) && (
                <Button
                  variant="danger"
                  size="md"
                  onClick={() => setCancellingItem(detailModalItem)}
                >
                  Hủy lịch hẹn này
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingItem && (
        <Modal
          isOpen={!!cancellingItem}
          onClose={() => setCancellingItem(null)}
          title="Xác nhận Yêu cầu Hủy Lịch Khám"
          subtitle={`Phiếu hẹn: ${cancellingItem.id}`}
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Bạn đang yêu cầu hủy lịch khám với <strong>{cancellingItem.doctorName}</strong> vào ngày{' '}
                <strong>{cancellingItem.appointmentDate}</strong>. Hành động này không thể hoàn tác.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5 uppercase">
                Lý do hủy lịch (*):
              </label>
              <textarea
                rows={3}
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Nhập lý do bạn muốn hủy lịch hẹn..."
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setCancellingItem(null)}
              >
                Giữ lại lịch hẹn
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleConfirmCancel}
              >
                Xác nhận Hủy lịch
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PatientHistoryPage;
