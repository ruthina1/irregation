import api from '../axios';

export const authApi = {
  login: (payload) => api.post('/umac/login', payload),
  register: (payload) => api.post('/umac/register', payload),
  logout: () => api.post('/umac/logout'),
  me: () => api.get('/umac/me'),
  changePassword: (data) => api.post('/umac/change-password', data),
};