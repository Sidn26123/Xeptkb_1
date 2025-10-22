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
    const { name, class_id, student_identifier } = req.body;
    if (!name || !class_id || !student_identifier) {
      return res.status(400).json(new ValidationResponse([{ field: 'name/class_id/student_identifier', message: 'Các trường name, class_id và student_identifier là bắt buộc' }]));
    }
    const newStudent = await Student.create({ name, class_id, student_identifier });
    res.status(201).json(new SuccessResponse(newStudent, 'Tạo sinh viên thành công', 201));
  } catch (err) {
    // handle unique constraint
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json(new ErrorResponse('student_identifier đã tồn tại', 409));
    }
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Cập nhật sinh viên
exports.updateStudent = async (req, res) => {
  try {
    const { name, class_id, student_identifier } = req.body;
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json(new ErrorResponse('Không tìm thấy sinh viên', 404));
    await student.update({ name: name ?? student.name, class_id: class_id ?? student.class_id, student_identifier: student_identifier ?? student.student_identifier });
    res.status(200).json(new SuccessResponse(student, 'Cập nhật sinh viên thành công'));
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json(new ErrorResponse('student_identifier đã tồn tại', 409));
    }
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