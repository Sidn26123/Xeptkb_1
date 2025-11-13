const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const Holidayrule = sequelize.define('Holidayrule', {
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
  day_start: {
    type: DataTypes.STRING(5),
    allowNull: true,
  },
  day_end: {
    type: DataTypes.STRING(5),
    allowNull: true,
  },
  is_lunar: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  recurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'holidayrule',
  timestamps: false,
});



module.exports = Holidayrule;
