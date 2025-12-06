const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'classes',
      key: 'id',
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  student_identifier: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
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
  email_personal: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  email_school: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'students',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['class_id'] }
  ],
});

// Associations (will be called from models/index.js)
Student.associate = (db) => {
  if (db.User) {
    Student.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
  }
  // Thêm association tới lớp để có thể include thông tin lớp/khoa
  if (db.Class) {
    Student.belongsTo(db.Class, { foreignKey: 'class_id', as: 'class' });
  }
};

module.exports = Student;