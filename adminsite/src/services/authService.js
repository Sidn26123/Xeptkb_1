import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Login: returns { accessToken, refreshToken, role }
export const login = (credentials) =>
  axios.post(`${API_BASE_URL}/login`, credentials);

// Refresh access token using refresh token
export const refreshAccessToken = (refreshToken) =>
  axios.post(`${API_BASE_URL}/refresh-token`, { refreshToken });

// Token helpers
/**
 * Save tokens. By default saves to localStorage (persistent). If persistent=false saves to sessionStorage.
 * @param {{accessToken?:string,refreshToken?:string}} tokens
 * @param {boolean} persistent
 */
export const saveTokens = ({ accessToken, refreshToken }, persistent = true) => {
  try {
    const storage = persistent ? localStorage : sessionStorage;
    if (accessToken) storage.setItem('accessToken', accessToken);
    if (refreshToken) storage.setItem('refreshToken', refreshToken);
    // also remove from the other storage to avoid confusion
    const other = persistent ? sessionStorage : localStorage;
    if (accessToken) other.removeItem('accessToken');
    if (refreshToken) other.removeItem('refreshToken');
  } catch {
    // ignore storage errors (e.g., storage disabled)
  }
};

/**
 * Save role string to storage
 * @param {string} role
 * @param {boolean} persistent
 */
export const saveRole = (role, persistent = true) => {
  try {
    const storage = persistent ? localStorage : sessionStorage;
    if (role !== undefined && role !== null) storage.setItem('role', String(role));
    const other = persistent ? sessionStorage : localStorage;
    other.removeItem('role');
  } catch { /* ignore storage errors (e.g., storage disabled) */ }
};

export const getRole = () => {
  try { return localStorage.getItem('role') || sessionStorage.getItem('role') || null; } catch { return null; }
};

export const clearRole = () => {
  try { localStorage.removeItem('role'); } catch { /* ignore */ };
  try { sessionStorage.removeItem('role'); } catch { /* ignore */ };
};

export const clearTokens = () => {
  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  } catch { void 0; }
  try {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
  } catch { void 0; }
};

export const getAccessToken = () => {
  try { return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') || null; } catch { return null; }
};

export const getRefreshToken = () => {
  try { return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken') || null; } catch { return null; }
};

// Create an axios instance that automatically sends access token if present
export const apiClient = axios.create({ baseURL: API_BASE_URL });
apiClient.interceptors.request.use((config) => {
  try {
    const token = getAccessToken();
    if (token) config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
  } catch {
    // ignore
  }
  return config;
});

// Response interceptor: attempt token refresh on 401 and retry the original request once
let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  refreshQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const res = await refreshAccessToken(refreshToken);
        const newAccessToken = res?.data?.accessToken;
        const newRefreshToken = res?.data?.refreshToken;
        if (newAccessToken) {
          // decide where to save tokens: prefer localStorage if tokens already there, else sessionStorage
          const persistent = !!localStorage.getItem('refreshToken');
          saveTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken }, persistent);
          apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
          processQueue(null, newAccessToken);
          originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
          return apiClient(originalRequest);
        }
        processQueue(new Error('Failed to refresh token'), null);
        clearTokens();
        return Promise.reject(error);
      } catch (err) {
        processQueue(err, null);
        clearTokens();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default {
  login,
  refreshAccessToken,
  saveTokens,
  saveRole,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getRole,
  clearRole,
  apiClient,
};
