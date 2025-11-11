const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');
const {getSchedulesFiltered, getSchedulingDataFromDB, saveScheduleToDB} = require("../services/scheduleService");
// controller/scheduleController.js
const { Schedule, CourseClass, Room, Day, TimeSlot, Teacher, Subject, Semester, Class } = require('../models');
const { addDays, setHours, setMinutes, startOfWeek } = require('date-fns');
const axios = require('axios');
const SCHEDULER_API_URL = 'http://localhost:5001/api/schedule';

/**
 * Gửi dữ liệu lập lịch đến dịch vụ lập lịch bên ngoài (ví dụ: Python Flask API).
 * * @param {object} inputData - Dữ liệu đầu vào cần thiết cho thuật toán GA (courses, teachers, rooms, config).
 * @returns {Promise<object>} JSON phản hồi từ API lập lịch.
 * @throws {Error} Nếu có lỗi kết nối hoặc API trả về lỗi (status code >= 400).
 */
async function callExternalScheduler(inputData) {
  console.log("Đang gọi API lập lịch với dữ liệu:");

  try {
    const response = await axios.post(SCHEDULER_API_URL, inputData, {
      headers: {
        'Content-Type': 'application/json'
      },
      // Tăng timeout nếu thuật toán GA mất nhiều thời gian
      timeout: 10000 // Ví dụ: 60 giây
    });
    console.log("Phản hồi từ API lập lịch:", response.data);
    // Axios tự động ném lỗi cho status code 4xx/5xx, nhưng kiểm tra lại để chắc chắn
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }

  } catch (error) {
    // Xử lý lỗi từ Axios/HTTP
    if (error.response) {
      // Lỗi phản hồi từ server (ví dụ: 400 Bad Request, 500 Internal Server Error)
      console.error("Lỗi API Scheduler:", error.response.data);
      throw new Error(`API Scheduler phản hồi lỗi: ${error.response.status} - ${error.response.data.error || JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      // Lỗi yêu cầu không nhận được phản hồi (ví dụ: timeout)
      console.error("Lỗi kết nối API Scheduler: Không nhận được phản hồi.");
      throw new Error("Lỗi kết nối: Dịch vụ lập lịch không phản hồi.");
    } else {
      // Lỗi khác (ví dụ: lỗi cấu hình yêu cầu)
      console.error("Lỗi khi gửi yêu cầu API Scheduler:", error.message);
      throw new Error(`Lỗi gửi yêu cầu: ${error.message}`);
    }
  }
}

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


exports.createScheduleWithDB = async (req, res) => {
  try {
    // 1. Lấy dữ liệu đã được định dạng từ DB
    const schedulingData = await getSchedulingDataFromDB();

    // 2. Gửi dữ liệu này đến API lập lịch
    const schedulerApiUrl = 'http://localhost:5001/api/schedule';

    // Sử dụng một thư viện HTTP client như axios hoặc node-fetch
    const response = await fetch(schedulerApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedulingData)
    });

    const scheduleResult = await response.json();

    // 3. Xử lý kết quả trả về (ví dụ: lưu vào DB hoặc trả về client)
    if (response.ok) {
      return res.status(200).json({
        message: "Schedule generated successfully.",
        schedule: scheduleResult
      });
    } else {
      return res.status(response.status).json({
        message: "Scheduler API failed to generate schedule.",
        details: scheduleResult
      });
    }

  } catch (error) {
    console.error('Error in creating schedule:', error);
    return res.status(500).json({ error: error.message });
  }
};

exports.createScheduleWithDB = async (req, res) => {
  try {
    // 1. Lấy dữ liệu cần thiết cho thuật toán GA (input)
    const schedulingInputData = await getSchedulingDataFromDB();

    // 2. Gửi dữ liệu input lên API lập lịch (External Service Call)
    const apiResponse = await callExternalScheduler(schedulingInputData);
    console.log("Phản hồi nhận được từ API lập lịch:", apiResponse);
    if (apiResponse) {

      // 3. Gọi hàm Service để lưu kết quả vào DB
      const semesterName = "Học kỳ 1, 2025-2026"; // Giả định
      const daysPerWeek = 7;
      const sessionsPerDay = 10;
      const sessionDuration = 45; // phút
      console.log("Lưu lịch trình vào DB với metadata:", {semesterName, daysPerWeek, sessionsPerDay, sessionDuration});

      const newGeneration = await saveScheduleToDB(
          apiResponse,
          semesterName,
          daysPerWeek,
          sessionsPerDay,
          sessionDuration
      );
      console.log("Lịch trình đã được lưu vào DB với ID:", newGeneration.id);
      return res.status(200).json({
        success: true,
        message: "Lịch trình đã được tạo và lưu thành công.",
        generationId: newGeneration.id
      });
    }

    // ... (Xử lý lỗi API không thành công)

  } catch (error) {
    console.error("Lỗi trong quá trình tạo lịch trình:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};