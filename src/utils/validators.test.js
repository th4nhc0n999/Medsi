import { describe, it, expect } from 'vitest';
import {
  validatePatientDob,
  validatePhoneNumber,
  validateEmail,
  validateFullName,
} from './validators.js';
import { buildCSVContent, formatCSVCell } from './csvExport.js';

describe('1. Patient Date of Birth (DOB) Validation', () => {
  const mockToday = new Date('2026-09-28T00:00:00.000Z');

  it('accepts valid past dates', () => {
    expect(validatePatientDob('1995-05-14', mockToday).isValid).toBe(true);
    expect(validatePatientDob('2019-10-20', mockToday).isValid).toBe(true);
    expect(validatePatientDob('1950-01-01', mockToday).isValid).toBe(true);
  });

  it('accepts today as valid birthday', () => {
    expect(validatePatientDob('2026-09-28', mockToday).isValid).toBe(true);
  });

  it('rejects future dates', () => {
    const futureResult = validatePatientDob('2026-09-29', mockToday);
    expect(futureResult.isValid).toBe(false);
    expect(futureResult.error).toMatch(/tương lai/);

    const farFuture = validatePatientDob('2035-12-01', mockToday);
    expect(farFuture.isValid).toBe(false);
  });

  it('rejects unrealistic birth years before 1900', () => {
    const tooOld = validatePatientDob('1880-05-10', mockToday);
    expect(tooOld.isValid).toBe(false);
    expect(tooOld.error).toMatch(/1900/);
  });

  it('rejects invalid calendar dates', () => {
    // Feb 30th does not exist
    const feb30 = validatePatientDob('2024-02-30', mockToday);
    expect(feb30.isValid).toBe(false);

    // April 31st does not exist
    const apr31 = validatePatientDob('2023-04-31', mockToday);
    expect(apr31.isValid).toBe(false);

    // Month 13 does not exist
    const month13 = validatePatientDob('2023-13-01', mockToday);
    expect(month13.isValid).toBe(false);
  });

  it('rejects malformed date strings and empty inputs', () => {
    expect(validatePatientDob('').isValid).toBe(false);
    expect(validatePatientDob('   ').isValid).toBe(false);
    expect(validatePatientDob(null).isValid).toBe(false);
    expect(validatePatientDob('14/05/1995').isValid).toBe(false);
    expect(validatePatientDob('not-a-date').isValid).toBe(false);
  });
});

describe('2. Phone Number Validation (9 - 11 digits)', () => {
  it('accepts valid 10-digit mobile numbers', () => {
    const res = validatePhoneNumber('0901234567');
    expect(res.isValid).toBe(true);
    expect(res.normalized).toBe('0901234567');
  });

  it('accepts valid 9-digit numbers', () => {
    const res = validatePhoneNumber('090123456');
    expect(res.isValid).toBe(true);
    expect(res.normalized).toBe('090123456');
  });

  it('accepts valid 11-digit landline/mobile numbers', () => {
    const res = validatePhoneNumber('02838234567');
    expect(res.isValid).toBe(true);
    expect(res.normalized).toBe('02838234567');
  });

  it('normalizes numbers with spaces, dots, and dashes', () => {
    expect(validatePhoneNumber('090 123 4567').normalized).toBe('0901234567');
    expect(validatePhoneNumber('090-123-4567').normalized).toBe('0901234567');
    expect(validatePhoneNumber('090.123.4567').normalized).toBe('0901234567');
  });

  it('normalizes numbers with +84 country code', () => {
    const res = validatePhoneNumber('+84901234567');
    expect(res.isValid).toBe(true);
    expect(res.normalized).toBe('0901234567');
  });

  it('rejects numbers that are too short (< 9 digits)', () => {
    expect(validatePhoneNumber('12345678').isValid).toBe(false);
    expect(validatePhoneNumber('090123').isValid).toBe(false);
  });

  it('rejects numbers that are too long (> 11 digits)', () => {
    expect(validatePhoneNumber('0901234567890').isValid).toBe(false);
  });

  it('rejects letters and special characters', () => {
    expect(validatePhoneNumber('09012345ab').isValid).toBe(false);
    expect(validatePhoneNumber('0901234#@!').isValid).toBe(false);
  });

  it('rejects empty inputs', () => {
    expect(validatePhoneNumber('').isValid).toBe(false);
    expect(validatePhoneNumber('   ').isValid).toBe(false);
    expect(validatePhoneNumber(null).isValid).toBe(false);
  });
});

describe('3. Email & Gmail Validation', () => {
  it('accepts valid standard email addresses', () => {
    expect(validateEmail('doctor.smith@hospital.vn').isValid).toBe(true);
    expect(validateEmail('contact@medsi.org').isValid).toBe(true);
    expect(validateEmail('user_123@sub.domain.co').isValid).toBe(true);
  });

  it('accepts valid Gmail addresses', () => {
    expect(validateEmail('nguyenvanan@gmail.com').isValid).toBe(true);
    expect(validateEmail('an.nguyen1995@gmail.com').isValid).toBe(true);
    expect(validateEmail('medsi.booking2026@gmail.com').isValid).toBe(true);
  });

  it('rejects Gmail usernames shorter than 6 characters', () => {
    const res = validateEmail('abc@gmail.com');
    expect(res.isValid).toBe(false);
    expect(res.error).toMatch(/6 đến 30/);
  });

  it('rejects Gmail usernames starting or ending with a dot', () => {
    expect(validateEmail('.nguyenvanan@gmail.com').isValid).toBe(false);
    expect(validateEmail('nguyenvanan.@gmail.com').isValid).toBe(false);
  });

  it('rejects emails with consecutive dots', () => {
    expect(validateEmail('nguyen..an@gmail.com').isValid).toBe(false);
    expect(validateEmail('an@gmail..com').isValid).toBe(false);
  });

  it('rejects emails missing domain or extension', () => {
    expect(validateEmail('nguyenvanan@gmail').isValid).toBe(false);
    expect(validateEmail('nguyenvanan@').isValid).toBe(false);
    expect(validateEmail('@gmail.com').isValid).toBe(false);
    expect(validateEmail('nguyenvanan.gmail.com').isValid).toBe(false);
  });

  it('rejects emails with double @ or invalid symbols', () => {
    expect(validateEmail('nguyen@@gmail.com').isValid).toBe(false);
    expect(validateEmail('nguyen van an@gmail.com').isValid).toBe(false);
    expect(validateEmail('nguyen*an@gmail.com').isValid).toBe(false);
  });

  it('rejects empty or whitespace inputs', () => {
    expect(validateEmail('').isValid).toBe(false);
    expect(validateEmail('   ').isValid).toBe(false);
    expect(validateEmail(null).isValid).toBe(false);
  });
});

describe('4. Full Name Validation', () => {
  it('accepts valid full names', () => {
    expect(validateFullName('Nguyễn Văn An').isValid).toBe(true);
    expect(validateFullName('Trần Thị B').isValid).toBe(true);
  });

  it('rejects empty or single character names', () => {
    expect(validateFullName('').isValid).toBe(false);
    expect(validateFullName('A').isValid).toBe(false);
  });

  it('rejects numbers-only names', () => {
    expect(validateFullName('1234567').isValid).toBe(false);
  });
});

describe('5. CSV Export Content & Vietnamese Character Preservation', () => {
  const headers = [
    'Mã lịch hẹn',
    'Họ tên bệnh nhân',
    'Số điện thoại',
    'Bác sĩ / Cơ sở y tế',
    'Chuyên khoa',
    'Bệnh viện tiếp nhận',
    'Trạng thái'
  ];

  const rows = [
    [
      'BK202610892',
      'Nguyễn Văn An',
      '0901234567',
      'BS. CKII Trần Quốc Huy',
      'Tim mạch',
      'Bệnh viện Chợ Rẫy',
      'Đã duyệt'
    ],
    [
      'BK202610893',
      'Trần Thị "Bé" Mai',
      '0987654321',
      'ThS. BS Lê Hoàng Mai',
      'Nhi khoa',
      'Bệnh viện Nhi Đồng 1',
      'Chờ duyệt'
    ],
    [
      'BK202610894',
      'Đặng Thị Hồng Nhung',
      '0912345678',
      'PGS. TS Phạm Đức Minh',
      'Cơ Xương Khớp',
      'Bệnh viện Đại học Y Dược TP.HCM',
      'Hoàn thành'
    ]
  ];

  it('starts with pure UTF-8 BOM (\\uFEFF) to ensure Excel detects UTF-8 correctly', () => {
    const csv = buildCSVContent(headers, rows);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });

  it('does NOT contain sep= directive which corrupts UTF-8 accents in Excel', () => {
    const csv = buildCSVContent(headers, rows);
    expect(csv.includes('sep=')).toBe(false);
  });

  it('preserves all Vietnamese diacritics for Bệnh nhân (Patients)', () => {
    const csv = buildCSVContent(headers, rows);
    expect(csv).toContain('Nguyễn Văn An');
    expect(csv).toContain('Trần Thị ""Bé"" Mai');
    expect(csv).toContain('Đặng Thị Hồng Nhung');
  });

  it('preserves all Vietnamese diacritics for Bác sĩ (Doctors)', () => {
    const csv = buildCSVContent(headers, rows);
    expect(csv).toContain('BS. CKII Trần Quốc Huy');
    expect(csv).toContain('ThS. BS Lê Hoàng Mai');
    expect(csv).toContain('PGS. TS Phạm Đức Minh');
  });

  it('preserves all Vietnamese diacritics for Bệnh viện (Hospitals)', () => {
    const csv = buildCSVContent(headers, rows);
    expect(csv).toContain('Bệnh viện Chợ Rẫy');
    expect(csv).toContain('Bệnh viện Nhi Đồng 1');
    expect(csv).toContain('Bệnh viện Đại học Y Dược TP.HCM');
  });

  it('preserves all Vietnamese diacritics for Chuyên khoa & Trạng thái', () => {
    const csv = buildCSVContent(headers, rows);
    expect(csv).toContain('Tim mạch');
    expect(csv).toContain('Cơ Xương Khớp');
    expect(csv).toContain('Đã duyệt');
    expect(csv).toContain('Chờ duyệt');
    expect(csv).toContain('Hoàn thành');
  });

  it('decodes identically through standard UTF-8 buffer decoding', () => {
    const csv = buildCSVContent(headers, rows);
    const buf = Buffer.from(csv, 'utf8');
    const decoded = buf.toString('utf8');
    expect(decoded).toBe(csv);
  });

  it('splits cleanly by semicolon delimiter for Excel on Windows VN', () => {
    const csv = buildCSVContent(headers, rows, { delimiter: ';' });
    const lines = csv.replace('\uFEFF', '').split('\r\n');
    expect(lines.length).toBe(4); // 1 header + 3 rows
    for (const line of lines) {
      // Should have 7 fields (6 semicolons)
      const fieldCount = line.split(';').length;
      expect(fieldCount).toBe(7);
    }
  });

  it('splits cleanly by comma delimiter for Google Sheets & international tools', () => {
    const csv = buildCSVContent(headers, rows, { delimiter: ',' });
    const lines = csv.replace('\uFEFF', '').split('\r\n');
    expect(lines.length).toBe(4);
    expect(lines[0].split(',').length).toBe(7);
  });

  it('preserves leading zeros for phone numbers so Excel does not drop 0', () => {
    const cell = formatCSVCell('0901234567', true, ';');
    expect(cell).toBe('="0901234567"');
  });
});
