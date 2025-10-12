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

module.exports = {
  getTimeSlotById,
  getAllTimeSlots,
  createTimeSlot,
};