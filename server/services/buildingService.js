const Building = require('../models/Building');

async function getBuildingById(id) {
  return await Building.findByPk(id);
}

async function getAllBuildings() {
  return await Building.findAll();
}

async function createBuilding(data) {
  return await Building.create(data);
}

module.exports = {
  getBuildingById,
  getAllBuildings,
  createBuilding,
};