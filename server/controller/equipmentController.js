const Equipment = require('../models/Equipments');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');
const {bulkImportEquipments} = require("../services/equipmentService");

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
    const { code, name, description, total } = req.body;
    // ensure code and name are provided (basic guard). Validator should normally handle this.
    const payload = { code, name, description };
    if (typeof total !== 'undefined') payload.total = total;
    const newEquipment = await Equipment.create(payload);
    res.status(201).json(new SuccessResponse(newEquipment, 'Tạo thiết bị thành công', 201));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Cập nhật thiết bị
exports.updateEquipment = async (req, res) => {
  try {
    const { code, name, description, total } = req.body;
    const equipment = await Equipment.findByPk(req.params.id);
    if (!equipment) return res.status(404).json(new ErrorResponse('Không tìm thấy thiết bị', 404));
    const update = { };
    if (typeof code !== 'undefined') update.code = code;
    if (typeof name !== 'undefined') update.name = name;
    if (typeof description !== 'undefined') update.description = description;
    if (typeof total !== 'undefined') update.total = total;
    await equipment.update(update);
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
// Import hàng loạt thiết bị
exports.bulkImportEquipments = async (req, res) => {
  try {
    const result = await bulkImportEquipments(req.body);

    if (result.error === 'EMPTY_DATA')
      return res.status(400).json(new ErrorResponse('Dữ liệu import trống', 400));

    if (result.error === 'NO_VALID_ITEM')
      return res.status(400).json(new ErrorResponse('Không có dữ liệu hợp lệ để import', 400));

    if (result.error === 'VALIDATION_ERROR')
      return res.status(422).json({
        error: 'Dữ liệu import có lỗi, vui lòng kiểm tra lại file',
        errors: result.errors
      });

    return res.status(201).json(
        new SuccessResponse(result.data, `Đã import thành công ${result.data.length} thiết bị`)
    );

  } catch (err) {
    console.log(err);
    return res.status(500).json(new ErrorResponse('Lỗi Server: ' + err.message, 500));
  }
};