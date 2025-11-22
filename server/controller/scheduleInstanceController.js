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
const Class = require('../models/Classes');
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
 * @desc    Tạo tất cả ScheduleInstances cho một Generation cụ thể
 * @route   POST /api/v1/schedule-generations/:generationId/generate-instances
 * @access  Private (Admin)
 */
exports.generateInstancesForGeneration = async (req, res) => {
    try {
        const { generationId } = req.params;
        const { startDate, endDate } = req.body;

        // 1. (Optional) Validate startDate/endDate nếu service của bạn cần
        // Bạn đã comment phần này ra, nhưng nếu hàm service
        // generateScheduleInstances CẦN ngày, bạn nên bật nó lên.
        if (!startDate || !endDate) {
            // return res.status(400).json(
            //     new ErrorResponse('Thiếu startDate hoặc endDate', 400)
            // );
        }

        // 2. Tìm tất cả các scheduleId thuộc generation này
        const schedulesInGeneration = await Schedule.findAll({
            where: { generation_id: generationId },
            attributes: ['id'], // Chỉ cần lấy ID
            raw: true,
        });

        if (!schedulesInGeneration || schedulesInGeneration.length === 0) {
            return res.status(404).json(
                new ErrorResponse('Không tìm thấy schedule nào cho generation này', 404)
            );
        }

        // Lấy mảng các ID
        const scheduleIds = schedulesInGeneration.map(s => s.id);

        // 3. Tạo một mảng các "promises" để gọi hàm service cho từng ID
        //    Sử dụng Promise.all để chạy song song, giúp tăng tốc độ
        const generationPromises = scheduleIds.map(scheduleId => {
            // GỌI HÀM SERVICE CỦA BẠN:
            //
            // **LỰA CHỌN 1 (Dùng ngày từ body):**
            // Nếu hàm service của bạn cần startDate/endDate từ body:
            // return generateScheduleInstances(scheduleId, startDate, endDate);
            //
            // **LỰA CHỌN 2 (Như code gốc của bạn):**
            // Nếu hàm service của bạn tự suy ra ngày tháng (dựa vào scheduleId):
            return generateScheduleInstances(scheduleId, null, null);
        });

        // 4. Thực thi tất cả các promises
        const allResults = await Promise.all(generationPromises);

        // allResults bây giờ là một mảng của các kết quả (ví dụ: [[instance1, instance2], [instance3]])
        // Làm phẳng (flatten) mảng này nếu cần
        const flattenedResults = allResults.flat();

        res.status(201).json(
            new SuccessResponse(
                {
                    totalSchedulesProcessed: scheduleIds.length,
                    totalInstancesGenerated: flattenedResults.length,
                    // data: flattenedResults // Gửi data về nếu client cần
                },
                'Tạo instances cho toàn bộ generation thành công',
                201
            )
        );
    } catch (err) {
        console.error('Lỗi tạo instances cho generation:', err);
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
 * GET /api/schedules/instances/:instanceId or /api/schedule-instances/:id
 */
exports.getInstanceById = async (req, res) => {
    try {
        const instanceId = req.params.id || req.params.instanceId;
        const instance = await ScheduleInstance.findByPk(instanceId, {
            include: [
                {
                    model: Schedule,
                    as: 'schedule',
                    include: [
                        { model: require('../models/CourseClasses'), as: 'courseClass', include: [ { model: require('../models/Classes'), as: 'class' } ] },
                        { model: require('../models/Rooms'), as: 'room' },
                        { model: require('../models/TimeSlot'), as: 'timeSlot' },
                        { model: require('../models/Days'), as: 'day' },
                        { model: require('../models/Teachers'), as: 'teacher' }
                    ]
                },
                // Include instance-level associations so overrides (room/timeSlot/teacher)
                // are present directly on the returned object. Frontend should prefer
                // these when they exist (they represent manual/instance overrides).
                { model: require('../models/Rooms'), as: 'room' },
                { model: require('../models/TimeSlot'), as: 'timeSlot' },
                { model: require('../models/Teachers'), as: 'teacher' }
            ]
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
        const userRole = req.user.role;
        const userId = req.user.id;

        // If user is teacher, they can only update their own instances
        if (userRole === 'teacher') {
            const instance = await ScheduleInstance.findByPk(instanceId, {
                include: [{
                    model: Schedule,
                    as: 'schedule',
                    attributes: ['teacher_id']
                }]
            });

            if (!instance) {
                return res.status(404).json(
                    new ErrorResponse('Không tìm thấy instance', 404)
                );
            }

            // Check if teacher is assigned to this instance
            const isAssignedTeacher = instance.teacher_id === userId ||
                (instance.teacher_id === null && instance.schedule?.teacher_id === userId);

            if (!isAssignedTeacher) {
                return res.status(403).json(
                    new ErrorResponse('Bạn không có quyền chỉnh sửa buổi học này', 403)
                );
            }

            // Teachers can only update certain fields
            const teacherAllowedFields = ['room_id', 'time_slot_id', 'status'];
            const updateData = {};
            for (const field of teacherAllowedFields) {
                if (updates[field] !== undefined) {
                    updateData[field] = updates[field];
                }
            }

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json(
                    new ErrorResponse('Không có dữ liệu để cập nhật', 400)
                );
            }
        } else {
            // Admin can update all allowed fields
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
        const { classId, semesterId, roomId, teacherId } = req.query;

        if ((!classId && !roomId && !teacherId) || !semesterId) {
            return res.status(400).json({
                message: 'Thiếu classId, roomId hoặc teacherId, hoặc thiếu semesterId'
            });
        }

        // Build include for Schedule with generation filter by semester
        const courseClassInclude = {
            model: CourseClass,
            as: 'courseClass',
            required: false,
            include: [
                { model: Subject, as: 'subject' },
                // Only select `id` and `name` from Class to avoid
                // requesting columns that may not exist in older DBs
                { model: Class, as: 'class', attributes: ['id', 'name'] }
            ]
        };

        const scheduleInclude = {
            model: Schedule,
            as: 'schedule',
            attributes: ['num_of_period', 'room_id'],
            required: true,
            include: [
                {
                    model: ScheduleGeneration,
                    as: 'generation',
                    attributes: [],
                    required: true,
                    where: { semester_id: semesterId }
                },
                courseClassInclude
            ]
        };

        // Build where clause for ScheduleInstance
        const whereClause = {};

        if (roomId) {
            // filter instances by room OR schedule.room_id
            whereClause[Op.or] = [
                { room_id: roomId },
                { '$schedule.room_id$': roomId }
            ];
        }

        // Filter by teacher (either override on instance or schedule.teacher_id)
        if (teacherId) {
            whereClause[Op.or] = [
                ...(whereClause[Op.or] || []),
                { teacher_id: teacherId },
                { '$schedule.teacher_id$': teacherId }
            ];
        }

        if (classId) {
            // restrict to instances whose schedule.courseClass.class_id matches
            courseClassInclude.required = true;
            courseClassInclude.where = { class_id: classId };
        }

        const instances = await ScheduleInstance.findAll({
            where: whereClause,
            include: [
                scheduleInclude,
                { model: Room, as: 'room' },
                { model: Teacher, as: 'teacher' },
                { model: require('../models/TimeSlot'), as: 'timeSlot' }
            ],
            order: [ ['date', 'ASC'], ['time_slot_id', 'ASC'] ]
        });

        // Chuyển đổi dữ liệu về dạng Frontend
        const events = transformInstancesToEvents(instances);

        res.status(200).json(events);

    } catch (error) {
        console.error('Lỗi khi lấy schedule instances:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

/**
 * Lấy instances cho một user (teacher hoặc student)
 * POST /api/v1/schedule-instances/instances/for-user
 * body: { userId, role: 'teacher'|'student', startDate, endDate, semesterId }
 */
exports.getInstancesForUser = async (req, res) => {
    try {
        const { userId, role, startDate, endDate, semesterId, classId } = req.body;

        // Validation: for student role we expect classId; for teacher role we expect userId
        if (!role || !startDate || !endDate) {
            return res.status(400).json(new ErrorResponse('Thiếu role, startDate hoặc endDate', 400));
        }
        if (role === 'student' && !classId) {
            return res.status(400).json(new ErrorResponse('Thiếu classId cho role student', 400));
        }
        if (role === 'teacher' && !userId) {
            return res.status(400).json(new ErrorResponse('Thiếu userId cho role teacher', 400));
        }

        // Build base where clause for date range
        const whereClause = {
            date: {
                [Op.between]: [startDate, endDate]
            }
        };

        // Build include clause similar to getAllInstances
        const includeClause = [
            {
                model: Schedule,
                as: 'schedule',
                required: true,
                include: [
                    { model: require('../models/CourseClasses'), as: 'courseClass' },
                    { model: require('../models/Rooms'), as: 'room' },
                    { model: require('../models/TimeSlot'), as: 'timeSlot' },
                    { model: require('../models/Days'), as: 'day' }
                ]
            }
        ];

        // If semesterId provided, filter generation
        if (semesterId) {
            includeClause[0].include.push({
                model: ScheduleGeneration,
                as: 'generation',
                where: { semester_id: semesterId }
            });
        }

        if (role === 'teacher') {
            // Filter by teacher (either override or pattern)
            whereClause[Op.or] = [
                { teacher_id: userId },
                { teacher_id: null, '$schedule.teacher_id$': userId }
            ];
        } else if (role === 'student') {
            // We expect caller to supply classId
            // Restrict to schedules whose courseClass.class_id matches this class
            includeClause[0].include = includeClause[0].include.map(inc => {
                if (inc.as === 'courseClass') {
                    return { ...inc, required: true, where: { class_id: classId } };
                }
                return inc;
            });
        } else {
            return res.status(400).json(new ErrorResponse('Role không hợp lệ (teacher|student)', 400));
        }

        const instances = await ScheduleInstance.findAll({
            where: whereClause,
            include: [
                ...includeClause,
                { model: Room, as: 'room' },
                { model: Teacher, as: 'teacher' },
                { model: require('../models/TimeSlot'), as: 'timeSlot' }
            ],
            order: [['date', 'ASC'], ['time_slot_id', 'ASC']]
        });

        res.status(200).json(new SuccessResponse(instances, 'Lấy instances cho user thành công'));
    } catch (err) {
        console.error('Lỗi getInstancesForUser:', err);
        res.status(500).json(new ErrorResponse(err.message, 500));
    }
};

module.exports = exports;