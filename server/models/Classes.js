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
    references: {
        model: 'trainingtypes',
        key: 'id',
    }
  },
  faculty_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'faculty',
      key: 'id',
    }
  },
}, {
  tableName: 'classes',
  timestamps: false,
  indexes: [
    { fields: ['training_type_id'] },
    { fields: ['faculty_id'] }
  ],
});

// Associations: Class -> Faculty
// Register associations in a single function so nothing is overwritten.
Class.associate = (models) => {
  if (!models) return;

  // Class -> Faculty
  if (models.Faculty) {
    Class.belongsTo(models.Faculty, { foreignKey: 'faculty_id', as: 'faculty' });
  }

  // Class -> CourseClass (one-to-many)
  if (models.CourseClass) {
    Class.hasMany(models.CourseClass, {
      foreignKey: 'class_id',
      as: 'courseclasses'
    });
  }

  // Optional: link to TrainingType model if present
  if (models.TrainingType) {
    Class.belongsTo(models.TrainingType, { foreignKey: 'training_type_id', as: 'trainingType' });
  }
};
module.exports = Class;