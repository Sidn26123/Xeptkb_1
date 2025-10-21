import authService from './authService';

const api = authService.apiClient;

export const getAllSubjects = async () => {
  const res = await api.get('/subjects');
  return res?.data?.data ?? [];
};

export const getSubjectById = async (id) => {
  const res = await api.get(`/subjects/${id}`);
  return res?.data?.data ?? null;
};

export const createSubject = async (data) => {
  const res = await api.post('/subjects', data);
  return res?.data?.data ?? null;
};

export const updateSubject = async (id, data) => {
  const res = await api.put(`/subjects/${id}`, data);
  return res?.data?.data ?? null;
};

export const deleteSubject = async (id) => {
  const res = await api.delete(`/subjects/${id}`);
  return res?.data ?? null;
};

export default {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
};
