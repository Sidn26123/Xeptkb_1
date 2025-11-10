const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');
const {getSchedulesFiltered} = require("../services/scheduleService");
// controller/scheduleController.js
const { Schedule, CourseClass, Room, Day, TimeSlot, Teacher, Subject, Semester, Class } = require('../models');
const { addDays, setHours, setMinutes, startOfWeek } = require('date-fns');
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



exports.getFormattedSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.findAll({
      include: [
        {
          model: CourseClass,
          as: 'courseClass', // ✅ phải trùng 'as' trong belongsTo
          include: [
            { model: Teacher, as: 'teacher', attributes: ['name', 'name'] },
            { model: Subject, as: 'subject', attributes: ['name', 'code'] },
            { model: Semester, as: 'semester', attributes: ['name', 'code'] },
            { model: Class, as: 'class', attributes: ['name'] }
          ]
        },
        { model: Room, as: 'room', attributes: ['name', 'buildings_id'] },
        { model: TimeSlot, as: 'timeSlot', attributes: ['start_hour', 'start_min', 'end_hour', 'end_min'] },
        { model: Day, as: 'day', attributes: ['idx'] } // thứ 2 = 0
      ]
    });


    // Lấy thứ 2 của tuần hiện tại
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });

    const formatted = schedules.map(s => {
      const dayOffset = s.Day.idx; // 0 = Monday
      const start = setMinutes(
          setHours(
              addDays(monday, dayOffset),
              s.TimeSlot.start_hour
          ),
          s.TimeSlot.start_min
      );

      const end = setMinutes(
          setHours(
              addDays(monday, dayOffset),
              s.TimeSlot.end_hour
          ),
          s.TimeSlot.end_min
      );

      return {
        id: s.id,
        title: s.CourseClass.Subject.name,
        start,
        end,
        teacher: `${s.CourseClass.Teacher.title}. ${s.CourseClass.Teacher.name}`,
        room: `${s.Room.name} - ${s.Room.building}`,
        type: s.CourseClass.type ?? 'lecture',
        subject: s.CourseClass.Subject.code
      };
    });

    return res.json({
      success: true,
      message: "Formatted schedules",
      data: formatted
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
