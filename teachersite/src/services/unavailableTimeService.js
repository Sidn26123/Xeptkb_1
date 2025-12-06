import authService from './authService';

const api = authService.apiClient;

export const listUnavailableTimes = async () => {
  const res = await api.get('/teachersite/unavailable-times');
  return res?.data?.data ?? [];
};

export const replaceUnavailableTimes = async (items = []) => {
  const res = await api.post('/teachersite/unavailable-times', { items });
  return res?.data?.data ?? [];
};

export const addUnavailableTime = async (day_id, time_slot_id) => {
  const res = await api.post('/teachersite/unavailable-times/add', { day_id, time_slot_id });
  return res?.data?.data ?? null;
};

export const deleteUnavailableTimes = async (items = []) => {
  const res = await api.delete('/teachersite/unavailable-times', { data: { items } });
  return res?.data?.data ?? res?.data ?? null;
};

export default {
  listUnavailableTimes,
  replaceUnavailableTimes,
  addUnavailableTime,
  deleteUnavailableTimes,
};
