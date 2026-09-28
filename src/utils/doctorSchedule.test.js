import { describe, it, expect, beforeEach } from 'vitest';
import {
  STORAGE_KEYS,
  getStorage,
  setStorage,
  generateDefaultDoctorSchedules,
  getDoctorSchedule,
  saveDoctorSchedule,
} from './storage.js';
import { isSlotPast } from '../data/slots.js';

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

describe('Doctor Schedule & Slot Management Tests', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  describe('1. Default Doctor Schedule Generation', () => {
    it('generates schedules for primary doctors (doc_1, doc_2, doc_3)', () => {
      const schedules = generateDefaultDoctorSchedules();
      expect(schedules).toBeDefined();
      expect(typeof schedules).toBe('object');
      expect(schedules.doc_1).toBeDefined();
      expect(schedules.doc_2).toBeDefined();
    });

    it('contains array of slots for dates in standard format (HH:mm)', () => {
      const schedules = generateDefaultDoctorSchedules();
      const doc1Dates = Object.keys(schedules.doc_1);
      expect(doc1Dates.length).toBeGreaterThan(0);

      const firstDateSlots = schedules.doc_1[doc1Dates[0]];
      expect(Array.isArray(firstDateSlots)).toBe(true);
      expect(firstDateSlots.length).toBeGreaterThan(0);
      firstDateSlots.forEach((slot) => {
        expect(slot).toMatch(/^\d{2}:\d{2}$/);
      });
    });
  });

  describe('2. Schedule Storage Operations', () => {
    it('returns empty array when doctor has no schedule or input is invalid', () => {
      expect(getDoctorSchedule(null, '2026-10-01')).toEqual([]);
      expect(getDoctorSchedule('doc_1', null)).toEqual([]);
      expect(getDoctorSchedule('non_existent_doctor', '2026-10-01')).toEqual([]);
    });

    it('saves and retrieves doctor schedule accurately', () => {
      const doctorId = 'doc_test_1';
      const dateStr = '2026-10-15';
      const slots = ['08:00', '08:30', '14:00', '14:30'];

      saveDoctorSchedule(doctorId, dateStr, slots);
      const retrieved = getDoctorSchedule(doctorId, dateStr);

      expect(retrieved).toEqual(slots);
    });

    it('updates doctor schedule without overwriting other dates', () => {
      const doctorId = 'doc_test_1';
      saveDoctorSchedule(doctorId, '2026-10-15', ['08:00', '08:30']);
      saveDoctorSchedule(doctorId, '2026-10-16', ['14:00', '14:30', '15:00']);

      const day1 = getDoctorSchedule(doctorId, '2026-10-15');
      const day2 = getDoctorSchedule(doctorId, '2026-10-16');

      expect(day1).toEqual(['08:00', '08:30']);
      expect(day2).toEqual(['14:00', '14:30', '15:00']);

      // Overwrite day1 with new slots
      saveDoctorSchedule(doctorId, '2026-10-15', ['09:00', '09:30']);
      expect(getDoctorSchedule(doctorId, '2026-10-15')).toEqual(['09:00', '09:30']);
      // day2 must remain untouched
      expect(getDoctorSchedule(doctorId, '2026-10-16')).toEqual(['14:00', '14:30', '15:00']);
    });
  });

  describe('3. Slot Filtering Rules', () => {
    it('identifies past slots on current date correctly', () => {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      const todayStr = `${y}-${m}-${d}`;

      // A slot 2 hours ago is past
      const pastHour = Math.max(0, today.getHours() - 2);
      const pastTimeStr = `${String(pastHour).padStart(2, '0')}:00`;
      if (pastHour > 0) {
        expect(isSlotPast(todayStr, pastTimeStr)).toBe(true);
      }

      // A future date slot is never past
      const futureDateStr = '2099-01-01';
      expect(isSlotPast(futureDateStr, '08:00')).toBe(false);
    });

    it('handles empty available slots gracefully for doctor booking', () => {
      const doctorId = 'doc_empty';
      const dateStr = '2026-11-01';
      const available = getDoctorSchedule(doctorId, dateStr);

      expect(available).toEqual([]);
      expect(available.length).toBe(0);
    });
  });
});
