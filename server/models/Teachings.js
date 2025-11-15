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
    references: {
      model: 'courseclasses',
      key: 'id',
    }
  },
  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teachers',
      key: 'id',
    }
  },
}, {
  tableName: 'teachings',
  timestamps: false,
  indexes: [
    { fields: ['course_class_id'] },
    { fields: ['teacher_id'] }
  ],
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