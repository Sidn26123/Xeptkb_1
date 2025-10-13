const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const CourseClass = sequelize.define('CourseClass', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  subject_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  semester_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'courseclasses',
  timestamps: false,
});

module.exports = CourseClass;