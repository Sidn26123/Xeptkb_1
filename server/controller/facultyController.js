const Faculty = require('../models/Faculty');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');

// Lấy tất cả khoa
exports.getAllFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.findAll();
    res.status(200).json(new SuccessResponse(faculties, 'Lấy danh sách khoa thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Lấy khoa theo id
exports.getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findByPk(req.params.id);
    if (!faculty) return res.status(404).json(new ErrorResponse('Không tìm thấy khoa', 404));
    res.status(200).json(new SuccessResponse(faculty, 'Lấy thông tin khoa thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Tạo khoa mới
exports.createFaculty = async (req, res) => {
  try {
    const { name, description } = req.body;
    const newFaculty = await Faculty.create({ name, description });
    res.status(201).json(new SuccessResponse(newFaculty, 'Tạo khoa thành công', 201));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Cập nhật khoa
exports.updateFaculty = async (req, res) => {
  try {
    const { name, description } = req.body;
    const faculty = await Faculty.findByPk(req.params.id);
    if (!faculty) return res.status(404).json(new ErrorResponse('Không tìm thấy khoa', 404));
    await faculty.update({ name, description });
    res.status(200).json(new SuccessResponse(faculty, 'Cập nhật khoa thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Xóa khoa
exports.deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findByPk(req.params.id);
    if (!faculty) return res.status(404).json(new ErrorResponse('Không tìm thấy khoa', 404));
    await faculty.destroy();
    res.status(200).json(new SuccessResponse(null, 'Xóa khoa thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};