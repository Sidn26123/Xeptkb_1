const InstructorUnavailableTime = require('../models/InstructorUnavailableTime');
const sequelize = require('../config/initSequelize');

async function getInstructorUnavailableTime(day_id, teacher_id, time_slot_id) {
  return await InstructorUnavailableTime.findOne({
    where: { day_id, teacher_id, time_slot_id }
  });
}

async function getAllInstructorUnavailableTimes() {
  return await InstructorUnavailableTime.findAll();
}

async function getByTeacher(teacher_id) {
  return await InstructorUnavailableTime.findAll({ where: { teacher_id } });
}

async function createInstructorUnavailableTime(data) {
  return await InstructorUnavailableTime.create(data);
}

async function addIfNotExists(teacher_id, day_id, time_slot_id) {
  const [row, created] = await InstructorUnavailableTime.findOrCreate({
    where: { teacher_id, day_id, time_slot_id },
    defaults: { teacher_id, day_id, time_slot_id }
  });
  return row;
}

async function replaceForTeacher(teacher_id, items = []) {
  // items: [{ day_id, time_slot_id }, ...]
  return await sequelize.transaction(async (t) => {
    await InstructorUnavailableTime.destroy({ where: { teacher_id }, transaction: t });
    if (Array.isArray(items) && items.length > 0) {
      const records = items.map(i => ({ teacher_id, day_id: i.day_id, time_slot_id: i.time_slot_id }));
      await InstructorUnavailableTime.bulkCreate(records, { transaction: t, ignoreDuplicates: true });
    }
    return await InstructorUnavailableTime.findAll({ where: { teacher_id }, transaction: t });
  });
}

async function deleteForTeacher(teacher_id, items = []) {
  // items: [{ day_id, time_slot_id }, ...]
  if (!Array.isArray(items) || items.length === 0) return 0;
  const whereClauses = items.map(i => ({ teacher_id, day_id: i.day_id, time_slot_id: i.time_slot_id }));
  // Combine with OR
  const { Op } = require('sequelize');
  const count = await InstructorUnavailableTime.destroy({ where: { [Op.or]: whereClauses } });
  return count;
}

module.exports = {
  getInstructorUnavailableTime,
  getAllInstructorUnavailableTimes,
  createInstructorUnavailableTime,
  getByTeacher,
  addIfNotExists,
  replaceForTeacher,
  deleteForTeacher,
};