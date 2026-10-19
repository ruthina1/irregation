import api from '../axios';
export const farmerApi = {
  getFarmers: (params) => api.get('/extension/farmers', { params }),
  createFarmer: (data) => api.post('/extension/farmers', data),
  updateFarmer: (id, data) => api.put(`/extension/farmers/${id}`, data),
  deleteFarmer: (id) => api.delete(`/extension/farmers/${id}`),
  approveFarmer: (id, data) => api.patch(`/extension/farmers/${id}/approve`, data),
};