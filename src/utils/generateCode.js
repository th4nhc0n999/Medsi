/**
 * Generates an appointment booking reference code, e.g., BK2026849102
 */
export function generateBookingCode() {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `BK${year}${randomSuffix}`;
}

/**
 * Generates a unique transaction/id string
 */
export function generateUniqueId(prefix = 'item') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}
