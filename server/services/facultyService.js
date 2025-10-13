const Faculty = require('../models/Faculty');

async function getFacultyById(id) {
  return await Faculty.findByPk(id);
}

async function getAllFaculties() {
  return await Faculty.findAll();
}

async function createFaculty(data) {
  return await Faculty.create(data);
}

module.exports = {
  getFacultyById,
  getAllFaculties,
  createFaculty,
};