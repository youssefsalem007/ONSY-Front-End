import axiosInstance from '../utils/axiosInstance';

export const getAdminDashboardStats = async () => {
  const response = await axiosInstance.get('/admin/dashboard');
  return response.data;
};

export const getAdminUsers = async (params) => {
  const response = await axiosInstance.get('/admin/users', { params });
  return response.data;
};

export const getAdminUserDetails = async (id) => {
  const response = await axiosInstance.get(`/admin/users/${id}`);
  return response.data;
};

export const deleteAdminUser = async (id) => {
  const response = await axiosInstance.delete(`/admin/users/${id}`);
  return response.data;
};

export const exportAdminUsers = async () => {
  const response = await axiosInstance.get('/admin/users/export', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'users_export.csv');
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
};

export const getAdminAnalytics = async () => {
  const response = await axiosInstance.get('/admin/analytics');
  return response.data;
};
