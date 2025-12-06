const {DataTypes} = require('sequelize');
const sequelize = require('../config/initSequelize');

const CourseClass = sequelize.define('CourseClass', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'subjects', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
    },
    // Đã xóa class_id ở đây
    semester_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'semesters', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
    },
    teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'teachers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
    },
    slot: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    duration_per_session: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    session_per_week: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    total_enrollment: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    }
}, {
    tableName: 'courseclasses',
    timestamps: false,
    indexes: [
        { fields: ['subject_id'] },
        // { fields: ['class_id'] }, // Đã xóa index này
        { fields: ['semester_id'] },
        { fields: ['teacher_id'] }
    ],
});

// ASSOCIATIONS
CourseClass.associate = (models) => {
    // Các quan hệ cũ
    CourseClass.belongsTo(models.Subject, { foreignKey: 'subject_id', as: 'subject' });
    CourseClass.belongsTo(models.Semester, { foreignKey: 'semester_id', as: 'semester' });
    CourseClass.belongsTo(models.Teacher, { foreignKey: 'teacher_id', as: 'teacher' });
    CourseClass.hasMany(models.Schedule, { foreignKey: 'course_class_id', as: 'schedules' });

    // === QUAN HỆ MỚI (N-N) ===

    // 1. Quan hệ trực tiếp với bảng trung gian (Để query check is_primary)
    // VD: courseClass.getClassGroups()
    CourseClass.hasMany(models.CourseClassGroup, {
        foreignKey: 'course_class_id',
        as: 'classGroups'
    });

    // 2. Quan hệ tắt (Shortcut) để lấy danh sách Lớp SV trực tiếp
    // VD: courseClass.getClasses()
    CourseClass.belongsToMany(models.Class, {
        through: models.CourseClassGroup,
        foreignKey: 'course_class_id',
        otherKey: 'class_id',
        as: 'classes'
    });
};

module.exports = CourseClass;