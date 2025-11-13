const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const Semester = sequelize.define('Semester', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  AcademicYearsid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: 'academicyears',
        key: 'id',
    }
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  start: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  end: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
}, {
  tableName: 'semesters',
  timestamps: false,
});
Semester.associate = (models) => {
  Semester.hasMany(models.CourseClass, {
    foreignKey: 'semester_id',
    as: 'courseclasses'
  });
  Semester.hasMany(models.ScheduleGeneration, {
    foreignKey: 'semester_id',
    as: 'generations',
  });
};
module.exports = Semester;