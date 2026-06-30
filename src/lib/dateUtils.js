/**
 * dateUtils.js — Centralized date utilities for Portal SPG
 * Enforces a 5-day school week (Monday to Friday)
 */

export const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
export const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

/**
 * Returns the start (Monday) and end (Friday) of the week for a given date.
 */
export function getSchoolWeekRange(date) {
  const d = new Date(date);
  // In JS, 0 is Sunday, 1 is Monday... 6 is Saturday.
  // We want to treat Sunday as the end of the previous week (7) for math purposes
  const day = d.getDay() === 0 ? 7 : d.getDay(); 
  
  const start = new Date(d);
  start.setDate(d.getDate() - day + 1); // Monday
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 4); // Friday (Monday + 4 days)
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

/**
 * Formats a date to YYYY-MM-DD string for Firestore querying
 */
export function formatDate(d) { 
  // We use local date parts to avoid timezone issues pushing it to the previous day
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
