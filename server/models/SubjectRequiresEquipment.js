const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const SubjectRequiresEquipment = sequelize.define('SubjectRequiresEquipment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  subject_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  equipment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  require_quantity_per_person: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
}, {
  tableName: 'subjectrequiresequipment',
  timestamps: false,
});

module.exports = SubjectRequiresEquipment;