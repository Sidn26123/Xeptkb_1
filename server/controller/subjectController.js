const Subject = require('../models/Subjects');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');

// Lấy tất cả môn học
exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.findAll();
    res.status(200).json(new SuccessResponse(subjects, 'Lấy danh sách môn học thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Lấy môn học theo id
exports.getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) return res.status(404).json(new ErrorResponse('Không tìm thấy môn học', 404));
    res.status(200).json(new SuccessResponse(subject, 'Lấy thông tin môn học thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Tạo môn học mới
exports.createSubject = async (req, res) => {
  try {
    const { name, code, faculty_id, description } = req.body;
    const newSubject = await Subject.create({ name, code, faculty_id, description });
    res.status(201).json(new SuccessResponse(newSubject, 'Tạo môn học thành công', 201));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Cập nhật môn học
exports.updateSubject = async (req, res) => {
  try {
    const { name, code, faculty_id, description } = req.body;
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) return res.status(404).json(new ErrorResponse('Không tìm thấy môn học', 404));
    await subject.update({ name, code, faculty_id, description });
    res.status(200).json(new SuccessResponse(subject, 'Cập nhật môn học thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Xóa môn học
exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) return res.status(404).json(new ErrorResponse('Không tìm thấy môn học', 404));
    await subject.destroy();
    res.status(200).json(new SuccessResponse(null, 'Xóa môn học thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};