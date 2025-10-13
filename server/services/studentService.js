const Student = require('../models/Students');

/**
 * Tìm sinh viên theo mã định danh
 */
async function getStudentByIdentifier(student_identifier) {
  return await Student.findOne({ where: { student_identifier } });
}

/**
 * Lấy tất cả sinh viên
 */
async function getAllStudents() {
  return await Student.findAll();
}

/**
 * Tạo mới sinh viên
 */
async function createStudent(data) {
  return await Student.create(data);
}

module.exports = {
  getStudentByIdentifier,
  getAllStudents,
  createStudent,
};