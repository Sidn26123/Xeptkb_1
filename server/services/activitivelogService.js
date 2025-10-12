const Activitivelog = require('../models/Activitivelog');

async function getActivitivelogById(id) {
  return await Activitivelog.findByPk(id);
}

async function getAllActivitivelogs() {
  return await Activitivelog.findAll();
}

async function createActivitivelog(data) {
  return await Activitivelog.create(data);
}

module.exports = {
  getActivitivelogById,
  getAllActivitivelogs,
  createActivitivelog,
};