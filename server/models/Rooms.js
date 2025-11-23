const { DataTypes } = require('sequelize');
const sequelize = require('../config/initSequelize');

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  capacity_max: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  capacity_optimal: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  floor_number: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  buildings_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: 'buildings',
        key: 'id',
    }
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
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
  tableName: 'rooms',
  timestamps: false,
  indexes: [
    { fields: ['buildings_id'] }
  ],
});
Room.associate = (models) => {
  Room.hasMany(models.Schedule, {
    foreignKey: 'room_id',
    as: 'schedules'
  });
  Room.hasMany(models.ScheduleInstance, {
    foreignKey: 'room_id',
    as: 'instances',
  });
  // Liên kết tới Building (nếu có)
  Room.belongsTo(models.Building, {
    foreignKey: 'buildings_id',
    as: 'building'
  });

};
module.exports = Room;