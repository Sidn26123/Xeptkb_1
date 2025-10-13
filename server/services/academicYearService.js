const AcademicYear = require('../models/AcademicYears');

/**
 * Tìm năm học theo mã
 */
async function getAcademicYearByCode(year_code) {
  return await AcademicYear.findOne({ where: { year_code } });
}

/**
 * Lấy tất cả năm học
 */
async function getAllAcademicYears() {
  return await AcademicYear.findAll();
}

/**
 * Tạo mới năm học
 */
async function createAcademicYear(data) {
  return await AcademicYear.create(data);
}

module.exports = {
  getAcademicYearByCode,
  getAllAcademicYears,
  createAcademicYear,
};