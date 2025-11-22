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

// New: propose schedule change (call backend propose-change)
export const proposeScheduleChange = async (date, courseClassId, options = {}) => {
  try {
    // options can include { prefer, maxCandidates, scheduleInstanceId }
    const body = { date, courseClassId, ...options };
    // Choose endpoint depending on flow: if caller provided scheduleInstanceId or fixedTimeSlotId,
    // use room-only endpoint; otherwise use time+room endpoint.
    const useRoomOnly = options && (options.scheduleInstanceId || options.fixedTimeSlotId);
    const endpoint = useRoomOnly ? '/schedule-instances/propose-change/room' : '/schedule-instances/propose-change/time';
    const res = await api.post(endpoint, body);
    // backend returns { success, summary, proposals }
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
        const semester = await import('./semesterService').then(s => s.getSemesterById(semesterId));
        if (!semester || !semester.start || !semester.end) return [];

        // Use the same query endpoint as classes: GET /schedule-instances/query
        const response = await api.get('/schedule-instances/query', {
            params: {
                teacherId,
                semesterId
            }
        });
        const data = response?.data ?? [];
        return data.map(event => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
            raw: event
        }));
    } catch (err) {
        console.error('Error fetching schedule events by teacher:', err);
        return [];
    }
}

// Fetch schedule instances for a teacher on a specific date (YYYY-MM-DD)
export async function fetchScheduleForTeacherOnDate(teacherId, dateStr) {
  // Delegate to unified user API
  if (!teacherId || !dateStr) return [];
  try {
    return await fetchScheduleForUserOnDate(teacherId, 'teacher', dateStr);
  } catch (err) {
    console.error('Error fetching schedule for teacher on date:', err);
    return [];
  }
}

// Fetch schedule instances for a user (teacher or student) on a specific date
export async function fetchScheduleForUserOnDate(userId, role, dateStr) {
  if (!userId || !role || !dateStr) return [];
  try {
    const body = {
      userId,
      role,
      startDate: dateStr,
      endDate: dateStr,
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

      return {
        id: row.id,
        start,
        end,
        timeslot: { name: timeslot?.name, idx: timeslot?.idx },
        title: courseClass?.name || row.subject_name || row.name || row.title,
        subject: { name: row.subject_name, code: row.subject_code },
        teacher: { name: row.teacher_name || row.teacher?.name },
        room: { code: row.room_code || row.room?.code },
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
