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

InstructorUnavailableTime.associate = (models) => {
  // Liên kết với Day (Thông qua day_id)
  InstructorUnavailableTime.belongsTo(models.Day, {
    foreignKey: 'day_id',
    as: 'day'
  });

  InstructorUnavailableTime.belongsTo(models.Teacher, {
    foreignKey: 'teacher_id',
    as: 'teacher'
  });

  InstructorUnavailableTime.belongsTo(models.TimeSlot, {
    foreignKey: 'time_slot_id',
    as: 'timeSlot'
  });
};
module.exports = InstructorUnavailableTime;