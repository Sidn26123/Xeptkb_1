const {SuccessResponse, ErrorResponse} = require('../utils/responseUtils');
const {getSchedulesFiltered, getSchedulingDataFromDB, saveScheduleToDB} = require("../services/scheduleService");
// controller/scheduleController.js
const {Schedule, CourseClass, Room, Day, TimeSlot, Teacher, Subject, Semester, Class} = require('../models');
const {addDays, setHours, setMinutes, startOfWeek} = require('date-fns');
const axios = require('axios');
const {
    saveScheduleToDatabase,
    getScheduleGeneration,
    getSchedulesBySemester
} = require("../services/scheduleInstanceService");
const SCHEDULER_API_URL = 'http://localhost:5001/api/schedule';
const ScheduleGeneration = require("../models/ScheduleGenerations");
const sequelize = require('../config/initSequelize');

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
        const {course_class_id, room_id, time_slot_id, date} = req.body;
        const newSchedule = await Schedule.create({course_class_id, room_id, time_slot_id, date});
        res.status(201).json(new SuccessResponse(newSchedule, 'Tạo lịch học thành công', 201));
    } catch (err) {
        res.status(500).json(new ErrorResponse(err.message, 500));
    }
};

// Cập nhật lịch học
exports.updateSchedule = async (req, res) => {
    try {
        const {course_class_id, room_id, time_slot_id, date} = req.body;
        const schedule = await Schedule.findByPk(req.params.id);
        if (!schedule) return res.status(404).json(new ErrorResponse('Không tìm thấy lịch học', 404));
        await schedule.update({course_class_id, room_id, time_slot_id, date});
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
                        {model: Teacher, as: 'teacher', attributes: ['name', 'name']},
                        {model: Subject, as: 'subject', attributes: ['name', 'code']},
                        {model: Semester, as: 'semester', attributes: ['name', 'code']},
                        {model: Class, as: 'class', attributes: ['name']}
                    ]
                },
                {model: Room, as: 'room', attributes: ['name', 'buildings_id']},
                {model: TimeSlot, as: 'timeSlot', attributes: ['start_hour', 'start_min', 'end_hour', 'end_min']},
                {model: Day, as: 'day', attributes: ['idx']} // thứ 2 = 0
            ]
        });


        // Lấy thứ 2 của tuần hiện tại
        const monday = startOfWeek(new Date(), {weekStartsOn: 1});

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
        res.status(500).json({success: false, message: "Server error"});
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
            headers: {'Content-Type': 'application/json'},
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
        return res.status(500).json({error: error.message});
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
            console.log("Lưu lịch trình vào DB với metadata:", {
                semesterName,
                daysPerWeek,
                sessionsPerDay,
                sessionDuration
            });

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
        return res.status(500).json({success: false, error: error.message});
    }
};

/**
 * Lưu schedule từ API response vào database
 * POST /api/schedules/save
 */
exports.saveSchedule = async (req, res) => {
    try {
        const apiResponse = req.body;
        console.log("Lưu schedule nhận được từ request body:", apiResponse);
        if (!apiResponse || !apiResponse.schedule) {
            console.log("Thiếu dữ liệu schedule trong request body.");
            return res.status(400).json(
                new ErrorResponse('Thiếu dữ liệu schedule', 400)
            );
        }
        const result = await saveScheduleToDatabase(apiResponse);
        res.status(201).json(
            new SuccessResponse(result, 'Lưu thời khóa biểu thành công', 201)
        );
    } catch (err) {
        console.error('Lỗi lưu schedule:', err);
        res.status(500).json(new ErrorResponse(err.message, 500));
    }
};

/**
 * Lấy thông tin một schedule generation
 * GET /api/schedules/generations/:id
 */
exports.getGenerationById = async (req, res) => {
    try {
        const generation = await getScheduleGeneration(req.params.id);

        if (!generation) {
            return res.status(404).json(
                new ErrorResponse('Không tìm thấy schedule generation', 404)
            );
        }

        res.status(200).json(
            new SuccessResponse(generation, 'Lấy thông tin generation thành công')
        );
    } catch (err) {
        console.error('Lỗi lấy generation:', err);
        res.status(500).json(new ErrorResponse(err.message, 500));
    }
};

/**
 * Lấy tất cả schedule generations của một học kỳ
 * GET /api/schedules/semesters/:semesterId/generations
 */
exports.getGenerationsBySemester = async (req, res) => {
    try {
        const generations = await getSchedulesBySemester(req.params.semesterId);

        res.status(200).json(
            new SuccessResponse(
                generations,
                'Lấy danh sách schedule generations thành công'
            )
        );
    } catch (err) {
        console.error('Lỗi lấy generations theo học kỳ:', err);
        res.status(500).json(new ErrorResponse(err.message, 500));
    }
};

/**
 * Lấy tất cả schedule generations
 * GET /api/schedules/generations
 */
exports.getAllGenerations = async (req, res) => {
    try {
        const generations = await ScheduleGeneration.findAll({
            include: [
                {
                    model: require('../models/Semesters'),
                    as: 'semesterInfo'
                }
            ],
            order: [['generated_at', 'DESC']]
        });

        res.status(200).json(
            new SuccessResponse(
                generations,
                'Lấy danh sách tất cả generations thành công'
            )
        );
    } catch (err) {
        console.error('Lỗi lấy tất cả generations:', err);
        res.status(500).json(new ErrorResponse(err.message, 500));
    }
};

/**
 * Xóa một schedule generation (và tất cả schedules, instances liên quan)
 * DELETE /api/schedules/generations/:id
 */
exports.deleteGeneration = async (req, res) => {
    try {
        const generation = await ScheduleGeneration.findByPk(req.params.id);

        if (!generation) {
            return res.status(404).json(
                new ErrorResponse('Không tìm thấy generation', 404)
            );
        }

        // Xóa tất cả schedules liên quan (cascade sẽ xóa instances)
        await Schedule.destroy({where: {generation_id: req.params.id}});

        // Xóa generation
        await generation.destroy();

        res.status(200).json(
            new SuccessResponse(null, 'Xóa generation thành công')
        );
    } catch (err) {
        console.error('Lỗi xóa generation:', err);
        res.status(500).json(new ErrorResponse(err.message, 500));
    }
};

/**
 * Lấy thống kê của một generation
 * GET /api/schedules/generations/:id/stats
 */
exports.getGenerationStats = async (req, res) => {
    try {
        const {id} = req.params;

        const generation = await ScheduleGeneration.findByPk(id, {
            include: [{
                model: Schedule,
                as: 'schedules',
                include: [
                    {model: require('../models/CourseClasses'), as: 'courseClass'},
                    {model: require('../models/Rooms'), as: 'room'},
                    {model: require('../models/Teachers'), as: 'teacher'}
                ]
            }]
        });

        if (!generation) {
            return res.status(404).json(
                new ErrorResponse('Không tìm thấy generation', 404)
            );
        }

        // Tính toán thống kê
        const schedules = generation.schedules || [];

        const stats = {
            generation_id: id,
            fitness_score: generation.fitness_score,
            penalty_breakdown: generation.penalty_breakdown,
            total_schedules: schedules.length,

            // Thống kê theo phòng
            rooms_used: [...new Set(schedules.map(s => s.room_id))].length,
            room_distribution: schedules.reduce((acc, s) => {
                acc[s.room_id] = (acc[s.room_id] || 0) + 1;
                return acc;
            }, {}),

            // Thống kê theo giáo viên
            teachers_count: [...new Set(schedules.map(s => s.teacher_id))].length,
            teacher_load: schedules.reduce((acc, s) => {
                acc[s.teacher_id] = (acc[s.teacher_id] || 0) + 1;
                return acc;
            }, {}),

            // Thống kê theo ngày
            day_distribution: schedules.reduce((acc, s) => {
                acc[s.day_id] = (acc[s.day_id] || 0) + 1;
                return acc;
            }, {}),

            // Metadata
            generated_at: generation.generated_at,
            semester: generation.semester,
            semester_id: generation.semester_id
        };

        res.status(200).json(
            new SuccessResponse(stats, 'Lấy thống kê generation thành công')
        );
    } catch (err) {
        console.error('Lỗi lấy thống kê generation:', err);
        res.status(500).json(new ErrorResponse(err.message, 500));
    }
};

/**
 * So sánh nhiều generations
 * POST /api/schedules/generations/compare
 * Body: { generationIds: [1, 2, 3] }
 */
exports.compareGenerations = async (req, res) => {
    try {
        const {generationIds} = req.body;

        if (!generationIds || !Array.isArray(generationIds) || generationIds.length === 0) {
            return res.status(400).json(
                new ErrorResponse('Thiếu danh sách generation IDs', 400)
            );
        }

        const generations = await ScheduleGeneration.findAll({
            where: {
                id: generationIds
            },
            include: [{
                model: Schedule,
                as: 'schedules'
            }]
        });

        if (generations.length === 0) {
            return res.status(404).json(
                new ErrorResponse('Không tìm thấy generations', 404)
            );
        }

        const comparison = generations.map(gen => ({
            id: gen.id,
            fitness_score: gen.fitness_score,
            penalty_breakdown: gen.penalty_breakdown,
            total_schedules: gen.schedules?.length || 0,
            generated_at: gen.generated_at,
            semester: gen.semester
        }));

        // Sắp xếp theo fitness score (cao nhất trước)
        comparison.sort((a, b) => b.fitness_score - a.fitness_score);

        res.status(200).json(
            new SuccessResponse(
                comparison,
                'So sánh generations thành công'
            )
        );
    } catch (err) {
        console.error('Lỗi so sánh generations:', err);
        res.status(500).json(new ErrorResponse(err.message, 500));
    }
};

/**
 * Export schedule generation ra JSON
 * GET /api/schedules/generations/:id/export
 */
exports.exportGeneration = async (req, res) => {
    try {
        const generation = await ScheduleGeneration.findByPk(req.params.id, {
            include: [{
                model: Schedule,
                as: 'schedules',
                include: [
                    {model: require('../models/CourseClasses'), as: 'courseClass'},
                    {model: require('../models/Rooms'), as: 'room'},
                    {model: require('../models/TimeSlot'), as: 'timeSlot'},
                    {model: require('../models/Days'), as: 'day'},
                    {model: require('../models/Teachers'), as: 'teacher'}
                ]
            }]
        });

        if (!generation) {
            return res.status(404).json(
                new ErrorResponse('Không tìm thấy generation', 404)
            );
        }

        // Format lại dữ liệu để export
        const exportData = {
            generation_info: {
                id: generation.id,
                semester: generation.semester,
                fitness_score: generation.fitness_score,
                penalty_breakdown: generation.penalty_breakdown,
                generated_at: generation.generated_at
            },
            schedules: generation.schedules.map(s => ({
                course_class: s.courseClass?.name,
                teacher: s.teacher?.name,
                room: s.room?.name,
                day: s.day?.name,
                time_slot: s.timeSlot?.name,
                periods: s.num_of_period
            }))
        };

        res.status(200).json(
            new SuccessResponse(exportData, 'Export generation thành công')
        );
    } catch (err) {
        console.error('Lỗi export generation:', err);
        res.status(500).json(new ErrorResponse(err.message, 500));
    }
};


exports.saveManualSchedule = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const {semester_id, semester, semester_config, schedules, generation_name} = req.body;

        console.log("Semester info:", semester);
        console.log("Semester config:", semester_config);
        if (!semester_id || !schedules || schedules.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Thiếu thông tin học kỳ hoặc danh sách lịch học."
            });
        }

        // Tạo Generation mới (Draft)
        const newGeneration = await ScheduleGeneration.create({
            semester_id: semester_id,
            name: generation_name || `Lịch xếp thủ công - ${new Date().toLocaleString('vi-VN')}`,
            status: 'draft',
            is_active: false,
            generated_at: new Date(),
            week_start: semester_config.start_week,
            week_end: semester_config.end_week,
            sessions_per_day: semester_config.sessions_per_day,
            session_duration: semester_config.session_duration,
            days_per_week: semester_config.days_per_week,
            total_weeks: semester_config.end_week - semester_config.start_week,
            fitness_score: 0,
            penalty_breakdown: {note: "Created manually via UI"}
        }, {transaction});
        // Chuẩn bị dữ liệu để Bulk Insert
        const scheduleData = schedules.map(item => ({
            generation_id: newGeneration.id,

            course_class_id: item.course_class_id,
            teacher_id: item.teacher_id,
            room_id: item.room_id,
            day_id: item.day_id,

            // LOGIC QUAN TRỌNG: Map start_period từ FE vào time_slot_id của DB
            // Giả định: item.start_period (1,2,3...) tương ứng với ID của TimeSlot trong DB
            time_slot_id: item.start_period,

            num_of_period: item.num_of_period,
            week_start: item.week_start,
            week_end: item.week_end,
            scheduler: 'manual_ui',
        }));

        await Schedule.bulkCreate(scheduleData, {transaction});
        await transaction.commit();

        return res.status(200).json({
            success: true,
            message: "Lưu lịch thủ công thành công!",
            data: {
                generation_id: newGeneration.id,
                total_schedules: scheduleData.length
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error("Error saving manual schedule:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lưu lịch.",
            error: error.message
        });
    }
};