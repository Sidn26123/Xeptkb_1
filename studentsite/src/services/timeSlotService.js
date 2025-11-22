import authService from './authService';

const api = authService.apiClient;

export const getAllTimeSlots = async () => {
  const res = await api.get('/time-slots');
  return res?.data?.data ?? [];
};

export const getTimeSlotById = async (id) => {
  const res = await api.get(`/time-slots/${id}`);
  return res?.data?.data ?? null;
};

export default {
  getAllTimeSlots,
  getTimeSlotById,
};
