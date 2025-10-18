const Equipment = require('../models/Equipments');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');

// Lấy tất cả thiết bị
exports.getAllEquipments = async (req, res) => {
  try {
    const equipments = await Equipment.findAll();
    res.status(200).json(new SuccessResponse(equipments, 'Lấy danh sách thiết bị thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Lấy thiết bị theo id
exports.getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findByPk(req.params.id);
    if (!equipment) return res.status(404).json(new ErrorResponse('Không tìm thấy thiết bị', 404));
    res.status(200).json(new SuccessResponse(equipment, 'Lấy thông tin thiết bị thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Tạo thiết bị mới
exports.createEquipment = async (req, res) => {
  try {
    const { name, description } = req.body;
    const newEquipment = await Equipment.create({ name, description });
    res.status(201).json(new SuccessResponse(newEquipment, 'Tạo thiết bị thành công', 201));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Cập nhật thiết bị
exports.updateEquipment = async (req, res) => {
  try {
    const { name, description } = req.body;
    const equipment = await Equipment.findByPk(req.params.id);
    if (!equipment) return res.status(404).json(new ErrorResponse('Không tìm thấy thiết bị', 404));
    await equipment.update({ name, description });
    res.status(200).json(new SuccessResponse(equipment, 'Cập nhật thiết bị thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Xóa thiết bị
exports.deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByPk(req.params.id);
    if (!equipment) return res.status(404).json(new ErrorResponse('Không tìm thấy thiết bị', 404));
    await equipment.destroy();
    res.status(200).json(new SuccessResponse(null, 'Xóa thiết bị thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};