import authService from './authService';

const api = authService.apiClient;

export const getAllBuildings = async () => {
  const res = await api.get('/buildings');
  return res?.data?.data ?? [];
};

export const getBuildingById = async (id) => {
  const res = await api.get(`/buildings/${id}`);
  return res?.data?.data ?? null;
};

export const createBuilding = async (data) => {
  const res = await api.post('/buildings', data);
  return res?.data?.data ?? null;
};

export const updateBuilding = async (id, data) => {
  const res = await api.put(`/buildings/${id}`, data);
  return res?.data?.data ?? null;
};

export const deleteBuilding = async (id) => {
  const res = await api.delete(`/buildings/${id}`);
  return res?.data ?? null;
};

export default {
  getAllBuildings,
  getBuildingById,
  createBuilding,
  updateBuilding,
  deleteBuilding,
};
