const Faculty = require('../models/Faculty');
const { SuccessResponse, ErrorResponse, ValidationResponse } = require('../utils/responseUtils');

// Lấy tất cả khoa
exports.getAllFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.findAll({ order: [['name', 'ASC']] });
    const payload = Array.isArray(faculties) ? faculties.map(f => (f && typeof f.toJSON === 'function') ? f.toJSON() : f) : [];
    res.status(200).json(new SuccessResponse(payload, 'Lấy danh sách khoa thành công'));
  } catch (err) {
    console.error('Lỗi lấy danh sách khoa:', err);
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Lấy khoa theo id
exports.getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findByPk(req.params.id);
    if (!faculty) return res.status(404).json(new ErrorResponse('Không tìm thấy khoa', 404));
    const payload = (faculty && typeof faculty.toJSON === 'function') ? faculty.toJSON() : faculty;
    res.status(200).json(new SuccessResponse(payload, 'Lấy thông tin khoa thành công'));
  } catch (err) {
    console.error('Lỗi lấy thông tin khoa:', err);
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Tạo khoa mới
exports.createFaculty = async (req, res) => {
  try {
    const { name, faculty_id } = req.body;
    const errors = {};
    if (!name || !name.trim()) errors.name = 'Tên khoa là bắt buộc';
    if (!faculty_id || !faculty_id.trim()) errors.faculty_id = 'Mã khoa là bắt buộc';
    if (Object.keys(errors).length) return res.status(400).json(new ValidationResponse(errors));

    const exists = await Faculty.findOne({ where: { faculty_id } });
    if (exists) return res.status(409).json(new ErrorResponse('Mã khoa đã tồn tại', 409));

    const faculty = await Faculty.create({ name: name.trim(), faculty_id: faculty_id.trim() });
    const payload = (faculty && typeof faculty.toJSON === 'function') ? faculty.toJSON() : faculty;
    res.status(201).json(new SuccessResponse(payload, 'Tạo khoa thành công', 201));
  } catch (err) {
    console.error('Lỗi tạo khoa:', err);
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Cập nhật khoa
exports.updateFaculty = async (req, res) => {
  try {
    const { name, faculty_id } = req.body;
    const faculty = await Faculty.findByPk(req.params.id);
    if (!faculty) return res.status(404).json(new ErrorResponse('Không tìm thấy khoa', 404));

    // if trying to change faculty_id, ensure uniqueness
    if (faculty_id && faculty_id !== faculty.faculty_id) {
      const exists = await Faculty.findOne({ where: { faculty_id } });
      if (exists) return res.status(409).json(new ErrorResponse('Mã khoa đã tồn tại', 409));
    }

    await faculty.update({
      name: name !== undefined ? name : faculty.name,
      faculty_id: faculty_id !== undefined ? faculty_id : faculty.faculty_id,
    });
    const payload = (faculty && typeof faculty.toJSON === 'function') ? faculty.toJSON() : faculty;
    res.status(200).json(new SuccessResponse(payload, 'Cập nhật khoa thành công'));
  } catch (err) {
    console.error('Lỗi cập nhật khoa:', err);
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
    console.error('Lỗi xóa khoa:', err);
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};
// (file intentionally contains single implementation below)