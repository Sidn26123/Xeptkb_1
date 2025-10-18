const Teaching = require('../models/Teachings');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');

// Lấy tất cả phân công giảng dạy
exports.getAllTeachings = async (req, res) => {
  try {
    const teachings = await Teaching.findAll();
    res.status(200).json(new SuccessResponse(teachings, 'Lấy danh sách phân công giảng dạy thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Lấy phân công giảng dạy theo id
exports.getTeachingById = async (req, res) => {
  try {
    const teaching = await Teaching.findByPk(req.params.id);
    if (!teaching) return res.status(404).json(new ErrorResponse('Không tìm thấy phân công giảng dạy', 404));
    res.status(200).json(new SuccessResponse(teaching, 'Lấy thông tin phân công giảng dạy thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Tạo phân công giảng dạy mới
exports.createTeaching = async (req, res) => {
  try {
    const { teacher_id, course_class_id, semester_id } = req.body;
    const newTeaching = await Teaching.create({ teacher_id, course_class_id, semester_id });
    res.status(201).json(new SuccessResponse(newTeaching, 'Tạo phân công giảng dạy thành công', 201));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Cập nhật phân công giảng dạy
exports.updateTeaching = async (req, res) => {
  try {
    const { teacher_id, course_class_id, semester_id } = req.body;
    const teaching = await Teaching.findByPk(req.params.id);
    if (!teaching) return res.status(404).json(new ErrorResponse('Không tìm thấy phân công giảng dạy', 404));
    await teaching.update({ teacher_id, course_class_id, semester_id });
    res.status(200).json(new SuccessResponse(teaching, 'Cập nhật phân công giảng dạy thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Xóa phân công giảng dạy
exports.deleteTeaching = async (req, res) => {
  try {
    const teaching = await Teaching.findByPk(req.params.id);
    if (!teaching) return res.status(404).json(new ErrorResponse('Không tìm thấy phân công giảng dạy', 404));
    await teaching.destroy();
    res.status(200).json(new SuccessResponse(null, 'Xóa phân công giảng dạy thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};