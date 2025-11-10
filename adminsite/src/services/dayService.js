import authService from './authService';

const api = authService.apiClient;

export const getAllDays = async () => {
    const res = await api.get('/days');
    return res?.data?.data ?? [];
}