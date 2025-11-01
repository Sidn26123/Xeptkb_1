import authService from './authService';

const api = authService.apiClient;

export const getAllHolidayRules = () =>
  api.get('/holiday-rules');

export const getHolidayRuleById = (id) =>
  api.get(`/holiday-rules/${id}`);

export const createHolidayRule = (data) =>
  api.post('/holiday-rules', data);

export const updateHolidayRule = (id, data) =>
  api.put(`/holiday-rules/${id}`, data);

export const deleteHolidayRule = (id) =>
  api.delete(`/holiday-rules/${id}`);

export const getHolidayRulesForSemester = (startDateIso, endDateIso) =>
  api.get('/holiday-rules/templates', { 
    params: { 
      start_date: startDateIso, 
      end_date: endDateIso 
    } 
  });