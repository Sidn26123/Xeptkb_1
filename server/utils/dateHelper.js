/**
 * Date helper utilities for handling day/month string format (DD/MM)
 */

/**
 * Convert day/month string (e.g., "20/10", "1/1") to Date object with specified year
 * @param {string} dayMonthStr - String in format "D/M" or "DD/MM" (e.g., "20/10", "1/1")
 * @param {number} year - The year to use for the date (e.g., 2024, 2025)
 * @returns {Date|null} - Date object or null if invalid format
 * 
 * @example
 * convertDayMonthToDate("20/10", 2024) // Returns Date object for Oct 20, 2024
 * convertDayMonthToDate("1/1", 2025)   // Returns Date object for Jan 1, 2025
 */
const convertDayMonthToDate = (dayMonthStr, year) => {
  if (!dayMonthStr || typeof dayMonthStr !== 'string') {
    return null;
  }

  const parts = dayMonthStr.split('/');
  if (parts.length !== 2) {
    return null;
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);

  // Validate day and month ranges
  if (isNaN(day) || isNaN(month) || day < 1 || day > 31 || month < 1 || month > 12) {
    return null;
  }

  // Create date (month is 0-indexed in JavaScript Date)
  const date = new Date(year, month - 1, day);

  // Verify the date is valid (handles invalid dates like Feb 30)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
};

/**
 * Convert day/month string to Date object for current year
 * @param {string} dayMonthStr - String in format "D/M" or "DD/MM"
 * @returns {Date|null} - Date object with current year or null if invalid
 * 
 * @example
 * convertDayMonthToCurrentYear("20/10") // Returns Date for Oct 20 of current year
 */
const convertDayMonthToCurrentYear = (dayMonthStr) => {
  const currentYear = new Date().getFullYear();
  return convertDayMonthToDate(dayMonthStr, currentYear);
};

/**
 * Check if a date falls within a holiday range (start/end day/month) for a given year
 * @param {Date} date - The date to check
 * @param {string} dayStart - Start day/month string (e.g., "20/10")
 * @param {string} dayEnd - End day/month string (e.g., "25/10")
 * @returns {boolean} - True if date falls within the range
 * 
 * @example
 * const checkDate = new Date(2024, 9, 22); // Oct 22, 2024
 * isDateInHolidayRange(checkDate, "20/10", "25/10") // Returns true
 */
const isDateInHolidayRange = (date, dayStart, dayEnd) => {
  if (!(date instanceof Date) || !dayStart || !dayEnd) {
    return false;
  }

  const year = date.getFullYear();
  const startDate = convertDayMonthToDate(dayStart, year);
  const endDate = convertDayMonthToDate(dayEnd, year);

  if (!startDate || !endDate) {
    return false;
  }

  return date >= startDate && date <= endDate;
};

/**
 * Format Date object back to day/month string (DD/MM)
 * @param {Date} date - Date object to format
 * @returns {string|null} - String in format "DD/MM" or null if invalid
 * 
 * @example
 * formatDateToDayMonth(new Date(2024, 9, 20)) // Returns "20/10"
 */
const formatDateToDayMonth = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return null;
  }

  const day = date.getDate();
  const month = date.getMonth() + 1; // Month is 0-indexed

  return `${day}/${month}`;
};
/**
 * Thêm một số ngày vào một đối tượng Date.
 * @param {Date} date - Ngày bắt đầu.
 * @param {number} days - Số ngày cần thêm.
 * @returns {Date}
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Lấy ngày Thứ Hai của tuần chứa ngày được cung cấp.
 * @param {Date} date - Ngày bất kỳ trong tuần.
 * @returns {Date} - Ngày thứ Hai của tuần đó.
 */
function getStartOfWeek(date) {
  const d = new Date(date);
  // 0 = Chủ Nhật, 1 = Thứ Hai, ..., 6 = Thứ Bảy
  const day = d.getDay();
  // (day === 0 ? -6 : 1) -> logic để đảm bảo Thứ Hai là ngày đầu tuần
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  // Set về 0 giờ để đảm bảo tính toán chính xác
  monday.setHours(0, 0, 0, 0);
  return monday;
}
module.exports = {
  convertDayMonthToDate,
  convertDayMonthToCurrentYear,
  isDateInHolidayRange,
  formatDateToDayMonth,
  getStartOfWeek,
  addDays
};
