import authService from './authService';

const api = authService.apiClient;

export const getAllTrainingTypes = async () => {
  const res = await api.get('/training-types');
  return res?.data?.data ?? [];
};

export const createTrainingType = async (data) => {
  const res = await api.post('/training-types', data);
  return res?.data?.data ?? null;
};

export const updateTrainingType = async (id, data) => {
  const res = await api.put(`/training-types/${id}`, data);
  return res?.data?.data ?? null;
};

export const deleteTrainingType = async (id) => {
  const res = await api.delete(`/training-types/${id}`);
  return res?.data ?? null;
};

export default {
  getAllTrainingTypes,
  createTrainingType,
  updateTrainingType,
  deleteTrainingType,
};
