import authService from './authService';

const api = authService.apiClient;

export const getAllDays = async () => {
    const res = await api.get('/days');
    return res?.data?.data ?? [];
}

export const getDayById = async (id
) => {
    const res = await api.get(`/days/${id}`);
    return res?.data?.data ?? null;
}
export const createDay = async (data) => {
    const res = await api.post('/days', data);
    return res?.data?.data ?? null;
}

export const updateDay = async (id, data) => {
    const res = await api.put(`/days/${id}`, data);
    return res?.data?.data ?? null;
}

export const deleteDay = async (id) => {
    const res = await api.delete(`/days/${id}`);
    return res?.data ?? null;
}

export default {
    getAllDays,
    getDayById,
    createDay,
    updateDay,
    deleteDay,
};