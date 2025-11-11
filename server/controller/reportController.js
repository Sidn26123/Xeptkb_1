const reportService = require('../services/reportService');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');

exports.schedulesByDay = async (req, res) => {
    try {
        const data = await reportService.schedulesByDay(req.query);
        res.json(new SuccessResponse(data, "Thống kê lịch học theo ngày"));
    } catch (err) {
        res.status(500).json(new ErrorResponse(err.message));
    }
};

exports.schedulesByTimeSlot = async (req, res) => {
    try {
        const data = await reportService.schedulesByTimeSlot(req.query);
        res.json(new SuccessResponse(data, "Thống kê lịch học theo TimeSlot"));
    } catch (err) {
        res.status(500).json(new ErrorResponse(err.message));
    }
};

exports.instructorConflicts = async (req, res) => {
    try {
        const data = await reportService.instructorConflicts(req.query);
        res.json(new SuccessResponse(data, "Giảng viên trùng lịch"));
    } catch (err) {
        res.status(500).json(new ErrorResponse(err.message));
    }
};

exports.availableRooms = async (req, res) => {
    try {
        const { day_id, time_slot_id } = req.query;
        const data = await reportService.availableRooms(day_id, time_slot_id, req.query);
        res.json(new SuccessResponse(data, "Phòng trống"));
    } catch (err) {
        res.status(500).json(new ErrorResponse(err.message));
    }
};

exports.instructorLoad = async (req, res) => {
    try {
        const data = await reportService.instructorLoad(req.query);
        res.json(new SuccessResponse(data, "Tải giảng viên"));
    } catch (err) {
        res.status(500).json(new ErrorResponse(err.message));
    }
};

exports.emptySlotsByWeek = async (req, res) => {
    try {
        const { start, end } = req.query;
        const data = await reportService.emptyTimeSlotsByWeek(start, end, req.query);
        res.json(new SuccessResponse(data, "Thống kê slot rỗng theo tuần"));
    } catch (err) {
        res.status(500).json(new ErrorResponse(err.message));
    }
};
