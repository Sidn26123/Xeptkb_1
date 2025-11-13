// import authService from './authService';
//
// const api = authService.apiClient;
//
// export const getAllDays = async () => {
//     const res = await api.get('/days');
//     return res?.data?.data ?? [];
// }
//
// export const getDayById = async (id
// ) => {
//     const res = await api.get(`/days/${id}`);
//     return res?.data?.data ?? null;
// }
// export const createDay = async (data) => {
//     const res = await api.post('/days', data);
//     return res?.data?.data ?? null;
// }
//
// export const updateDay = async (id, data) => {
//     const res = await api.put(`/days/${id}`, data);
//     return res?.data?.data ?? null;
// }
//
// export const deleteDay = async (id) => {
//     const res = await api.delete(`/days/${id}`);
//     return res?.data ?? null;
// }
//
// export default {
//     getAllDays,
//     getDayById,
//     createDay,
//     updateDay,
//     deleteDay,
// };

import authService from './authService';

const api = authService.apiClient;

export const getAllCourseClasses = async () => {
    const res = await api.get('/course-classes');
    return res?.data?.data ?? [];
}

export const getCourseClassById = async (id) => {
    const res = await api.get(`/course-classes/${id}`);
    return res?.data?.data ?? null;
}

export const createCourseClass = async (data) => {
    const res = await api.post('/course-classes', data);
    return res?.data?.data ?? null;
}

export const updateCourseClass = async (id, data) => {
    const res = await api.put(`/course-classes/${id}`, data);
    return res?.data?.data ?? null;
}

export const deleteCourseClass = async (id) => {
    const res = await api.delete(`/course-classes/${id}`);
    return res?.data ?? null;
}