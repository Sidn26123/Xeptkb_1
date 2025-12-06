import authService from './authService';

const api = authService.apiClient;

export const getAllStudents = async () => {
  const res = await api.get('/students');
  return res?.data?.data ?? [];
};

export const getStudentById = async (id) => {
  const res = await api.get(`/students/${id}`);
  return res?.data?.data ?? null;
};

export const createStudent = async (data) => {
  const res = await api.post('/students', data);
  return res?.data?.data ?? null;
};

export const updateStudent = async (id, data) => {
  const res = await api.put(`/students/${id}`, data);
  return res?.data?.data ?? null;
};

export const deleteStudent = async (id) => {
  const res = await api.delete(`/students/${id}`);
  return res?.data ?? null;
};
export const bulkImportStudents = async (datalist) => {
  const res = await api.post('/students/bulk-import', datalist);
  return res?.response?.data ?? null;
}
export default {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  bulkImportStudents
};
