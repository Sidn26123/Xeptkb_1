const Room = require('../models/Rooms');
const {SuccessResponse, ErrorResponse} = require('../utils/responseUtils');

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
exports.createRoom = async (req, res, next) => {
    try {
        // Accept client payload that uses the fields defined in the Room model
        const {
            code,
            name,
            type,
            capacity_max,
            capacity_optimal,
            floor_number,
            status,
            buildings_id,
            metadata,
        } = req.body;

        // buildings_id is required by the model (allowNull: false)
        const newRoom = await Room.create({
            code,
            name,
            type,
            capacity_max,
            capacity_optimal,
            floor_number,
            status,
            buildings_id,
            metadata,
        });

        res.status(201).json(new SuccessResponse(newRoom, 'Tạo phòng học thành công', 201));
    } catch (err) {
        console.error('[roomController.createRoom] error:', err);
        return next(err);
    }
};

// Cập nhật phòng học
exports.updateRoom = async (req, res, next) => {
    try {
        const {
            code,
            name,
            type,
            capacity_max,
            capacity_optimal,
            floor_number,
            status,
            buildings_id,
            metadata,
        } = req.body;

        const room = await Room.findByPk(req.params.id);
        if (!room) return res.status(404).json(new ErrorResponse('Không tìm thấy phòng học', 404));

        await room.update({
            code,
            name,
            type,
            capacity_max,
            capacity_optimal,
            floor_number,
            status,
            buildings_id,
            metadata,
        });

        res.status(200).json(new SuccessResponse(room, 'Cập nhật phòng học thành công'));
    } catch (err) {
        console.error('[roomController.updateRoom] error:', err);
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

exports.getAllRoomsWithEquipment = async (req, res) => {
    try {
        const rooms = await Room.findAll({
            include: ['equipments'] // Assuming 'equipments' is the alias defined in the Room model association
        });
        res.status(200).json(new SuccessResponse(rooms, 'Lấy danh sách phòng học với thiết bị thành công'));
    } catch (err) {
        res.status(500).json(new ErrorResponse(err.message, 500));

    }
}
