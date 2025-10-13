const SystemConfig = require('../models/SystemConfig');

async function getSystemConfigById(id) {
  return await SystemConfig.findByPk(id);
}

async function getAllSystemConfigs() {
  return await SystemConfig.findAll();
}

async function createSystemConfig(data) {
  return await SystemConfig.create(data);
}

module.exports = {
  getSystemConfigById,
  getAllSystemConfigs,
  createSystemConfig,
};