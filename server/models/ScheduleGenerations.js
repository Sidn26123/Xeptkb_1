const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');
//metadata về lần generate lịch
const ScheduleGeneration = sequelize.define("ScheduleGeneration", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  // lưu metadata
  semester: {
    type: DataTypes.STRING(50), // "2024-2025-1"
    allowNull: true,
  },
  semester_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'semesters',
      key: 'id',
    }
  },
  total_weeks: {
    type: DataTypes.INTEGER,
  },
  days_per_week: {
    type: DataTypes.INTEGER,
  },
  sessions_per_day: {
    type: DataTypes.INTEGER,
  },
  session_duration: {
    type: DataTypes.INTEGER,
  },

  // thời điểm generate
  generated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },

  // lưu tổng fitness
  fitness_score: {
    type: DataTypes.FLOAT,
  },

  // JSON lưu penalty chi tiết
  penalty_breakdown: {
    type: DataTypes.JSON,
    defaultValue: {},
  },

  // Option: lưu luôn full JSON để trace
  raw_json: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: "schedule_generations",
  timestamps: false,
});
ScheduleGeneration.associate = (models) => {
  ScheduleGeneration.hasMany(models.Schedule, {
    foreignKey: 'generation_id',
    as: 'schedules'
  });
  ScheduleGeneration.belongsTo(models.Semester, {
    foreignKey: 'semester_id',
    as: 'semesterInfo'
  });
};
module.exports = ScheduleGeneration;
