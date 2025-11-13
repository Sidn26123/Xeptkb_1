import authService from './authService';
const api = authService.apiClient;

export const getSchedulesByDay = async () => {
    const res = await api.get('/reports/day');
    return res?.data?.data ?? [];
};

export const getSchedulesByTimeSlot = async () => {
    const res = await api.get('/reports/timeslot');
    return res?.data?.data ?? [];
};

export const getInstructorConflicts = async () => {
    const res = await api.get('/reports/instructor-conflicts');
    return res?.data?.data ?? [];
};

export const getAvailableRooms = async () => {
    const res = await api.get('/reports/available-rooms');
    return res?.data?.data ?? [];
};

export const getInstructorLoad = async () => {
    const res = await api.get('/reports/instructor-load');
    return res?.data?.data ?? [];
};

export const getEmptySlotsByWeek = async () => {
    const res = await api.get('/reports/empty-slots-week');
    return res?.data?.data ?? [];
};

export const getGenerationStats = async () => {
    const res = await api.get('/reports/stat');
    return res?.data?.data ?? null;
};

export const getPenaltyAnalysis = async () => {
    const res = await api.get('/reports/penalty');
    return res?.data?.data ?? null;
};

export const getFitnessTrend = async () => {
    const res = await api.get('/reports/fitness-trend');
    return res?.data?.data ?? [];
};
