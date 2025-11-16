import authService from './authService';
const api = authService.apiClient;

export const createScheduleChangeRequest = async (payload) => {
  const res = await api.post('/schedule-change-requests', payload);
  return res?.data?.data ?? res?.data ?? null;
};

export const listScheduleChangeRequests = async (filters = {}) => {
  const res = await api.get('/schedule-change-requests', { params: filters });
  return res?.data?.data ?? [];
};

export const approveRequest = async (id, updates = {}) => {
  const res = await api.post(`/schedule-change-requests/${id}/approve`, updates);
  return res?.data?.data ?? res?.data ?? null;
};

export const applyRequest = async (id) => {
  const res = await api.post(`/schedule-change-requests/${id}/apply`);
  return res?.data?.data ?? res?.data ?? null;
};

export const rejectRequest = async (id, reason) => {
  const res = await api.post(`/schedule-change-requests/${id}/reject`, { reason });
  return res?.data?.data ?? res?.data ?? null;
};
export const getRequestById = async (id) => {
  const res = await api.get(`/schedule-change-requests/${id}`);
  return res?.data?.data ?? res?.data ?? null;
};

export default {
  createScheduleChangeRequest,
  listScheduleChangeRequests,
  getRequestById,
  approveRequest,
  applyRequest,
  rejectRequest
};