import api from '../axios';
export const watershedApi = {
  getWatersheds: () => api.get('/ncm/watersheds'),
  createWatershed: (data) => api.post('/ncm/watersheds', data),
  updateWatershed: (id, data) => api.put(`/ncm/watersheds/${id}`, data),
  deleteWatershed: (id) => api.delete(`/ncm/watersheds/${id}`),
};