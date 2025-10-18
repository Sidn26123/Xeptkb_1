const SubjectRequiresEquipment = require('../models/SubjectRequiresEquipment');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');

// Lấy tất cả yêu cầu thiết bị cho môn học
exports.getAllSubjectRequiresEquipments = async (req, res) => {
  try {
    const items = await SubjectRequiresEquipment.findAll();
    res.status(200).json(new SuccessResponse(items, 'Lấy danh sách yêu cầu thiết bị cho môn học thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Lấy yêu cầu thiết bị theo id
exports.getSubjectRequiresEquipmentById = async (req, res) => {
  try {
    const item = await SubjectRequiresEquipment.findByPk(req.params.id);
    if (!item) return res.status(404).json(new ErrorResponse('Không tìm thấy yêu cầu thiết bị', 404));
    res.status(200).json(new SuccessResponse(item, 'Lấy thông tin yêu cầu thiết bị thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Tạo yêu cầu thiết bị mới
exports.createSubjectRequiresEquipment = async (req, res) => {
  try {
    const { subject_id, equipment_id, quantity } = req.body;
    const newItem = await SubjectRequiresEquipment.create({ subject_id, equipment_id, quantity });
    res.status(201).json(new SuccessResponse(newItem, 'Tạo yêu cầu thiết bị thành công', 201));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Cập nhật yêu cầu thiết bị
exports.updateSubjectRequiresEquipment = async (req, res) => {
  try {
    const { subject_id, equipment_id, quantity } = req.body;
    const item = await SubjectRequiresEquipment.findByPk(req.params.id);
    if (!item) return res.status(404).json(new ErrorResponse('Không tìm thấy yêu cầu thiết bị', 404));
    await item.update({ subject_id, equipment_id, quantity });
    res.status(200).json(new SuccessResponse(item, 'Cập nhật yêu cầu thiết bị thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Xóa yêu cầu thiết bị
exports.deleteSubjectRequiresEquipment = async (req, res) => {
  try {
    const item = await SubjectRequiresEquipment.findByPk(req.params.id);
    if (!item) return res.status(404).json(new ErrorResponse('Không tìm thấy yêu cầu thiết bị', 404));
    await item.destroy();
    res.status(200).json(new SuccessResponse(null, 'Xóa yêu cầu thiết bị thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};