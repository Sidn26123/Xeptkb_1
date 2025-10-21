import authService from './authService';

const api = authService.apiClient;

export const getAllTeachers = async () => {
  const res = await api.get('/teachers');
  return res?.data?.data ?? [];
};

export const getTeacherById = async (id) => {
  const res = await api.get(`/teachers/${id}`);
  return res?.data?.data ?? null;
};

export const createTeacher = async (data) => {
  const res = await api.post('/teachers', data);
  return res?.data?.data ?? null;
};

export const updateTeacher = async (id, data) => {
  const res = await api.put(`/teachers/${id}`, data);
  return res?.data?.data ?? null;
};

export const deleteTeacher = async (id) => {
  const res = await api.delete(`/teachers/${id}`);
  return res?.data ?? null;
};

export default {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
};
