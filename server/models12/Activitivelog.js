const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const Activitivelog = sequelize.define('Activitivelog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  account_id: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'activitivelog',
  timestamps: false,
});

module.exports = Activitivelog;