// Storage utility for robust, safe localStorage interactions

export const STORAGE_KEYS = {
  USERS: 'users',
  CURRENT_USER: 'currentUser',
  PATIENT_PROFILES: 'patientProfiles',
  BOOKINGS: 'bookings',
  PAYMENTS: 'payments',
  BOOKING_DRAFT: 'bookingDraft',
};

/**
 * Safely retrieve parsed data from localStorage
 */
export function getStorage(key, fallback = null) {
  try {
    const item = localStorage.getItem(key);
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
  } catch (error) {
    console.error(`Error removing key "${key}" from localStorage:`, error);
  }
}

/**
 * Seed initial data if not already present
 */
export function initInitialStorage() {
  // 1. Initial Admin & Demo User
  const existingUsers = getStorage(STORAGE_KEYS.USERS, null);
  if (!existingUsers || !Array.isArray(existingUsers) || existingUsers.length === 0) {
    const defaultUsers = [
      {
        id: 'usr_admin',
        fullName: 'Quản Trị Viên MedSi',
        email: 'admin@medsi.vn',
        phone: '0988889999',
        password: 'admin123',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'usr_demo_patient',
        fullName: 'Nguyễn Văn An',
        email: 'demo@medsi.vn',
        phone: '0901234567',
        password: '123456',
        role: 'patient',
        createdAt: new Date().toISOString(),
      },
    ];
    setStorage(STORAGE_KEYS.USERS, defaultUsers);
  }

  // 2. Initial Patient Profiles for demo user
  const existingProfiles = getStorage(STORAGE_KEYS.PATIENT_PROFILES, null);
  if (!existingProfiles || !Array.isArray(existingProfiles)) {
    const defaultProfiles = [
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
        createdAt: new Date().toISOString(),
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
        createdAt: new Date().toISOString(),
      },
    ];
    setStorage(STORAGE_KEYS.PATIENT_PROFILES, defaultProfiles);
  }

  // 3. Initial Bookings
  const existingBookings = getStorage(STORAGE_KEYS.BOOKINGS, null);
  if (!existingBookings || !Array.isArray(existingBookings)) {
    const defaultBookings = [
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
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
    ];
    setStorage(STORAGE_KEYS.BOOKINGS, defaultBookings);
  }

  // 4. Initial Payments
  const existingPayments = getStorage(STORAGE_KEYS.PAYMENTS, null);
  if (!existingPayments || !Array.isArray(existingPayments)) {
    const defaultPayments = [
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
    ];
    setStorage(STORAGE_KEYS.PAYMENTS, defaultPayments);
  }
}
