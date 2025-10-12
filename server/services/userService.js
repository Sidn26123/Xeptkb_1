const User = require('../models/user');

async function getUserByUsername(username) {
  return await User.findOne({ where: { username } });
}

async function getAllUsers() {
  return await User.findAll();
}

async function createUser(data) {
  return await User.create(data);
}

function verifyPassword(inputPassword, userPassword) {
  return inputPassword === userPassword;
}

module.exports = {
  getUserByUsername,
  getAllUsers,
  createUser,
  verifyPassword,
};