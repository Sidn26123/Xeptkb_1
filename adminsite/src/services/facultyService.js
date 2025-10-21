import authService from './authService';

const api = authService.apiClient;

export const getAllFaculties = async () => {
  const res = await api.get('/faculties');
  return res?.data?.data ?? [];
};

export const getFacultyById = async (id) => {
  const res = await api.get(`/faculties/${id}`);
  return res?.data?.data ?? null;
};

export const createFaculty = async (data) => {
  const res = await api.post('/faculties', data);
  return res?.data?.data ?? null;
};

export const updateFaculty = async (id, data) => {
  const res = await api.put(`/faculties/${id}`, data);
  return res?.data?.data ?? null;
};

export const deleteFaculty = async (id) => {
  const res = await api.delete(`/faculties/${id}`);
  return res?.data ?? null;
};

export default {
  getAllFaculties,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
};
