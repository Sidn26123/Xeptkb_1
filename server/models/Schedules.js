const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  course_class_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  day_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  time_slot_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  scheduler: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  num_of_period: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  generation_id: {   // <-- thêm dòng này
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "schedule_generations",
      key: "id",
    }
  }
}, {
  tableName: 'schedules',
  timestamps: false,
});

module.exports = Schedule;