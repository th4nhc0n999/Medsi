import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  CheckCheck, 
  XCircle, 
  DollarSign, 
  Search, 
  Filter, 
  RotateCcw, 
  Trash2, 
  Eye, 
  Check, 
  X, 
  Calendar, 
  AlertCircle,
  FileSpreadsheet,
  Download,
  Building2,
  Stethoscope
} from 'lucide-react';
import Button from '../components/Button';
import StatusBadge from '../components/Badge';
import Modal from '../components/Modal';
import { useToast } from '../hooks/useToast';

export const AdminDashboardPage = ({
  appointments = [],
  stats,
  doctors = [],
  onUpdateStatus,
  onDeleteAppointment,
  onResetData,
  onNavigate
}) => {
  const toast = useToast();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDoctorId, setSelectedDoctorId] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');

  // Modals
  const [detailModalItem, setDetailModalItem] = useState(null);
  const [cancellingItem, setCancellingItem] = useState(null);
  const [adminCancelReason, setAdminCancelReason] = useState('Bác sĩ có ca phẫu thuật cấp cứu đột xuất');
  const [deletingId, setDeletingId] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Filtered List
  const filteredAppointments = useMemo(() => {
    return appointments.filter((item) => {
      // Search
      if (searchTerm) {
        const q = searchTerm.toLowerCase().trim();
        const matchId = item.id.toLowerCase().includes(q);
        const matchPatient = item.patientName.toLowerCase().includes(q);
        const matchPhone = item.patientPhone.includes(q);
        const matchDoctor = item.doctorName.toLowerCase().includes(q);
        if (!matchId && !matchPatient && !matchPhone && !matchDoctor) return false;
      }

      // Status
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }

      // Doctor
      if (selectedDoctorId !== 'all' && item.doctorId !== selectedDoctorId) {
        return false;
      }

      // Date
      if (selectedDate && item.appointmentDate !== selectedDate) {
        return false;
      }

      return true;
    });
  }, [appointments, searchTerm, selectedStatus, selectedDoctorId, selectedDate]);

  // Actions
  const handleApprove = (item) => {
    try {
      onUpdateStatus(item.id, 'confirmed');
      toast.success(`Đã duyệt lịch hẹn ${item.id} cho ${item.patientName}!`);
    } catch {
      toast.error('Có lỗi xảy ra khi duyệt lịch.');
    }
  };

  const handleComplete = (item) => {
    try {
      onUpdateStatus(item.id, 'completed');
      toast.success(`Đã cập nhật trạng thái đã khám xong cho ${item.patientName}!`);
    } catch {
      toast.error('Có lỗi xảy ra khi hoàn thành lịch.');
    }
  };

  const handleConfirmCancel = () => {
    if (!cancellingItem) return;
    try {
      onUpdateStatus(cancellingItem.id, 'cancelled', adminCancelReason);
      toast.info(`Đã chuyển lịch hẹn ${cancellingItem.id} sang trạng thái Hủy.`);
      setCancellingItem(null);
    } catch {
      toast.error('Có lỗi xảy ra khi hủy lịch.');
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingId) return;
    try {
      onDeleteAppointment(deletingId);
      toast.success(`Đã xóa hoàn toàn lịch hẹn ${deletingId}!`);
      setDeletingId(null);
    } catch {
      toast.error('Có lỗi xảy ra khi xóa lịch.');
    }
  };

  const handleResetData = () => {
    try {
      onResetData();
      toast.success('Đã khôi phục toàn bộ dữ liệu mẫu ban đầu thành công!');
      setShowResetConfirm(false);
      setSearchTerm('');
      setSelectedStatus('all');
      setSelectedDoctorId('all');
      setSelectedDate('');
    } catch {
      toast.error('Không thể khôi phục dữ liệu mẫu.');
    }
  };

  // Export to CSV helper
  const handleExportCSV = () => {
    try {
      const headers = ['Mã hẹn', 'Họ tên', 'SĐT', 'Bác sĩ', 'Chuyên khoa', 'Ngày', 'Khung giờ', 'Trạng thái', 'Giá khám'];
      const rows = filteredAppointments.map((a) => [
        a.id,
        `"${a.patientName}"`,
        a.patientPhone,
        `"${a.doctorName}"`,
        `"${a.specialtyName}"`,
        a.appointmentDate,
        a.timeSlot,
        a.status,
        a.consultationFee,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `medsi_appointments_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Đã xuất file CSV lịch hẹn thành công!');
    } catch (e) {
      toast.error('Không thể xuất file CSV: ' + e.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Banner / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-medical-600 mb-1">
            <span>Bảng điều khiển</span>
            <span>/</span>
            <span className="text-slate-500">Quản trị Lễ tân & Phòng khám</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Quản Lý Lịch Hẹn Khám Bệnh
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
            Duyệt lịch hẹn, điều phối ca khám, theo dõi tiến độ và kiểm soát doanh thu
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
          >
            Xuất file CSV
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={RotateCcw}
            onClick={() => setShowResetConfirm(true)}
            className="text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-200"
          >
            Khôi phục dữ liệu mẫu
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tổng lịch hẹn</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.total}</div>
          <div className="text-[10px] text-slate-400 mt-1">Toàn bộ hồ sơ</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-soft bg-amber-50/20">
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
            <span>Chờ duyệt</span>
            <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">{stats.pending}</div>
          <div className="text-[10px] text-amber-600 font-medium mt-1">Cần lễ tân xử lý</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-soft bg-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
            <span>Đã xác nhận</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">{stats.confirmed}</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-1">Sắp đến khám</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-sky-200 shadow-soft bg-sky-50/20">
          <div className="flex items-center justify-between text-sky-700 text-xs font-semibold">
            <span>Đã khám xong</span>
            <CheckCheck className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-sky-700 mt-2">{stats.completed}</div>
          <div className="text-[10px] text-sky-600 font-medium mt-1">Hoàn thành</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-soft bg-rose-50/20">
          <div className="flex items-center justify-between text-rose-700 text-xs font-semibold">
            <span>Đã hủy</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-700 mt-2">{stats.cancelled}</div>
          <div className="text-[10px] text-rose-600 font-medium mt-1">Lịch bị hủy</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-medical-200 shadow-soft bg-medical-50/30">
          <div className="flex items-center justify-between text-medical-800 text-xs font-semibold">
            <span>Doanh thu khám</span>
            <DollarSign className="w-4 h-4 text-medical-600" />
          </div>
          <div className="text-xl font-black text-medical-800 mt-2 truncate">
            {new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(stats.estimatedRevenue)}đ
          </div>
          <div className="text-[10px] text-medical-600 font-medium mt-1">Lịch duyệt & xong</div>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search box */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã hẹn, tên bệnh nhân, SĐT, bác sĩ..."
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-medical-500/20 focus:border-medical-500"
            />
          </div>

          {/* Status filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-medical-500/20 focus:border-medical-500 font-medium text-slate-700"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt (Pending)</option>
              <option value="confirmed">Đã xác nhận (Confirmed)</option>
              <option value="completed">Đã khám xong (Completed)</option>
              <option value="cancelled">Đã hủy (Cancelled)</option>
            </select>
          </div>

          {/* Doctor filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-medical-500/20 focus:border-medical-500 font-medium text-slate-700 truncate"
            >
              <option value="all">Tất cả bác sĩ</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date filter */}
          <div className="sm:col-span-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-medical-500/20 focus:border-medical-500"
            />
          </div>
        </div>

        {/* Filter status summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Hiển thị <strong>{filteredAppointments.length}</strong> / {appointments.length} lịch hẹn
          </span>
          {(searchTerm || selectedStatus !== 'all' || selectedDoctorId !== 'all' || selectedDate) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('all');
                setSelectedDoctorId('all');
                setSelectedDate('');
              }}
              className="text-medical-600 hover:text-medical-700 font-semibold"
            >
              Xóa các bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Main Appointments Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 sm:px-6">Mã hẹn / Ngày tạo</th>
                <th className="py-3.5 px-4">Bệnh nhân</th>
                <th className="py-3.5 px-4">Bác sĩ & Khoa</th>
                <th className="py-3.5 px-4">Lịch hẹn</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Phí khám</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* ID & Created Date */}
                    <td className="py-4 px-4 sm:px-6">
                      <span className="font-bold text-medical-700 block">{item.id}</span>
                      <span className="text-[11px] text-slate-400">
                        {item.createdAt ? new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}{' '}
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : ''}
                      </span>
                    </td>

                    {/* Patient */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{item.patientName}</div>
                      <div className="text-xs text-slate-500">{item.patientPhone}</div>
                      {item.patientGender && (
                        <span className="text-[10px] text-slate-400">{item.patientGender}</span>
                      )}
                    </td>

                    {/* Doctor & Specialty */}
                    <td className="py-4 px-4">
                      <div className="text-slate-900 font-semibold">{item.doctorName}</div>
                      <span className="inline-block px-2 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 mt-0.5">
                        {item.specialtyName}
                      </span>
                    </td>

                    {/* Date & Slot */}
                    <td className="py-4 px-4">
                      <div className="text-slate-900 font-bold">
                        {new Date(item.appointmentDate).toLocaleDateString('vi-VN')}
                      </div>
                      <span className="text-xs text-medical-600 font-semibold">{item.timeSlot}</span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <StatusBadge status={item.status} size="sm" />
                    </td>

                    {/* Fee */}
                    <td className="py-4 px-4 font-bold text-slate-800">
                      {new Intl.NumberFormat('vi-VN').format(item.consultationFee || 0)}đ
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Detail View */}
                        <button
                          onClick={() => setDetailModalItem(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-medical-600 hover:bg-medical-50 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Approve Button */}
                        {item.status === 'pending' && (
                          <button
                            onClick={() => handleApprove(item)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Xác nhận duyệt lịch"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        {/* Complete Button */}
                        {item.status === 'confirmed' && (
                          <button
                            onClick={() => handleComplete(item)}
                            className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 transition-colors"
                            title="Đã khám xong"
                          >
                            <CheckCheck className="w-4 h-4" />
                          </button>
                        )}

                        {/* Cancel Button */}
                        {['pending', 'confirmed'].includes(item.status) && (
                          <button
                            onClick={() => setCancellingItem(item)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                            title="Hủy lịch hẹn"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeletingId(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Xóa vĩnh viễn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Không tìm thấy lịch hẹn nào theo tiêu chuẩn lọc
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {detailModalItem && (
        <Modal
          isOpen={!!detailModalItem}
          onClose={() => setDetailModalItem(null)}
          title="Chi tiết Hồ sơ Đặt khám"
          subtitle={`Mã phiếu: ${detailModalItem.id}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-600">Trạng thái phiếu:</span>
              <StatusBadge status={detailModalItem.status} size="md" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 font-bold block mb-1">BỆNH NHÂN:</span>
                <strong className="text-slate-900 block text-sm">{detailModalItem.patientName}</strong>
                <div>SĐT: {detailModalItem.patientPhone}</div>
                <div>Email: {detailModalItem.patientEmail || 'Không có'}</div>
                <div>Giới tính: {detailModalItem.patientGender || 'Nam'} | NS: {detailModalItem.patientDob || 'N/A'}</div>
                <div>Đ/C: {detailModalItem.patientAddress || 'Không có'}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 font-bold block mb-1">BÁC SĨ PHỤ TRÁCH:</span>
                <strong className="text-slate-900 block text-sm">{detailModalItem.doctorName}</strong>
                <div className="text-medical-600 font-semibold">{detailModalItem.specialtyName}</div>
                <div className="mt-2 text-slate-800 font-bold">
                  {detailModalItem.timeSlot} - {new Date(detailModalItem.appointmentDate).toLocaleDateString('vi-VN')}
                </div>
                <div className="text-emerald-700 font-extrabold mt-1">
                  Phí: {new Intl.NumberFormat('vi-VN').format(detailModalItem.consultationFee || 0)} VNĐ
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-400 font-bold block mb-1">LÝ DO KHÁM / TRIỆU CHỨNG:</span>
              <p className="text-slate-700 italic leading-relaxed">
                "{detailModalItem.symptoms || 'Không có mô tả triệu chứng'}"
              </p>
            </div>

            {detailModalItem.cancellationReason && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                <strong className="block mb-1">LÝ DO HỦY:</strong>
                <p>{detailModalItem.cancellationReason}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              {detailModalItem.status === 'pending' && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => {
                    handleApprove(detailModalItem);
                    setDetailModalItem(null);
                  }}
                >
                  Duyệt lịch hẹn
                </Button>
              )}
              {detailModalItem.status === 'confirmed' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    handleComplete(detailModalItem);
                    setDetailModalItem(null);
                  }}
                >
                  Hoàn thành khám
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetailModalItem(null)}
              >
                Đóng
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Admin Cancel Modal */}
      {cancellingItem && (
        <Modal
          isOpen={!!cancellingItem}
          onClose={() => setCancellingItem(null)}
          title="Hủy Lịch Hẹn Khám (Quyền Quản Trị)"
          subtitle={`Phiếu: ${cancellingItem.id} - ${cancellingItem.patientName}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Nhập lý do hủy lịch hẹn này để lưu lại trong nhật ký quản trị:
            </p>
            <textarea
              rows={3}
              value={adminCancelReason}
              onChange={(e) => setAdminCancelReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              placeholder="Nhập lý do hủy lịch..."
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setCancellingItem(null)}>
                Bỏ qua
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmCancel}>
                Xác nhận Hủy
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Delete Modal */}
      {deletingId && (
        <Modal
          isOpen={!!deletingId}
          onClose={() => setDeletingId(null)}
          title="Xác nhận Xóa Vĩnh Viễn"
          subtitle={`Mã phiếu: ${deletingId}`}
        >
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Lịch hẹn này sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu localStorage. Bạn có chắc chắn muốn tiếp tục không?
              </span>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeletingId(null)}>
                Hủy bỏ
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmDelete}>
                Xác nhận Xóa
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Reset Data Modal */}
      {showResetConfirm && (
        <Modal
          isOpen={showResetConfirm}
          onClose={() => setShowResetConfirm(false)}
          title="Khôi Phục Dữ Liệu Ban Đầu"
          subtitle="Dành cho Giảng viên / Đánh giá viên test đồ án"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Hành động này sẽ khôi phục lại toàn bộ dữ liệu mẫu (Seed Data) ban đầu gồm danh sách bác sĩ, chuyên khoa và 6 lịch hẹn với các trạng thái khác nhau. Dữ liệu mới tạo thêm sẽ được làm mới.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowResetConfirm(false)}>
                Quay lại
              </Button>
              <Button variant="primary" size="sm" onClick={handleResetData}>
                Xác nhận Khôi phục
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminDashboardPage;
