const {Schedule, CourseClass, Class, Room, Day, TimeSlot, Teaching, Teacher, Subject, ScheduleGeneration, Schedules} = require('../models');
const {getAllSubjectIds} = require("./subjectService");
const {logger} = require("sequelize/lib/utils/logger");
const sequelize = require('../config/initSequelize'); // Đường dẫn đến instance sequelize của bạn
async function getScheduleById(id) {
    return await Schedule.findByPk(id);
}

async function getAllSchedules() {
    return await Schedule.findAll();
}

async function createSchedule(data) {
    return await Schedule.create(data);
}

async function getSchedulesFiltered(filters = {}) {
    const {
        generation_id,
        course_class_id,
        day_id,
        room_id,
        time_slot_id,
        scheduler,
    } = filters;

    const whereClause = {};

    if (generation_id) whereClause.generation_id = generation_id;
    if (course_class_id) whereClause.course_class_id = course_class_id;
    if (day_id) whereClause.day_id = day_id;
    if (room_id) whereClause.room_id = room_id;
    if (time_slot_id) whereClause.time_slot_id = time_slot_id;
    if (scheduler) whereClause.scheduler = scheduler;

    return await Schedule.findAll({
        where: whereClause,
        order: [['id', 'ASC']],
    });
}

async function getTeachersWithAllSubjects(message) {
    // 1. TÍCH HỢP HÀM: Lấy danh sách ID của TẤT CẢ các môn học
    const allSubjectIds = await getAllSubjectIds();

    // --- 2. COLLECT TEACHERS DATA ---
    // Lấy TẤT CẢ giáo viên (chỉ cần id và name)
    // KHÔNG cần include các quan hệ phức tạp nữa
    const teachersData = await Teacher.findAll({
        attributes: ['id', 'name'],
    });

    logger.warn(`Tổng số giáo viên lấy được: ${teachersData.length}`);

    // 3. Xử lý dữ liệu: Gán toàn bộ Subject IDs vào trường can_teach_courses
    const teachers = teachersData.map(t => {
        return {
            "id": t.id,
            "name": t.name,
            // THAY THẾ LOGIC CŨ BẰNG TOÀN BỘ SUBJECT IDS
            "can_teach_courses": allSubjectIds
        };
    });
    logger.warn(`Đã gán toàn bộ môn học cho tất cả giáo viên.` + teachers[0].id + " có thể dạy " + teachers[0].can_teach_courses.length + " môn.");
    return teachers;
}
async function getSchedulingDataFromDB() {
    try {
        // --- 1. COLLECT COURSES DATA ---
        // Lấy tất cả các lớp học, bao gồm thông tin về Môn học (Subject) và Lớp (Class)
        const courseClasses = await CourseClass.findAll({
            include: [
                {
                    model: Subject,
                    attributes: ['id', 'theory_hours'],
                    as: 'subject',
                    // Bổ sung required: true để bắt buộc INNER JOIN
                    required: true
                },
                {model: Class, attributes: ['id'], as: 'class'},
            ],
            // ...
        });

        const courses = courseClasses.map(cc => ({
            // "id" trong JSON là id của CourseClass
            "id": cc.id,
            // "course_id" trong JSON là subject_id của CourseClass
            "course_id": cc.id,
            "student_count": 30, // Lấy từ Class
            "weeks_needed": cc.subject?.theory_hours || 0, // Lấy từ Subject
            "sessions_per_week": 1, // Lấy từ Subject
            "duration_per_session": 4 // Lấy từ Subject
        }));


        // --- 2. COLLECT TEACHERS DATA ---
        // Lấy tất cả giáo viên, bao gồm các môn họ có thể dạy
        // const teachersData = await Teacher.findAll({
        //     attributes: ['id', 'name'],
        //     // 1. Dùng bảng Teaching để tìm các lớp học mà giáo viên liên quan
        //     include: [
        //         {
        //             model: Teaching,
        //             attributes: ['course_class_id'], // Chỉ cần id của lớp học
        //             // 2. Từ lớp học, join tiếp đến CourseClass
        //             include: [
        //                 {
        //                     model: CourseClass,
        //                     attributes: ['subject_id'], // Chỉ cần subject_id
        //                     // 3. Từ CourseClass, join đến Subject
        //                     include: [
        //                         {
        //                             model: Subject,
        //                             attributes: ['id']
        //                         }
        //                     ]
        //                 }
        //             ]
        //         }
        //     ]
        // });
        //
        // const teachers = teachersData.map(t => {
        //     // 4. Lấy danh sách các subject ID từ tất cả các lớp mà giáo viên này đã dạy
        //     const subjectIds = t.Teachings
        //         .map(teaching => teaching.CourseClass ? teaching.CourseClass.Subject.id : null)
        //         .filter(id => id !== null);
        //
        //     // 5. Loại bỏ các ID trùng lặp để chỉ giữ lại các môn (Subject) mà họ có thể dạy
        //     const uniqueSubjectIds = [...new Set(subjectIds)];
        //
        //     return {
        //         "id": t.id,
        //         "name": t.name,
        //         // can_teach_courses là mảng các Subject ID
        //         "can_teach_courses": uniqueSubjectIds
        //     };
        // });
        const teachers = await getTeachersWithAllSubjects();
        // --- 3. COLLECT ROOMS DATA ---
        // Lấy tất cả phòng học và sức chứa
        const roomsData = await Room.findAll({
            attributes: ['id', 'name', 'capacity_max'] // Sử dụng capacity_max làm capacity
        });

        const rooms = roomsData.map(r => ({
            "id": r.id,
            "name": r.name,
            "capacity": r.capacity_max || 0
        }));

        // --- 4. CONFIG DATA (Phần này thường được lấy từ bảng Settings/Semester Config) ---
        // Bạn cần tự định nghĩa/lấy từ DB cho phù hợp
        const semester_config = {
            "start_week": 1,
            "end_week": 15,
            "max_concurrent_courses": 4
        };

        const ga_config = {
            "population_size": 50,
            "generations": 300,
            "crossover_rate": 0.8,
            "mutation_rate": 0.2,
            "elite_size": 5,
            "tournament_size": 3
        };
        //log teacher
        logger.warn(`Tổng số khóa học lấy được: ${teachers.length}`);
        //log detail first teacher
        logger.warn(`Chi tiết giáo viên đầu tiên: ID=${teachers[0].id}, Name=${teachers[0].name}, Can Teach Courses Count=${teachers[0].can_teach_courses.length}`);
        // --- 5. RETURN FINAL STRUCTURE ---
        return {
            courses: courses,
            teachers: teachers,
            rooms: rooms,
            semester_config: semester_config,
            ga_config: ga_config
        };

    } catch (error) {
        console.error("Error collecting scheduling data:", error);
        throw new Error("Failed to fetch data for scheduler.");
    }
}



// /**
//  * Lưu kết quả lập lịch từ API vào các bảng ScheduleGeneration và Schedule.
//  * * @param {object} apiResult - JSON phản hồi từ API lập lịch.
//  * @param {string} semesterName - Tên/Mã học kỳ hiện tại (ví dụ: "2024-2025-1").
//  * @param {number} daysPerWeek - Tổng số ngày hoạt động trong tuần (ví dụ: 7).
//  * @param {number} sessionsPerDay - Tổng số tiết học/slot mỗi ngày (ví dụ: 10).
//  * @param {number} sessionDuration - Thời lượng mỗi tiết học/slot (ví dụ: 45 phút).
//  */
// async function saveScheduleToDB(apiResult, semesterName, daysPerWeek, sessionsPerDay, sessionDuration) {
//     // Trích xuất dữ liệu cốt lõi
//     const scheduleData = apiResult;
//
//     // Kiểm tra tính hợp lệ cơ bản
//     if (!scheduleData) {
//         throw new Error("API result does not contain a successful schedule.");
//     }
//
//     let transaction;
//
//     try {
//         transaction = await sequelize.transaction();
//
//         // 1. LƯU VÀO SCHEDULE GENERATION
//         // Dữ liệu cần thiết cho ScheduleGeneration
//         const generationData = {
//             semester: semesterName,
//             total_weeks: scheduleData.semester.end_week - scheduleData.semester.start_week + 1,
//             days_per_week: daysPerWeek,
//             sessions_per_day: sessionsPerDay,
//             session_duration: sessionDuration,
//
//             // Dữ liệu từ kết quả GA
//             fitness_score: scheduleData.fitness || null,
//             penalty_breakdown: scheduleData.penalty_breakdown || {},
//             raw_json: apiResult, // Lưu toàn bộ JSON để tra cứu
//         };
//
//         const newGeneration = await ScheduleGeneration.create(generationData, { transaction });
//         const generationId = newGeneration.id;
//
//         const scheduleRecords = [];
//
//         // 2. CHUYỂN ĐỔI VÀ LƯU VÀO SCHEDULE
//         for (const course of scheduleData.courses) {
//
//             // Giả định: course_class_id cần được mapping từ class_id và course_id
//             // TẠM THỜI SỬ DỤNG course.id CỦA INPUT, nhưng nên mapping thực tế
//             const courseClassId = course.course_id;
//
//             for (const slot of course.weekly_slots) {
//                 // Tạo một bản ghi Schedule cho mỗi weekly_slot
//                 const scheduleEntry = {
//                     generation_id: generationId,
//                     course_class_id: courseClassId,
//                     day_id: slot.day,
//                     room_id: course.room_id,
//                     time_slot_id: slot.period,
//                     num_of_period: slot.duration,
//                     scheduler: "Genetic Algorithm", // Có thể thay bằng tên scheduler
//                     // Các trường khác như semester, teacher_id,... được lấy thông qua CourseClass và Generation
//                 };
//                 scheduleRecords.push(scheduleEntry);
//             }
//         }
//
//         // Thực hiện bulk create
//         await Schedule.bulkCreate(scheduleRecords, { transaction });
//
//         // Cam kết giao dịch
//         await transaction.commit();
//
//         console.log(`Successfully saved ${scheduleRecords.length} schedule entries under Generation ID: ${generationId}`);
//         return newGeneration;
//
//     } catch (error) {
//         // Hoàn tác giao dịch nếu có lỗi
//         if (transaction) await transaction.rollback();
//         console.error("Error saving schedule to database:", error);
//         throw new Error("Failed to save schedule due to database error.");
//     }
// }

// /**
//  * Lưu kết quả lập lịch từ API vào các bảng ScheduleGeneration và Schedule (pattern).
//  *
//  * @param {object} apiResult - JSON phản hồi từ API lập lịch.
//  * @param {number} semesterId - ID của học kỳ (ví dụ: 1).
//  * @param {string} semesterName - Tên/Mã học kỳ (ví dụ: "2024-2025-1").
//  * @param {number} daysPerWeek - Config: Tổng số ngày hoạt động trong tuần (ví dụ: 7).
//  * @param {number} sessionsPerDay - Config: Tổng số tiết học/slot mỗi ngày (ví dụ: 10).
//  * @param {number} sessionDuration - Config: Thời lượng mỗi tiết học/slot (ví dụ: 45 phút).
//  */
// async function saveScheduleToDB(apiResult, semesterId, semesterName, daysPerWeek, sessionsPerDay, sessionDuration) {
//     // Trích xuất dữ liệu cốt lõi
//     const scheduleData = apiResult;
//
//     // Kiểm tra tính hợp lệ cơ bản
//     if (!scheduleData || !scheduleData.courses || !scheduleData.semester) {
//         throw new Error("API result is missing key data (courses, semester).");
//     }
//
//     let transaction;
//
//     try {
//         transaction = await sequelize.transaction();
//
//         // 1. LƯU VÀO SCHEDULE GENERATION
//         // Tính toán tổng số tuần của học kỳ (dựa trên config của GA run)
//         const totalSemesterWeeks = scheduleData.semester.end_week - scheduleData.semester.start_week + 1;
//
//         const generationData = {
//             semester_id: semesterId, // <-- [CẬP NHẬT] Thêm ID học kỳ
//             semester: semesterName,
//             total_weeks: totalSemesterWeeks, // Tổng tuần của học kỳ
//             days_per_week: daysPerWeek,
//             sessions_per_day: sessionsPerDay,
//             session_duration: sessionDuration,
//
//             // Dữ liệu từ kết quả GA
//             fitness_score: scheduleData.fitness || null,
//             penalty_breakdown: scheduleData.penalty_breakdown || {},
//             raw_json: apiResult, // Lưu toàn bộ JSON để tra cứu
//         };
//
//         const newGeneration = await ScheduleGeneration.create(generationData, { transaction });
//         const generationId = newGeneration.id;
//
//         const scheduleRecords = [];
//
//         // 2. CHUYỂN ĐỔI VÀ LƯU VÀO SCHEDULE (Bảng mẫu TKB)
//         for (const course of scheduleData.courses) {
//
//             // [QUAN TRỌNG]
//             // Dữ liệu API của bạn có `class_id` và `course_id`.
//             // Bảng `Schedule` cần `course_class_id` (khóa ngoại đến `courseclasses`).
//             // `course.class_id` từ API chính là `course_class_id` chúng ta cần.
//             const courseClassId = course.class_id; // <-- [CẬP NHẬT]
//
//             if (!courseClassId) {
//                 console.warn("Skipping course block with missing class_id:", course);
//                 continue;
//             }
//
//             for (const slot of course.weekly_slots) {
//                 // Tạo một bản ghi Schedule (pattern) cho mỗi weekly_slot
//                 const scheduleEntry = {
//                     generation_id: generationId,
//                     course_class_id: courseClassId,
//                     teacher_id: course.teacher_id, // <-- [CẬP NHẬT] Thêm teacher_id
//                     day_id: slot.day,
//                     room_id: course.room_id,
//                     time_slot_id: slot.period,     // <-- [CẬP NHẬT] "period" map với time_slot_id
//                     num_of_period: slot.duration,
//                     scheduler: "Genetic Algorithm",
//
//                     // Các trường start_week, end_week không thuộc về bảng Schedule (pattern)
//                     // Chúng sẽ được dùng ở bước sau (sinh instance)
//                 };
//                 scheduleRecords.push(scheduleEntry);
//             }
//         }
//
//         // Thực hiện bulk create
//         await Schedule.bulkCreate(scheduleRecords, { transaction });
//
//         // Cam kết giao dịch
//         await transaction.commit();
//
//         console.log(`Successfully saved ${scheduleRecords.length} schedule patterns under Generation ID: ${generationId}`);
//         return newGeneration;
//
//     } catch (error) {
//         // Hoàn tác giao dịch nếu có lỗi
//         if (transaction) await transaction.rollback();
//         console.error("Error saving schedule to database:", error);
//         throw new Error("Failed to save schedule due to database error.");
//     }
// }

/**
 * [ĐÃ CẬP NHẬT]
 * Lưu kết quả lập lịch (pattern) vào DB, SỬ DỤNG MỘT TRANSACTION CÓ SẴN.
 *
 * @param {object} apiResult - JSON phản hồi từ API lập lịch.
 * @param {number} semesterId - ID của học kỳ.
 * @param {string} semesterName - Tên/Mã học kỳ.
 * @param {number} daysPerWeek - Config: Tổng số ngày hoạt động.
 * @param {number} sessionsPerDay - Config: Tổng số tiết học.
 * @param {number} sessionDuration - Config: Thời lượng mỗi tiết.
 * @param {import('sequelize').Transaction} transaction - Giao dịch Sequelize TỪ BÊN NGOÀI.
 */
async function saveScheduleToDB(apiResult, semesterId, semesterName, daysPerWeek, sessionsPerDay, sessionDuration, transaction) {
    // Trích xuất dữ liệu cốt lõi
    const scheduleData = apiResult;

    // Kiểm tra tính hợp lệ cơ bản
    if (!scheduleData || !scheduleData.courses || !scheduleData.semester) {
        throw new Error("API result is missing key data (courses, semester).");
    }

    // [CẬP NHẬT] Hàm này sẽ KHÔNG tự tạo hay commit/rollback transaction.
    // Nó sẽ ném lỗi nếu thất bại, để hàm GỌI nó (controller) tự rollback.

    try {
        // 1. LƯU VÀO SCHEDULE GENERATION
        // Tính toán tổng số tuần của học kỳ (dựa trên config của GA run)
        const totalSemesterWeeks = scheduleData.semester.end_week - scheduleData.semester.start_week + 1;

        const generationData = {
            semester_id: semesterId,
            semester: "HK1",
            total_weeks: totalSemesterWeeks, // Tổng tuần của học kỳ
            days_per_week: daysPerWeek,
            sessions_per_day: sessionsPerDay,
            session_duration: sessionDuration,

            // Dữ liệu từ kết quả GA
            fitness_score: scheduleData.fitness || null,
            penalty_breakdown: scheduleData.penalty_breakdown || {},
            raw_json: apiResult, // Lưu toàn bộ JSON để tra cứu
        };

        // [CẬP NHẬT] Sử dụng transaction được truyền vào
        const newGeneration = await ScheduleGeneration.create(generationData, { transaction });
        const generationId = newGeneration.id;

        const scheduleRecords = [];

        // 2. CHUYỂN ĐỔI VÀ LƯU VÀO SCHEDULE (Bảng mẫu TKB)
        for (const course of scheduleData.courses) {

            const courseClassId = course.class_id; // class_id từ API chính là course_class_id

            if (!courseClassId) {
                console.warn("Skipping course block with missing class_id:", course);
                continue;
            }

            for (const slot of course.weekly_slots) {
                // Tạo một bản ghi Schedule (pattern) cho mỗi weekly_slot
                const scheduleEntry = {
                    generation_id: generationId,
                    course_class_id: courseClassId,
                    teacher_id: course.teacher_id, // Schema mới đã có teacher_id
                    day_id: slot.day,
                    room_id: course.room_id,
                    time_slot_id: slot.period,     // "period" map với time_slot_id
                    num_of_period: slot.duration,  // "duration" map với num_of_period
                    scheduler: "Genetic Algorithm",
                };
                scheduleRecords.push(scheduleEntry);
            }
        }

        // [CẬP NHẬT] Sử dụng transaction được truyền vào
        await Schedule.bulkCreate(scheduleRecords, { transaction });

        console.log(`Successfully saved ${scheduleRecords.length} schedule patterns under Generation ID: ${generationId}`);

        // [CẬP NHẬT] Trả về, KHÔNG commit
        return newGeneration;

    } catch (error) {
        // [CẬP NHẬT] KHÔNG rollback. Chỉ ném lỗi để controller xử lý.
        console.error("Error during saveScheduleToDB (will be rolled back by caller):", error);
        // Ném lỗi gốc để controller bên ngoài bắt được và rollback
        throw error;
    }
}

// exports.getFormattedSchedules = async (req, res) => {
//   try {
//     const schedules = await Schedule.findAll({
//       include: [
//         {
//           model: CourseClass,
//           include: [
//             { model: Teacher, attributes: ['name', 'title'] },
//             { model: Subject, attributes: ['name', 'code'] }
//           ]
//         },
//         { model: Room, attributes: ['name', 'building'] },
//         { model: TimeSlot, attributes: ['start_hour', 'start_min', 'end_hour', 'end_min'] },
//         { model: Day, attributes: ['idx'] } // thứ 2 = 0
//       ]
//     });
//
//     // Lấy thứ 2 của tuần hiện tại
//     const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
//
//     const formatted = schedules.map(s => {
//       const dayOffset = s.Day.idx; // 0 = Monday
//       const start = setMinutes(
//           setHours(
//               addDays(monday, dayOffset),
//               s.TimeSlot.start_hour
//           ),
//           s.TimeSlot.start_min
//       );
//
//       const end = setMinutes(
//           setHours(
//               addDays(monday, dayOffset),
//               s.TimeSlot.end_hour
//           ),
//           s.TimeSlot.end_min
//       );
//
//       return {
//         id: s.id,
//         title: s.CourseClass.Subject.name,
//         start,
//         end,
//         teacher: `${s.CourseClass.Teacher.title}. ${s.CourseClass.Teacher.name}`,
//         room: `${s.Room.name} - ${s.Room.building}`,
//         type: s.CourseClass.type ?? 'lecture',
//         subject: s.CourseClass.Subject.code
//       };
//     });
//
//     return res.json({
//       success: true,
//       message: "Formatted schedules",
//       data: formatted
//     });
//
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };


module.exports = {
    getScheduleById,
    getAllSchedules,
    createSchedule,
    getSchedulesFiltered,
    getSchedulingDataFromDB,
    saveScheduleToDB
};