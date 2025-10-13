const Subject = require('../models/Subject');

async function getSubjectById(id) {
  return await Subject.findByPk(id);
}

async function getAllSubjects() {
  return await Subject.findAll();
}

async function createSubject(data) {
  return await Subject.create(data);
}

module.exports = {
  getSubjectById,
  getAllSubjects,
  createSubject,
};