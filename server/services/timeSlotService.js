const TimeSlot = require('../models/TimeSlot');

async function getTimeSlotById(id) {
    return await TimeSlot.findByPk(id);
}

async function getAllTimeSlots() {
    return await TimeSlot.findAll();
}

async function createTimeSlot(data) {
    return await TimeSlot.create(data);
}

async function updateTimeSlot(id, data) {
    return await TimeSlot.update(data, {where: {id}});
}

async function deleteTimeSlot(id) {
    return await TimeSlot.destroy({where: {id}});
}

module.exports = {
    getTimeSlotById,
    getAllTimeSlots,
    createTimeSlot,
    updateTimeSlot,
    deleteTimeSlot
};