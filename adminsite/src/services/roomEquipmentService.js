import authService from './authService';

const api = authService.apiClient;

export const getAllRoomEquipments = async () => {
  const res = await api.get('/room-equipments');
  return res?.data?.data ?? [];
};

export const getRoomEquipmentById = async (id) => {
  const res = await api.get(`/room-equipments/${id}`);
  return res?.data?.data ?? null;
};

export const createRoomEquipment = async (data) => {
  const res = await api.post('/room-equipments', data);
  return res?.data?.data ?? null;
};

export const updateRoomEquipment = async (id, data) => {
  const res = await api.put(`/room-equipments/${id}`, data);
  return res?.data?.data ?? null;
};

export const deleteRoomEquipment = async (id) => {
  const res = await api.delete(`/room-equipments/${id}`);
  return res?.data ?? null;
};

export default {
  getAllRoomEquipments,
  getRoomEquipmentById,
  createRoomEquipment,
  updateRoomEquipment,
  deleteRoomEquipment,
};
