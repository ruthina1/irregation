import api from '../axios';
export const empowermentApi = {
  getProfiles: () => api.get('/psnp/empowerment'),
  createProfile: (data) => api.post('/psnp/empowerment', data),
  updateProfile: (id, data) => api.put(`/psnp/empowerment/${id}`, data),
  deleteProfile: (id) => api.delete(`/psnp/empowerment/${id}`),

  approveProfile: (id, data) => api.patch(`/psnp/empowerment-profiles/${id}/approve`, data),
};