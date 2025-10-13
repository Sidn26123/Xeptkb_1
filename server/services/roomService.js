const Room = require('../models/Room');

async function getRoomById(id) {
  return await Room.findByPk(id);
}

async function getAllRooms() {
  return await Room.findAll();
}

async function createRoom(data) {
  return await Room.create(data);
}

module.exports = {
  getRoomById,
  getAllRooms,
  createRoom,
};