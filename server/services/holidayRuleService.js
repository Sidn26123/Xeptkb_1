const HolidayRule = require('../models/HolidayRule');

async function getHolidayRuleById(id) {
  return await HolidayRule.findByPk(id);
}

async function getAllHolidayRules() {
  return await HolidayRule.findAll();
}

async function createHolidayRule(data) {
  return await HolidayRule.create(data);
}

module.exports = {
  getHolidayRuleById,
  getAllHolidayRules,
  createHolidayRule,
};