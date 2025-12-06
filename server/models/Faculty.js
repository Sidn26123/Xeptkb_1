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
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'faculty',
  timestamps: false,
  indexes: [
    { fields: ['faculty_id'] }
  ],
});

module.exports = Faculty;