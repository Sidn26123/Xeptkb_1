import authService from './authService';

const api = authService.apiClient;

export const getAllSchedules = async () => {
    const res = await api.get('/schedules');
    return res?.data?.data ?? [];
}

export const getScheduleById = async (id) => {
    const res = await api.get(`/schedules/${id}`);
    return res?.data?.data ?? null;
}

export const filterSchedules = async (filters) => {
    const res = await api.post('/schedules/filter', filters);
    return res?.data?.data ?? [];
}