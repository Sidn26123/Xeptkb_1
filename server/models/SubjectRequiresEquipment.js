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
    references: {
      model: 'subjects',
      key: 'id',
    }
  },
  equipment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'equipments',
      key: 'id',
    }
  },
  require_quantity_per_person: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
}, {
  tableName: 'subjectrequiresequipment',
  timestamps: false,
  indexes: [
    { fields: ['subject_id'] },
    { fields: ['equipment_id'] }
  ],
});

module.exports = SubjectRequiresEquipment;