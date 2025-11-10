const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');
const Subject = sequelize.define('Subject', {
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
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  theory_hours: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  self_study_hours: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  practice_hours: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  requires_lab: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'subjects',
  timestamps: false,
});

Subject.associate = (models) => {
  Subject.hasMany(models.CourseClass, {
    foreignKey: 'subject_id',
    as: 'courseclasses'
  });
};

module.exports = Subject;