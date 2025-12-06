// controller/scheduleGenerationController.js
import {
    getScheduleGeneration,
    getSchedulesBySemester,
    saveScheduleToDatabase
} from "../services/scheduleInstanceService";

const {
    getAllScheduleGenerations,
    getScheduleGenerationById,
    createScheduleGeneration,
    deleteScheduleGeneration,
    filterScheduleGenerations
} = require('../services/scheduleGenerationService');

const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');
import ScheduleGeneration from "../models/ScheduleGenerations";
import Schedule from "../models/Schedules";
// GET all
exports.getAllScheduleGenerations = async (req, res) => {
    try {
        const data = await getAllScheduleGenerations();
        res.status(200).json(new SuccessResponse(data, "Lấy danh sách thành công"));
    } catch (err) {
        res.status(500).json(new ErrorResponse(err.message));
    }
};

// GET by ID
exports.getScheduleGenerationById = async (req, res) => {
    try {
        const result = await getScheduleGenerationById(req.params.id);
        if (!result) {
            return res.status(404).json(new ErrorResponse("Không tìm thấy bản ghi"));
        }
        res.json(new SuccessResponse(result, "Lấy chi tiết thành công"));
    } catch (err) {
        res.status(500).json(new ErrorResponse(err.message));
    }
};

// POST create
exports.createScheduleGeneration = async (req, res) => {
    try {
        const created = await createScheduleGeneration(req.body);
        res.status(201).json(new SuccessResponse(created, "Tạo mới thành công"));
    } catch (err) {
        res.status(500).json(new ErrorResponse(err.message));
    }
};

// DELETE
exports.deleteScheduleGeneration = async (req, res) => {
    try {
        const deleted = await deleteScheduleGeneration(req.params.id);
        if (!deleted) {
            return res.status(404).json(new ErrorResponse("Không tìm thấy bản ghi"));
        }
        res.json(new SuccessResponse({}, "Xóa thành công"));
    } catch (err) {
        res.status(500).json(new ErrorResponse(err.message));
    }
};

// FILTER + SORT + PAGINATION
exports.filterScheduleGenerations = async (req, res) => {
    try {
        const result = await filterScheduleGenerations(req.query);
        res.json(new SuccessResponse({
            total: result.count,
            data: result.rows
        }, "Lọc dữ liệu thành công"));
    } catch (err) {
        res.status(500).json(new ErrorResponse(err.message));
    }
};
/**
 * Lưu schedule từ API response vào database
 * POST /api/schedules/save
 */
exports.saveSchedule = async (req, res) => {
    try {
        const { apiResponse } = req.body;

        if (!apiResponse || !apiResponse.schedule) {
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
        await Schedule.destroy({ where: { generation_id: req.params.id } });

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
        const { id } = req.params;

        const generation = await ScheduleGeneration.findByPk(id, {
            include: [{
                model: Schedule,
                as: 'schedules',
                include: [
                    { model: require('../models/CourseClasses'), as: 'courseClass' },
                    { model: require('../models/Rooms'), as: 'room' },
                    { model: require('../models/Teachers'), as: 'teacher' }
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
        const { generationIds } = req.body;

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
                    { model: require('../models/CourseClasses'), as: 'courseClass' },
                    { model: require('../models/Rooms'), as: 'room' },
                    { model: require('../models/TimeSlot'), as: 'timeSlot' },
                    { model: require('../models/Days'), as: 'day' },
                    { model: require('../models/Teachers'), as: 'teacher' }
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

