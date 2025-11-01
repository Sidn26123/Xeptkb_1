const lunisolar = require('lunisolar');

/**
 * 🇻🇳 Chuyển ngày Âm sang Dương (theo múi giờ Việt Nam GMT+7)
 * @param {number} lunarYear - Năm âm lịch
 * @param {number} lunarMonth - Tháng âm lịch
 * @param {number} lunarDay - Ngày âm lịch
 * @param {boolean} isLeap - Có phải tháng nhuận không
 * @returns {Date} Ngày dương tương ứng (Date GMT+7)
 */
function convertLunarToSolar(lunarYear, lunarMonth, lunarDay, isLeap = false) {
  try {
    // lunisolar.fromLunar expects an object: { year, month, day, isLeapMonth }
    const lunarData = {
      year: lunarYear,
      month: lunarMonth,
      day: lunarDay,
      isLeapMonth: !!isLeap,
    };

    const ls = lunisolar.fromLunar
      ? lunisolar.fromLunar(lunarData)
      : lunisolar(lunarData);

    // Use format('YYYY-MM-DD') to get canonical date then build Vietnam-midnight Date
    const ymd = ls.format ? ls.format('YYYY-MM-DD') : null;
    if (!ymd) throw new Error('lunisolar.fromLunar did not return expected instance');
    const [y, m, d] = ymd.split('-').map(p => parseInt(p, 10));
    const solarDateVN = new Date(Date.UTC(y, m - 1, d) + 7 * 60 * 60 * 1000);
    return solarDateVN;
  } catch (error) {
    console.error(`[lunisolarUtils] Error converting lunar to solar: ${lunarYear}-${lunarMonth}-${lunarDay}, isLeap=${isLeap}`, error && error.stack ? error.stack : error);
    throw error;
  }
}

/**
 * 🇻🇳 Chuyển ngày Dương sang Âm (theo múi giờ Việt Nam GMT+7)
 * @param {Date} date - Ngày dương (đối tượng Date)
 * @returns {object} Thông tin ngày âm
 */
function convertSolarToLunar(date) {
  // Chuẩn hóa thời gian: convert Vietnam-midnight Date -> UTC Date for lunisolar
  const dateUTC = new Date(date.getTime() - 7 * 60 * 60 * 1000);
  const ls = lunisolar(dateUTC);
  const lunarObj = ls.lunar;

  return {
    year: lunarObj.year || lunarObj.lunarNewYearDay && new Date(lunarObj.lunarNewYearDay).getFullYear(),
    month: lunarObj.month,
    day: lunarObj.day,
    isLeap: !!lunarObj.isLeapMonth,
  };
}

module.exports = { convertLunarToSolar, convertSolarToLunar };
