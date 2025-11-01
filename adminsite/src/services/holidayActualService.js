import authService from './authService';

const api = authService.apiClient;

export const getAllHolidayActuals = () =>
  api.get('/holiday-actuals');

export const getHolidayActualById = (id) =>
  api.get(`/holiday-actuals/${id}`);

export const createHolidayActual = (data) =>
  api.post('/holiday-actuals', data);

export const updateHolidayActual = (id, data) =>
  api.put(`/holiday-actuals/${id}`, data);

export const deleteHolidayActual = (id) =>
  api.delete(`/holiday-actuals/${id}`);