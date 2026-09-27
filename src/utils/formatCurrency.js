/**
 * Formats a numeric value into Vietnamese Dong currency string (e.g. 350.000 đ)
 */
export function formatCurrency(amount) {
  if (typeof amount !== 'number') {
    amount = Number(amount) || 0;
  }
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}
