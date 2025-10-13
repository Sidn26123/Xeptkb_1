const Class = require('../models/Class');

async function getClassById(id) {
  return await Class.findByPk(id);
}

async function getAllClasses() {
  return await Class.findAll();
}

async function createClass(data) {
  return await Class.create(data);
}

module.exports = {
  getClassById,
  getAllClasses,
  createClass,
};