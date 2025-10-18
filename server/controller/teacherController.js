const Teacher = require('../models/Teachers');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');

// Lấy tất cả giáo viên
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.findAll();
    res.status(200).json(new SuccessResponse(teachers, 'Lấy danh sách giáo viên thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Lấy giáo viên theo id
exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) return res.status(404).json(new ErrorResponse('Không tìm thấy giáo viên', 404));
    res.status(200).json(new SuccessResponse(teacher, 'Lấy thông tin giáo viên thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Tạo giáo viên mới
exports.createTeacher = async (req, res) => {
  try {
    const { name, faculty_id, email, phone } = req.body;
    const newTeacher = await Teacher.create({ name, faculty_id, email, phone });
    res.status(201).json(new SuccessResponse(newTeacher, 'Tạo giáo viên thành công', 201));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Cập nhật giáo viên
exports.updateTeacher = async (req, res) => {
  try {
    const { name, faculty_id, email, phone } = req.body;
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) return res.status(404).json(new ErrorResponse('Không tìm thấy giáo viên', 404));
    await teacher.update({ name, faculty_id, email, phone });
    res.status(200).json(new SuccessResponse(teacher, 'Cập nhật giáo viên thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Xóa giáo viên
exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) return res.status(404).json(new ErrorResponse('Không tìm thấy giáo viên', 404));
    await teacher.destroy();
    res.status(200).json(new SuccessResponse(null, 'Xóa giáo viên thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};