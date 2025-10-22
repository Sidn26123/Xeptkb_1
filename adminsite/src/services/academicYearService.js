import authService from './authService';

const api = authService.apiClient;

export const getAllAcademicYears = async () => {
  const res = await api.get('/academic-years');
  return res?.data?.data ?? [];
};

export const getAcademicYearById = async (id) => {
  const res = await api.get(`/academic-years/${id}`);
  return res?.data?.data ?? null;
};

export const createAcademicYear = async (data) => {
  const res = await api.post('/academic-years', data);
  return res?.data?.data ?? null;
};

export const updateAcademicYear = async (id, data) => {
  const res = await api.put(`/academic-years/${id}`, data);
  return res?.data?.data ?? null;
};

export const deleteAcademicYear = async (id) => {
  const res = await api.delete(`/academic-years/${id}`);
  return res?.data ?? null;
};

export default {
  getAllAcademicYears,
  getAcademicYearById,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
};
