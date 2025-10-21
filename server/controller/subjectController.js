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
    const { name, training_type_id, code, theory_hours = 0, self_study_hours = 0, practice_hours = 0, requires_lab = false } = req.body;
    if (!name || !training_type_id || !code) {
      return res.status(400).json(new ValidationResponse([{ field: 'name/training_type_id/code', message: 'Các trường name, training_type_id và code là bắt buộc' }]));
    }
    const newSubject = await Subject.create({ name, training_type_id, code, theory_hours, self_study_hours, practice_hours, requires_lab });
    res.status(201).json(new SuccessResponse(newSubject, 'Tạo môn học thành công', 201));
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json(new ErrorResponse('code đã tồn tại', 409));
    }
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Cập nhật môn học
exports.updateSubject = async (req, res) => {
  try {
    const { name, training_type_id, code, theory_hours, self_study_hours, practice_hours, requires_lab } = req.body;
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) return res.status(404).json(new ErrorResponse('Không tìm thấy môn học', 404));
    await subject.update({
      name: name ?? subject.name,
      training_type_id: training_type_id ?? subject.training_type_id,
      code: code ?? subject.code,
      theory_hours: theory_hours ?? subject.theory_hours,
      self_study_hours: self_study_hours ?? subject.self_study_hours,
      practice_hours: practice_hours ?? subject.practice_hours,
      requires_lab: requires_lab ?? subject.requires_lab,
    });
    res.status(200).json(new SuccessResponse(subject, 'Cập nhật môn học thành công'));
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json(new ErrorResponse('code đã tồn tại', 409));
    }
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