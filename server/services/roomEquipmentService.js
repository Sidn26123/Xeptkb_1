const RoomEquipment = require('../models/RoomEquipment');

async function getRoomEquipmentById(id) {
  return await RoomEquipment.findByPk(id);
}

async function getAllRoomEquipments() {
  return await RoomEquipment.findAll();
}

async function createRoomEquipment(data) {
  return await RoomEquipment.create(data);
}

module.exports = {
  getRoomEquipmentById,
  getAllRoomEquipments,
  createRoomEquipment,
};