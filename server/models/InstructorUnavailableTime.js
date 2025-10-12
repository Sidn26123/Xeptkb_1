const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const InstructorUnavailableTime = sequelize.define('InstructorUnavailableTime', {
  day_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  teacher_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  time_slot_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
}, {
  tableName: 'instructorsunavailabletime',
  timestamps: false,
});

module.exports = InstructorUnavailableTime;