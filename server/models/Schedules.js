const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');
// Biểu diễn mẫu thời khóa biểu (TKB)
const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  course_class_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: "courseclasses",
        key: "id",
    }
  },
  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: null,
    references: {
      model: "teachers", // (Giả sử bạn có bảng teachers)
      key: "id",
    }
  },
  day_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: "days",
        key: "id",
    }
  },
  room_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: "rooms",
        key: "id",
    }
  },
  time_slot_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
        model: "timeslots",
        key: "id",
    }
  },
  scheduler: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  num_of_period: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  //Lưu index tuần, tuan 1 la tuan week_start ở generation, cụ thể của schedule cua 1 course class
  week_start: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  week_end: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  generation_id: {   // <-- thêm dòng này
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "schedule_generations",
      key: "id",
    }
  }
}, {
  tableName: 'schedules',
  timestamps: false,
  indexes: [{
    unique: true,
    fields: ['generation_id', 'course_class_id', 'day_id', 'time_slot_id']
  }]
});

Schedule.associate = (models) => {
  Schedule.belongsTo(models.CourseClass, {
    foreignKey: 'course_class_id',
    as: 'courseClass'
  });
  Schedule.belongsTo(models.Day, {
    foreignKey: 'day_id',
    as: 'day'
  });
  Schedule.belongsTo(models.Room, {
    foreignKey: 'room_id',
    as: 'room'
  });
  Schedule.belongsTo(models.TimeSlot, {
    foreignKey: 'time_slot_id',
    as: 'timeSlot'
  });
  Schedule.belongsTo(models.ScheduleGeneration, {
    foreignKey: 'generation_id',
    as: 'generation'
  });
  Schedule.belongsTo(models.Teacher, {
    foreignKey: 'teacher_id',
    as: 'teacher'
  });
  Schedule.hasMany(models.ScheduleInstance, {
    foreignKey: 'schedule_id',
    as: 'instances'
  });
};

module.exports = Schedule;