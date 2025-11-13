import authService from './authService';

const api = authService.apiClient;

export const getAllTimeSlots = async () => {
    const res = await api.get('/time-slots');
    return res?.data?.data ?? [];
}

export const getTimeSlotById = async (id) => {
    const res = await api.get(`/time-slots/${id}`);
    return res?.data?.data ?? null;
}
export const createTimeSlot = async (data) => {
    const res = await api.post('/time-slots', data);
    return res?.data?.data ?? null;
}

export const updateTimeSlot = async (id, data) => {
    const res = await api.put(`/time-slots/${id}`, data);
    return res?.data?.data ?? null;
}

export const deleteTimeSlot = async (id) => {
    const res = await api.delete(`/time-slots/${id}`);
    return res?.data ?? null;
}

export default {
    getAllTimeSlots,
    getTimeSlotById,
    createTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
};