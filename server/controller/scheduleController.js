const Schedule = require('../models/Schedules');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');
const {getSchedulesFiltered} = require("../services/scheduleService");

// Lấy tất cả lịch học
exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.findAll();
    res.status(200).json(new SuccessResponse(schedules, 'Lấy danh sách lịch học thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Lấy lịch học theo id
exports.getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);
    if (!schedule) return res.status(404).json(new ErrorResponse('Không tìm thấy lịch học', 404));
    res.status(200).json(new SuccessResponse(schedule, 'Lấy thông tin lịch học thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Tạo lịch học mới
exports.createSchedule = async (req, res) => {
  try {
    const { course_class_id, room_id, time_slot_id, date } = req.body;
    const newSchedule = await Schedule.create({ course_class_id, room_id, time_slot_id, date });
    res.status(201).json(new SuccessResponse(newSchedule, 'Tạo lịch học thành công', 201));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Cập nhật lịch học
exports.updateSchedule = async (req, res) => {
  try {
    const { course_class_id, room_id, time_slot_id, date } = req.body;
    const schedule = await Schedule.findByPk(req.params.id);
    if (!schedule) return res.status(404).json(new ErrorResponse('Không tìm thấy lịch học', 404));
    await schedule.update({ course_class_id, room_id, time_slot_id, date });
    res.status(200).json(new SuccessResponse(schedule, 'Cập nhật lịch học thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Xóa lịch học
exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);
    if (!schedule) return res.status(404).json(new ErrorResponse('Không tìm thấy lịch học', 404));
    await schedule.destroy();
    res.status(200).json(new SuccessResponse(null, 'Xóa lịch học thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

exports.getSchedulesByFilter = async (req, res) => {
    try {
        const filters = req.body;
        const schedules = await getSchedulesFiltered(filters);
        res.status(200).json(new SuccessResponse(schedules, 'Lấy danh sách lịch học theo bộ lọc thành công'));

    } catch (err) {
        res.status(500).json(new ErrorResponse(err.message, 500));
    }
}