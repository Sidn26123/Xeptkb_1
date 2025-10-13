const Teacher = require('../models/Teachers');

async function getTeacherById(id) {
  return await Teacher.findByPk(id);
}

async function getAllTeachers() {
  return await Teacher.findAll();
}

async function createTeacher(data) {
  return await Teacher.create(data);
}

module.exports = {
  getTeacherById,
  getAllTeachers,
  createTeacher,
};