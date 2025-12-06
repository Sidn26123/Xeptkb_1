// controllers/manualScheduleController.js
const db = require('../models');
const { Op } = require('sequelize');

/**
 * Lấy dữ liệu cho lưới lịch (Grid) và danh sách chưa xếp
 */
async function getManualGridData(req, res) {
    try {
        const { semesterId } = req.query;
        if (!semesterId) return res.status(400).json({ success: false, message: 'Missing semesterId' });

        // 1. Lấy danh sách các lớp học phần trong học kỳ
        const courseClasses = await db.CourseClass.findAll({
            where: { semester_id: semesterId },
            include: [
                { model: db.Subject, as: 'subject' }, // Cần alias đúng trong model
                { model: db.Teacher, as: 'teacher' },
                { model: db.Class, as: 'class_ref' } // Alias tùy model define
            ]
        });

        // 2. Lấy lịch đã xếp (Pattern)
        const schedules = await db.Schedule.findAll({
            include: [
                {
                    model: db.CourseClass,
                    as: 'courseClass',
                    where: { semester_id: semesterId },
                    include: [{ model: db.Subject, as: 'subject' }]
                },
                { model: db.Room, as: 'room' },
                { model: db.Teacher, as: 'teacher' }
            ]
        });

        // 3. Phân loại: Đã xếp vs Chưa xếp
        const scheduledClassIds = new Set(schedules.map(s => s.course_class_id));

        // Lớp chưa xếp là lớp không có trong bảng schedules
        const unscheduledList = courseClasses.filter(cc => !scheduledClassIds.has(cc.id)).map(cc => ({
            id: cc.id,
            name: cc.name,
            subject_code: cc.subject ? cc.subject.code : 'N/A',
            subject_name: cc.subject ? cc.subject.name : 'N/A',
            student_count: 50, // Giả định hoặc lấy từ bảng students count
            teacher_name: cc.teacher ? cc.teacher.name : 'Chưa có GV',
            duration: cc.duration_per_session,
            weeks_needed: 15 // Có thể lấy từ bảng courses/subjects
        }));

        // Format lại schedules để render lên Grid
        const gridEvents = schedules.map(s => ({
            id: s.id, // Schedule ID
            course_class_id: s.course_class_id,
            name: s.courseClass.name,
            subject_code: s.courseClass.subject.code,
            day_id: s.day_id, // 2-8
            start_period: s.time_slot_id, // Lưu ý: DB của bạn time_slot_id là FK, cần join lấy idx nếu id != idx
            num_of_period: s.num_of_period,
            room_code: s.room ? s.room.code : 'N/A',
            teacher_code: s.teacher ? s.teacher.teacher_identifier : 'N/A',
            type: s.scheduler === 'manual' ? 'manual' : 'auto'
        }));

        return res.json({
            success: true,
            unscheduled: unscheduledList,
            scheduled: gridEvents
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
}

/**
 * Kiểm tra xung đột (Pattern Check)
 */
async function checkConflict(req, res) {
    try {
        const { courseClassId, teacherId, roomId, dayId, startPeriod, duration, semesterId, excludeScheduleId } = req.body;

        // Convert slot idx to actual time range (nếu cần logic phức tạp hơn)
        const endPeriod = startPeriod + duration - 1;
        const conflicts = [];

        // 1. Check GV bận (Unavailable Time)
        // Cần join bảng timeslots để so sánh idx
        const unavailable = await db.InstructorUnavailableTime.findAll({
            where: {
                teacher_id: teacherId,
                day_id: dayId
            },
            include: [{
                model: db.TimeSlot,
                as: 'timeSlot',
                where: {
                    idx: { [Op.between]: [startPeriod, endPeriod] }
                }
            }]
        });

        if (unavailable.length > 0) {
            conflicts.push({ type: 'TEACHER_BUSY', message: 'Giảng viên đã đăng ký bận giờ này.' });
        }

        // 2. Check Trùng Lịch (Schedules table) - GV hoặc Phòng hoặc Lớp SV
        // Tìm tất cả schedule có thể va chạm
        const potentialClashes = await db.Schedule.findAll({
            where: {
                day_id: dayId,
                id: { [Op.ne]: excludeScheduleId || -1 }, // Trừ chính nó
                [Op.or]: [
                    { teacher_id: teacherId },
                    { room_id: roomId },
                    // { course_class_id: ... } // Check trùng lớp SV cần join sâu hơn
                ]
            },
            include: [
                { model: db.TimeSlot, as: 'timeSlot' }, // Để lấy idx bắt đầu
                { model: db.CourseClass, as: 'courseClass', where: { semester_id: semesterId } },
                { model: db.Room, as: 'room' }
            ]
        });

        // Lọc thủ công overlap logic: (StartA <= EndB) and (EndA >= StartB)
        for (const s of potentialClashes) {
            const s_start = s.timeSlot.idx; // Giả sử timeSlot có trường idx
            const s_end = s_start + s.num_of_period - 1;

            if (Math.max(startPeriod, s_start) <= Math.min(endPeriod, s_end)) {
                if (s.teacher_id == teacherId) {
                    conflicts.push({ type: 'TEACHER_CONFLICT', message: `GV trùng lịch dạy lớp ${s.courseClass.name}` });
                }
                if (s.room_id == roomId) {
                    conflicts.push({ type: 'ROOM_CONFLICT', message: `Phòng ${s.room.code} đã có lớp ${s.courseClass.name}` });
                }
                // Logic check trùng Lớp Sinh viên (Class) nếu cần
            }
        }

        // 3. Check Sức chứa
        const room = await db.Room.findByPk(roomId);
        // Lấy sĩ số lớp (giả sử trong courseClass hoặc students count)
        // const studentCount = ...
        // if (room.capacity_max < studentCount) conflicts.push(...)

        return res.json({
            success: true,
            isValid: conflicts.length === 0,
            conflicts
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
}

/**
 * Lưu/Cập nhật lịch thủ công
 */
// async function saveManualSchedule(req, res) {
//     const t = await db.sequelize.transaction();
//     try {
//         const {
//             scheduleId, // Nếu có là Update, không là Create
//             courseClassId,
//             teacherId,
//             roomId,
//             dayId,
//             startPeriod, // idx
//             duration,
//             semesterId,
//             generationId // Nếu muốn gắn vào generation nào đó
//         } = req.body;
//
//         // Cần tìm time_slot_id từ idx (vì DB lưu ID)
//         const timeSlot = await db.TimeSlot.findOne({ where: { idx: startPeriod } });
//         if (!timeSlot) throw new Error('Invalid Time Slot Index');
//
//         // Lấy thông tin lớp để biết week_start, week_end (hoặc truyền từ FE)
//         const semester = await db.Semester.findByPk(semesterId);
//
//         // Payload chung
//         const payload = {
//             course_class_id: courseClassId,
//             teacher_id: teacherId,
//             room_id: roomId,
//             day_id: dayId,
//             time_slot_id: timeSlot.id,
//             num_of_period: duration,
//             scheduler: 'manual', // <--- Đánh dấu thủ công
//             generation_id: generationId || 1,
//             week_start: week_start, // Tạm lấy full học kỳ
//             week_end: week_end   // Tạm lấy full học kỳ
//         };
//
//         if (scheduleId) {
//             // UPDATE
//             await db.Schedule.update(payload, { where: { id: scheduleId }, transaction: t });
//
//             // OPTIONAL: Xóa và tạo lại schedule_instances cho đúng logic
//             // await db.ScheduleInstance.destroy({ where: { schedule_id: scheduleId }, transaction: t });
//             // await generateInstancesForSchedule(scheduleId, t); // Cần viết hàm helper này
//         } else {
//             // INSERT
//             const newSched = await db.Schedule.create(payload, { transaction: t });
//         }
//
//         await t.commit();
//         return res.json({ success: true, message: 'Đã lưu lịch thủ công' });
//
//     } catch (err) {
//         await t.rollback();
//         console.error(err);
//         return res.status(500).json({ success: false, message: err.message });
//     }
// }

module.exports = {
    getManualGridData,
    checkConflict,
    // saveManualSchedule
};