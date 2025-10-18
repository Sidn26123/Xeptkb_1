const Room = require('../models/Rooms');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');

// Lấy tất cả phòng học
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll();
    res.status(200).json(new SuccessResponse(rooms, 'Lấy danh sách phòng học thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Lấy phòng học theo id
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json(new ErrorResponse('Không tìm thấy phòng học', 404));
    res.status(200).json(new SuccessResponse(room, 'Lấy thông tin phòng học thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Tạo phòng học mới
exports.createRoom = async (req, res) => {
  try {
    const { name, building_id, capacity, type } = req.body;
    const newRoom = await Room.create({ name, building_id, capacity, type });
    res.status(201).json(new SuccessResponse(newRoom, 'Tạo phòng học thành công', 201));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Cập nhật phòng học
exports.updateRoom = async (req, res) => {
  try {
    const { name, building_id, capacity, type } = req.body;
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json(new ErrorResponse('Không tìm thấy phòng học', 404));
    await room.update({ name, building_id, capacity, type });
    res.status(200).json(new SuccessResponse(room, 'Cập nhật phòng học thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Xóa phòng học
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json(new ErrorResponse('Không tìm thấy phòng học', 404));
    await room.destroy();
    res.status(200).json(new SuccessResponse(null, 'Xóa phòng học thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};