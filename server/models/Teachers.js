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
  academic_title: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  gender: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  id_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  ethnicity: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  religion: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  place_of_birth: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  nationality: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'Việt Nam',
  },
  email_school: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  email_personal: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  teacher_identifier: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    unique: true,
  },
  faculty_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'teachers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
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
  Teacher.hasMany(models.Schedule, {
    foreignKey: 'teacher_id',
    as: 'schedules',
  });

  Teacher.hasMany(models.ScheduleInstance, {
    foreignKey: 'teacher_id',
    as: 'instances',
  });
};

Teacher.associate = (db) => {
  if (db.User) {
    Teacher.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
  }
};

module.exports = Teacher;