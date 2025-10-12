const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const Semester = sequelize.define('Semester', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  year_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  start: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  end: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
}, {
  tableName: 'semesters',
  timestamps: false,
});

module.exports = Semester;