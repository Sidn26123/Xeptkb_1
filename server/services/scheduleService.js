const Schedule = require('../models/Schedule');

async function getScheduleById(id) {
  return await Schedule.findByPk(id);
}

async function getAllSchedules() {
  return await Schedule.findAll();
}

async function createSchedule(data) {
  return await Schedule.create(data);
}

module.exports = {
  getScheduleById,
  getAllSchedules,
  createSchedule,
};