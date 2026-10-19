import api from '../axios';

export const workforceApi = {
  getExperts: () => api.get('/extension/experts'),
  createExpert: (data) => api.post('/extension/experts', data),
  updateExpert: (id, data) => api.put(`/extension/experts/${id}`, data),
  deleteExpert: (id) => api.delete(`/extension/experts/${id}`),
  approveExpert: (id, data) => api.patch(`/extension/experts/${id}/approve`, data),

  getTeams: () => api.get('/extension/teams'),
  createTeam: (data) => api.post('/extension/teams', data),
  updateTeam: (id, data) => api.put(`/extension/teams/${id}`, data),
  deleteTeam: (id) => api.delete(`/extension/teams/${id}`),
  approveTeam: (id, data) => api.patch(`/extension/teams/${id}/approve`, data)
};