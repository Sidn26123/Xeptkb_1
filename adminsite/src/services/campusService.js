import authService from './authService';

const api = authService.apiClient;

export const getAllCampus = async () => {
  const res = await api.get('/campus');
  return res?.data?.data ?? [];
};

export const getCampusById = async (id) => {
  const res = await api.get(`/campus/${id}`);
  return res?.data?.data ?? null;
};

export const createCampus = async (data) => {
  const res = await api.post('/campus', data);
  return res?.data?.data ?? null;
};

export const updateCampus = async (id, data) => {
  const res = await api.put(`/campus/${id}`, data);
  return res?.data?.data ?? null;
};

export const deleteCampus = async (id) => {
  const res = await api.delete(`/campus/${id}`);
  return res?.data ?? null;
};

export default {
  getAllCampus,
  getCampusById,
  createCampus,
  updateCampus,
  deleteCampus,
};
