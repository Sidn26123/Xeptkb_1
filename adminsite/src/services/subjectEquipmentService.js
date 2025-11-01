import authService from './authService';

const api = authService.apiClient;

export const getAllSubjectRequiresEquipments = async () => {
  const res = await api.get('/subject-requires-equipments');
  return res?.data?.data ?? [];
};

export const getSubjectRequiresEquipmentById = async (id) => {
  const res = await api.get(`/subject-requires-equipments/${id}`);
  return res?.data?.data ?? null;
};

export const createSubjectRequiresEquipment = async (data) => {
  const res = await api.post('/subject-requires-equipments', data);
  return res?.data?.data ?? null;
};

export const updateSubjectRequiresEquipment = async (id, data) => {
  const res = await api.put(`/subject-requires-equipments/${id}`, data);
  return res?.data?.data ?? null;
};

export const deleteSubjectRequiresEquipment = async (id) => {
  const res = await api.delete(`/subject-requires-equipments/${id}`);
  return res?.data ?? null;
};

export default {
  getAllSubjectRequiresEquipments,
  getSubjectRequiresEquipmentById,
  createSubjectRequiresEquipment,
  updateSubjectRequiresEquipment,
  deleteSubjectRequiresEquipment,
};
