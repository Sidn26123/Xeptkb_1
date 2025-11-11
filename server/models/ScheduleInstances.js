const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const ScheduleInstance = sequelize.define('ScheduleInstance', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  schedule_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'FK to schedules (pattern)',
  },
  course_class_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'FK to courseclasses',
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Actual date of the session',
  },
  day_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'FK to days (for quick weekday filter)',
  },
  time_slot_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'FK to timeslots; NULL for unscheduled time',
  },
  time_slot_idx: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Denormalized idx from timeslots for sorting',
  },
  num_of_period: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: 'Number of consecutive periods',
  },
  room_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'FK to rooms; NULL if not assigned',
  },
  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'FK to teachers; NULL if not assigned',
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'cancelled', 'rescheduled', 'done', 'skipped'),
    allowNull: false,
    defaultValue: 'scheduled',
    comment: 'Session status',
  },
  cancel_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Reason for cancellation or skip',
  },
  replaced_by_instance_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'FK to new instance if rescheduled',
  },
  origin: {
    type: DataTypes.ENUM('auto', 'manual'),
    allowNull: false,
    defaultValue: 'auto',
    comment: 'Creation method',
  },
  scheduler: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Generator/user identifier',
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional data (original_time_slot, notes, etc)',
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'schedule_instances',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_schedule_id',
      fields: ['schedule_id'],
    },
    {
      name: 'idx_date',
      fields: ['date'],
    },
    {
      name: 'idx_course_date',
      fields: ['course_class_id', 'date'],
    },
    {
      name: 'idx_teacher_date',
      fields: ['teacher_id', 'date'],
    },
    {
      name: 'idx_room_date',
      fields: ['room_id', 'date'],
    },
    {
      name: 'idx_status',
      fields: ['status'],
    },
    {
      name: 'idx_status_date',
      fields: ['status', 'date'],
    },
    {
      name: 'ux_course_date_slot',
      unique: true,
      fields: ['course_class_id', 'date', 'time_slot_id'],
    },
  ],
});

module.exports = ScheduleInstance;
