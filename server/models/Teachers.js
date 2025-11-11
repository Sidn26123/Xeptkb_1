const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const Teacher = sequelize.define('Teacher', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  teacher_identifier: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  faculty_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'teachers',
  timestamps: false,
});
Teacher.associate = (models) => {
  Teacher.hasMany(models.CourseClass, {
    foreignKey: 'teacher_id',
    as: 'courseclasses'
  });
};
Teacher.associate = (models) => {
  // Quan hệ 1:N thông qua bảng trung gian Teaching
  Teacher.hasMany(models.Teaching, {
    foreignKey: 'teacher_id',
    as: 'teachings'
  });

  // **Quan hệ Many-to-Many với CourseClass thông qua bảng Teaching**
  Teacher.belongsToMany(models.CourseClass, {
    through: models.Teaching,
    foreignKey: 'teacher_id',
    otherKey: 'course_class_id',
    as: 'courseclassesTaught' // Đổi tên alias để phân biệt với hasMany nếu cần
  });

  Teacher.belongsTo(models.Faculty, {
    foreignKey: 'faculty_id',
    as: 'faculty'
  });
};

module.exports = Teacher;