const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const Constraints = sequelize.define('Constraints', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  weight:{
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    },
  type: {
    type: DataTypes.ENUM('H', 'S'),
    allowNull: false,
    defaultValue: 'S',
  }
}, {
  tableName: 'constraints',
  timestamps: false,
});

module.exports = Constraints;