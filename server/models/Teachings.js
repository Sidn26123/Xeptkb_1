const { DataTypes } = require('sequelize');
const sequelize = require('./initSequelize');

const Teaching = sequelize.define('Teaching', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  course_class_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'teachings',
  timestamps: false,
});

module.exports = Teaching;