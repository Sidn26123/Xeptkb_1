const sequelize = require('../config/initSequelize');
const Schedule = require('../models/Schedules');
const Day = require('../models/Days');
const TimeSlot = require('../models/TimeSlot');
const Instructor = require('../models/InstructorUnavailableTime');
const Room = require('../models/Rooms');
const CourseClass = require('../models/CourseClasses');

module.exports = {

    // 1. Thống kê lịch học theo từng ngày
    async schedulesByDay(filters) {
        const { semester_id, program_id, start_date, end_date } = filters;

        return await Day.findAll({
            include: [{
                model: Schedule,
                as: 'schedules',
                required: false,
                where: {
                    ...(semester_id && { semester_id }),
                    ...(program_id && { program_id }),
                    ...(start_date && { date: { [sequelize.Op.gte]: start_date } }),
                    ...(end_date && { date: { [sequelize.Op.lte]: end_date } })
                },
                attributes: []
            }],
            attributes: [
                'id',
                'name',
                [sequelize.fn('COUNT', sequelize.col('schedules.id')), 'total_schedules']
            ],
            group: ['Day.id']
        });
    },

    // 2. Thống kê lịch học theo TimeSlot
    async schedulesByTimeSlot(filters) {
        const { semester_id, program_id, start_date, end_date } = filters;

        return await TimeSlot.findAll({
            include: [{
                model: Schedule,
                as: 'schedules',
                required: false,
                where: {
                    ...(semester_id && { semester_id }),
                    ...(program_id && { program_id }),
                    ...(start_date && { date: { [sequelize.Op.gte]: start_date } }),
                    ...(end_date && { date: { [sequelize.Op.lte]: end_date } })
                },
                attributes: []
            }],
            attributes: [
                'id',
                'name',
                'start_hour',
                'start_min',
                'end_hour',
                'end_min',
                [sequelize.fn('COUNT', sequelize.col('schedules.id')), 'total_schedules']
            ],
            group: ['TimeSlot.id']
        });
    },

    // 3. Giảng viên bị trùng lịch
    async instructorConflicts(filters) {
        const { semester_id, program_id } = filters;

        return await Schedule.findAll({
            attributes: [
                'instructor_id',
                'day_id',
                'time_slot_id',
                [sequelize.fn('COUNT', '*'), 'count']
            ],
            include: [
                { model: Instructor, attributes: ['name'] },
                { model: CourseClass, attributes: ['name'] }
            ],
            where: {
                ...(semester_id && { semester_id }),
                ...(program_id && { program_id }),
            },
            group: ['instructor_id', 'day_id', 'time_slot_id'],
            having: sequelize.literal('COUNT(*) > 1')
        });
    },

    // 4. Phòng còn trống theo Day + TimeSlot
    async availableRooms(dayId, timeSlotId, filters) {
        const { semester_id, program_id } = filters;

        return await Room.findAll({
            include: [{
                model: Schedule,
                required: false,
                where: {
                    day_id: dayId,
                    time_slot_id: timeSlotId,
                    ...(semester_id && { semester_id }),
                    ...(program_id && { program_id }),
                }
            }],
            where: sequelize.literal('schedules.id IS NULL')
        });
    },

    // 5. Tải giảng viên (số lớp dạy)
    async instructorLoad(filters) {
        const { semester_id, program_id } = filters;

        return await Instructor.findAll({
            include: [{
                model: Schedule,
                attributes: [],
                where: {
                    ...(semester_id && { semester_id }),
                    ...(program_id && { program_id }),
                }
            }],
            attributes: [
                'id',
                'name',
                [sequelize.fn('COUNT', sequelize.col('schedules.id')), 'total_classes']
            ],
            group: ['Instructor.id']
        });
    },

    // 6. Thống kê slot rỗng theo tuần
    async emptyTimeSlotsByWeek(weekStart, weekEnd, filters) {
        const { semester_id, program_id } = filters;

        return await TimeSlot.findAll({
            include: [{
                model: Schedule,
                as: 'schedules',
                required: false,
                where: {
                    date: { [sequelize.Op.between]: [weekStart, weekEnd] },
                    ...(semester_id && { semester_id }),
                    ...(program_id && { program_id }),
                }
            }],
            attributes: [
                'id',
                'name',
                [sequelize.fn('COUNT', sequelize.col('schedules.id')), 'occupied']
            ],
            group: ['TimeSlot.id']
        });
    }
};
