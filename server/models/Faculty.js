const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const Faculty = sequelize.define('Faculty', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  faculty_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: false,
  },
}, {
  tableName: 'faculty',
  timestamps: false,
});

module.exports = Faculty;