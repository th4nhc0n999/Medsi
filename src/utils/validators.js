/**
 * Validation utilities for MedSi Clinic Booking
 * Handles validation for:
 * - Patient Date of Birth (DOB) - No future dates, reasonable birth year (1900 - today)
 * - Phone numbers (9 to 11 digits, valid format)
 * - Email / Gmail addresses (strict RFC regex, Gmail specific constraints)
 * - Full name (presence, minimum length)
 */

/**
 * Validate patient date of birth (DOB)
 * @param {string} dobString - Date of birth in YYYY-MM-DD or parseable format
 * @param {Date} [referenceDate] - Optional reference date (default: now)
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validatePatientDob(dobString, referenceDate = new Date()) {
  if (!dobString || typeof dobString !== 'string' || !dobString.trim()) {
    return { isValid: false, error: 'Vui lòng chọn ngày sinh của bệnh nhân' };
  }

  const trimmed = dobString.trim();
  // Standard format YYYY-MM-DD check
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(trimmed)) {
    return { isValid: false, error: 'Định dạng ngày sinh không hợp lệ (cần YYYY-MM-DD)' };
  }

  const [yearStr, monthStr, dayStr] = trimmed.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (month < 1 || month > 12) {
    return { isValid: false, error: 'Tháng sinh không hợp lệ (từ 1 đến 12)' };
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return { isValid: false, error: `Ngày sinh không hợp lệ trong tháng ${month}` };
  }

  const ref = new Date(referenceDate);
  const todayYear = ref.getFullYear();
  const todayMonth = ref.getMonth() + 1;
  const todayDay = ref.getDate();

  // Future date check (year, month, day)
  if (
    year > todayYear ||
    (year === todayYear && month > todayMonth) ||
    (year === todayYear && month === todayMonth && day > todayDay)
  ) {
    return { isValid: false, error: 'Ngày sinh không thể ở tương lai' };
  }

  // Minimum realistic year check (e.g. at most 130 years old, >= 1900)
  if (year < 1900) {
    return { isValid: false, error: 'Năm sinh không hợp lệ (phải từ năm 1900 trở lại đây)' };
  }

  return { isValid: true };
}

/**
 * Validate and normalize Vietnamese phone number (9-11 digits)
 * Requirements:
 * - Must be 9 to 11 digits (as specified by user requirement)
 * - May start with 0 or +84 or standard VN prefixes
 * @param {string} phone
 * @returns {{ isValid: boolean, error?: string, normalized?: string }}
 */
export function validatePhoneNumber(phone) {
  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    return { isValid: false, error: 'Vui lòng nhập số điện thoại' };
  }

  const trimmed = phone.trim();

  // Check for invalid characters (only digits, spaces, dots, dashes, and optional leading +)
  if (!/^\+?[0-9\s.-]+$/.test(trimmed)) {
    return { isValid: false, error: 'Số điện thoại chỉ được chứa chữ số' };
  }

  // Normalize by removing spaces, dots, dashes
  let clean = trimmed.replace(/[\s.-]/g, '');

  // Convert international +84 to 0
  if (clean.startsWith('+84')) {
    clean = '0' + clean.slice(3);
  } else if (clean.startsWith('84') && clean.length > 10) {
    clean = '0' + clean.slice(2);
  }

  // Check digit-only
  if (!/^\d+$/.test(clean)) {
    return { isValid: false, error: 'Số điện thoại không hợp lệ' };
  }

  // Check length between 9 and 11 digits
  if (clean.length < 9 || clean.length > 11) {
    return { isValid: false, error: 'Số điện thoại phải từ 9 đến 11 chữ số' };
  }

  return { isValid: true, normalized: clean };
}

/**
 * Validate email address with strict format check & Gmail-specific rules
 * @param {string} email
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string' || !email.trim()) {
    return { isValid: false, error: 'Vui lòng nhập địa chỉ email' };
  }

  const trimmed = email.trim();

  // Basic length limit (RFC 5321)
  if (trimmed.length < 5 || trimmed.length > 254) {
    return { isValid: false, error: 'Độ dài email không hợp lệ' };
  }

  // Cannot contain consecutive dots
  if (trimmed.includes('..')) {
    return { isValid: false, error: 'Email không được chứa 2 dấu chấm liên tiếp' };
  }

  // Standard RFC email pattern
  // Ensures username, single @, domain name with at least 2 chars TLD
  const emailRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Định dạng email không hợp lệ (Ví dụ: yourname@gmail.com)' };
  }

  // Specific validation if domain is Gmail (e.g. @gmail.com)
  const parts = trimmed.split('@');
  if (parts.length === 2) {
    const domain = parts[1].toLowerCase();
    const localPart = parts[0];

    if (domain === 'gmail.com') {
      // Gmail username rules:
      // - 6 to 30 characters (for the base username before +)
      // - can only contain letters (a-z), numbers (0-9), and periods (.)
      // - cannot begin or end with a period
      const baseUsername = localPart.split('+')[0];

      if (baseUsername.length < 6 || baseUsername.length > 30) {
        return {
          isValid: false,
          error: 'Tên người dùng Gmail phải từ 6 đến 30 ký tự (trước @gmail.com)',
        };
      }

      if (!/^[a-zA-Z0-9.]+$/.test(baseUsername)) {
        return {
          isValid: false,
          error: 'Gmail chỉ chấp nhận chữ cái (a-z), số (0-9) và dấu chấm (.)',
        };
      }

      if (baseUsername.startsWith('.') || baseUsername.endsWith('.')) {
        return {
          isValid: false,
          error: 'Tên người dùng Gmail không được bắt đầu hoặc kết thúc bằng dấu chấm',
        };
      }
    }
  }

  return { isValid: true };
}

/**
 * Validate full name
 * @param {string} name
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateFullName(name) {
  if (!name || typeof name !== 'string' || !name.trim()) {
    return { isValid: false, error: 'Họ và tên là bắt buộc' };
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Họ và tên phải có ít nhất 2 ký tự' };
  }
  // Must not be numbers only
  if (/^\d+$/.test(trimmed)) {
    return { isValid: false, error: 'Họ và tên không hợp lệ' };
  }
  return { isValid: true };
}
