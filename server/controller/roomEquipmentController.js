const RoomEquipment = require('../models/RoomEquipment');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');

// Lấy tất cả thiết bị phòng học
exports.getAllRoomEquipments = async (req, res) => {
  try {
    const roomEquipments = await RoomEquipment.findAll();
    res.status(200).json(new SuccessResponse(roomEquipments, 'Lấy danh sách thiết bị phòng học thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Lấy thiết bị phòng học theo id
exports.getRoomEquipmentById = async (req, res) => {
  try {
    const roomEquipment = await RoomEquipment.findByPk(req.params.id);
    if (!roomEquipment) return res.status(404).json(new ErrorResponse('Không tìm thấy thiết bị phòng học', 404));
    res.status(200).json(new SuccessResponse(roomEquipment, 'Lấy thông tin thiết bị phòng học thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Lấy danh sách thiết bị theo room_id
exports.getRoomEquipmentsByRoomId = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const roomEquipments = await RoomEquipment.findAll({ where: { room_id: roomId } });
    res.status(200).json(new SuccessResponse(roomEquipments, 'Lấy danh sách thiết bị của phòng thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Tạo thiết bị phòng học mới
exports.createRoomEquipment = async (req, res) => {
  try {
    const { room_id, equipment_id, quantity } = req.body;
    const newRoomEquipment = await RoomEquipment.create({ room_id, equipment_id, quantity });
    res.status(201).json(new SuccessResponse(newRoomEquipment, 'Tạo thiết bị phòng học thành công', 201));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Cập nhật thiết bị phòng học
exports.updateRoomEquipment = async (req, res) => {
  try {
    const { room_id, equipment_id, quantity } = req.body;
    const roomEquipment = await RoomEquipment.findByPk(req.params.id);
    if (!roomEquipment) return res.status(404).json(new ErrorResponse('Không tìm thấy thiết bị phòng học', 404));
    await roomEquipment.update({ room_id, equipment_id, quantity });
    res.status(200).json(new SuccessResponse(roomEquipment, 'Cập nhật thiết bị phòng học thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Xóa thiết bị phòng học
exports.deleteRoomEquipment = async (req, res) => {
  try {
    const roomEquipment = await RoomEquipment.findByPk(req.params.id);
    if (!roomEquipment) return res.status(404).json(new ErrorResponse('Không tìm thấy thiết bị phòng học', 404));
    await roomEquipment.destroy();
    res.status(200).json(new SuccessResponse(null, 'Xóa thiết bị phòng học thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};