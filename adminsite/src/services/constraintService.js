import authService from './authService';

const api = authService.apiClient;

export const getAllConstraints = async () => {
    const res = await api.get('/constraints');
    return res?.data?.data ?? [];
};

