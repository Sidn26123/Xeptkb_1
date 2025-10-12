const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const HolidayRule = sequelize.define('HolidayRule', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  day_end: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  is_lunar: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  recurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  day_start: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'holidayrule',
  timestamps: false,
});

module.exports = HolidayRule;