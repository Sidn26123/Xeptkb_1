const Schedule = require('../models/Schedules');

async function getScheduleById(id) {
  return await Schedule.findByPk(id);
}

async function getAllSchedules() {
  return await Schedule.findAll();
}

async function createSchedule(data) {
  return await Schedule.create(data);
}

async function getSchedulesFiltered(filters = {}) {
  const {
    generation_id,
    course_class_id,
    day_id,
    room_id,
    time_slot_id,
    scheduler,
  } = filters;

  const whereClause = {};

  if (generation_id) whereClause.generation_id = generation_id;
  if (course_class_id) whereClause.course_class_id = course_class_id;
  if (day_id) whereClause.day_id = day_id;
  if (room_id) whereClause.room_id = room_id;
  if (time_slot_id) whereClause.time_slot_id = time_slot_id;
  if (scheduler) whereClause.scheduler = scheduler;

  return await Schedule.findAll({
    where: whereClause,
    order: [['id', 'ASC']],
  });
}

module.exports = {
  getScheduleById,
  getAllSchedules,
  createSchedule,
  getSchedulesFiltered
};