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
  fetchScheduleEventsByTeacher,
  fetchScheduleForTeacherOnDate,
  fetchScheduleForUserOnDate,
};
