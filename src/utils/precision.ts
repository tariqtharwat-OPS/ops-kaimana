/**
 * Precision and rounding utilities for OPS-Kaimana
 */

/**
 * Rounds a quantity to 1 decimal place (e.g., 276.0)
 * @param value The quantity to round
 * @returns Rounded number
 */
export const roundQty = (value: number): number => {
  return Math.round((value || 0) * 10) / 10;
};

/**
 * Rounds an IDR amount to 0 decimal places (integer)
 * @param value The amount to round
 * @returns Rounded integer
 */
export const roundAmount = (value: number): number => {
  return Math.round(value || 0);
};

/**
 * Formats a quantity as a string with exactly 1 decimal place
 */
export const formatQty = (value: number): string => {
  return roundQty(value).toFixed(1);
};

/**
 * Formats an amount as an IDR currency string
 */
export const formatAmount = (value: number): string => {
  return 'Rp ' + roundAmount(value).toLocaleString('id-ID');
};
