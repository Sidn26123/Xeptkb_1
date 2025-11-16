const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const ScheduleChangeRequest = sequelize.define('ScheduleChangeRequest', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  schedule_instance_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'FK to schedule_instances'
  },
  request_type: {
    type: DataTypes.ENUM('room_change','time_change','teacher_change','cancellation'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending','under_review','approved','rejected','applied','cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  requested_by_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  requested_by_role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  old_room_id: { type: DataTypes.INTEGER },
  old_time_slot_id: { type: DataTypes.INTEGER },
  old_date: { type: DataTypes.DATEONLY },
  old_teacher_id: { type: DataTypes.INTEGER },

  new_room_id: { type: DataTypes.INTEGER },
  new_time_slot_id: { type: DataTypes.INTEGER },
  new_date: { type: DataTypes.DATEONLY },
  new_teacher_id: { type: DataTypes.INTEGER },

  change_from_date: { type: DataTypes.DATEONLY },
  change_to_date: { type: DataTypes.DATEONLY },
}, {
  tableName: 'schedule_change_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

ScheduleChangeRequest.associate = (models) => {
  ScheduleChangeRequest.belongsTo(models.ScheduleInstance || require('./ScheduleInstances'), {
    foreignKey: 'schedule_instance_id',
    as: 'scheduleInstance'
  });

  ScheduleChangeRequest.belongsTo(models.User || require('./User'), {
    foreignKey: 'requested_by_user_id',
    as: 'requestedBy'
  });

  ScheduleChangeRequest.belongsTo(models.Room || require('./Rooms'), {
    foreignKey: 'old_room_id',
    as: 'oldRoom'
  });
  ScheduleChangeRequest.belongsTo(models.Room || require('./Rooms'), {
    foreignKey: 'new_room_id',
    as: 'newRoom'
  });

  ScheduleChangeRequest.belongsTo(models.Teacher || require('./Teachers'), {
    foreignKey: 'old_teacher_id',
    as: 'oldTeacher'
  });
  ScheduleChangeRequest.belongsTo(models.Teacher || require('./Teachers'), {
    foreignKey: 'new_teacher_id',
    as: 'newTeacher'
  });

  ScheduleChangeRequest.belongsTo(models.TimeSlot || require('./TimeSlot'), {
    foreignKey: 'old_time_slot_id',
    as: 'oldTimeSlot'
  });
  ScheduleChangeRequest.belongsTo(models.TimeSlot || require('./TimeSlot'), {
    foreignKey: 'new_time_slot_id',
    as: 'newTimeSlot'
  });
};

module.exports = ScheduleChangeRequest;
