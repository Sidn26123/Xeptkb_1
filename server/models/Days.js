const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');
//Day: Thể hện ngày trong tuần (Thứ 2, Thứ 3, ... Chủ nhật)
const Day = sequelize.define('Day', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  idx: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: false,
  }
}, {
  tableName: 'days',
  timestamps: false,
});
Day.associate = (models) => {
  Day.hasMany(models.Schedule, {
    foreignKey: 'day_id',
    as: 'schedules'
  });
  Day.hasMany(models.InstructorUnavailableTime, {
    foreignKey: 'day_id',
    as: 'unavailableTimes' // Tên alias mới để truy vấn
  });
};



module.exports = Day;