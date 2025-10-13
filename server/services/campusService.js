const Campus = require('../models/Campus');

async function getCampusById(id) {
  return await Campus.findByPk(id);
}

async function getAllCampus() {
  return await Campus.findAll();
}

async function createCampus(data) {
  return await Campus.create(data);
}

module.exports = {
  getCampusById,
  getAllCampus,
  createCampus,
};