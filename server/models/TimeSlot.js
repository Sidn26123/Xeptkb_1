const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const TimeSlot = sequelize.define('TimeSlot', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  idx: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'timeslots',
  timestamps: false,
});

module.exports = TimeSlot;