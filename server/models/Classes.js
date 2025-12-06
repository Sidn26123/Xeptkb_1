const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
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
  training_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'trainingtypes', key: 'id' }
  },
  faculty_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'faculty', key: 'id' }
  },
}, {
  tableName: 'classes',
  timestamps: false,
  indexes: [
    { fields: ['training_type_id'] },
    { fields: ['faculty_id'] }
  ],
});

// ASSOCIATIONS
Class.associate = (models) => {
  if (!models) return;

  // Quan hệ cũ
  if (models.Faculty) {
    Class.belongsTo(models.Faculty, { foreignKey: 'faculty_id', as: 'faculty' });
  }
  if (models.TrainingType) {
    Class.belongsTo(models.TrainingType, { foreignKey: 'training_type_id', as: 'trainingType' });
  }

  // === QUAN HỆ MỚI (Sửa đổi từ hasMany CourseClass cũ) ===

  // 1. Lấy thông tin chi tiết qua bảng trung gian
  // VD: class.getParticipatingGroups()
  if (models.CourseClassGroup) {
    Class.hasMany(models.CourseClassGroup, {
      foreignKey: 'class_id',
      as: 'participatingGroups'
    });
  }

  // 2. Lấy danh sách các lớp học phần mà lớp này tham gia
  // VD: class.getCourseClasses()
  if (models.CourseClass && models.CourseClassGroup) {
    Class.belongsToMany(models.CourseClass, {
      through: models.CourseClassGroup,
      foreignKey: 'class_id',
      otherKey: 'course_class_id',
      as: 'courseClasses'
    });
  }
};

module.exports = Class;