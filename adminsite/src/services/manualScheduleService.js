import authService from './authService';
const api = authService.apiClient;

export const getManualGridData = async (semesterId) => {
    const res = await api.get(`/schedules/manual/grid?semesterId=${semesterId}`);
    return res.data; // { unscheduled: [], scheduled: [] }
};

export const checkManualConflict = async (payload) => {
    // payload: { courseClassId, teacherId, roomId, dayId, startPeriod, duration, semesterId }
    const res = await api.post('/schedules/manual/check', payload);
    return res.data; // { isValid: bool, conflicts: [] }
};

export const saveManualSchedule = async (payload) => {
    const res = await api.post('/schedules/manual/save', payload);
    return res.data;
};

export default {
    getManualGridData,
    checkManualConflict,
    saveManualSchedule
};