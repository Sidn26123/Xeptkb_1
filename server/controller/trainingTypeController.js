const TrainingType = require('../models/TrainingType');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');

// Lấy tất cả loại hình đào tạo
exports.getAllTrainingTypes = async (req, res) => {
  try {
    const types = await TrainingType.findAll();
    res.status(200).json(new SuccessResponse(types, 'Lấy danh sách loại hình đào tạo thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Lấy loại hình đào tạo theo id
exports.getTrainingTypeById = async (req, res) => {
  try {
    const type = await TrainingType.findByPk(req.params.id);
    if (!type) return res.status(404).json(new ErrorResponse('Không tìm thấy loại hình đào tạo', 404));
    res.status(200).json(new SuccessResponse(type, 'Lấy thông tin loại hình đào tạo thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Tạo loại hình đào tạo mới
exports.createTrainingType = async (req, res) => {
  try {
    const { code, name, description } = req.body;
    if (!code || !name) {
      return res.status(400).json(new ErrorResponse('Thiếu mã hoặc tên loại hình đào tạo', 400));
    }
    const exists = await TrainingType.findOne({ where: { code } });
    console.error('Lỗi tạo training type:', err);
    if (exists) return res.status(409).json(new ErrorResponse('Mã loại hình đào tạo đã tồn tại', 409));
    const newType = await TrainingType.create({ code, name, description });
    res.status(201).json(new SuccessResponse(newType, 'Tạo loại hình đào tạo thành công', 201));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Cập nhật loại hình đào tạo
exports.updateTrainingType = async (req, res) => {
  try {
    const { code, name, description } = req.body;
    const type = await TrainingType.findByPk(req.params.id);
    if (!type) return res.status(404).json(new ErrorResponse('Không tìm thấy loại hình đào tạo', 404));
    if (code && code !== type.code) {
      const exists = await TrainingType.findOne({ where: { code } });
      if (exists) return res.status(409).json(new ErrorResponse('Mã loại hình đào tạo đã tồn tại', 409));
    }
    await type.update({ code, name, description });
    res.status(200).json(new SuccessResponse(type, 'Cập nhật loại hình đào tạo thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Xóa loại hình đào tạo
exports.deleteTrainingType = async (req, res) => {
  try {
    const type = await TrainingType.findByPk(req.params.id);
    if (!type) return res.status(404).json(new ErrorResponse('Không tìm thấy loại hình đào tạo', 404));
    await type.destroy();
    res.status(200).json(new SuccessResponse(null, 'Xóa loại hình đào tạo thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};