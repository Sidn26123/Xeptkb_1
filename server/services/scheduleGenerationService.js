// services/scheduleGenerationService.js
const ScheduleGeneration = require('../models/ScheduleGenerations');
const { Op } = require('sequelize');

async function getAllScheduleGenerations() {
    return await ScheduleGeneration.findAll({
        order: [['generated_at', 'DESC']],
    });
}

async function getScheduleGenerationById(id) {
    return await ScheduleGeneration.findByPk(id);
}

async function createScheduleGeneration(data) {
    return await ScheduleGeneration.create(data);
}

async function deleteScheduleGeneration(id) {
    return await ScheduleGeneration.destroy({ where: { id } });
}

/**
 * Filter + Sort + Pagination
 * query = {
 *   semester: '2024-2025-1',
 *   sortBy: 'generated_at',
 *   sortOrder: 'desc',
 *   limit: 10,
 *   page: 1
 * }
 */
async function filterScheduleGenerations(query) {
    const {
        semester,
        sortBy = 'generated_at',
        sortOrder = 'DESC',
        limit = 20,
        page = 1,
    } = query;

    const where = {};
    if (semester) {
        where.semester = semester;
    }

    const offset = (page - 1) * limit;

    return await ScheduleGeneration.findAndCountAll({
        where,
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
    });
}

module.exports = {
    getAllScheduleGenerations,
    getScheduleGenerationById,
    createScheduleGeneration,
    deleteScheduleGeneration,
    filterScheduleGenerations,
};
