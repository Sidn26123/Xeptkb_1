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

export const saveManualSchedule = async (manualData) => {
    const res = await api.post('/schedules/save-manual', manualData);
    return res?.data ?? null;
}

export const generateAllSchedules = async (id) => {
    const res = await api.post('/schedule-instances/generations/' + id + '/instances/generate-all');
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
        const data = await response.data;
        // QUAN TRỌNG: Chuyển đổi string date thành Date object
        // Hàm transformInstancesToEvents ở backend đã trả về Date object,
        // nhưng JSON.stringify/parse sẽ làm nó thành string.
        const scheduleArray = data.data || [];

        if (Array.isArray(scheduleArray)) {
            var finalData = scheduleArray.map(event => ({
                ...event,
                start: new Date(event.start),
                end: new Date(event.end),
            }));

            console.log('Transformed schedule events:', finalData); // Dòng này sẽ hiện
        }
        return finalData;
    } catch (error) {
        console.error('Error fetching schedule events:', error);
        return []; // Trả về mảng rỗng nếu lỗi
    }
}

export async function fetchScheduleEventsByRoom(roomId, semesterId) {
    if (!roomId || !semesterId) return [];
    try {
        const response = await api.get(`/schedule-instances/query`, {
            params: {
                roomId,
                semesterId,
            }
        });
        const data = response.data || [];
        return data.map(event => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
        }));
    } catch (err) {
        console.error('Error fetching schedule events by room:', err);
        return [];
    }
}

// Fetch schedule events for a teacher during a semester.
// Uses the POST /schedule-instances/instances/filter endpoint which requires
// startDate and endDate (semester boundaries).
import { getSemesterById } from './semesterService';

export async function fetchScheduleEventsByTeacher(teacherId, semesterId) {
    if (!teacherId || !semesterId) return [];
    try {
        const semester = await getSemesterById(semesterId);
        if (!semester || !semester.start || !semester.end) return [];

        // Use the same query endpoint as classes: GET /schedule-instances/query
        // so the response is an array of transformed events (not wrapped in SuccessResponse)
        const response = await api.get('/schedule-instances/query', {
            params: {
                teacherId,
                semesterId
            }
        });
        const data = response?.data ?? [];
        return data.map(event => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
        }));
    } catch (err) {
        console.error('Error fetching schedule events by teacher:', err);
        return [];
    }
}

export const generateScheduleInstance = async (generationId, options) => {
    const res = await api.post(`/schedule-instances/${generationId}/instances/generate-all`, options);
    return res?.data ?? null;
}