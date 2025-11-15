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
        references: {
            model: 'subjects',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
    },
    class_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'classes',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
    },
    semester_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'semesters',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
    },
    teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'teachers',
            key: 'id',
        },
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
}, {
    tableName: 'courseclasses',
    timestamps: false,
    indexes: [
        { fields: ['subject_id'] },
        { fields: ['class_id'] },
        { fields: ['semester_id'] },
        { fields: ['teacher_id'] }
    ],
});
// Associations
CourseClass.associate = (models) => {
    CourseClass.belongsTo(models.Subject, { foreignKey: 'subject_id', as: 'subject' });
    CourseClass.belongsTo(models.Class, { foreignKey: 'class_id', as: 'class' });
    CourseClass.belongsTo(models.Semester, { foreignKey: 'semester_id', as: 'semester' });
    CourseClass.belongsTo(models.Teacher, { foreignKey: 'teacher_id', as: 'teacher' });
    CourseClass.hasMany(models.Schedule, {
        foreignKey: 'course_class_id',
        as: 'schedules'
    });
};
module.exports = CourseClass;