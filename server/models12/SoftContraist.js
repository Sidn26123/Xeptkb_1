const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const SoftContraist = sequelize.define('SoftContraist', {
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
}, {
  tableName: 'softcontraist',
  timestamps: false,
});

module.exports = SoftContraist;