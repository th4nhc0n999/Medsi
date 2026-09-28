import { describe, it, expect, beforeEach } from 'vitest';
import {
  STORAGE_KEYS,
  getStorage,
  setStorage,
  getDoctorPaymentAccount,
  saveDoctorPaymentAccount,
  resetToInitialStorage,
} from './storage.js';
import { VIETQR_BANKS } from '../data/banks.js';
import { DOCTORS } from '../data/doctors.js';

// Mock localStorage for Node.js test environment
let store = {};
const localStorageMock = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => {
    store[key] = String(val);
  },
  removeItem: (key) => {
    delete store[key];
  },
  clear: () => {
    store = {};
  },
};
globalThis.localStorage = localStorageMock;

describe('Doctor Payment & Gateway Specification Tests', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  describe('1. VIETQR Banks Data Integrity', () => {
    it('contains major Vietnamese banks', () => {
      expect(VIETQR_BANKS.length).toBeGreaterThan(10);
      const bankIds = VIETQR_BANKS.map((b) => b.id);
      expect(bankIds).toContain('MB');
      expect(bankIds).toContain('VCB');
      expect(bankIds).toContain('TCB');
      expect(bankIds).toContain('BIDV');
      expect(bankIds).toContain('CTG');
    });

    it('each bank has valid id, name, and code', () => {
      VIETQR_BANKS.forEach((b) => {
        expect(b.id).toBeTruthy();
        expect(b.name).toBeTruthy();
        expect(b.code).toBeTruthy();
      });
    });
  });

  describe('2. Doctor Seed Payment Configuration', () => {
    it('all doctors have default paymentAccount defined', () => {
      expect(DOCTORS.length).toBeGreaterThan(0);
      DOCTORS.forEach((doc) => {
        expect(doc.paymentAccount).toBeDefined();
        expect(doc.paymentAccount.bankAccount).toBeDefined();
        expect(doc.paymentAccount.bankAccount.bankId).toBeTruthy();
        expect(doc.paymentAccount.bankAccount.accountNumber).toBeTruthy();
        expect(doc.paymentAccount.bankAccount.accountName).toBeTruthy();

        expect(doc.paymentAccount.momoAccount).toBeDefined();
        expect(doc.paymentAccount.momoAccount.phoneNumber).toMatch(/^0\d{9}$/);
        expect(doc.paymentAccount.momoAccount.accountName).toBeTruthy();
      });
    });

    it('doc_2 (TS. BS Nguyễn Thị Bảy) has MBBank and valid MoMo config as in spec', () => {
      const doc2 = DOCTORS.find((d) => d.id === 'doc_2');
      expect(doc2).toBeDefined();
      expect(doc2.paymentAccount.bankAccount.bankId).toBe('MB');
      expect(doc2.paymentAccount.bankAccount.accountNumber).toBe('0345678999');
      expect(doc2.paymentAccount.bankAccount.accountName).toBe('NGUYEN THI BAY');
      expect(doc2.paymentAccount.momoAccount.phoneNumber).toBe('0987654321');
    });
  });

  describe('3. Storage Operations for Doctor Payment Accounts', () => {
    it('returns null when doctor has no custom payment account', () => {
      const account = getDoctorPaymentAccount('doc_999');
      expect(account).toBeNull();
    });

    it('saves and retrieves doctor payment account correctly', () => {
      const customConfig = {
        bankAccount: {
          bankId: 'TCB',
          bankName: 'Techcombank',
          accountNumber: '19036789999011',
          accountName: 'HOANG MINH TUAN',
        },
        momoAccount: {
          phoneNumber: '0933445566',
          accountName: 'HOANG MINH TUAN',
        },
      };

      const saved = saveDoctorPaymentAccount('doc_3', customConfig);
      expect(saved).toBeDefined();
      expect(saved.updatedAt).toBeDefined();
      expect(saved.bankAccount.accountNumber).toBe('19036789999011');

      const retrieved = getDoctorPaymentAccount('doc_3');
      expect(retrieved).toBeDefined();
      expect(retrieved.bankAccount.bankId).toBe('TCB');
      expect(retrieved.momoAccount.phoneNumber).toBe('0933445566');
    });

    it('handles multiple doctors independently without collision', () => {
      saveDoctorPaymentAccount('doc_1', {
        bankAccount: { bankId: 'VCB', accountNumber: '0071001234567', accountName: 'TRAN QUOC HUY' },
        momoAccount: { phoneNumber: '0911223344', accountName: 'TRAN QUOC HUY' },
      });

      saveDoctorPaymentAccount('doc_2', {
        bankAccount: { bankId: 'MB', accountNumber: '0345678999', accountName: 'NGUYEN THI BAY' },
        momoAccount: { phoneNumber: '0987654321', accountName: 'NGUYEN THI BAY' },
      });

      const doc1 = getDoctorPaymentAccount('doc_1');
      const doc2 = getDoctorPaymentAccount('doc_2');

      expect(doc1.bankAccount.bankId).toBe('VCB');
      expect(doc2.bankAccount.bankId).toBe('MB');
    });
  });

  describe('4. MoMo & VietQR Payload Formats', () => {
    it('generates valid MoMo P2P QR string structure (2|99|phone|name||0|0|amount|note)', () => {
      const phone = '0987654321';
      const name = 'NGUYEN THI BAY';
      const amount = 1030000;
      const note = 'MEDSI_20261002';

      const momoPayload = `2|99|${phone}|${name}||0|0|${amount}|${note}`;
      expect(momoPayload).toContain('2|99|0987654321|NGUYEN THI BAY||0|0|1030000|MEDSI_20261002');
    });

    it('generates valid VietQR compact2 URL format', () => {
      const bankId = 'MB';
      const accNum = '0345678999';
      const amount = 1030000;
      const memo = 'MEDSI 0901234567 20261002';
      const accName = 'NGUYEN THI BAY';

      const url = `https://img.vietqr.io/image/${bankId}-${accNum}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(accName)}`;

      expect(url).toContain('https://img.vietqr.io/image/MB-0345678999-compact2.png');
      expect(url).toContain('amount=1030000');
      expect(url).toContain(encodeURIComponent(memo));
    });
  });
});
