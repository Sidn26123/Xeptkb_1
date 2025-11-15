const {
    generateScheduleInstances,
    generateAllInstancesForGeneration,
    getScheduleInstances,
    updateScheduleInstance,
    cancelScheduleInstance,
    rescheduleInstance, transformInstancesToEvents
} = require('../services/scheduleInstanceService');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');
const ScheduleInstance = require('../models/ScheduleInstances');
const Schedule = require('../models/Schedules');
const ScheduleGeneration = require('../models/ScheduleGenerations');
const { Op } = require('sequelize');
const CourseClass = require('../models/CourseClasses');
const Subject = require('../models/Subjects');
const Room = require('../models/Rooms');
const Teacher = require('../models/Teachers');
// ==================== INSTANCE GENERATION ====================

/**
 * Tạo instances cho một schedule cụ thể
 * POST /api/schedules/:scheduleId/instances/generate
 */
exports.generateInstancesForSchedule = async (req, res) => {
    try {
        const {scheduleId} = req.params;
        const { startDate, endDate } = req.body;

        if (!startDate || !endDate) {
            // return res.status(400).json(
            //     new ErrorResponse('Thiếu startDate hoặc endDate', 400)
            // );

        }

        const result = await generateScheduleInstances(
            scheduleId,
            null,
            null
        );

        res.status(201).json(
            new SuccessResponse(result, 'Tạo schedule instances thành công', 201)
        );
    } catch (err) {
        console.error('Lỗi tạo instances:', err);
        res.status(500).json(new ErrorResponse(err.message, 500));
    }
};

/**
 * Tạo tất cả instances cho một generation
 * POST /api/schedules/generations/:generationId/instances/generate-all
 */
exports.generateAllInstances = async (req, res) => {
    try {
        const { generationId } = req.params;
        const { startDate, endDate } = req.body;

        if (!startDate || !endDate) {
            // return res.status(400).json(
            //     new ErrorResponse('Thiếu startDate hoặc endDate', 400)
            // );
        }

        const result = await generateAllInstancesForGeneration(
            generationId,
            null, null
        );

        res.status(201).json(
            new SuccessResponse(result, 'Tạo tất cả instances thành công', 201)
        );
    } catch (err) {
        console.error('Lỗi tạo tất cả instances:', err);
        res.status(500).json(new ErrorResponse(err.message, 500));
    }
};

// ==================== INSTANCE QUERY ====================

/**
 * Lấy tất cả instances với filter
 * POST /api/schedules/instances/filter
 */
exports.getAllInstances = async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            semesterId,
            teacherId,
            roomId,
            status,
            courseClassId,
            dayId
        } = req.body;

        if (!startDate || !endDate) {
            return res.status(400).json(
                new ErrorResponse('Thiếu startDate hoặc endDate', 400)
            );
        }

        const whereClause = {
            date: {
                [Op.between]: [startDate, endDate]
            }
        };

        if (status) {
            whereClause.status = status;
        }

        // Build include clause
        const includeClause = [{
            model: Schedule,
            as: 'schedule',
            required: true,
            include: [
                {
                    model: require('../models/CourseClasses'),
                    as: 'courseClass',
                    ...(courseClassId && { where: { id: courseClassId } })
                },
                { model: require('../models/Rooms'), as: 'room' },
                { model: require('../models/TimeSlot'), as: 'timeSlot' },
                {
                    model: require('../models/Days'),
                    as: 'day',
                    ...(dayId && { where: { id: dayId } })
                }
            ]
        }];

        // Filter by semester
        if (semesterId) {
            includeClause[0].include.push({
                model: ScheduleGeneration,
                as: 'generation',
                where: { semester_id: semesterId }
            });
        }

        // Filter by teacher (either override or pattern)
        if (teacherId) {
            whereClause[Op.or] = [
                { teacher_id: teacherId },
                {
                    teacher_id: null,
                    '$schedule.teacher_id$': teacherId
                }
            ];
        }

        // Filter by room (either override or pattern)
        if (roomId) {
            whereClause[Op.or] = [
                ...(whereClause[Op.or] || []),
                { room_id: roomId },
                {
                    room_id: null,
                    '$schedule.room_id$': roomId
                }
            ];
        }

        const instances = await ScheduleInstance.findAll({
            where: whereClause,
            include: includeClause,
            order: [['date', 'ASC'], ['time_slot_id', 'ASC']]
        });

        res.status(200).json(
            new SuccessResponse(instances, 'Lấy danh sách instances thành công')
        );
    } catch (err) {
        console.error('Lỗi lấy tất cả instances:', err);
        res.status(500).json(new ErrorResponse(err.message, 500));
    }
};

/**
 * Lấy instances của một schedule trong khoảng thời gian
 * GET /api/schedules/:scheduleId/instances?startDate=...&endDate=...
 */
exports.getInstancesBySchedule = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json(
                new ErrorResponse('Thiếu startDate hoặc endDate', 400)
            );
        }

        const instances = await getScheduleInstances(
            scheduleId,
            new Date(startDate),
            new Date(endDate)
        );

        res.status(200).json(
            new SuccessResponse(instances, 'Lấy danh sách instances thành công')
        );
    } catch (err) {
        console.error('Lỗi lấy instances:', err);
        res.status(500).json(new ErrorResponse(err.message, 500));
    }
};

/**
 * Lấy chi tiết một instance
 * GET /api/schedules/instances/:instanceId
 */
exports.getInstanceById = async (req, res) => {
    try {
        const instance = await ScheduleInstance.findByPk(req.params.instanceId, {
            include: [{
                model: Schedule,
                as: 'schedule',
                include: [
                    { model: require('../models/CourseClasses'), as: 'courseClass' },
                    { model: require('../models/Rooms'), as: 'room' },
                    { model: require('../models/TimeSlot'), as: 'timeSlot' },
                    { model: require('../models/Days'), as: 'day' },
                    { model: require('../models/Teachers'), as: 'teacher' }
                ]
            }]
        });

        if (!instance) {
            return res.status(404).json(
                new ErrorResponse('Không tìm thấy instance', 404)
            );
        }

        res.status(200).json(
            new SuccessResponse(instance, 'Lấy thông tin instance thành công')
        );
    } catch (err) {
        console.error('Lỗi lấy instance:', err);
        res.status(500).json(new ErrorResponse(err.message, 500));
    }
};

// ==================== INSTANCE MODIFICATION ====================

/**
 * Cập nhật một instance
 * PUT /api/schedules/instances/:instanceId
 */
exports.updateInstance = async (req, res) => {
    try {
        const { instanceId } = req.params;
        const updates = req.body;

        // Validate allowed fields
        const allowedFields = [
            'room_id',
            'teacher_id',
            'time_slot_id',
            'status',
            'cancel_reason',
            'metadata'
        ];

        const updateData = {};
        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                updateData[field] = updates[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json(
                new ErrorResponse('Không có dữ liệu để cập nhật', 400)
            );
        }

        const result = await updateScheduleInstance(instanceId, updateData);

        res.status(200).json(
            new SuccessResponse(result, 'Cập nhật instance thành công')
        );
    } catch (err) {
        console.error('Lỗi cập nhật instance:', err);
        res.status(500).json(new ErrorResponse(err.message, 500));
    }
};

/**
 * Hủy một buổi học
 * POST /api/schedules/instances/:instanceId/cancel
 */
exports.cancelInstance = async (req, res) => {
    try {
        const { instanceId } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json(
                new ErrorResponse('Thiếu lý do hủy', 400)
            );
        }

        const result = await cancelScheduleInstance(instanceId, reason);

        res.status(200).json(
            new SuccessResponse(result, 'Hủy buổi học thành công')
        );
    } catch (err) {
        console.error('Lỗi hủy buổi học:', err);
        res.status(500).json(new ErrorResponse(err.message, 500));
    }
};

/**
 * Đổi lịch một buổi học
 * POST /api/schedules/instances/:instanceId/reschedule
 */
exports.rescheduleInstanceHandler = async (req, res) => {
    try {
        const { instanceId } = req.params;
        const { newDate, room_id, teacher_id, time_slot_id } = req.body;

        if (!newDate) {
            return res.status(400).json(
                new ErrorResponse('Thiếu ngày mới', 400)
            );
        }

        const overrides = {};
        if (room_id !== undefined) overrides.room_id = room_id;
        if (teacher_id !== undefined) overrides.teacher_id = teacher_id;
        if (time_slot_id !== undefined) overrides.time_slot_id = time_slot_id;

        const result = await rescheduleInstance(
            instanceId,
            new Date(newDate),
            overrides
        );

        res.status(200).json(
            new SuccessResponse(result, 'Đổi lịch thành công')
        );
    } catch (err) {
        console.error('Lỗi đổi lịch:', err);
        res.status(500).json(new ErrorResponse(err.message, 500));
    }
};

/**
 * Đánh dấu buổi học đã hoàn thành
 * POST /api/schedules/instances/:instanceId/complete
 */
exports.completeInstance = async (req, res) => {
    try {
        const { instanceId } = req.params;
        const { notes } = req.body;

        const updateData = {
            status: 'done',
            metadata: {
                completed_at: new Date(),
                completed_by: req.user?.id, // from verifyToken middleware
                notes: notes || null
            }
        };

        const result = await updateScheduleInstance(instanceId, updateData);

        res.status(200).json(
            new SuccessResponse(result, 'Đánh dấu hoàn thành thành công')
        );
    } catch (err) {
        console.error('Lỗi đánh dấu hoàn thành:', err);
        res.status(500).json(new ErrorResponse(err.message, 500));
    }
};

/**
 * Xóa một instance
 * DELETE /api/schedules/instances/:instanceId
 */
exports.deleteInstance = async (req, res) => {
    try {
        const instance = await ScheduleInstance.findByPk(req.params.instanceId);

        if (!instance) {
            return res.status(404).json(
                new ErrorResponse('Không tìm thấy instance', 404)
            );
        }

        await instance.destroy();

        res.status(200).json(
            new SuccessResponse(null, 'Xóa instance thành công')
        );
    } catch (err) {
        console.error('Lỗi xóa instance:', err);
        res.status(500).json(new ErrorResponse(err.message, 500));
    }
};
exports.getScheduleInstancesByQuery = async (req, res) => {
    try {
        const { classId, semesterId } = req.query;

        if (!classId || !semesterId) {
            return res.status(400).json({
                message: 'Thiếu classId hoặc semesterId'
            });
        }

        // Truy vấn chính: Lấy ScheduleInstance
        const instances = await ScheduleInstance.findAll({
            include: [
                {
                    model: Schedule,
                    as: 'schedule',
                    attributes: ['num_of_period'],
                    required: true, // INNER JOIN
                    include: [
                        {
                            model: ScheduleGeneration,
                            as: 'generation',
                            attributes: [],
                            required: true,
                            where: {
                                semester_id: semesterId
                            }
                        },
                        {
                            model: CourseClass,
                            as: 'courseClass',
                            required: true,
                            where: {
                                class_id: classId
                            },
                            include: [
                                { model: Subject, as: 'subject' }
                            ]
                        }
                    ]
                },
                {
                    model: Room,
                    as: 'room',
                },
                {
                    model: Teacher,
                    as: 'teacher',
                }
            ],
            order: [
                ['date', 'ASC'],
                ['time_slot_id', 'ASC']
            ]
        });

        console.log('Fetched schedule instances:', instances);

        // Chuyển đổi dữ liệu về dạng Frontend
        const events = transformInstancesToEvents(instances);

        res.status(200).json(events);

    } catch (error) {
        console.error('Lỗi khi lấy schedule instances:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};
module.exports = exports;