import axios from 'axios';
import { getToken, removeToken } from './cookieUtils';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://onsy-backend.vercel.app',
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ── Request interceptor: attach token ── */
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

/* ── Response interceptor: handle auth errors ── */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error?.response?.status;
    const message = (error?.response?.data?.message || '').toLowerCase();

    // Catch any token/auth related error the backend returns as 4xx or 5xx
    const isAuthError =
      status === 401 ||
      (status === 500 && (
        message.includes('unauthorized') ||
        message.includes('invalid token') ||
        message.includes('expired')       ||
        message.includes('jwt')           ||
        message.includes('token')
      ));

    if (isAuthError) {
      removeToken();                       // clear stale/expired cookie
      window.location.href = '/SignIn';    // hard redirect
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;