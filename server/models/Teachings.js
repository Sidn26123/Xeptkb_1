const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const Teaching = sequelize.define('Teaching', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  course_class_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'teachings',
  timestamps: false,
});
Teaching.associate = (models) => {
  // Teaching thuộc về CourseClass (1:N)
  Teaching.belongsTo(models.CourseClass, {
    foreignKey: 'course_class_id',
    as: 'courseclass' // Tên alias cho quan hệ
  });

  // Teaching thuộc về Teacher (1:N)
  Teaching.belongsTo(models.Teacher, {
    foreignKey: 'teacher_id',
    as: 'teacher' // Tên alias cho quan hệ
  });
};
module.exports = Teaching;