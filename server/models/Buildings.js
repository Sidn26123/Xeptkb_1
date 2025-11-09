const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const Building = sequelize.define('Building', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  campus_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: 'campus',
        key: 'id',
    }
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  floor_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
}, {
  tableName: 'buildings',
  timestamps: false,
});

module.exports = Building;