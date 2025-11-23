import authService from './authService';

const api = authService.apiClient;

export const getAllSchedules = async (params = {}) => {
  // params can be used to filter: { course_class_id, week_start }
  const res = await api.get('/schedules', { params });
  return res?.data?.data ?? [];
};

export const getScheduleById = async (id) => {
  const res = await api.get(`/schedules/${id}`);
  return res?.data?.data ?? null;
};

// Explicit room-only propose (fixed timeslot / replace room)
export const proposeRoomChange = async (date, courseClassId, options = {}) => {
  try {
    const body = { date, courseClassId, ...options };
    const res = await api.post('/schedule-instances/propose-change/room', body);
    return res?.data ?? { success: false };
  } catch (err) {
    const errorData = err?.response?.data;
    if (errorData) {
      return {
        success: false,
        message: errorData.message || 'Có lỗi xảy ra',
        reason: errorData.reason,
        ...errorData
      };
    }
    throw err;
  }
};

// Explicit time+room propose (scan day for slots)
export const proposeTimeChange = async (date, courseClassId, options = {}) => {
  try {
    const body = { date, courseClassId, ...options };
    const res = await api.post('/schedule-instances/propose-change/time', body);
    return res?.data ?? { success: false };
  } catch (err) {
    const errorData = err?.response?.data;
    if (errorData) {
      return {
        success: false,
        message: errorData.message || 'Có lỗi xảy ra',
        reason: errorData.reason,
        ...errorData
      };
    }
    throw err;
  }
};

// New: apply schedule change (call backend apply-change)
// Accepts a single object as payload, uses correct backend field names
export const applyScheduleChange = async (payload) => {
  try {
    // Map FE fields to BE required fields
    const body = {
      date: payload.date,
      courseClassId: payload.courseClassId,
      selectedRoomId: payload.roomId, // FE uses roomId, BE expects selectedRoomId
      selectedStartSlot: payload.startSlot, // FE uses startSlot, BE expects selectedStartSlot
      reason: payload.reason,
      scheduleInstanceId: payload.scheduleInstanceId,
    };
    const res = await api.post('/schedule-instances/apply-change', body);
    return res?.data ?? { success: false };
  } catch (err) {
    // Extract error message from backend
    const errorData = err?.response?.data;
    if (errorData) {
      return { 
        success: false, 
        message: errorData.message || 'Có lỗi xảy ra',
        reason: errorData.reason,
        ...errorData
      };
    }
    throw err; // Re-throw if not API error
  }
};

export const getScheduleInstanceById = async (id) => {
  const res = await api.get(`/schedule-instances/${id}`);
  return res?.data?.data ?? null;
};


export const getAllTimeSlots = async () => {
  const res = await api.get('/time-slots');
  return res?.data?.data ?? [];
};

// Fetch schedule events for a teacher during a semester.
export async function fetchScheduleEventsByTeacher(teacherId, semesterId) {
    if (!teacherId || !semesterId) return [];
    try {
        // Use GET /schedule-instances/query
        const response = await api.get('/schedule-instances/query', {
            params: {
                teacherId,
                semesterId
            }
        });
        const data = response?.data?.data ?? [];
        return data.map(event => ({
            ...event,
            raw: event
        }));
    } catch (err) {
        console.error('Error fetching schedule events by teacher:', err);
        return [];
    }
}

// Fetch schedule instances for a teacher on a specific date range (YYYY-MM-DD)
export async function fetchScheduleForTeacherOnDate(teacherId, startDate = null, endDate = null) {
  // Delegate to unified user API. If startDate is not provided, compute a
  // dynamic shrinking-week range: from today -> upcoming Sunday. If today is
  // Sunday, range will be Sunday -> next Sunday.
  if (!teacherId) return [];
  try {
    return await fetchScheduleForUserOnDate(teacherId, 'teacher', startDate, endDate);
  } catch (err) {
    console.error('Error fetching schedule for teacher on date:', err);
    return [];
  }
}

// Fetch schedule instances for a user (teacher or student) on a specific date range
export async function fetchScheduleForUserOnDate(userId, role, startDate = null, endDate = null) {
  // If caller supplies explicit startDate (and optional endDate) use them.
  // Otherwise compute a shrinking-week range: start = today (or Sunday if today
  // is Sunday), end = upcoming Sunday (the Sunday that ends this logical week).
  if (!userId || !role) return [];
  // compute dynamic range when not provided
  if (!startDate) {
    const today = new Date();
    // find the Sunday of the current week (0 = Sunday)
    const thisWeekSunday = new Date(today);
    thisWeekSunday.setHours(0,0,0,0);
    thisWeekSunday.setDate(thisWeekSunday.getDate() - thisWeekSunday.getDay());

    // upcoming Sunday (one week ahead of thisWeekSunday)
    const upcomingSunday = new Date(thisWeekSunday);
    upcomingSunday.setDate(thisWeekSunday.getDate() + 7);

    // If today is Sunday (getDay() === 0) we want range: today (Sunday) -> upcomingSunday
    // Otherwise: start = today, end = upcomingSunday
    const start = new Date(today);
    start.setHours(0,0,0,0);
    const end = upcomingSunday;

    // format to YYYY-MM-DD
    const fmt = (d) => d.toISOString().slice(0,10);
    startDate = fmt(start);
    endDate = fmt(end);
  } else if (!endDate) {
    // if only startDate provided, keep endDate = startDate
    endDate = startDate;
  }
  try {
    const body = {
      userId,
      role,
      startDate,
      endDate,
    };
    const response = await api.post('/schedule-instances/instances/daily', body);
    const instances = response?.data?.data ?? [];

    return (Array.isArray(instances) ? instances : []).map(row => {
      const date = row.date || (row.start ? row.start : null);
      const timeslot = (row.timeSlot || row.schedule?.timeSlot) || null;
      const courseClass = row.schedule?.courseClass || null;

      let start = null;
      let end = null;
      if (date) start = new Date(date + 'T00:00:00');
      if (date) end = new Date(date + 'T00:00:00');

      // Teacher identifier: prefer explicit fields from API then nested objects
      const teacherName = row.teacher_name || row.teacher?.name || row.schedule?.teacher?.name || null;
      const teacherIdentifier = row.teacher_identifier || row.teacher?.teacher_identifier || row.schedule?.teacher_identifier || row.schedule?.teacher?.teacher_identifier || null;

      // Class info: prefer nested class.name (added server-side) then courseClass.name
      const classObj = (row.schedule && row.schedule.courseClass && row.schedule.courseClass.class)
        ? { id: row.schedule.courseClass.class.id, name: row.schedule.courseClass.class.name }
        : (row.schedule && row.schedule.courseClass)
          ? { id: row.schedule.courseClass.id || null, name: row.schedule.courseClass.name || null }
          : (row.course_class_id || row.course_class_name) ? { id: row.course_class_id || null, name: row.course_class_name || null } : null;

      // Room details: include name, code, floor_number, building
      const roomObj = row.room || {};
      const room = {
        code: row.room_code || roomObj.code || null,
        name: row.room_name || roomObj.name || null,
        floor_number: roomObj.floor_number !== undefined ? roomObj.floor_number : (row.room_floor_number !== undefined ? row.room_floor_number : null),
        building: {
          id: roomObj.building?.id || row.room_building_id || null,
          name: roomObj.building?.name || row.room_building_name || null,
        }
      };

      return {
        id: row.id,
        start,
        end,
        timeslot: { name: timeslot?.name, idx: timeslot?.idx },
        title: courseClass?.name || row.subject_name || row.name || row.title,
        subject: { name: row.subject_name, code: row.subject_code },
        teacher: { name: teacherName, teacher_identifier: teacherIdentifier },
        class: classObj,
        className: classObj?.name || courseClass?.name || row.course_class_name || null,
        room: room,
        date: date, // Add date field
        raw: row,
      };
    });
  } catch (err) {
    console.error('Error fetching schedule for user on date:', err);
    return [];
  }
}

export default {
  getAllSchedules,
  getScheduleById,
  getAllTimeSlots,
  fetchScheduleEventsByTeacher,
  fetchScheduleForTeacherOnDate,
  fetchScheduleForUserOnDate,
  getScheduleInstanceById,
};
