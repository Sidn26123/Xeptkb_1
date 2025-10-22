const Faculty = require('../models/Faculty');

async function getAllFaculties() {
  return await Faculty.findAll();
}

async function getFacultyById(id) {
  return await Faculty.findByPk(id);
}

async function createFaculty(data) {
  return await Faculty.create(data);
}

async function updateFaculty(id, data) {
  const faculty = await Faculty.findByPk(id);
  if (!faculty) return null;
  return await faculty.update(data);
}

async function deleteFaculty(id) {
  const faculty = await Faculty.findByPk(id);
  if (!faculty) return null;
  await faculty.destroy();
  return true;
}

module.exports = {
  getAllFaculties,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
};
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