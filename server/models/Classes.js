const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  training_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  faculty_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'classes',
  timestamps: false,
});

// Associations: Class -> Faculty
Class.associate = (db) => {
  if (db.Faculty) {
    Class.belongsTo(db.Faculty, { foreignKey: 'faculty_id', as: 'faculty' });
  }
};

module.exports = Class;