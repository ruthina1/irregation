import api from '../axios';
export const nutritionApi = {
  getProfiles: () => api.get('/psnp/nutrition'),
  createProfile: (data) => api.post('/psnp/nutrition', data),
  updateProfile: (id, data) => api.put(`/psnp/nutrition/${id}`, data),
  deleteProfile: (id) => api.delete(`/psnp/nutrition/${id}`),

  approveProfile: (id, data) => api.patch(`/psnp/nutrition-profiles/${id}/approve`, data),
};