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
    start_hour: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  start_min: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  end_hour: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  end_min: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  is_break: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  }
}, {
  tableName: 'timeslots',
  timestamps: false,
});
TimeSlot.associate = (models) => {
  TimeSlot.hasMany(models.Schedule, {
    foreignKey: 'time_slot_id',
    as: 'schedules'
  });
  TimeSlot.hasMany(models.InstructorUnavailableTime, {
    foreignKey: 'time_slot_id',
    as: 'unavailableTimes' // Tên alias mới để truy vấn
  });
};
module.exports = TimeSlot;