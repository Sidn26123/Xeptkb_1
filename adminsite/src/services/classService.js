import authService from './authService';

const api = authService.apiClient;

export const getAllClasses = async () => {
  const res = await api.get('/classes');
  return res?.data?.data ?? [];
};

export const getClassById = async (id) => {
  const res = await api.get(`/classes/${id}`);
  return res?.data?.data ?? null;
};

export const createClass = async (data) => {
  const res = await api.post('/classes', data);
  return res?.data?.data ?? null;
};

export const updateClass = async (id, data) => {
  const res = await api.put(`/classes/${id}`, data);
  return res?.data?.data ?? null;
};

export const deleteClass = async (id) => {
  const res = await api.delete(`/classes/${id}`);
  return res?.data ?? null;
};
export const bulkImportClasses = async (datalist) => {
  const res = await api.post('/classes/bulk-import', datalist);
  return res?.response?.data ?? null;
}

export default {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  bulkImportClasses
};
