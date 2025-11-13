// // const { Op } = require('sequelize');
// // const { addDays, addWeeks, setDay } = require('date-fns'); // Thư viện xử lý ngày
// // const { ScheduleGeneration, Schedule, ScheduleInstance, Semester, sequelize } = require('../models'); // Giả sử bạn đã import
// //
// // /**
// //  * Tính toán ngày cụ thể dựa trên ngày bắt đầu học kỳ, số tuần và ngày trong tuần.
// //  * @param {Date} semesterStartDate - Ngày bắt đầu của học kỳ (ví dụ: 20/10/2025).
// //  * @param {number} weekIndex - Tuần muốn tính (ví dụ: tuần 1, 2, 3...).
// //  * @param {number} dayOfWeek - Ngày trong tuần (ví dụ: 2=Thứ 2, 3=Thứ 3... LƯU Ý: date-fns 1=T2, 2=T3).
// //  */
// // function calculateDate(semesterStartDate, weekIndex, dayOfWeek) {
// //     // date-fns: 0=Chủ Nhật, 1=Thứ 2, ..., 6=Thứ 7
// //     // Giả sử: day_id của bạn (từ 2 đến 7)
// //     // Cần 1 map nhỏ:
// //     const dayMap = {
// //         2: 1, // Thứ 2 (DB) -> 1 (date-fns)
// //         3: 2, // Thứ 3 (DB) -> 2 (date-fns)
// //         4: 3, // Thứ 4 (DB) -> 3 (date-fns)
// //         5: 4, // Thứ 5 (DB) -> 4 (date-fns)
// //         6: 5, // Thứ 6 (DB) -> 5 (date-fns)
// //         7: 6, // Thứ 7 (DB) -> 6 (date-fns)
// //         8: 0  // Giả sử 8 là Chủ Nhật (DB) -> 0 (date-fns)
// //     };
// //
// //     const targetDay = dayMap[dayOfWeek];
// //     if (targetDay === undefined) {
// //         throw new Error(`Invalid day_id: ${dayOfWeek}`);
// //     }
// //
// //     // 1. Lấy ngày đầu tiên của tuần (tuần 1)
// //     // setDay sẽ tự động nhảy đến ngày `targetDay` (ví dụ T2) của tuần chứa `semesterStartDate`
// //     const firstTargetDay = setDay(semesterStartDate, targetDay, { weekStartsOn: 1 }); // Giả sử tuần bắt đầu từ Thứ 2 (1)
// //
// //     // 2. Thêm số tuần (trừ đi 1 vì tuần 1 đã được tính)
// //     // addWeeks sẽ thêm (weekIndex - 1) * 7 ngày
// //     const targetDate = addWeeks(firstTargetDay, weekIndex - 1);
// //
// //     // 3. Trả về định dạng YYYY-MM-DD
// //     return targetDate.toISOString().split('T')[0];
// // }
// //
// // // --- Thêm các model cần thiết ở đầu file ---
// // const { Op } = require("sequelize");
// // const sequelize = require('../config/initSequelize'); // Import sequelize instance
// // const ScheduleGeneration = require('../models/ScheduleGeneration');
// // const Schedule = require('../models/Schedule');
// // const ScheduleInstance = require('../models/ScheduleInstance');
// // const Semester = require('../models/Semester'); // <-- BẮT BUỘC
// //
// // // --- Thêm hàm helper (nếu cần) để lấy ISO day (Thứ 2=1, CN=7) ---
// // // (Date.getDay() trả về 0 cho CN, nên ta cần chuẩn hóa)
// // function getISODay(date) {
// //     const day = date.getDay();
// //     return day === 0 ? 7 : day; // 0 (Sun) -> 7
// // }
// //
// //
// // /**
// //  * Hàm lưu TKB (pattern) VÀ sinh tất cả các buổi học (instances)
// //  * @param {Object} req.body - JSON từ Python service
// //  */
// // exports.saveGeneratedSchedule1 = async (req, res) => {
// //     // 1. Khởi tạo Transaction
// //     const t = await sequelize.transaction();
// //
// //     try {
// //         // --- CẤU HÌNH BẮT BUỘC: ÁNH XẠ `day_id` sang ISO Weekday ---
// //         // Bạn PHẢI CẬP NHẬT map này cho đúng với CSDL của bạn.
// //         // Format: [day_id_trong_CSDL, ISO_day_of_week]
// //         // (ISO Weekday: 1 = Thứ Hai, 2 = Thứ Ba, ..., 7 = Chủ Nhật)
// //         //
// //         // Ví dụ: Nếu bảng 'days' của bạn có:
// //         // id: 2, name: "Thứ Hai" -> [2, 1]
// //         // id: 3, name: "Thứ Ba"  -> [3, 2]
// //         // id: 7, name: "Thứ Bảy" -> [7, 6]
// //         // id: 8, name: "Chủ Nhật" -> [8, 7]
// //         //
// //         // Dựa trên JSON mẫu (day: 2, 6, 7), tôi giả định:
// //         const dayIsoMap = new Map([
// //             [2, 1], // Giả định: day_id 2 = Thứ Hai (ISO 1)
// //             [3, 2], // Giả định: day_id 3 = Thứ Ba (ISO 2)
// //             [4, 3], // Giả định: day_id 4 = Thứ Tư (ISO 3)
// //             [5, 4], // Giả định: day_id 5 = Thứ Năm (ISO 4)
// //             [6, 5], // Giả định: day_id 6 = Thứ Sáu (ISO 5)
// //             [7, 6], // Giả định: day_id 7 = Thứ Bảy (ISO 6)
// //             [8, 7], // Giả định: day_id 8 = Chủ Nhật (ISO 7) <-- Hoặc [1, 7] nếu ID 1 là CN
// //         ]);
// //         // --- KẾT THÚC CẤU HÌNH ---
// //
// //
// //         const rawRequestData = req.body;
// //         const scheduleData = req.body.schedule;
// //
// //         if (!scheduleData) {
// //             await t.rollback();
// //             return res.status(400).json({ message: "Missing 'schedule' key in request body." });
// //         }
// //
// //         console.log("📌 Input scheduleData:", JSON.stringify(scheduleData, null, 2));
// //
// //         // --- BẮT BUỘC: Lấy thông tin HỌC KỲ ---
// //         const semester = await Semester.findByPk(scheduleData.semester.semesterId, { transaction: t });
// //         if (!semester || !semester.start_date) {
// //             await t.rollback();
// //             return res.status(404).json({ message: `Semester with ID ${scheduleData.semester.semesterId} not found or has no 'start_date'.` });
// //         }
// //         const semesterStartDate = new Date(semester.start_date);
// //         // --- KẾT THÚC LẤY DỮ LIỆU HỌC KỲ ---
// //
// //         // 2. Tạo record tổng quan (ScheduleGeneration)
// //         const generation = await ScheduleGeneration.create({
// //             semester_id: scheduleData.semester.semesterId,
// //             total_weeks: scheduleData.semester.end_week,
// //             days_per_week: scheduleData.semester.daysPerWeek,
// //             sessions_per_day: scheduleData.semester.sessionsPerDay,
// //             session_duration: scheduleData.semester.sessionDuration,
// //             fitness_score: scheduleData.fitness,
// //             penalty_breakdown: scheduleData.penalty_breakdown,
// //             raw_json: rawRequestData,
// //         }, { transaction: t });
// //
// //
// //         // 3. Chuẩn bị dữ liệu cho Schedule (mẫu TKB)
// //         const schedulePatternsToCreate = [];
// //         const courseWeekMap = new Map(scheduleData.courses.map(c => [
// //             c.class_id,
// //             { start_week: c.start_week, end_week: c.end_week }
// //         ]));
// //
// //         for (const course of scheduleData.courses) {
// //             for (const slot of course.weekly_slots) {
// //                 // Kiểm tra xem day_id có trong map thủ công không
// //                 if (!dayIsoMap.has(slot.day)) {
// //                     await t.rollback();
// //                     return res.status(400).json({ message: `Invalid day_id: ${slot.day}. Not found in your hardcoded 'dayIsoMap'.` });
// //                 }
// //
// //                 schedulePatternsToCreate.push({
// //                     course_class_id: course.class_id,
// //                     teacher_id: course.teacher_id,
// //                     day_id: slot.day, // <-- Dùng ID (ví dụ: 2) từ JSON
// //                     time_slot_id: slot.period,
// //                     room_id: course.room_id,
// //                     num_of_period: slot.duration,
// //                     scheduler: "system",
// //                     generation_id: generation.id,
// //                 });
// //             }
// //         }
// //
// //         // 3.1. Bulk Create Schedule (mẫu TKB)
// //         const createdSchedules = await Schedule.bulkCreate(schedulePatternsToCreate, {
// //             transaction: t,
// //             returning: true
// //         });
// //
// //
// //         // 4. Sinh ScheduleInstance (buổi học cụ thể)
// //         const instancesToCreate = [];
// //
// //         for (const schedulePattern of createdSchedules) {
// //             const courseWeeks = courseWeekMap.get(schedulePattern.course_class_id);
// //             // Lấy ngày ISO từ map thủ công
// //             const scheduleDayOfWeekISO = dayIsoMap.get(schedulePattern.day_id); // (ví dụ: 1 cho Thứ Hai)
// //
// //             // Tính ngày đầu tiên của môn học
// //             const firstWeekStartDate = new Date(semesterStartDate);
// //             const dayOffset = (scheduleDayOfWeekISO - getISODay(firstWeekStartDate) + 7) % 7;
// //             const firstInstanceDate = new Date(firstWeekStartDate);
// //             firstInstanceDate.setDate(firstWeekStartDate.getDate() + dayOffset);
// //
// //             // Lặp qua các tuần mà môn học này diễn ra
// //             for (let week = courseWeeks.start_week; week <= courseWeeks.end_week; week++) {
// //                 const instanceDate = new Date(firstInstanceDate);
// //                 instanceDate.setDate(firstInstanceDate.getDate() + (week - 1) * 7);
// //
// //                 instancesToCreate.push({
// //                     schedule_id: schedulePattern.id,
// //                     date: instanceDate.toISOString().split('T')[0], // Format YYYY-MM-DD
// //                     time_slot_id: null,
// //                     room_id: null,
// //                     teacher_id: null,
// //                     status: 'scheduled',
// //                     origin: 'auto',
// //                 });
// //             }
// //         }
// //
// //         // 4.1. Bulk Create ScheduleInstance (buổi học cụ thể)
// //         await ScheduleInstance.bulkCreate(instancesToCreate, { transaction: t });
// //
// //         // 5. Commit Transaction
// //         await t.commit();
// //
// //         console.log(`✅ Saved schedule pattern (${createdSchedules.length} records) and generated ${instancesToCreate.length} instances successfully.`);
// //         return res.status(201).json({
// //             message: "Schedule pattern and all instances saved successfully",
// //             generation_id: generation.id,
// //             patterns_created: createdSchedules.length,
// //             instances_created: instancesToCreate.length,
// //             data: generation
// //         });
// //
// //     } catch (error) {
// //         // 6. Rollback Transaction
// //         await t.rollback();
// //
// //         console.error("❌ Error saving schedule and instances:", error);
// //
// //         if (error.name === 'SequelizeValidationError') {
// //             return res.status(400).json({
// //                 message: "Validation error",
// //                 errors: error.errors.map(e => e.message)
// //             });
// //         }
// //
// //         return res.status(500).json({
// //             message: "Failed to save generated schedule and instances",
// //             error: error.message || error
// //         });
// //     }
// // };
// //
// //
// // module.exports = {
// //     calculateDate
// // }
//
// const ScheduleGeneration = require('../models');
// const Schedule = require('../models');
// const sequelize = require('../config/initSequelize');
//
// /**
//  * Lưu schedule từ API response vào database
//  * @param {Object} apiResponse - Response từ API generate schedule
//  * @returns {Promise<Object>} - Trả về generation record đã tạo
//  */
// async function saveScheduleToDatabase(apiResponse) {
//     const transaction = await sequelize.transaction();
//
//     try {
//         const { schedule } = apiResponse;
//         const {
//             courses,
//             fitness,
//             generations,
//             penalty_breakdown,
//             schedule_summary,
//             semester
//         } = schedule;
//
//         // 1. Tạo record ScheduleGeneration
//         const scheduleGeneration = await ScheduleGeneration.create({
//             semester: semester.semesterName,
//             semester_id: semester.semesterId,
//             total_weeks: semester.end_week - semester.start_week + 1,
//             days_per_week: semester.daysPerWeek,
//             sessions_per_day: semester.sessionsPerDay,
//             session_duration: semester.sessionDuration,
//             generated_at: new Date(),
//             fitness_score: fitness,
//             penalty_breakdown: penalty_breakdown,
//             raw_json: schedule, // Lưu toàn bộ JSON để trace
//         }, { transaction });
//
//         // 2. Tạo các records Schedule từ courses
//         const scheduleRecords = [];
//
//         for (const course of courses) {
//             // Mỗi course có thể có nhiều weekly_slots
//             for (const slot of course.weekly_slots) {
//                 const scheduleRecord = {
//                     course_class_id: course.class_id,
//                     teacher_id: course.teacher_id,
//                     day_id: slot.day,
//                     room_id: course.room_id,
//                     time_slot_id: slot.period,
//                     num_of_period: slot.duration,
//                     generation_id: scheduleGeneration.id,
//                     scheduler: 'genetic_algorithm', // hoặc thông tin khác
//                 };
//
//                 scheduleRecords.push(scheduleRecord);
//             }
//         }
//
//         // Bulk insert các Schedule records
//         await Schedule.bulkCreate(scheduleRecords, { transaction });
//
//         // Commit transaction
//         await transaction.commit();
//
//         return {
//             success: true,
//             generation_id: scheduleGeneration.id,
//             total_schedules: scheduleRecords.length,
//             fitness_score: fitness,
//             message: 'Schedule saved successfully'
//         };
//
//     } catch (error) {
//         // Rollback nếu có lỗi
//         await transaction.rollback();
//
//         console.error('Error saving schedule to database:', error);
//         throw {
//             success: false,
//             error: error.message,
//             message: 'Failed to save schedule to database'
//         };
//     }
// }
//
// /**
//  * Lấy schedule generation với các schedules liên quan
//  * @param {number} generationId
//  * @returns {Promise<Object>}
//  */
// async function getScheduleGeneration(generationId) {
//     try {
//         const generation = await ScheduleGeneration.findByPk(generationId, {
//             include: [{
//                 model: Schedule,
//                 as: 'schedules',
//                 include: [
//                     { model: require('../models/CourseClasses'), as: 'courseClass' },
//                     { model: require('../models/Days'), as: 'day' },
//                     { model: require('../models/Rooms'), as: 'room' },
//                     { model: require('../models/TimeSlot'), as: 'timeSlot' }
//                 ]
//             }]
//         });
//
//         return generation;
//     } catch (error) {
//         console.error('Error fetching schedule generation:', error);
//         throw error;
//     }
// }
//
// /**
//  * Lấy tất cả schedule generations của một học kỳ
//  * @param {number} semesterId
//  * @returns {Promise<Array>}
//  */
// async function getSchedulesBySemester(semesterId) {
//     try {
//         const generations = await ScheduleGeneration.findAll({
//             where: { semester_id: semesterId },
//             include: [{
//                 model: Schedule,
//                 as: 'schedules'
//             }],
//             order: [['generated_at', 'DESC']]
//         });
//
//         return generations;
//     } catch (error) {
//         console.error('Error fetching schedules by semester:', error);
//         throw error;
//     }
// }
//
// // Export functions
// module.exports = {
//     saveScheduleToDatabase,
//     getScheduleGeneration,
//     getSchedulesBySemester
// };

const { Op, QueryTypes } = require('sequelize');
const Schedule = require('../models/Schedules');
const CourseClass = require('../models/CourseClasses');
const Semester = require('../models/Semesters');
const HolidayActual = require('../models/HolidayActual');
const InstructorUnavailableTime = require('../models/InstructorUnavailableTime');
const TimeSlot = require('../models/TimeSlot');
const ScheduleGeneration = require('../models/ScheduleGenerations');
const ScheduleInstance = require('../models/ScheduleInstances');
const Day = require('../models/Days');
const Room = require('../models/Rooms');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');
const sequelize = require('../config/initSequelize');
const {getStartOfWeek} = require("../utils/dateHelper");
const {setMinutes, setHours, addMinutes} = require("date-fns");
// Helper: convert Date (YYYY-MM-DD) string to Date object (local)
function parseDate(dateStr) {
    return new Date(dateStr + 'T00:00:00');
}

function formatDate(d) {
    return d.toISOString().slice(0, 10);
}

function addDays(date, days) {
    const r = new Date(date);
    r.setDate(r.getDate() + days);
    return r;
}

function isoWeekday(date) {
    // ISO weekday: Monday=1 .. Sunday=7
    const jsDay = date.getDay(); // 0 (Sun) .. 6 (Sat)
    return jsDay === 0 ? 7 : jsDay;
}

// Check if a date is within any holidayactual ranges
function isHoliday(dateStr, holidays) {
    for (const h of holidays) {
        if (dateStr >= h.start_date && dateStr <= h.end_date) return true;
    }
    return false;
}

// POST /api/schedule-instances/generate
exports.generateInstances = async (req, res) => {
    try {
        const { semester_id, start, end, persist = false, scheduler = 'auto-gen' } = req.body;

        let rangeStart, rangeEnd;
        if (semester_id) {
            const sem = await Semester.findByPk(semester_id);
            if (!sem) return res.status(404).json(new ErrorResponse('Không tìm thấy semester', 404));
            rangeStart = sem.start;
            rangeEnd = sem.end;
        } else if (start && end) {
            rangeStart = start;
            rangeEnd = end;
        } else {
            return res.status(400).json(new ErrorResponse('Cần truyền semester_id hoặc start và end', 400));
        }

        // load holidays for semester if semester_id provided (else none)
        let holidays = [];
        if (semester_id) {
            holidays = await HolidayActual.findAll({ where: { semester_id } });
            // map to plain ranges
            holidays = holidays.map(h => ({ start_date: h.start_date, end_date: h.end_date }));
        }

        // load all courseclasses in semester (if semester_id) or all courseclasses
        let courseClassWhere = {};
        if (semester_id) courseClassWhere.semester_id = semester_id;
        const courseClasses = await CourseClass.findAll({ where: courseClassWhere });
        const courseClassMap = {};
        courseClasses.forEach(cc => { courseClassMap[cc.id] = cc; });
        const courseClassIds = courseClasses.map(cc => cc.id);

        // load schedules for these courseclasses
        const scheduleWhere = {};
        if (courseClassIds.length > 0) scheduleWhere.course_class_id = { [Op.in]: courseClassIds };
        const schedules = await Schedule.findAll({ where: scheduleWhere });

        // load instructor unavailable times for quick check
        const unavailable = await InstructorUnavailableTime.findAll();
        const unavailableSet = new Set();
        unavailable.forEach(u => {
            unavailableSet.add(`${u.teacher_id}::${u.day_id}::${u.time_slot_id}`);
        });

        // load timeslot idx map
        const timeslots = await TimeSlot.findAll();
        const tsIdx = {};
        timeslots.forEach(t => { tsIdx[t.id] = t.idx; });

        // generate instances in memory
        const instances = [];
        const sDate = parseDate(rangeStart);
        const eDate = parseDate(rangeEnd);

        for (const sched of schedules) {
            const cc = courseClassMap[sched.course_class_id];
            if (!cc) continue; // safety

            // determine teacher_id from courseclass if present
            const teacherId = cc.teacher_id || null;

            // start from first date >= sDate with weekday = sched.day_id
            let current = new Date(sDate);
            // advance until matches weekday
            const targetDay = sched.day_id; // assume 1=Mon..7=Sun
            while (isoWeekday(current) !== targetDay) {
                current = addDays(current, 1);
                if (current > eDate) break;
            }
            while (current <= eDate) {
                const dateStr = formatDate(current);
                // skip holidays
                if (!isHoliday(dateStr, holidays)) {
                    // check instructor unavailable
                    let status = 'scheduled';
                    if (teacherId && sched.time_slot_id && unavailableSet.has(`${teacherId}::${sched.day_id}::${sched.time_slot_id}`)) {
                        status = 'skipped';
                    }

                    instances.push({
                        schedule_id: sched.id,
                        course_class_id: sched.course_class_id,
                        date: dateStr,
                        day_id: sched.day_id,
                        time_slot_id: sched.time_slot_id,
                        time_slot_idx: tsIdx[sched.time_slot_id] || null,
                        num_of_period: sched.num_of_period || 1,
                        room_id: null,
                        teacher_id: teacherId,
                        status,
                        origin: 'auto',
                        scheduler,
                        metadata: null,
                    });
                }
                current = addDays(current, 7);
            }
        }

        if (persist && instances.length > 0) {
            // bulk insert (do not create duplicates naively) -- simple approach: insert all
            const created = await ScheduleInstance.bulkCreate(instances, { ignoreDuplicates: true });
            return res.status(201).json(new SuccessResponse(created, `Tạo ${created.length} schedule instances`, 201));
        }

        // return generated instances (not persisted)
        res.status(200).json(new SuccessResponse(instances, `Sinh được ${instances.length} schedule instances (preview)`));

    } catch (err) {
        console.error(err);
        res.status(500).json(new ErrorResponse(err.message, 500));
    }
};

// GET /api/v1/schedule-instances
exports.getInstances = async (req, res) => {
    try {
        const {
            start,
            end,
            class_id,
            course_class_id,
            teacher_id,
            room_id,
            status,
            page = 1,
            pageSize = 50,
        } = req.query;

        const where = ['1=1'];
        const replacements = {};

        if (start && end) {
            where.push('si.date BETWEEN :start AND :end');
            replacements.start = start;
            replacements.end = end;
        } else if (start) {
            where.push('si.date >= :start');
            replacements.start = start;
        } else if (end) {
            where.push('si.date <= :end');
            replacements.end = end;
        }

        if (course_class_id) {
            where.push('si.course_class_id = :course_class_id');
            replacements.course_class_id = course_class_id;
        }

        if (class_id) {
            where.push('cc.class_id = :class_id');
            replacements.class_id = class_id;
        }

        if (teacher_id) {
            where.push('si.teacher_id = :teacher_id');
            replacements.teacher_id = teacher_id;
        }

        if (room_id) {
            where.push('si.room_id = :room_id');
            replacements.room_id = room_id;
        }

        if (status) {
            where.push('si.status = :status');
            replacements.status = status;
        }

        const offset = (Math.max(parseInt(page, 10), 1) - 1) * parseInt(pageSize, 10);
        const limit = parseInt(pageSize, 10);

        const baseJoin = `
      FROM schedule_instances si
      LEFT JOIN timeslots ts ON si.time_slot_id = ts.id
      LEFT JOIN courseclasses cc ON si.course_class_id = cc.id
      LEFT JOIN subjects s ON cc.subject_id = s.id
      LEFT JOIN classes c ON cc.class_id = c.id
      LEFT JOIN teachers t ON si.teacher_id = t.id
      LEFT JOIN rooms r ON si.room_id = r.id
    `;

        const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

        const countQuery = `SELECT COUNT(DISTINCT si.id) as count ${baseJoin} ${whereClause}`;
        const countResult = await Schedule.sequelize.query(countQuery, {
            replacements,
            type: QueryTypes.SELECT,
        });
        const total = countResult && countResult[0] ? countResult[0].count : 0;

        const dataQuery = `
      SELECT si.*,
             ts.name as time_slot_name,
             ts.idx as time_slot_idx,
             cc.name as course_class_name,
             s.name as subject_name,
             c.name as class_name,
             t.name as teacher_name,
             r.code as room_code
      ${baseJoin}
      ${whereClause}
      ORDER BY si.date ASC, ts.idx ASC, si.id ASC
      LIMIT :limit OFFSET :offset
    `;

        replacements.limit = limit;
        replacements.offset = offset;

        const rows = await Schedule.sequelize.query(dataQuery, {
            replacements,
            type: QueryTypes.SELECT,
        });

        return res.status(200).json({
            success: true,
            data: rows,
            pagination: { total, page: parseInt(page, 10), pageSize: limit },
        });
    } catch (error) {
        console.error('getInstances error', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const dayMap = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
};

/**
 * Hàm lưu JSON kết quả vào database
 * @param {Object} resultJson - JSON như bạn gửi ở trên
 */
exports.saveGeneratedSchedule = async (req, res) => {
    try {
        // 1. Tạo record tổng quan
        //log resultJson
        const resultJson = JSON.stringify(req.body, null, 2);
        console.log("📌 Input resultJson:", resultJson.semester);
        const generation = await ScheduleGeneration.create({
            semester: resultJson.semester,
            total_weeks: resultJson.semester.total_weeks,
            days_per_week: resultJson.semester.days_per_week,
            sessions_per_day: resultJson.semester.sessions_per_day,
            session_duration: resultJson.semester.session_duration,

            generated_at: resultJson.generated_at,
            fitness_score: resultJson.fitness_score,
            penalty_breakdown: resultJson.penalty_breakdown,

            // lưu toàn bộ json để trace lại khi cần
            raw_json: resultJson,
        });

        // 2. Lưu từng slot của từng course
        for (const course of resultJson.courses) {
            for (const slot of course.time_slots) {
                await Schedule.create({
                    course_class_id: course.class_id,
                    day_id: dayMap[slot.day],
                    time_slot_id: slot.session_number,
                    room_id: course.room_id,
                    num_of_period: 1,
                    scheduler: "system",
                    generation_id: generation.id,
                });
            }
        }

        console.log("✅ Saved schedule successfully");
        return res.status(201).json({
            message: "Schedule saved successfully",
            generation_id: generation.id,
            data: generation
        });

    } catch (error) {
        console.error("❌ Error saving schedule:", error);

        return res.status(500).json({
            message: "Failed to save generated schedule",
            error: error.message || error
        });
    }
};


/**
 * Lưu schedule từ API response vào database
 * @param {Object} apiResponse - Response từ API generate schedule
 * @returns {Promise<Object>} - Trả về generation record đã tạo
 */
async function saveScheduleToDatabase(apiResponse) {
    const transaction = await sequelize.transaction();

    try {
        const { schedule } = apiResponse;
        const {
            courses,
            fitness,
            generations,
            penalty_breakdown,
            schedule_summary,
            semester
        } = schedule;

        // 1. Tạo record ScheduleGeneration
        const scheduleGeneration = await ScheduleGeneration.create({
            semester: semester.semesterName,
            semester_id: semester.semester_id,
            total_weeks: semester.end_week - semester.start_week + 1,
            days_per_week: semester.days_per_week,
            sessions_per_day: semester.sessions_per_day,
            session_duration: semester.session_duration,
            generated_at: new Date(),
            week_start: semester.start_week,
            week_end: semester.end_week,
            fitness_score: fitness,
            penalty_breakdown: penalty_breakdown,
            raw_json: schedule, // Lưu toàn bộ JSON để trace
        }, { transaction });

        // 2. Tạo các records Schedule từ courses
        const scheduleRecords = [];

        for (const course of courses) {
            // Mỗi course có thể có nhiều weekly_slots
            for (const slot of course.weekly_slots) {
                const scheduleRecord = {
                    course_class_id: course.class_id,
                    teacher_id: course.teacher_id,
                    day_id: slot.day,
                    room_id: course.room_id,
                    time_slot_id: slot.period,
                    num_of_period: slot.duration,
                    generation_id: scheduleGeneration.id,
                    week_start: course.start_week,
                    week_end: course.end_week,
                    scheduler: 'genetic_algorithm', // hoặc thông tin khác
                };

                scheduleRecords.push(scheduleRecord);
            }
        }

        // Bulk insert các Schedule records
        await Schedule.bulkCreate(scheduleRecords, { transaction });

        // Commit transaction
        await transaction.commit();

        return {
            success: true,
            generation_id: scheduleGeneration.id,
            total_schedules: scheduleRecords.length,
            fitness_score: fitness,
            message: 'Schedule saved successfully'
        };

    } catch (error) {
        // Rollback nếu có lỗi
        await transaction.rollback();

        console.error('Error saving schedule to database:', error);
        throw {
            success: false,
            error: error.message,
            message: 'Failed to save schedule to database'
        };
    }
}

/**
 * Lấy schedule generation với các schedules liên quan
 * @param {number} generationId
 * @returns {Promise<Object>}
 */
async function getScheduleGeneration(generationId) {
    try {
        const generation = await ScheduleGeneration.findByPk(generationId, {
            include: [{
                model: Schedule,
                as: 'schedules',
                include: [
                    { model: CourseClass, as: 'courseClass' },
                    { model: Day, as: 'day' },
                    { model: Room, as: 'room' },
                    { model: TimeSlot, as: 'timeSlot' }
                ]
            }]
        });

        return generation;
    } catch (error) {
        console.error('Error fetching schedule generation:', error);
        throw error;
    }
}

/**
 * Lấy tất cả schedule generations của một học kỳ
 * @param {number} semesterId
 * @returns {Promise<Array>}
 */
async function getSchedulesBySemester(semesterId) {
    try {
        const generations = await ScheduleGeneration.findAll({
            where: { semester_id: semesterId },
            include: [{
                model: Schedule,
                as: 'schedules'
            }],
            order: [['generated_at', 'DESC']]
        });

        return generations;
    } catch (error) {
        console.error('Error fetching schedules by semester:', error);
        throw error;
    }
}

// /**
//  * Tạo schedule instances từ schedule pattern
//  * @param {number} scheduleId - ID của schedule pattern
//  * @param {Date} startDate - Ngày bắt đầu (thường là ngày đầu học kỳ)
//  * @param {Date} endDate - Ngày kết thúc
//  * @returns {Promise<Array>} - Danh sách instances đã tạo
//  */
// async function generateScheduleInstances(scheduleId, startDate, endDate) {
//     const transaction = await sequelize.transaction();
//
//     try {
//         // Lấy schedule pattern
//         const schedule = await Schedule.findByPk(scheduleId, {
//             include: [
//                 { model: Day, as: 'day' },
//                 { model: ScheduleGeneration, as: 'generation' }
//             ]
//         });
//
//         if (!schedule) {
//             throw new Error('Schedule not found');
//         }
//
//         const instances = [];
//         const start = new Date(startDate);
//         const end = new Date(endDate);
//         //CAL total week
//         console.log(`Generating instances for schedule ID ${scheduleId} from ${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`);
//         // Lặp qua từng tuần từ startDate đến endDate
//         for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
//             // Kiểm tra xem ngày này có trùng với day_id của schedule không
//             const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ...
//
//             // Chuyển đổi: nếu day_id của bạn là 1=Monday, 2=Tuesday...
//             // thì cần map với dayOfWeek
//             const mappedDayId = dayOfWeek === 0 ? 7 : dayOfWeek; // 7 = Sunday nếu bạn dùng 1-7
//             console.log(`Checking date ${date.toISOString().split('T')[0]} (dayOfWeek=${dayOfWeek}, mappedDayId=${mappedDayId}) against schedule.day_id=${schedule.day_id}`);
//             if (mappedDayId === schedule.day_id) {
//                 instances.push({
//                     schedule_id: scheduleId,
//                     date: date.toISOString().split('T')[0], // YYYY-MM-DD
//                     time_slot_id: null, // Sử dụng giá trị từ pattern
//                     room_id: null,      // Sử dụng giá trị từ pattern
//                     teacher_id: null,   // Sử dụng giá trị từ pattern
//                     status: 'scheduled',
//                     origin: 'auto',
//                     metadata: {
//                         generated_from: 'pattern',
//                         generation_id: schedule.generation_id
//                     }
//                 });
//             }
//         }
//
//         // Bulk insert các instances
//         const createdInstances = await ScheduleInstance.bulkCreate(instances, {
//             transaction,
//             ignoreDuplicates: true // Bỏ qua nếu đã tồn tại
//         });
//
//         await transaction.commit();
//
//         return {
//             success: true,
//             total_instances: createdInstances.length,
//             instances: createdInstances
//         };
//
//     } catch (error) {
//         await transaction.rollback();
//         console.error('Error generating schedule instances:', error);
//         throw error;
//     }
// }


/**
 * Tạo schedule instances từ schedule pattern, tự động tính toán ranh giới.
 * @param {number} scheduleId - ID của schedule pattern.
 * @param {string | Date | null} [filterStartDate] - (Tùy chọn) Chỉ tạo instance SAU ngày này.
 * @param {string | Date | null} [filterEndDate] - (Tùy chọn) Chỉ tạo instance TRƯỚC ngày này.
 */
async function generateScheduleInstances(scheduleId, filterStartDate = null, filterEndDate = null) {
    const transaction = await sequelize.transaction();

    try {
        // 1. Lấy dữ liệu (Đã thêm include cho Semester)
        // Đảm bảo các model Day, ScheduleGeneration, Semester đã được import và associate
        const schedule = await Schedule.findByPk(scheduleId, {
            include: [
                { model: Day, as: 'day' },
                {
                    model: ScheduleGeneration,
                    as: 'generation',
                    include: [{
                        model: Semester,
                        as: 'semesterInfo'
                    }]
                }
            ],
            transaction
        });

        if (!schedule || !schedule.generation || !schedule.generation.semesterInfo) {
            await transaction.rollback();
            throw new Error('Không tìm thấy dữ liệu Schedule, Generation, hoặc Semester.');
        }

        const { generation } = schedule;
        const { semesterInfo } = generation;

        // --- 2. Tính toán ranh giới "Thế giới thực" ---

        // Ngày bắt đầu của học kỳ
        const semesterStartDate = new Date(semesterInfo.start);
        semesterStartDate.setHours(0, 0, 0, 0); // Chuẩn hóa

        // Ngày kết thúc của học kỳ
        const semesterEndDate = new Date(semesterInfo.end);
        semesterEndDate.setHours(23, 59, 59, 999); // Chuẩn hóa

        // Tính tổng số tuần offset so với đầu học kỳ
        // (week_start - 1) vì tuần 1 nghĩa là 0 offset
        const totalStartOffsetWeeks = (generation.week_start - 1) + (schedule.week_start - 1);
        const totalEndOffsetWeeks = (generation.week_start - 1) + (schedule.week_end - 1);

        // Ngày bắt đầu (lý thuyết) của schedule này (là Thứ Hai của tuần đó)
        const calculatedStartDate = addDays(semesterStartDate, totalStartOffsetWeeks * 7);

        // Ngày kết thúc (lý thuyết) của schedule này (là Chủ Nhật của tuần đó)
        const calculatedEndDate = addDays(semesterStartDate, (totalEndOffsetWeeks * 7) + 6);
        calculatedEndDate.setHours(23, 59, 59, 999); // Set về cuối ngày

        // --- 3. Áp dụng tham số lọc (nếu có) ---

        const paramStartDate = filterStartDate ? new Date(filterStartDate) : new Date('1970-01-01');
        const paramEndDate = filterEndDate ? new Date(filterEndDate) : new Date('9999-12-31');

        // Ngày bắt đầu hiệu lực: là ngày *muộn nhất* trong các mốc
        const effectiveStartDate = new Date(Math.max(
            paramStartDate.getTime(),
            semesterStartDate.getTime(),
            calculatedStartDate.getTime()
        ));

        // Ngày kết thúc hiệu lực: là ngày *sớm nhất* trong các mốc
        const effectiveEndDate = new Date(Math.min(
            paramEndDate.getTime(),
            semesterEndDate.getTime(),
            calculatedEndDate.getTime()
        ));

        // --- 4. Vòng lặp TỐI ƯU (Theo tuần) ---
        const instances = [];

        // Giả định: day_id 1=Thứ Hai, 2=Thứ Ba, ..., 7=Chủ Nhật.
        // Offset so với ngày Thứ Hai (ngày đầu tuần)
        const dayOffset = schedule.day_id - 1;

        if (dayOffset < 0 || dayOffset > 6) {
            throw new Error(`day_id không hợp lệ: ${schedule.day_id}. Phải từ 1 đến 7.`);
        }

        // Lấy ngày Thứ Hai của tuần bắt đầu
        let currentWeekStart = getStartOfWeek(effectiveStartDate);
        console.log({
            semesterStart: semesterInfo.start,
            semesterEnd: semesterInfo.end,
            filterStartDate,
            filterEndDate,
            calculatedStartDate,
            calculatedEndDate,
            effectiveStartDate,
            effectiveEndDate,
        });
        console.log(`Generating instances for schedule ID ${scheduleId}`);
        console.log(`Effective Range: ${effectiveStartDate.toISOString().split('T')[0]} to ${effectiveEndDate.toISOString().split('T')[0]}`);

        while (currentWeekStart <= effectiveEndDate) {
            // Tính ngày "thế giới thực" cho instance này
            const instanceDate = addDays(currentWeekStart, dayOffset);

            // Chỉ tạo instance nếu ngày đó nằm trong phạm vi hiệu lực
            // (ví dụ: ngày bắt đầu hiệu lực là Thứ 4, thì Thứ 2, 3 tuần đó sẽ bị bỏ qua)
            if (instanceDate >= effectiveStartDate && instanceDate <= effectiveEndDate) {

                // Sử dụng cấu trúc object của bạn
                instances.push({
                    schedule_id: scheduleId,
                    date: instanceDate.toISOString().split('T')[0], // YYYY-MM-DD

                    // Lấy dữ liệu từ pattern, thay vì null
                    time_slot_id: schedule.time_slot_id,
                    room_id: schedule.room_id,
                    teacher_id: schedule.teacher_id,

                    status: 'scheduled',
                    origin: 'auto',
                    metadata: {
                        generated_from: 'pattern',
                        generation_id: schedule.generation_id
                    }
                });
            }

            // Chuyển sang tuần tiếp theo
            currentWeekStart = addDays(currentWeekStart, 7);
        }

        // --- 5. Bulk insert ---
        console.log(`Attempting to create ${instances.length} instances.`);
        if (instances.length === 0) {
            await transaction.commit(); // Vẫn commit dù không tạo gì
            return {
                success: true,
                total_instances: 0,
                message: "No instances needed to be generated for the given range.",
                instances: []
            };
        }

        const createdInstances = await ScheduleInstance.bulkCreate(instances, {
            transaction,
            ignoreDuplicates: true // Giữ lại logic này, rất tốt!
        });

        await transaction.commit();

        return {
            success: true,
            total_instances: createdInstances.length,
            instances: createdInstances
        };

    } catch (error) {
        await transaction.rollback();
        console.error('Error generating schedule instances:', error);
        throw error;
    }
}

/**
 * Tạo tất cả instances cho một generation
 * @param {number} generationId
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Promise<Object>}
 */
async function generateAllInstancesForGeneration(generationId, startDate, endDate) {
    try {
        // Lấy tất cả schedules của generation
        const schedules = await Schedule.findAll({
            where: { generation_id: generationId }
        });

        let totalInstances = 0;

        for (const schedule of schedules) {
            const result = await generateScheduleInstances(schedule.id, startDate, endDate);
            totalInstances += result.total_instances;
        }

        return {
            success: true,
            generation_id: generationId,
            total_schedules: schedules.length,
            total_instances: totalInstances,
            message: 'All instances generated successfully'
        };

    } catch (error) {
        console.error('Error generating all instances:', error);
        throw error;
    }
}

/**
 * Lấy schedule instances theo date range
 * @param {number} scheduleId
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Promise<Array>}
 */
async function getScheduleInstances(scheduleId, startDate, endDate) {
    try {
        const { Op } = require('sequelize');

        const instances = await ScheduleInstance.findAll({
            where: {
                schedule_id: scheduleId,
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: [{
                model: Schedule,
                as: 'schedule',
                include: [
                    { model: CourseClass, as: 'courseClass' },
                    { model: Room, as: 'room' },
                    { model: TimeSlot, as: 'timeSlot' }
                ]
            }],
            order: [['date', 'ASC']]
        });

        return instances;
    } catch (error) {
        console.error('Error fetching schedule instances:', error);
        throw error;
    }
}

/**
 * Cập nhật một instance cụ thể (override)
 * @param {number} instanceId
 * @param {Object} updates - { room_id, teacher_id, time_slot_id, status, cancel_reason }
 * @returns {Promise<Object>}
 */
async function updateScheduleInstance(instanceId, updates) {
    try {

        const instance = await ScheduleInstance.findByPk(instanceId);
        if (!instance) {
            throw new Error('Instance not found');
        }

        await instance.update(updates);

        return {
            success: true,
            instance: instance,
            message: 'Instance updated successfully'
        };

    } catch (error) {
        console.error('Error updating schedule instance:', error);
        throw error;
    }
}

/**
 * Hủy một buổi học
 * @param {number} instanceId
 * @param {string} reason
 * @returns {Promise<Object>}
 */
async function cancelScheduleInstance(instanceId, reason) {
    return await updateScheduleInstance(instanceId, {
        status: 'cancelled',
        cancel_reason: reason
    });
}

/**
 * Đổi lịch một buổi học sang ngày khác
 * @param {number} instanceId
 * @param {Date} newDate
 * @param {Object} overrides - { room_id, teacher_id, time_slot_id }
 * @returns {Promise<Object>}
 */
async function rescheduleInstance(instanceId, newDate, overrides = {}) {
    const transaction = await sequelize.transaction();

    try {

        // Lấy instance gốc
        const originalInstance = await ScheduleInstance.findByPk(instanceId);
        if (!originalInstance) {
            throw new Error('Instance not found');
        }

        // Tạo instance mới
        const newInstance = await ScheduleInstance.create({
            schedule_id: originalInstance.schedule_id,
            date: newDate,
            time_slot_id: overrides.time_slot_id || null,
            room_id: overrides.room_id || null,
            teacher_id: overrides.teacher_id || null,
            status: 'scheduled',
            origin: 'manual',
            metadata: {
                rescheduled_from: instanceId,
                original_date: originalInstance.date
            }
        }, { transaction });

        // Cập nhật instance cũ
        await originalInstance.update({
            status: 'rescheduled',
            replaced_by_instance_id: newInstance.id
        }, { transaction });

        await transaction.commit();

        return {
            success: true,
            original_instance: originalInstance,
            new_instance: newInstance,
            message: 'Instance rescheduled successfully'
        };

    } catch (error) {
        await transaction.rollback();
        console.error('Error rescheduling instance:', error);
        throw error;
    }
}
function transformInstancesToEvents(instances) {
    if (!instances || instances.length === 0) {
        return [];
    }

    return instances.map(instance => {
        // --- Lấy dữ liệu đã eager-load ---
        const schedule = instance.schedule;
        const courseClass = schedule?.courseClass;
        const subject = courseClass?.subject;
        const teacher = instance.teacher; // Từ FK trên ScheduleInstance
        const room = instance.room;       // Từ FK trên ScheduleInstance

        // --- Tính toán Start/End ---
        // Logic này được lấy TỪ file StudentSchedule.jsx của bạn
        // (logic tính toán trong hàm convertSchedulesToUI #2)

        // QUAN TRỌNG: 'instance.date' là string 'YYYY-MM-DD'
        // new Date('2025-11-13') sẽ tạo ra ngày 13/11/2025 00:00:00 UTC
        // Thêm 'T00:00:00' để nó được parse là giờ địa phương
        const eventDate = new Date(`${instance.date}T00:00:00`);

        // Giả định: 7:00 AM là tiết 1
        const baseStartTime = setHours(setMinutes(eventDate, 0), 7);
        // Giả định: time_slot_id là index (1, 2, 3...)
        const startMinutesOffset = (instance.time_slot_id - 1) * 45; // 45 phút/tiết
        const start = addMinutes(baseStartTime, startMinutesOffset);

        // Lấy số tiết từ `Schedule` (pattern)
        const num_of_period = schedule?.num_of_period || 1;
        const end = addMinutes(start, num_of_period * 45);

        // --- Trả về cấu trúc Event ---
        return {
            id: instance.id,
            title: courseClass?.name || subject?.name || 'N/A',
            start: start, // JS Date object
            end: end,     // JS Date object
            teacher: teacher?.name || 'N/A',
            room: room ? `${room.name} - ${room.building_id || 'N/A'}` : 'N/A',
            type: courseClass?.type || 'lecture',
            subject: subject?.code || 'N/A', // Mã môn học
        };
    });
}

// Export functions
module.exports = {
    saveScheduleToDatabase,
    getScheduleGeneration,
    getSchedulesBySemester,
    generateScheduleInstances,
    generateAllInstancesForGeneration,
    getScheduleInstances,
    updateScheduleInstance,
    cancelScheduleInstance,
    rescheduleInstance,
    transformInstancesToEvents
};
