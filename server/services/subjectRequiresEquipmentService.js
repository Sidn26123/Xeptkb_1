const SubjectRequiresEquipment = require('../models/SubjectRequiresEquipment');

async function getSubjectRequiresEquipmentById(id) {
  return await SubjectRequiresEquipment.findByPk(id);
}

async function getAllSubjectRequiresEquipments() {
  return await SubjectRequiresEquipment.findAll();
}

async function createSubjectRequiresEquipment(data) {
  return await SubjectRequiresEquipment.create(data);
}

module.exports = {
  getSubjectRequiresEquipmentById,
  getAllSubjectRequiresEquipments,
  createSubjectRequiresEquipment,
};