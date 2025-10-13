const Semester = require('../models/Semester');

async function getSemesterById(id) {
  return await Semester.findByPk(id);
}

async function getAllSemesters() {
  return await Semester.findAll();
}

async function createSemester(data) {
  return await Semester.create(data);
}

module.exports = {
  getSemesterById,
  getAllSemesters,
  createSemester,
};