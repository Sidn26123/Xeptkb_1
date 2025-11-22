const { Op } = require('sequelize');
const db = require('../models');

// Lightweight schedule change helper
// Exports: proposeOptions(params)

function getOccupiedSlots(startIdx, duration) {
  const slots = [];
  for (let i = 0; i < duration; i++) slots.push(startIdx + i);
  return slots;
}

async function loadCachedData() {
  // load timeslots, rooms, room equipments, subject requires
  const timeslots = await db.TimeSlot.findAll({ order: [['idx', 'ASC']] });
  const rooms = await db.Room.findAll();
  const roomEquipRows = await db.RoomEquipment.findAll();
  const roomEquipMap = {};
  roomEquipRows.forEach(r => {
    roomEquipMap[r.room_id] = roomEquipMap[r.room_id] || new Set();
    roomEquipMap[r.room_id].add(r.equipment_id);
  });
  
  // Create timeslot id -> idx mapping
  const timeslotIdxMap = {};
  timeslots.forEach(t => {
    timeslotIdxMap[t.id] = t.idx;
  });
  
  return { timeslots, rooms, roomEquipMap, timeslotIdxMap };
}

async function proposeOptions({ date, teacherId, courseClassId, prefer = 'room', maxCandidates = null, semesterId = null, excludeInstanceId = null }) {
  if (!date || !courseClassId) return { success: false, reason: 'invalid_input' };

  // Past date
  const now = new Date();
  if (new Date(date) < new Date(now.toDateString())) return { success: false, reason: 'date_in_past' };

  const { timeslots, rooms, roomEquipMap, timeslotIdxMap } = await loadCachedData();
  const maxIdx = Math.max(...timeslots.map(t => t.idx));
  const breakSlotIdxs = timeslots.filter(t => t.is_break).map(t => t.idx);

  // course class data
  const courseClass = await db.CourseClass.findByPk(courseClassId, { include: [ { model: db.Class, as: 'class' }, { model: db.Subject, as: 'subject' } ] });
  if (!courseClass) return { success: false, reason: 'invalid_courseclass' };
  const duration = courseClass.duration_per_session || 2;
  const subjectId = courseClass.subject_id;
  const targetClassId = courseClass.class_id;

  // Get the current instance's room to exclude it from proposals
  let excludeRoomId = null;
  if (excludeInstanceId) {
    const currentInstance = await db.ScheduleInstance.findByPk(excludeInstanceId);
    if (currentInstance) {
      excludeRoomId = currentInstance.room_id;
      if (process.env.DEBUG_SCHEDULE_CHANGE === '1') {
        console.log('[DEBUG] Current instance room to exclude:', excludeRoomId);
      }
    }
  }

  // If caller didn't provide an explicit instance id, try to auto-detect the
  // ScheduleInstance for this courseClass on the given date so that the
  // instance won't block itself and its room can be excluded from proposals.
  if (!excludeInstanceId) {
    try {
      const sameInstance = await db.ScheduleInstance.findOne({
        where: { date, status: 'scheduled' },
        include: [{ model: db.Schedule, as: 'schedule', where: { course_class_id: courseClassId } }]
      });
      if (sameInstance) {
        excludeInstanceId = sameInstance.id;
        excludeRoomId = sameInstance.room_id;
        if (process.env.DEBUG_SCHEDULE_CHANGE === '1') {
          console.log('[DEBUG] Auto-detected current instance to exclude:', excludeInstanceId, 'room:', excludeRoomId);
        }
      }
    } catch (e) {
      if (process.env.DEBUG_SCHEDULE_CHANGE === '1') console.log('[DEBUG] auto-detect instance failed:', e && e.message ? e.message : e);
    }
  }

  // holiday check (try semester-specific first, then global)
  if (semesterId) {
    const holiday = await db.HolidayActual.findOne({ where: { semester_id: semesterId, start_date: { [Op.lte]: date }, end_date: { [Op.gte]: date } } });
    if (holiday) return { success: false, reason: 'date_is_holiday', holiday: holiday.name };
  }
  // also check global holidays (cover cases where semesterId is not provided)
  const globalHoliday = await db.HolidayActual.findOne({ where: { start_date: { [Op.lte]: date }, end_date: { [Op.gte]: date } } });
  if (globalHoliday) return { success: false, reason: 'date_is_holiday', holiday: globalHoliday.name };

  // teacher recurring availability: map date -> day_id
  const d = new Date(date);
  const jsDay = d.getDay();
  const dayId = jsDay === 0 ? 7 : jsDay;

  // Disallow Sundays (day_id = 7)
  if (dayId === 7) {
    return { success: false, reason: 'sunday_not_allowed' };
  }

  const teacherUnavailableSlots = await db.InstructorUnavailableTime.findAll({ where: { teacher_id: teacherId, day_id: dayId } });
  const teacherUnavailableSlotIds = new Set(teacherUnavailableSlots.map(t => t.time_slot_id));

  // busy instances on date - eager load all necessary data
  // Exclude the instance being changed so it doesn't block itself
  
  const whereClause = { date, status: 'scheduled' };
  if (excludeInstanceId) {
    // Ensure excludeInstanceId is treated as integer for comparison
    const excludeId = parseInt(excludeInstanceId, 10);
    whereClause.id = { [Op.ne]: excludeId };
  }
  const busyInstances = await db.ScheduleInstance.findAll({ 
    where: whereClause, 
    include: [
      { model: db.Schedule, as: 'schedule', include: [{ model: db.CourseClass, as: 'courseClass', include: [{ model: db.Class, as: 'class' }] }] },
      { model: db.TimeSlot, as: 'timeSlot' }
    ]
  });

  // Build busy maps for optimization
  const teacherBusyMap = new Map(); // startIdx -> duration
  const classBusyMap = new Map(); // class_id -> [{ startIdx, duration }]
  const roomBusyMap = new Map(); // room_id -> [{ startIdx, duration }]
  
  busyInstances.forEach(inst => {
    // Get actual time_slot_id (instance override or schedule default)
    const timeSlotId = inst.time_slot_id || (inst.schedule && inst.schedule.time_slot_id);
    if (!timeSlotId) return;
    
    const startIdx = timeslotIdxMap[timeSlotId];
    if (!startIdx) return;
    
    const duration = inst.schedule ? (inst.schedule.num_of_period || 1) : 1;
    
    // Teacher busy
    const teacherIdActual = inst.teacher_id || (inst.schedule && inst.schedule.courseClass && inst.schedule.courseClass.teacher_id);
    if (teacherIdActual) {
      if (!teacherBusyMap.has(teacherIdActual)) teacherBusyMap.set(teacherIdActual, []);
      teacherBusyMap.get(teacherIdActual).push({ startIdx, duration });
    }
    
    // Class busy
    if (inst.schedule && inst.schedule.courseClass && inst.schedule.courseClass.class_id) {
      const classId = inst.schedule.courseClass.class_id;
      if (!classBusyMap.has(classId)) classBusyMap.set(classId, []);
      classBusyMap.get(classId).push({ startIdx, duration });
    }
    
    // Room busy
    const roomIdActual = inst.room_id || (inst.schedule && inst.schedule.room_id);
    if (roomIdActual) {
      if (!roomBusyMap.has(roomIdActual)) roomBusyMap.set(roomIdActual, []);
      roomBusyMap.get(roomIdActual).push({ startIdx, duration });
    }
  });
  
  // Helper: check if two blocks overlap
  function blocksOverlap(startA, durationA, startB, durationB) {
    const endA = startA + durationA - 1;
    const endB = startB + durationB - 1;
    return !(endA < startB || endB < startA);
  }
  
  // Helper: check if a block conflicts with busy list
  function hasConflict(startIdx, duration, busyList) {
    if (!busyList) return false;
    return busyList.some(busy => blocksOverlap(startIdx, duration, busy.startIdx, busy.duration));
  }

  // Get required equipment ids
  const reqEquipRows = await db.SubjectRequiresEquipment.findAll({ where: { subject_id: subjectId } });
  const requiredEquipIds = reqEquipRows.map(r => r.equipment_id);

  const proposals = [];
  const scanned = { rooms: 0, slots: 0 };

  // generate candidate start slots (by idx)
  const slotIdxs = timeslots.map(t => t.idx);
  for (const startIdx of slotIdxs) {
    if (startIdx + duration - 1 > maxIdx) continue; // exceeds
    const overlap = getOccupiedSlots(startIdx, duration);
    if (overlap.some(o => breakSlotIdxs.includes(o))) continue; // touches break

    // check teacher recurring unavailability - check if any slot in overlap is blocked
    const timeslotIdsInOverlap = timeslots.filter(t => overlap.includes(t.idx)).map(t => t.id);
    const hasTeacherUnavailable = timeslotIdsInOverlap.some(tsId => teacherUnavailableSlotIds.has(tsId));
    if (hasTeacherUnavailable) continue;

    // check teacher conflicts on this date using pre-built map
    if (hasConflict(startIdx, duration, teacherBusyMap.get(teacherId))) continue;

    // check class conflict using pre-built map
    if (hasConflict(startIdx, duration, classBusyMap.get(targetClassId))) continue;

    scanned.slots += 1;

    // find available rooms for this block
    for (const room of rooms) {
      scanned.rooms += 1;
      
      // Exclude current room from proposals
      if (excludeRoomId && room.id === excludeRoomId) {
        if (process.env.DEBUG_SCHEDULE_CHANGE === '1') {
          console.log('[DEBUG] Excluding current room from proposals:', room.id, room.name);
        }
        continue;
      }
      
      // Check room conflict using pre-built map
      if (hasConflict(startIdx, duration, roomBusyMap.get(room.id))) continue;

      // capacity
      const studentCount = courseClass.slot || 0;
      if (room.capacity_max < studentCount) continue;

      // equipment
      if (requiredEquipIds.length > 0) {
        const equipSet = roomEquipMap[room.id] || new Set();
        const hasAll = requiredEquipIds.every(eid => equipSet.has(eid));
        if (!hasAll) continue;
      }

      // passed all hard checks -> accept proposal
      proposals.push({ room_id: room.id, room_name: room.name, room_code: room.code, start_slot: startIdx, occupied_slots: overlap, capacity: room.capacity_max });
      // If maxCandidates is provided (truthy), stop when reached. If null/undefined -> unlimited.
      if (maxCandidates && proposals.length >= maxCandidates) break;
    }

    if (maxCandidates && proposals.length >= maxCandidates) break;
  }

  if (proposals.length === 0) return { success: false, reason: 'no_available_slots', details: { date, checked_rooms: scanned.rooms, checked_slots: scanned.slots } };
  return { success: true, summary: { total_found: proposals.length, scanned_rooms: scanned.rooms, scanned_slots: scanned.slots, duration_per_session: duration }, proposals };
}

async function proposeRoomAlternatives({ date, teacherId, courseClassId, fixedTimeSlotId = null, excludeInstanceId = null, excludeRoomId = null, maxCandidates = null, semesterId = null }) {
  if (!date || !courseClassId) return { success: false, reason: 'invalid_input' };

  // Past date
  const now = new Date();
  if (new Date(date) < new Date(now.toDateString())) return { success: false, reason: 'date_in_past' };

  const { timeslots, rooms, roomEquipMap, timeslotIdxMap } = await loadCachedData();
  const breakSlotIdxs = timeslots.filter(t => t.is_break).map(t => t.idx);

  // course class data
  const courseClass = await db.CourseClass.findByPk(courseClassId, { include: [ { model: db.Class, as: 'class' }, { model: db.Subject, as: 'subject' } ] });
  if (!courseClass) return { success: false, reason: 'invalid_courseclass' };
  const duration = courseClass.duration_per_session || 2;
  const subjectId = courseClass.subject_id;
  const targetClassId = courseClass.class_id;

  // If excludeInstanceId provided, try to read instance for excludeRoomId or time slot
  if (excludeInstanceId) {
    try {
      const currentInstance = await db.ScheduleInstance.findByPk(excludeInstanceId);
      if (currentInstance) {
        excludeRoomId = excludeRoomId || currentInstance.room_id;
        fixedTimeSlotId = fixedTimeSlotId || currentInstance.time_slot_id || (currentInstance.schedule && currentInstance.schedule.time_slot_id);
      }
    } catch (e) {
      // ignore
    }
  }

  // If fixedTimeSlotId still not provided, try to auto-detect the instance for this courseClass on the date
  if (!fixedTimeSlotId) {
    try {
      const sameInstance = await db.ScheduleInstance.findOne({
        where: { date, status: 'scheduled' },
        include: [{ model: db.Schedule, as: 'schedule', where: { course_class_id: courseClassId } }]
      });
      if (sameInstance) {
        fixedTimeSlotId = sameInstance.time_slot_id || (sameInstance.schedule && sameInstance.schedule.time_slot_id);
        excludeRoomId = excludeRoomId || sameInstance.room_id;
      }
    } catch (e) {
      // ignore
    }
  }

  if (!fixedTimeSlotId) return { success: false, reason: 'invalid_timeslot' };

  // holiday checks
  if (semesterId) {
    const holiday = await db.HolidayActual.findOne({ where: { semester_id: semesterId, start_date: { [Op.lte]: date }, end_date: { [Op.gte]: date } } });
    if (holiday) return { success: false, reason: 'date_is_holiday', holiday: holiday.name };
  }
  const globalHoliday = await db.HolidayActual.findOne({ where: { start_date: { [Op.lte]: date }, end_date: { [Op.gte]: date } } });
  if (globalHoliday) return { success: false, reason: 'date_is_holiday', holiday: globalHoliday.name };

  const d = new Date(date);
  const jsDay = d.getDay();
  const dayId = jsDay === 0 ? 7 : jsDay;
  if (dayId === 7) return { success: false, reason: 'sunday_not_allowed' };

  const teacherUnavailableSlots = await db.InstructorUnavailableTime.findAll({ where: { teacher_id: teacherId, day_id: dayId } });
  const teacherUnavailableSlotIds = new Set(teacherUnavailableSlots.map(t => t.time_slot_id));

  // Build busy maps (exclude provided instance)
  const whereClause = { date, status: 'scheduled' };
  if (excludeInstanceId) whereClause.id = { [Op.ne]: parseInt(excludeInstanceId, 10) };
  const busyInstances = await db.ScheduleInstance.findAll({
    where: whereClause,
    include: [
      { model: db.Schedule, as: 'schedule', include: [{ model: db.CourseClass, as: 'courseClass', include: [{ model: db.Class, as: 'class' }] }] },
      { model: db.TimeSlot, as: 'timeSlot' }
    ]
  });

  const teacherBusyMap = new Map();
  const classBusyMap = new Map();
  const roomBusyMap = new Map();
  busyInstances.forEach(inst => {
    const timeSlotId = inst.time_slot_id || (inst.schedule && inst.schedule.time_slot_id);
    if (!timeSlotId) return;
    const startIdx = timeslotIdxMap[timeSlotId];
    if (!startIdx) return;
    const dur = inst.schedule ? (inst.schedule.num_of_period || 1) : 1;
    const teacherIdActual = inst.teacher_id || (inst.schedule && inst.schedule.courseClass && inst.schedule.courseClass.teacher_id);
    if (teacherIdActual) {
      if (!teacherBusyMap.has(teacherIdActual)) teacherBusyMap.set(teacherIdActual, []);
      teacherBusyMap.get(teacherIdActual).push({ startIdx, duration: dur });
    }
    if (inst.schedule && inst.schedule.courseClass && inst.schedule.courseClass.class_id) {
      const cid = inst.schedule.courseClass.class_id;
      if (!classBusyMap.has(cid)) classBusyMap.set(cid, []);
      classBusyMap.get(cid).push({ startIdx, duration: dur });
    }
    const roomIdActual = inst.room_id || (inst.schedule && inst.schedule.room_id);
    if (roomIdActual) {
      if (!roomBusyMap.has(roomIdActual)) roomBusyMap.set(roomIdActual, []);
      roomBusyMap.get(roomIdActual).push({ startIdx, duration: dur });
    }
  });

  function blocksOverlap(startA, durationA, startB, durationB) {
    const endA = startA + durationA - 1;
    const endB = startB + durationB - 1;
    return !(endA < startB || endB < startA);
  }
  function hasConflict(startIdx, dur, busyList) {
    if (!busyList) return false;
    return busyList.some(b => blocksOverlap(startIdx, dur, b.startIdx, b.duration));
  }

  const startIdx = timeslotIdxMap[fixedTimeSlotId];
  if (!startIdx && startIdx !== 0) return { success: false, reason: 'invalid_timeslot' };
  const overlap = getOccupiedSlots(startIdx, duration);
  if (overlap.some(o => breakSlotIdxs.includes(o))) return { success: false, reason: 'timeslot_touches_break' };

  const timeslotIdsInOverlap = timeslots.filter(t => overlap.includes(t.idx)).map(t => t.id);
  const hasTeacherUnavailable = timeslotIdsInOverlap.some(tsId => teacherUnavailableSlotIds.has(tsId));
  if (hasTeacherUnavailable) return { success: false, reason: 'teacher_unavailable_at_this_time' };

  // check teacher & class conflicts
  if (hasConflict(startIdx, duration, teacherBusyMap.get(teacherId))) return { success: false, reason: 'teacher_busy_at_this_time' };
  if (hasConflict(startIdx, duration, classBusyMap.get(targetClassId))) return { success: false, reason: 'class_busy_at_this_time' };

  // required equipment
  const reqEquipRows = await db.SubjectRequiresEquipment.findAll({ where: { subject_id: subjectId } });
  const requiredEquipIds = reqEquipRows.map(r => r.equipment_id);

  const proposals = [];
  const studentCount = courseClass.slot || 0;

  for (const room of rooms) {
    // Exclude current room
    if (excludeRoomId && room.id === excludeRoomId) continue;
    if (hasConflict(startIdx, duration, roomBusyMap.get(room.id))) continue;
    if (room.capacity_max < studentCount) continue;
    if (requiredEquipIds.length > 0) {
      const equipSet = roomEquipMap[room.id] || new Set();
      const hasAll = requiredEquipIds.every(eid => equipSet.has(eid));
      if (!hasAll) continue;
    }
    proposals.push({ room_id: room.id, room_name: room.name, room_code: room.code, start_slot: startIdx, occupied_slots: overlap, capacity: room.capacity_max });
    if (maxCandidates && proposals.length >= maxCandidates) break;
  }

  if (proposals.length === 0) return { success: false, reason: 'no_available_rooms_at_this_time', details: { date, checked_time_slot: fixedTimeSlotId } };
  return { success: true, mode: 'room_only', fixed_time_slot_id: fixedTimeSlotId, summary: { total_found: proposals.length, duration_per_session: duration }, proposals };
}

module.exports = { proposeOptions, proposeRoomAlternatives };

