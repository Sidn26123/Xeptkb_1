const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const AcademicYear = sequelize.define('AcademicYear', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  year_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: false, // Changed to false to not create index when alter = true
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
}, {
  tableName: 'academicyears',
  timestamps: false,
});

module.exports = AcademicYear;