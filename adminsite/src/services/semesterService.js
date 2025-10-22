import authService from './authService';

const api = authService.apiClient;

export const getAllSemesters = async () => {
  const res = await api.get('/semesters');
  return res?.data?.data ?? [];
};

export const getSemesterById = async (id) => {
  const res = await api.get(`/semesters/${id}`);
  return res?.data?.data ?? null;
};

export const createSemester = async (data) => {
  const res = await api.post('/semesters', data);
  return res?.data?.data ?? null;
};

export const updateSemester = async (id, data) => {
  const res = await api.put(`/semesters/${id}`, data);
  return res?.data?.data ?? null;
};

export const deleteSemester = async (id) => {
  const res = await api.delete(`/semesters/${id}`);
  return res?.data ?? null;
};