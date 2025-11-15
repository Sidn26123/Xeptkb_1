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
    const yyyy = dateStr.length === 10 ? dateStr : new Date(dateStr).toISOString().slice(0,10);
    const startDate = `${yyyy}T00:00:00`;
    const endDate = `${yyyy}T23:59:59`;

    let instances = [];

    // Use the daily endpoint for all user roles (server supports role differentiation)
    let body;
    if (role === 'student') {
      // server now expects `classId` for student queries
      body = { classId: userId, role, startDate, endDate };
    } else {
      body = { userId, role, startDate, endDate };
    }
    const response = await api.post('/schedule-instances/instances/daily', body);
    instances = response?.data?.data ?? response?.data ?? [];

    return (Array.isArray(instances) ? instances : []).map(row => {
      // Normalize common fields used by the UI
      const date = row.date || row.instance_date || (row.start ? row.start : null) || null;
      const timeslot = row.timeSlot || row.timeslot || row.schedule?.timeSlot || null;
      const courseClass = row.schedule?.courseClass || row.course_class || null;

      // Derive readable start/end if possible
      let start = null;
      let end = null;
      if (row.start_datetime) start = new Date(row.start_datetime);
      else if (date) start = new Date(date + 'T00:00:00');
      if (row.end_datetime) end = new Date(row.end_datetime);
      else if (date) end = new Date(date + 'T00:00:00');

      return {
        id: row.id || row.instance_id,
        start,
        end,
        timeslot: { name: timeslot?.name || timeslot?.title, idx: timeslot?.idx ?? timeslot?.order },
        title: courseClass?.name || row.subject_name || row.name || row.title,
        subject: { name: row.subject_name || row.subject?.name, code: row.subject_code || row.subject?.code },
        teacher: { name: row.teacher_name || row.teacher?.name || row.schedule?.teacher?.name },
        room: { code: row.room_code || row.room?.code || row.room?.name, floor_number: row.room?.floor_number ?? row.room_floor },
        raw: row,
      };
    });
  } catch (err) {
    console.error('Error fetching schedule for user on date:', err);
    return [];
  }
}

// Convenience wrapper to fetch by class id (student use-case)
export async function fetchScheduleForClassOnDate(classId, dateStr) {
  // Dedicated helper: fetch schedule instances for a class on a date
  if (!classId || !dateStr) return [];
  try {
    const yyyy = dateStr.length === 10 ? dateStr : new Date(dateStr).toISOString().slice(0,10);
    const startDate = `${yyyy}T00:00:00`;
    const endDate = `${yyyy}T23:59:59`;

    const body = { classId, role: 'student', startDate, endDate };
    const response = await api.post('/schedule-instances/instances/daily', body);
    const instances = response?.data?.data ?? response?.data ?? [];

    return (Array.isArray(instances) ? instances : []).map(row => {
      const date = row.date || row.instance_date || (row.start ? row.start : null) || null;
      const timeslot = row.timeSlot || row.timeslot || row.schedule?.timeSlot || null;
      const courseClass = row.schedule?.courseClass || row.course_class || null;

      let start = null;
      let end = null;
      if (row.start_datetime) start = new Date(row.start_datetime);
      else if (date) start = new Date(date + 'T00:00:00');
      if (row.end_datetime) end = new Date(row.end_datetime);
      else if (date) end = new Date(date + 'T00:00:00');

      return {
        id: row.id || row.instance_id,
        start,
        end,
        timeslot: { name: timeslot?.name || timeslot?.title, idx: timeslot?.idx ?? timeslot?.order },
        title: courseClass?.name || row.subject_name || row.name || row.title,
        subject: { name: row.subject_name || row.subject?.name, code: row.subject_code || row.subject?.code },
        teacher: { name: row.teacher_name || row.teacher?.name || row.schedule?.teacher?.name },
        room: { code: row.room_code || row.room?.code || row.room?.name, floor_number: row.room?.floor_number ?? row.room_floor },
        raw: row,
      };
    });
  } catch (err) {
    console.error('Error fetching schedule for class on date:', err);
    return [];
  }
}

export default {
  getAllSchedules,
  getScheduleById,
  fetchScheduleForTeacherOnDate,
  fetchScheduleForUserOnDate,
};

// Fetch schedule events for a student (by classId) during a semester.
export async function fetchScheduleEventsByStudent(classId, semesterId) {
  if (!classId || !semesterId) return [];
  try {
    const semester = await import('./semesterService').then(s => s.getSemesterById(semesterId));
    if (!semester || !semester.start || !semester.end) return [];

    const response = await api.get('/schedule-instances/query', {
      params: {
        classId,
        semesterId
      }
    });
    const data = response?.data ?? [];
    return (Array.isArray(data) ? data : []).map(event => ({
      ...event,
      start: event.start ? new Date(event.start) : null,
      end: event.end ? new Date(event.end) : null,
    }));
  } catch (err) {
    console.error('Error fetching schedule events by student:', err);
    return [];
  }
}
