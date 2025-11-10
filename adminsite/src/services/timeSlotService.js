import authService from './authService';

const api = authService.apiClient;

export const getAllTimeSlots = async () => {
    const res = await api.get('/timeslots');
    return res?.data?.data ?? [];
}