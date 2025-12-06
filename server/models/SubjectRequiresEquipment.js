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

  type: {
    type: DataTypes.STRING(3),
    allowNull: true, // "lab", "lec"
  },

}, {
  tableName: 'subjectrequiresequipment',
  timestamps: false,
  indexes: [
    { fields: ['subject_id', 'type'] }
  ],
});

module.exports = SubjectRequiresEquipment;