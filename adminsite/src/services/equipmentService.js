import authService from './authService';

const api = authService.apiClient;

export const getAllEquipments = async () => {
  const res = await api.get('/equipments');
  return res?.data?.data ?? [];
};

export const getEquipmentById = async (id) => {
  const res = await api.get(`/equipments/${id}`);
  return res?.data?.data ?? null;
};

export const createEquipment = async (payload) => {
  const res = await api.post('/equipments', payload);
  return res?.data ?? null;
};

export const updateEquipment = async (id, payload) => {
  const res = await api.put(`/equipments/${id}`, payload);
  return res?.data ?? null;
};

export const deleteEquipment = async (id) => {
  const res = await api.delete(`/equipments/${id}`);
  return res?.data ?? null;
};

export const bulkImportEquipments = async (datalist) => {
    const res = await api.post('/equipments/bulk', datalist);
    return res?.response?.data ?? null;
}

export default {
  getAllEquipments,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  bulkImportEquipments
};
