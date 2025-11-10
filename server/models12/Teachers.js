const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const Teacher = sequelize.define('Teacher', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  teacher_identifier: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  faculty_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'teachers',
  timestamps: false,
});

module.exports = Teacher;