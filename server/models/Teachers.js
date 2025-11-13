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

Teacher.associate = (db) => {
  if (db.User) {
    Teacher.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
  }
};

module.exports = Teacher;