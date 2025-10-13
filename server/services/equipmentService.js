const Equipment = require('../models/Equipment');

async function getEquipmentById(id) {
  return await Equipment.findByPk(id);
}

async function getAllEquipments() {
  return await Equipment.findAll();
}

async function createEquipment(data) {
  return await Equipment.create(data);
}

module.exports = {
  getEquipmentById,
  getAllEquipments,
  createEquipment,
};