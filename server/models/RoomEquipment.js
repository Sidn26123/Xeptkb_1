const {DataTypes} = require('sequelize');
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
        references: {
            model: 'equipments',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'

    },
  room_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'rooms',
      key: 'id',
    }
  },
  equipment_quantity: {
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
  indexes: [
    { fields: ['equipment_id'] },
    { fields: ['room_id'] }
  ],
});module.exports = RoomEquipment;