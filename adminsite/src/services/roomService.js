import authService from './authService';

const api = authService.apiClient;

export const getAllRooms = async () => {
  const res = await api.get('/rooms');
  return res?.data?.data ?? [];
};

export const getAllRoomsWithEquipment = async () => {
    const res = await api.get('/rooms/full');
    return res?.data?.data ?? [];
}

export const getRoomById = async (id) => {
  const res = await api.get(`/rooms/${id}`);
  return res?.data?.data ?? null;
};

export const createRoom = async (data) => {
  const res = await api.post('/rooms', data);
  return res?.data?.data ?? null;
};

export const updateRoom = async (id, data) => {
  const res = await api.put(`/rooms/${id}`, data);
  return res?.data?.data ?? null;
};

export const deleteRoom = async (id) => {
  const res = await api.delete(`/rooms/${id}`);
  return res?.data ?? null;
};

export default {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
};
