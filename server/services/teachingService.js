const Teaching = require('../models/Teaching');

async function getTeachingById(id) {
  return await Teaching.findByPk(id);
}

async function getAllTeachings() {
  return await Teaching.findAll();
}

async function createTeaching(data) {
  return await Teaching.create(data);
}

module.exports = {
  getTeachingById,
  getAllTeachings,
  createTeaching,
};