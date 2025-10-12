const AdminUser = require('../models/AdminUser');

async function getAdminUserById(id) {
  return await AdminUser.findByPk(id);
}

async function getAllAdminUsers() {
  return await AdminUser.findAll();
}

async function createAdminUser(data) {
  return await AdminUser.create(data);
}

module.exports = {
  getAdminUserById,
  getAllAdminUsers,
  createAdminUser,
};