const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const RoomEquipment = sequelize.define('RoomEquipment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  equipment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  room_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
}, {
  tableName: 'roomsequipments',
  timestamps: false,
});

module.exports = RoomEquipment;