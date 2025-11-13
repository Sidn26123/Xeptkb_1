const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');
// Biểu diễn các buổi học cụ thể sinh ra từ mẫu TKB
const ScheduleInstance = sequelize.define('ScheduleInstance', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  // Link đến MẪU TKB. Đây là trường quan trọng nhất.
  schedule_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'FK to schedules (pattern)',
    references: {
      model: 'schedules',
      key: 'id'
    }
  },

  // Ngày diễn ra buổi học cụ thể
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },

  // === CÁC TRƯỜNG OVERRIDE (GHI ĐÈ) ===
  // Nếu NULL, lấy giá trị từ schedule_id (mẫu)
  // Nếu CÓ GIÁ TRỊ, dùng giá trị này (vì có thay đổi đột xuất)
  time_slot_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Override time slot (if NULL, use pattern)',
  },
  room_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Override room (if NULL, use pattern)',
  },
  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Override teacher (if NULL, use pattern)',
  },
  // === HẾT CÁC TRƯỜNG OVERRIDE ===

  // Trạng thái của buổi học này
  status: {
    type: DataTypes.ENUM('scheduled', 'cancelled', 'rescheduled', 'done', 'skipped'),
    allowNull: false,
    defaultValue: 'scheduled',
  },

  // Các thông tin riêng của instance
  cancel_reason: {
    type: DataTypes.TEXT,
  },
  replaced_by_instance_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'FK to new instance if rescheduled',
  },
  origin: {
    type: DataTypes.ENUM('auto', 'manual'), // 'auto' = sinh từ mẫu, 'manual' = thêm tay
    allowNull: false,
    defaultValue: 'auto',
  },
  metadata: {
    type: DataTypes.JSON, // Ghi chú thêm
  },
}, {
  tableName: 'schedule_instances',
  timestamps: true, // created_at, updated_at

  // Đảm bảo không có 2 buổi học của cùng 1 mẫu TKB trong cùng 1 ngày
  indexes: [{
    unique: true,
    fields: ['schedule_id', 'date']
  }]
});

//assiocate
ScheduleInstance.associate = (models) => {
  // Mẫu TKB gốc
  ScheduleInstance.belongsTo(models.Schedule, {
    foreignKey: 'schedule_id',
    as: 'schedule',
  });

  // Liên kết override
  ScheduleInstance.belongsTo(models.TimeSlot, {
    foreignKey: 'time_slot_id',
    as: 'timeSlot',
  });

  ScheduleInstance.belongsTo(models.Room, {
    foreignKey: 'room_id',
    as: 'room',
  });

  ScheduleInstance.belongsTo(models.Teacher, {
    foreignKey: 'teacher_id',
    as: 'teacher',
  });

  // Liên kết tự tham chiếu (reschedule / replaced)
  ScheduleInstance.belongsTo(models.ScheduleInstance, {
    foreignKey: 'replaced_by_instance_id',
    as: 'replacedBy',
  });

  ScheduleInstance.hasMany(models.ScheduleInstance, {
    foreignKey: 'replaced_by_instance_id',
    as: 'replacedInstances',
  });
};
module.exports = ScheduleInstance;
