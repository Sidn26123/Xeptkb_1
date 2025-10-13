const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const HolidayActual = sequelize.define('HolidayActual', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  rule_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
}, {
  tableName: 'holidayactual',
  timestamps: false,
});

module.exports = HolidayActual;