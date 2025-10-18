const Campus = require('../models/Campus');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');

// Lấy tất cả cơ sở
exports.getAllCampus = async (req, res) => {
  try {
    const campusList = await Campus.findAll();
    res.status(200).json(new SuccessResponse(campusList, 'Lấy danh sách cơ sở thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Lấy cơ sở theo id
exports.getCampusById = async (req, res) => {
  try {
    const campus = await Campus.findByPk(req.params.id);
    if (!campus) return res.status(404).json(new ErrorResponse('Không tìm thấy cơ sở', 404));
    res.status(200).json(new SuccessResponse(campus, 'Lấy thông tin cơ sở thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Tạo cơ sở mới
exports.createCampus = async (req, res) => {
  try {
    const { name, address } = req.body;
    const newCampus = await Campus.create({ name, address });
    res.status(201).json(new SuccessResponse(newCampus, 'Tạo cơ sở thành công', 201));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Cập nhật cơ sở
exports.updateCampus = async (req, res) => {
  try {
    const { name, address } = req.body;
    const campus = await Campus.findByPk(req.params.id);
    if (!campus) return res.status(404).json(new ErrorResponse('Không tìm thấy cơ sở', 404));
    await campus.update({ name, address });
    res.status(200).json(new SuccessResponse(campus, 'Cập nhật cơ sở thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Xóa cơ sở
exports.deleteCampus = async (req, res) => {
  try {
    const campus = await Campus.findByPk(req.params.id);
    if (!campus) return res.status(404).json(new ErrorResponse('Không tìm thấy cơ sở', 404));
    await campus.destroy();
    res.status(200).json(new SuccessResponse(null, 'Xóa cơ sở thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};