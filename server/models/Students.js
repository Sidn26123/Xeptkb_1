const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: 'classes',
        key: 'id',
    }
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  student_identifier: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'students',
  timestamps: false,
});

module.exports = Student;