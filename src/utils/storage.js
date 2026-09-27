// Storage utility for robust, safe localStorage interactions

export const STORAGE_KEYS = {
  USERS: 'medsi_users',
  CURRENT_USER: 'medsi_currentUser',
  PATIENT_PROFILES: 'medsi_patientProfiles',
  BOOKINGS: 'medsi_bookings',
  PAYMENTS: 'medsi_payments',
  BOOKING_DRAFT: 'medsi_bookingDraft',
};

// Initial Seed Data Sets
export const DEFAULT_USERS = [
  {
    id: 'usr_admin',
    fullName: 'Quản Trị Viên MedSi',
    email: 'admin@medsi.vn',
    phone: '0988889999',
    password: 'admin123',
    role: 'admin',
    createdAt: '2026-09-25T08:00:00.000Z',
  },
  {
    id: 'usr_demo_patient',
    fullName: 'Nguyễn Văn An',
    email: 'demo@medsi.vn',
    phone: '0901234567',
    password: '123456',
    role: 'patient',
    createdAt: '2026-09-26T09:00:00.000Z',
  },
];

export const DEFAULT_PROFILES = [
  {
    id: 'prof_1',
    userId: 'usr_demo_patient',
    fullName: 'Nguyễn Văn An',
    dob: '1992-05-14',
    gender: 'Nam',
    phone: '0901234567',
    relationship: 'Bản thân',
    idCard: '079092001234',
    address: 'Quận 1, TP.HCM',
    createdAt: '2026-09-26T09:30:00.000Z',
  },
  {
    id: 'prof_2',
    userId: 'usr_demo_patient',
    fullName: 'Nguyễn Minh Khang',
    dob: '2019-10-20',
    gender: 'Nam',
    phone: '0901234567',
    relationship: 'Con',
    idCard: '',
    address: 'Quận 1, TP.HCM',
    createdAt: '2026-09-26T10:00:00.000Z',
  },
];

export const DEFAULT_BOOKINGS = [
  {
    id: 'bk_demo_1',
    code: 'BK202610892',
    userId: 'usr_demo_patient',
    patientProfileId: 'prof_1',
    patientName: 'Nguyễn Văn An',
    patientPhone: '0901234567',
    bookingType: 'doctor',
    doctorId: 'doc_1',
    hospitalId: null,
    examTypeId: null,
    providerName: 'BS. CKII Trần Quốc Huy',
    specialtyName: 'Tim mạch',
    city: 'TP.HCM',
    date: '2026-10-02',
    startTime: '08:30',
    endTime: '09:00',
    symptoms: 'Thường xuyên đau tức nhẹ vùng ngực trái khi gắng sức, hồi hộp.',
    examFee: 350000,
    serviceFee: 30000,
    totalAmount: 380000,
    paymentStatus: 'paid',
    paymentMethod: 'qr',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'bk_demo_2',
    code: 'BK202610893',
    userId: 'usr_demo_patient',
    patientProfileId: 'prof_2',
    patientName: 'Nguyễn Minh Khang',
    patientPhone: '0901234567',
    bookingType: 'doctor',
    doctorId: 'doc_4',
    hospitalId: null,
    examTypeId: null,
    providerName: 'ThS. BS Lê Hoàng Mai',
    specialtyName: 'Nhi khoa',
    city: 'TP.HCM',
    date: '2026-10-05',
    startTime: '09:30',
    endTime: '10:00',
    symptoms: 'Bé ho có đờm 3 ngày nay, sốt nhẹ vào ban đêm.',
    examFee: 300000,
    serviceFee: 30000,
    totalAmount: 330000,
    paymentStatus: 'unpaid',
    paymentMethod: 'onsite',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'bk_demo_3',
    code: 'BK202610894',
    userId: 'usr_demo_patient',
    patientProfileId: 'prof_1',
    patientName: 'Trần Thị Mai',
    patientPhone: '0987654321',
    bookingType: 'doctor',
    doctorId: 'doc_2',
    hospitalId: null,
    examTypeId: null,
    providerName: 'TS. BS Nguyễn Phương Thảo',
    specialtyName: 'Da liễu',
    city: 'TP.HCM',
    date: '2026-10-03',
    startTime: '14:00',
    endTime: '14:30',
    symptoms: 'Da mặt dị ứng nổi mẩn sau khi dùng mỹ phẩm mới.',
    examFee: 300000,
    serviceFee: 30000,
    totalAmount: 330000,
    paymentStatus: 'paid',
    paymentMethod: 'atm',
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'bk_demo_4',
    code: 'BK202610895',
    userId: 'usr_demo_patient',
    patientProfileId: 'prof_1',
    patientName: 'Lê Hoàng Nam',
    patientPhone: '0912345678',
    bookingType: 'doctor',
    doctorId: 'doc_3',
    hospitalId: null,
    examTypeId: null,
    providerName: 'BS. CKI Hoàng Minh Tuấn',
    specialtyName: 'Tai Mũi Họng',
    city: 'Hà Nội',
    date: '2026-10-04',
    startTime: '10:00',
    endTime: '10:30',
    symptoms: 'Đau rát họng, khàn giọng kéo dài hơn một tuần.',
    examFee: 280000,
    serviceFee: 30000,
    totalAmount: 310000,
    paymentStatus: 'unpaid',
    paymentMethod: 'onsite',
    status: 'cancelled',
    cancelReason: 'Bệnh nhân bận công tác đột xuất',
    cancelledAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export const DEFAULT_PAYMENTS = [
  {
    id: 'pay_demo_1',
    bookingId: 'bk_demo_1',
    bookingCode: 'BK202610892',
    method: 'QR Code',
    examFee: 350000,
    serviceFee: 30000,
    totalAmount: 380000,
    status: 'paid',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'pay_demo_3',
    bookingId: 'bk_demo_3',
    bookingCode: 'BK202610894',
    method: 'Thẻ ATM / Internet Banking',
    examFee: 300000,
    serviceFee: 30000,
    totalAmount: 330000,
    status: 'paid',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

/**
 * Safely retrieve parsed data from localStorage with backward-compatible legacy key check
 */
export function getStorage(key, fallback = null) {
  try {
    let item = localStorage.getItem(key);
    // Backward-compatibility: if namespaced key not found, check legacy un-namespaced key
    if (item === null || item === undefined) {
      const legacyKey = key.replace('medsi_', '');
      item = localStorage.getItem(legacyKey);
    }
    if (item === null || item === undefined) return fallback;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error reading key "${key}" from localStorage:`, error);
    return fallback;
  }
}

/**
 * Safely serialize and save data to localStorage
 */
export function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing key "${key}" to localStorage:`, error);
  }
}

/**
 * Safely remove a key from localStorage
 */
export function removeStorage(key) {
  try {
    localStorage.removeItem(key);
    // Also remove legacy key if present
    const legacyKey = key.replace('medsi_', '');
    localStorage.removeItem(legacyKey);
  } catch (error) {
    console.error(`Error removing key "${key}" from localStorage:`, error);
  }
}

/**
 * Seed initial data if not already present
 */
export function initInitialStorage() {
  const existingUsers = getStorage(STORAGE_KEYS.USERS, null);
  if (!existingUsers || !Array.isArray(existingUsers) || existingUsers.length === 0) {
    setStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
  }

  const existingProfiles = getStorage(STORAGE_KEYS.PATIENT_PROFILES, null);
  if (!existingProfiles || !Array.isArray(existingProfiles) || existingProfiles.length === 0) {
    setStorage(STORAGE_KEYS.PATIENT_PROFILES, DEFAULT_PROFILES);
  }

  const existingBookings = getStorage(STORAGE_KEYS.BOOKINGS, null);
  if (!existingBookings || !Array.isArray(existingBookings) || existingBookings.length === 0) {
    setStorage(STORAGE_KEYS.BOOKINGS, DEFAULT_BOOKINGS);
  }

  const existingPayments = getStorage(STORAGE_KEYS.PAYMENTS, null);
  if (!existingPayments || !Array.isArray(existingPayments) || existingPayments.length === 0) {
    setStorage(STORAGE_KEYS.PAYMENTS, DEFAULT_PAYMENTS);
  }
}

/**
 * Reset all storage to initial clean seed data (Useful for grading/testing)
 */
export function resetToInitialStorage() {
  setStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
  setStorage(STORAGE_KEYS.PATIENT_PROFILES, DEFAULT_PROFILES);
  setStorage(STORAGE_KEYS.BOOKINGS, DEFAULT_BOOKINGS);
  setStorage(STORAGE_KEYS.PAYMENTS, DEFAULT_PAYMENTS);
  removeStorage(STORAGE_KEYS.BOOKING_DRAFT);
  window.dispatchEvent(new Event('medsi_storage_reset'));
  return true;
}
