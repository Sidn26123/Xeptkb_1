const Building = require('../models/Buildings');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');

// Lấy tất cả tòa nhà
exports.getAllBuildings = async (req, res) => {
  try {
    const buildings = await Building.findAll();
    res.status(200).json(new SuccessResponse(buildings, 'Lấy danh sách tòa nhà thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Lấy tòa nhà theo id
exports.getBuildingById = async (req, res) => {
  try {
    const building = await Building.findByPk(req.params.id);
    if (!building) return res.status(404).json(new ErrorResponse('Không tìm thấy tòa nhà', 404));
    res.status(200).json(new SuccessResponse(building, 'Lấy thông tin tòa nhà thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Tạo tòa nhà mới
exports.createBuilding = async (req, res) => {
  try {
    const { name, campus_id } = req.body;
    const newBuilding = await Building.create({ name, campus_id });
    res.status(201).json(new SuccessResponse(newBuilding, 'Tạo tòa nhà thành công', 201));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Cập nhật tòa nhà
exports.updateBuilding = async (req, res) => {
  try {
    const { name, campus_id } = req.body;
    const building = await Building.findByPk(req.params.id);
    if (!building) return res.status(404).json(new ErrorResponse('Không tìm thấy tòa nhà', 404));
    await building.update({ name, campus_id });
    res.status(200).json(new SuccessResponse(building, 'Cập nhật tòa nhà thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Xóa tòa nhà
exports.deleteBuilding = async (req, res) => {
  try {
    const building = await Building.findByPk(req.params.id);
    if (!building) return res.status(404).json(new ErrorResponse('Không tìm thấy tòa nhà', 404));
    await building.destroy();
    res.status(200).json(new SuccessResponse(null, 'Xóa tòa nhà thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};