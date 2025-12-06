const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const CourseClassGroup = sequelize.define('CourseClassGroup', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    course_class_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'courseclasses', key: 'id' }
    },
    class_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'classes', key: 'id' }
    },
    is_primary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    tableName: 'course_class_groups',
    timestamps: false,
    indexes: [
        { fields: ['course_class_id'] },
        { fields: ['class_id'] }
    ]
});

// ASSOCIATION
CourseClassGroup.associate = (models) => {
    // 1. Liên kết về CourseClass
    CourseClassGroup.belongsTo(models.CourseClass, {
        foreignKey: 'course_class_id',
        as: 'courseClass',
        onDelete: 'CASCADE' // Xóa Lớp học phần -> Xóa luôn record nhóm này
    });

    // 2. Liên kết về Class (Lớp sinh viên)
    CourseClassGroup.belongsTo(models.Class, {
        foreignKey: 'class_id',
        as: 'studentClass', // Đặt tên khác đi chút cho đỡ nhầm với model Class
        onDelete: 'CASCADE' // Xóa Lớp SV -> Xóa luôn record nhóm này
    });
};

module.exports = CourseClassGroup;