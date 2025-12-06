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

export const getScheduleInstanceById = async (id) => {
  if (!id) return null;
  try {
    const res = await api.get(`/schedule-instances/${id}`);
    return res?.data?.data ?? res?.data ?? null;
  } catch (err) {
    console.error('Error fetching schedule instance by id:', err);
    return null;
  }
};

export const getAllTimeSlots = async () => {
  const res = await api.get('/time-slots');
  return res?.data?.data ?? [];
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
    // API shape can be: { success, message, data: [ ... ] }
    // Normalize to an array of items. Be defensive in case server returns
    // either the array directly or wrapped in `data`.
    let payload = response?.data ?? [];
    if (payload && payload.data && Array.isArray(payload.data)) payload = payload.data;
    const arr = Array.isArray(payload) ? payload : [];
    return arr.map(event => ({
      ...event,
      start: event.start ? new Date(event.start) : null,
      end: event.end ? new Date(event.end) : null,
    }));
  } catch (err) {
    console.error('Error fetching schedule events by student:', err);
    return [];
  }
}

// Fetch schedule instances for a user (teacher or student) on a specific date range
export async function fetchScheduleForUserOnDate(userId, role, startDate = null, endDate = null, classId = null) {
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
    // For student role, classId is required
    if (role === 'student' && classId) {
      body.classId = classId;
    }
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
  getScheduleInstanceById,
  fetchScheduleForUserOnDate,
  fetchScheduleEventsByStudent,
  getAllTimeSlots,
  fetchScheduleForClassOnDate,
};