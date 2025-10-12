const HolidayActual = require('../models/HolidayActual');

async function getHolidayActualById(id) {
  return await HolidayActual.findByPk(id);
}

async function getAllHolidayActuals() {
  return await HolidayActual.findAll();
}

async function createHolidayActual(data) {
  return await HolidayActual.create(data);
}

module.exports = {
  getHolidayActualById,
  getAllHolidayActuals,
  createHolidayActual,
};