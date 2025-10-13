const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const TrainingType = sequelize.define('TrainingType', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
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
  tableName: 'trainingtypes',
  timestamps: false,
});

module.exports = TrainingType;