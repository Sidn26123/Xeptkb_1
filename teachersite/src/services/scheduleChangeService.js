import authService from './authService';
const api = authService.apiClient;

export const createScheduleChangeRequest = async (payload) => {
  const res = await api.post('/schedule-change-requests', payload);
  return res?.data?.data ?? res?.data ?? null;
};

export const listMyRequests = async () => {
  const res = await api.get('/schedule-change-requests');
  return res?.data?.data ?? [];
};

export const getRequestsByInstance = async (instanceId) => {
  if (!instanceId) return [];
  // server `listRequests` expects `schedule_instance_id` as filter
  const res = await api.get('/schedule-change-requests', { params: { schedule_instance_id: instanceId } });
  return res?.data?.data ?? [];
};

export default { createScheduleChangeRequest, listMyRequests, getRequestsByInstance };
