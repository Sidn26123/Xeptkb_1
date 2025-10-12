const TrainingType = require('../models/TrainingType');

async function getTrainingTypeById(id) {
  return await TrainingType.findByPk(id);
}

async function getAllTrainingTypes() {
  return await TrainingType.findAll();
}

async function createTrainingType(data) {
  return await TrainingType.create(data);
}

module.exports = {
  getTrainingTypeById,
  getAllTrainingTypes,
  createTrainingType,
};