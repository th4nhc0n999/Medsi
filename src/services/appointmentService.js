import { INITIAL_APPOINTMENTS, DOCTORS } from './mockData';

const STORAGE_KEY = 'medsi_appointments_v1';
const DOCTORS_STORAGE_KEY = 'medsi_doctors_v1';
const STORAGE_EVENT = 'medsi_storage_change';

class AppointmentService {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    try {
      // Auto-migrate from previous storage key if present
      const oldAppointments = localStorage.getItem('medibook_appointments_v1');
      if (oldAppointments && !localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, oldAppointments);
      }
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_APPOINTMENTS));
      }

      const oldDoctors = localStorage.getItem('medibook_doctors_v1');
      if (oldDoctors && !localStorage.getItem(DOCTORS_STORAGE_KEY)) {
        localStorage.setItem(DOCTORS_STORAGE_KEY, oldDoctors);
      }
      const storedDoctors = localStorage.getItem(DOCTORS_STORAGE_KEY);
      if (!storedDoctors) {
        localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(DOCTORS));
      }
    } catch (e) {
      console.warn('LocalStorage not available or error initializing', e);
    }
  }

  // Lấy toàn bộ danh sách lịch hẹn
  getAll(filters = {}) {
    this.initStorage();
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      let result = [...data];

      if (filters.status && filters.status !== 'all') {
        result = result.filter(item => item.status === filters.status);
      }

      if (filters.doctorId && filters.doctorId !== 'all') {
        result = result.filter(item => item.doctorId === filters.doctorId);
      }

      if (filters.date) {
        result = result.filter(item => item.appointmentDate === filters.date);
      }

      if (filters.search) {
        const query = filters.search.trim().toLowerCase();
        result = result.filter(item => 
          (item.id && item.id.toLowerCase().includes(query)) ||
          (item.patientName && item.patientName.toLowerCase().includes(query)) ||
          (item.patientPhone && item.patientPhone.includes(query)) ||
          (item.doctorName && item.doctorName.toLowerCase().includes(query)) ||
          (item.specialtyName && item.specialtyName.toLowerCase().includes(query))
        );
      }

      // Sắp xếp mới nhất lên đầu
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      return result;
    } catch (e) {
      console.error('Error fetching appointments', e);
      return [];
    }
  }

  getById(id) {
    const all = this.getAll();
    return all.find(item => item.id === id) || null;
  }

  getByPhone(phone) {
    if (!phone) return [];
    const normalized = phone.replace(/\D/g, '');
    const all = this.getAll();
    return all.filter(item => {
      const cleanPhone = (item.patientPhone || '').replace(/\D/g, '');
      return cleanPhone.includes(normalized);
    });
  }

  // Lấy các khung giờ đã có người đặt của bác sĩ vào ngày chỉ định
  getOccupiedSlots(doctorId, date) {
    if (!doctorId || !date) return [];
    const all = this.getAll();
    return all
      .filter(item => 
        item.doctorId === doctorId && 
        item.appointmentDate === date && 
        item.status !== 'cancelled'
      )
      .map(item => item.timeSlot);
  }

  create(appointmentData) {
    this.initStorage();
    try {
      const all = this.getAll();
      
      // Tạo mã lịch hẹn độc nhất
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const newId = `MDB-2026-${randomSuffix}`;

      const newAppointment = {
        id: newId,
        patientName: appointmentData.patientName.trim(),
        patientPhone: appointmentData.patientPhone.trim(),
        patientEmail: (appointmentData.patientEmail || '').trim(),
        patientDob: appointmentData.patientDob || '',
        patientGender: appointmentData.patientGender || 'Nam',
        patientAddress: (appointmentData.patientAddress || '').trim(),
        doctorId: appointmentData.doctorId,
        doctorName: appointmentData.doctorName,
        specialtyName: appointmentData.specialtyName,
        consultationFee: Number(appointmentData.consultationFee) || 300000,
        appointmentDate: appointmentData.appointmentDate,
        timeSlot: appointmentData.timeSlot,
        symptoms: (appointmentData.symptoms || '').trim(),
        status: 'pending', // Mặc định là chờ duyệt
        createdAt: new Date().toISOString(),
        notes: appointmentData.notes || 'Khách đặt qua cổng trực tuyến'
      };

      const updatedList = [newAppointment, ...all];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new Event(STORAGE_EVENT));

      return newAppointment;
    } catch (e) {
      console.error('Error creating appointment', e);
      throw new Error('Không thể lưu thông tin lịch hẹn. Vui lòng thử lại!');
    }
  }

  updateStatus(id, newStatus, reason = '') {
    this.initStorage();
    try {
      const all = this.getAll();
      const index = all.findIndex(item => item.id === id);
      if (index === -1) return null;

      all[index] = {
        ...all[index],
        status: newStatus,
        updatedAt: new Date().toISOString(),
        ...(reason ? { cancellationReason: reason } : {})
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      window.dispatchEvent(new Event(STORAGE_EVENT));
      return all[index];
    } catch (e) {
      console.error('Error updating appointment status', e);
      return null;
    }
  }

  delete(id) {
    this.initStorage();
    try {
      const all = this.getAll();
      const filtered = all.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      window.dispatchEvent(new Event(STORAGE_EVENT));
      return true;
    } catch (e) {
      console.error('Error deleting appointment', e);
      return false;
    }
  }

  resetToMockData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_APPOINTMENTS));
      localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(DOCTORS));
      window.dispatchEvent(new Event(STORAGE_EVENT));
      return true;
    } catch (e) {
      console.error('Error resetting mock data', e);
      return false;
    }
  }

  getStats() {
    const all = this.getAll();
    const stats = {
      total: all.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      estimatedRevenue: 0
    };

    all.forEach(item => {
      if (item.status === 'pending') stats.pending++;
      else if (item.status === 'confirmed') {
        stats.confirmed++;
        stats.estimatedRevenue += (item.consultationFee || 0);
      }
      else if (item.status === 'completed') {
        stats.completed++;
        stats.estimatedRevenue += (item.consultationFee || 0);
      }
      else if (item.status === 'cancelled') stats.cancelled++;
    });

    return stats;
  }

  // Doctor helpers
  getDoctors() {
    this.initStorage();
    try {
      const stored = localStorage.getItem(DOCTORS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : DOCTORS;
    } catch {
      return DOCTORS;
    }
  }

  getDoctorById(id) {
    const docs = this.getDoctors();
    return docs.find(d => d.id === id) || null;
  }
}

export const appointmentService = new AppointmentService();
export default appointmentService;
