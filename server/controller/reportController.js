const reportService = require('../services/reportService');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');
const sequelize = require('../config/initSequelize');
exports.schedulesByDay = async (req, res) => {
    try {
        const data = await reportService.schedulesByDay(req.query);
        res.json(new SuccessResponse(data, "Thống kê lịch học theo ngày"));
    } catch (err) {
        res.status(500).json(new ErrorResponse(err.message));
    }
};

exports.schedulesByTimeSlot = async (req, res) => {
    try {
        const data = await reportService.schedulesByTimeSlot(req.query);
        res.json(new SuccessResponse(data, "Thống kê lịch học theo TimeSlot"));
    } catch (err) {
        res.status(500).json(new ErrorResponse(err.message));
    }
};

exports.instructorConflicts = async (req, res) => {
    try {
        const data = await reportService.instructorConflicts(req.query);
        res.json(new SuccessResponse(data, "Giảng viên trùng lịch"));
    } catch (err) {
        res.status(500).json(new ErrorResponse(err.message));
    }
};

exports.availableRooms = async (req, res) => {
    try {
        const { day_id, time_slot_id } = req.query;
        const data = await reportService.availableRooms(day_id, time_slot_id, req.query);
        res.json(new SuccessResponse(data, "Phòng trống"));
    } catch (err) {
        res.status(500).json(new ErrorResponse(err.message));
    }
};

exports.instructorLoad = async (req, res) => {
    try {
        const data = await reportService.instructorLoad(req.query);
        res.json(new SuccessResponse(data, "Tải giảng viên"));
    } catch (err) {
        res.status(500).json(new ErrorResponse(err.message));
    }
};

exports.emptySlotsByWeek = async (req, res) => {
    try {
        const { start, end } = req.query;
        const data = await reportService.emptyTimeSlotsByWeek(start, end, req.query);
        res.json(new SuccessResponse(data, "Thống kê slot rỗng theo tuần"));
    } catch (err) {
        res.status(500).json(new ErrorResponse(err.message));
    }
};

// controllers/generationController.js
const { ScheduleGeneration, Semester } = require('../models'); // Giả sử bạn đã import model

// GET /api/generations
exports.getAllGenerations = async (req, res) => {
    try {
        const { page = 1, limit = 10, semester_id } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (semester_id) {
            whereClause.semester_id = semester_id;
        }

        const { count, rows } = await ScheduleGeneration.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: offset,
            order: [['generated_at', 'DESC']], // Sắp xếp mới nhất lên đầu
            include: [{
                model: Semester,
                as: 'semesterInfo', // Sử dụng 'as' từ association
                attributes: ['id', 'name', 'year'] // Chỉ lấy thông tin cần thiết
            }]
        });

        res.json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            data: rows,
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

// GET /api/generations/:id
exports.getGenerationById = async (req, res) => {
    try {
        const generation = await ScheduleGeneration.findByPk(req.params.id, {
            include: [{
                model: Semester,
                as: 'semesterInfo',
                attributes: ['id', 'name', 'year']
            }]
        });

        if (!generation) {
            return res.status(404).json({ message: 'Không tìm thấy lần tạo TKB này' });
        }
        res.json({ data: generation });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

exports.getGenerationStats = async (req, res) => {
    try {
        const { semester_id } = req.query;
        const whereClause = semester_id ? { semester_id } : {};

        const stats = await ScheduleGeneration.findOne({
            where: whereClause,
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalGenerations'],
                [sequelize.fn('AVG', sequelize.col('fitness_score')), 'averageFitness'],
                [sequelize.fn('MIN', sequelize.col('fitness_score')), 'bestFitnessScore'], // Giả sử điểm fitness càng thấp càng tốt
                [sequelize.fn('MAX', sequelize.col('fitness_score')), 'worstFitnessScore']
            ],
            raw: true, // Trả về object thuần
        });

        // Chuyển đổi kiểu dữ liệu (AVG có thể trả về string)
        const formattedStats = {
            totalGenerations: parseInt(stats.totalGenerations, 10) || 0,
            averageFitness: parseFloat(stats.averageFitness) || 0,
            bestFitnessScore: parseFloat(stats.bestFitnessScore) || 0,
            worstFitnessScore: parseFloat(stats.worstFitnessScore) || 0,
            semester_id: semester_id ? parseInt(semester_id, 10) : null
        };

        res.json({ data: formattedStats });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};


exports.getPenaltyAnalysis = async (req, res) => {
    try {
        const { semester_id } = req.query;
        const whereClause = semester_id ? { semester_id } : {};

        const generations = await ScheduleGeneration.findAll({
            where: whereClause,
            attributes: ['penalty_breakdown'], // Chỉ lấy cột penalty
        });

        const totalPenaltyCounts = {};

        generations.forEach(gen => {
            const penalties = gen.penalty_breakdown; // Đây là một object, ví dụ: { "teacher_conflict": 5, "room_conflict": 2 }

            if (penalties && typeof penalties === 'object') {
                Object.keys(penalties).forEach(key => {
                    const count = parseInt(penalties[key], 10) || 0;
                    if (count > 0) {
                        totalPenaltyCounts[key] = (totalPenaltyCounts[key] || 0) + count;
                    }
                });
            }
        });

        res.json({
            data: {
                totalPenaltyCounts,
                totalGenerationsAnalyzed: generations.length,
                semester_id: semester_id ? parseInt(semester_id, 10) : null
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

exports.getFitnessTrend = async (req, res) => {
    try {
        const { semester_id, limit = 50 } = req.query;
        const whereClause = semester_id ? { semester_id } : {};

        const trends = await ScheduleGeneration.findAll({
            where: whereClause,
            attributes: ['id', 'generated_at', 'fitness_score'],
            order: [['generated_at', 'ASC']], // Sắp xếp theo thời gian
            limit: parseInt(limit, 10),
        });

        res.json({ data: trends });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};