import api from '../axios';

export const umacApi = {
  getUsers: (page = 1) => api.get(`/umac/users?page=${page}`),
  createUser: (payload) => api.post('/umac/register', payload),
  updateUser: (id, payload) => api.put(`/umac/users/${id}`, payload),
  toggleUserStatus: (id) => api.patch(`/umac/users/${id}/toggle-status`),
  verifyUserEmail: (id) => api.patch(`/umac/users/${id}/verify`),
  deleteUser: (id) => api.delete(`/umac/users/${id}`),

  // Role & Permission endpoints
  getPermissions: () => api.get('/umac/permissions'),
  getRoles: () => api.get('/umac/roles'),
  createRole: (payload) => api.post('/umac/roles', payload),
  updateRole: (id, payload) => api.put(`/umac/roles/${id}`, payload),
  deleteRole: (id) => api.delete(`/umac/roles/${id}`),

};