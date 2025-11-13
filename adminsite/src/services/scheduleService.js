import authService from './authService';
import axios from "axios";

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

export const callGenerateSchedule = async (data) => {
    const res = await axios.post('http://localhost:5001/api/schedule', data);
    return res?.data ?? null;
}

export const saveSchedule = async (scheduleData) => {
    const res = await api.post('/schedules/save', scheduleData);
    return res?.data?.data ?? null;
}

export async function fetchScheduleEvents(classId, semesterId) {
    if (!classId || !semesterId) {
        return []; // Không gọi API nếu thiếu tham số
    }
    try {
        const response = await api.get(`/schedule-instances/query`, {
            params: {
                classId,
                semesterId,
            },
        });
        console.log('Fetched schedule events:', response.data);
        const data = await response.data;

        // QUAN TRỌNG: Chuyển đổi string date thành Date object
        // Hàm transformInstancesToEvents ở backend đã trả về Date object,
        // nhưng JSON.stringify/parse sẽ làm nó thành string.
        return data.map(event => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
        }));
    } catch (error) {
        console.error('Error fetching schedule events:', error);
        return []; // Trả về mảng rỗng nếu lỗi
    }
}