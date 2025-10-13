const InstructorUnavailableTime = require('../models/InstructorUnavailableTime');

async function getInstructorUnavailableTime(day_id, teacher_id, time_slot_id) {
  return await InstructorUnavailableTime.findOne({
    where: { day_id, teacher_id, time_slot_id }
  });
}

async function getAllInstructorUnavailableTimes() {
  return await InstructorUnavailableTime.findAll();
}

async function createInstructorUnavailableTime(data) {
  return await InstructorUnavailableTime.create(data);
}

module.exports = {
  getInstructorUnavailableTime,
  getAllInstructorUnavailableTimes,
  createInstructorUnavailableTime,
};