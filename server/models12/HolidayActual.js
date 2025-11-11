const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const HolidayActual = sequelize.define('HolidayActual', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  semester_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'semesters',
      key: 'id'
    }
  },
  rule_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'holidayrule',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
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
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'holidayactual',
  timestamps: false,
});

module.exports = HolidayActual;