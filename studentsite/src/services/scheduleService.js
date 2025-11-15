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

export default {
  getAllSchedules,
  getScheduleById,
};
