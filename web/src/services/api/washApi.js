import api from '../axios';

export const washApi = {
  // Water
  getWater: () => api.get('/psnp/wash/water'),
  createWater: (data) => api.post('/psnp/wash/water', data),
  updateWater: (id, data) => api.put(`/psnp/wash/water/${id}`, data),
  deleteWater: (id) => api.delete(`/psnp/wash/water/${id}`),
  
  // Sanitation
  getSanitation: () => api.get('/psnp/wash/sanitation'),
  createSanitation: (data) => api.post('/psnp/wash/sanitation', data),
  updateSanitation: (id, data) => api.put(`/psnp/wash/sanitation/${id}`, data),
  deleteSanitation: (id) => api.delete(`/psnp/wash/sanitation/${id}`),

    // Hygiene
  getHygiene: () => api.get('/psnp/wash/hygiene'),
  createHygiene: (data) => api.post('/psnp/wash/hygiene', data),
  updateHygiene: (id, data) => api.put(`/psnp/wash/hygiene/${id}`, data),
  deleteHygiene: (id) => api.delete(`/psnp/wash/hygiene/${id}`),

  // Unified Dedicated Wash Approval
  approveWashProfile: (type, id, data) => api.patch(`/psnp/wash-approvals/${type}/${id}`, data),
};