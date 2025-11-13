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
    references: {
      model: 'trainingtypes',
      key: 'id',
    }
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
  credits: {
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
  indexes: [
    { fields: ['training_type_id'] }
  ],
});

Subject.associate = (models) => {
  Subject.hasMany(models.CourseClass, {
    foreignKey: 'subject_id',
    as: 'courseclasses'
  });
  Subject.belongsTo(models.TrainingType, {
    foreignKey: 'training_type_id',
    as: 'trainingType'
  });
};

module.exports = Subject;