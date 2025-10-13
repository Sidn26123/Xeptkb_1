const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const AdminUser = sequelize.define('AdminUser', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  account_id: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'adminuser',
  timestamps: false,
});

module.exports = AdminUser;