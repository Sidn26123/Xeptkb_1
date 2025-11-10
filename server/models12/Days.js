const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const Day = sequelize.define('Day', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
}, {
  tableName: 'days',
  timestamps: false,
});

module.exports = Day;