// controller/scheduleGenerationController.js
const {
    getAllScheduleGenerations,
    getScheduleGenerationById,
    createScheduleGeneration,
    deleteScheduleGeneration,
    filterScheduleGenerations
} = require('../services/scheduleGenerationService');

const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');

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
