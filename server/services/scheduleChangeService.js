const sequelize = require('../config/initSequelize');
const ScheduleChangeRequest = require('../models/ScheduleChangeRequests');
const ScheduleInstance = require('../models/ScheduleInstances');
const { Op } = require('sequelize');

/**
 * Create a schedule change request
 * payload: { schedule_instance_id, request_type, reason, new_room_id, new_time_slot_id, new_date, new_teacher_id, change_from_date, change_to_date }
 */
async function createRequest(payload, user) {
  // Defensive: accept several possible property names and coerce to integer
  const rawId = payload.schedule_instance_id || payload.scheduleInstanceId || payload.id || null;
  const instanceId = rawId !== null && rawId !== undefined ? parseInt(rawId, 10) : null;

  let instance = null;
  if (instanceId) {
    console.debug('createRequest: looking up ScheduleInstance by id=', instanceId);
    instance = await ScheduleInstance.findByPk(instanceId);
    if (!instance) {
      console.warn('createRequest: ScheduleInstance not found for id=', instanceId);
    }
  }

  // Fallback: try to locate instance from provided old_* fields (dateISO, time slot, teacher, room)
  if (!instance) {
    const oldDate = payload.old_date || payload.date || payload.oldDate || null;
    const oldTimeSlot = payload.old_time_slot_id || payload.oldTimeSlotId || payload.time_slot_id || null;
    const oldTeacher = payload.old_teacher_id || payload.oldTeacherId || payload.teacher_id || null;
    const oldRoom = payload.old_room_id || payload.oldRoomId || payload.room_id || null;

    if (oldDate) {
      const where = { date: oldDate };
      if (oldTimeSlot) where.time_slot_id = oldTimeSlot;
      // Attempt to match teacher or room if provided
      const orClauses = [];
      if (oldTeacher) orClauses.push({ teacher_id: oldTeacher });
      if (oldRoom) orClauses.push({ room_id: oldRoom });

      const findOpts = { where };
      if (orClauses.length > 0) {
        findOpts.where = { ...where, [Op.or]: orClauses };
      }

      try {
        instance = await ScheduleInstance.findOne(findOpts);
        if (instance) console.debug('createRequest: found instance by fallback lookup id=', instance.id);
      } catch (err) {
        console.error('createRequest: error during fallback lookup', err);
      }
    }
  }

  if (!instance) {
    console.error('createRequest: missing schedule_instance_id in payload and fallback lookup failed', payload);
    throw new Error('Missing schedule_instance_id');
  }

  // Normalize request_type values coming from frontend
  const rawType = payload.request_type || payload.type || null;
  let requestType = rawType;
  if (rawType === 'date_change' || rawType === 'date-change') {
    // legacy frontend used 'date_change' — DB expects 'time_change'
    requestType = 'time_change';
  }

  // Validate requestType against allowed enum
  const allowedTypes = ['room_change','time_change','teacher_change','cancellation'];
  if (!allowedTypes.includes(requestType)) {
    console.error('createRequest: invalid request_type', requestType, 'allowed=', allowedTypes);
    throw new Error('Invalid request_type: ' + requestType);
  }

  const scr = await ScheduleChangeRequest.create({
    schedule_instance_id: instance.id,
    request_type: requestType,
    status: 'pending',
    requested_by_user_id: user.id,
    requested_by_role: user.role || 'teacher',
    reason: payload.reason || null,

    old_room_id: instance.room_id,
    old_time_slot_id: instance.time_slot_id,
    old_date: instance.date,
    old_teacher_id: instance.teacher_id,

    new_room_id: payload.new_room_id || null,
    new_time_slot_id: payload.new_time_slot_id || null,
    new_date: payload.new_date || null,
    new_teacher_id: payload.new_teacher_id || null,

    change_from_date: payload.change_from_date || null,
    change_to_date: payload.change_to_date || null,
  });

  return scr;
}

async function listRequests(filters = {}) {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.request_type) where.request_type = filters.request_type;
  if (filters.requested_by_user_id) where.requested_by_user_id = filters.requested_by_user_id;
  if (filters.schedule_instance_id) where.schedule_instance_id = filters.schedule_instance_id;

  const rows = await ScheduleChangeRequest.findAll({ where, order: [['created_at','DESC']] });
  return rows;
}

async function getRequestById(id) {
  const r = await ScheduleChangeRequest.findByPk(id, {
    include: [
      {
        model: ScheduleInstance,
        as: 'scheduleInstance',
        include: [
          { model: require('../models/Rooms'), as: 'room' },
          { model: require('../models/Teachers'), as: 'teacher' },
          { model: require('../models/TimeSlot'), as: 'timeSlot' }
        ]
      }
    ]
  });
  if (!r) throw new Error('Request not found');

  // Enrich with names/codes
  const enriched = r.toJSON();
  if (r.scheduleInstance) {
    enriched.old_room_code = r.scheduleInstance.room?.code;
    enriched.old_teacher_name = r.scheduleInstance.teacher?.name;
    enriched.old_teacher_code = r.scheduleInstance.teacher?.teacher_identifier;
    enriched.old_time_slot_name = r.scheduleInstance.timeSlot?.name;
  }

  // For new values, need to fetch separately if IDs present
  if (enriched.new_room_id) {
    const newRoom = await require('../models/Rooms').findByPk(enriched.new_room_id);
    enriched.new_room_code = newRoom?.code;
  }
  if (enriched.new_teacher_id) {
    const newTeacher = await require('../models/Teachers').findByPk(enriched.new_teacher_id);
    enriched.new_teacher_name = newTeacher?.name;
    enriched.new_teacher_code = newTeacher?.teacher_identifier;
  }
  if (enriched.new_time_slot_id) {
    const newTimeSlot = await require('../models/TimeSlot').findByPk(enriched.new_time_slot_id);
    enriched.new_time_slot_name = newTimeSlot?.name;
  }

  return enriched;
}

async function approveRequest(id, adminUser, updates = {}) {
  const r = await ScheduleChangeRequest.findByPk(id);
  if (!r) throw new Error('Request not found');
  if (r.status !== 'pending' && r.status !== 'under_review') throw new Error('Request cannot be approved in current state');

  await r.update({
    status: 'approved',
    new_room_id: updates.new_room_id !== undefined ? updates.new_room_id : r.new_room_id,
    new_time_slot_id: updates.new_time_slot_id !== undefined ? updates.new_time_slot_id : r.new_time_slot_id,
    new_date: updates.new_date !== undefined ? updates.new_date : r.new_date,
    new_teacher_id: updates.new_teacher_id !== undefined ? updates.new_teacher_id : r.new_teacher_id,
  });

  return r;
}

/**
 * Apply an approved request atomically: update schedule_instances and mark request applied
 */
async function applyRequest(id, adminUser) {
  const transaction = await sequelize.transaction();
  try {
    const r = await ScheduleChangeRequest.findByPk(id, { transaction });
    if (!r) throw new Error('Request not found');
    if (r.status !== 'approved') throw new Error('Only approved requests can be applied');

    const instance = await ScheduleInstance.findByPk(r.schedule_instance_id, { transaction });
    if (!instance) throw new Error('Schedule instance not found');

    const updates = {};
    if (r.new_room_id) updates.room_id = r.new_room_id;
    if (r.new_time_slot_id) updates.time_slot_id = r.new_time_slot_id;
    if (r.new_teacher_id) updates.teacher_id = r.new_teacher_id;
    if (r.new_date) updates.date = r.new_date;

    // If there are no updates, still mark applied
    if (Object.keys(updates).length > 0) {
      await instance.update(updates, { transaction });
    }

    await r.update({ status: 'applied' }, { transaction });

    await transaction.commit();
    return { success: true, request: r, instance };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function rejectRequest(id, adminUser, reason) {
  const r = await ScheduleChangeRequest.findByPk(id);
  if (!r) throw new Error('Request not found');
  if (r.status === 'applied') throw new Error('Cannot reject an applied request');
  await r.update({ status: 'rejected' });
  return r;
}

module.exports = {
  createRequest,
  listRequests,
  getRequestById,
  approveRequest,
  applyRequest,
  rejectRequest
};
