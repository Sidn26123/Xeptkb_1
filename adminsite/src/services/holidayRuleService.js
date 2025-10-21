import authService from './authService';

const api = authService.apiClient;

export const getAllHolidayRules = () =>
  api.get('/holidayRule');

export const getHolidayRuleById = (id) =>
  api.get(`/holidayRule/${id}`);

export const createHolidayRule = (data) =>
  api.post('/holidayRule', data);

export const updateHolidayRule = (id, data) =>
  api.put(`/holidayRule/${id}`, data);

export const deleteHolidayRule = (id) =>
  api.delete(`/holidayRule/${id}`);