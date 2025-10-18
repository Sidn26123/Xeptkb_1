const Student = require('../models/Students');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');

// Lấy tất cả sinh viên
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.findAll();
    res.status(200).json(new SuccessResponse(students, 'Lấy danh sách sinh viên thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Lấy sinh viên theo id
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json(new ErrorResponse('Không tìm thấy sinh viên', 404));
    res.status(200).json(new SuccessResponse(student, 'Lấy thông tin sinh viên thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Tạo sinh viên mới
exports.createStudent = async (req, res) => {
  try {
    const { name, class_id, email, phone } = req.body;
    const newStudent = await Student.create({ name, class_id, email, phone });
    res.status(201).json(new SuccessResponse(newStudent, 'Tạo sinh viên thành công', 201));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Cập nhật sinh viên
exports.updateStudent = async (req, res) => {
  try {
    const { name, class_id, email, phone } = req.body;
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json(new ErrorResponse('Không tìm thấy sinh viên', 404));
    await student.update({ name, class_id, email, phone });
    res.status(200).json(new SuccessResponse(student, 'Cập nhật sinh viên thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Xóa sinh viên
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json(new ErrorResponse('Không tìm thấy sinh viên', 404));
    await student.destroy();
    res.status(200).json(new SuccessResponse(null, 'Xóa sinh viên thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};