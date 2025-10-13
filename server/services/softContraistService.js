const SoftContraist = require('../models/SoftContraist');

async function getSoftContraistById(id) {
  return await SoftContraist.findByPk(id);
}

async function getAllSoftContraists() {
  return await SoftContraist.findAll();
}

async function createSoftContraist(data) {
  return await SoftContraist.create(data);
}

module.exports = {
  getSoftContraistById,
  getAllSoftContraists,
  createSoftContraist,
};