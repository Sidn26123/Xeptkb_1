import authService from './authService';

const api = authService.apiClient;

export const getAllHolidayActuals = () =>
  api.get('/holidayActual');

export const getHolidayActualById = (id) =>
  api.get(`/holidayActual/${id}`);

export const createHolidayActual = (data) =>
  api.post('/holidayActual', data);

export const updateHolidayActual = (id, data) =>
  api.put(`/holidayActual/${id}`, data);

export const deleteHolidayActual = (id) =>
  api.delete(`/holidayActual/${id}`);