import api from '../axios';

export const psnpApi = {
  getHouseholds: () => api.get('/psnp/households'),
  createHousehold: (data) => api.post('/psnp/households', data),
  updateHousehold: (id, data) => api.put(`/psnp/households/${id}`, data),
  deleteHousehold: (id) => api.delete(`/psnp/households/${id}`),

  approveHousehold: (id, data) => api.patch(`/psnp/households/${id}/approve`, data),
  
  createTransfer: (data) => api.post('/psnp/transfers', data),
  deleteTransfer: (id) => api.delete(`/psnp/transfers/${id}`),
  approveTransfer: (id, data) => api.patch(`/psnp/transfers/${id}/approve`, data),
  getEligibleFarmers: () => api.get('/psnp/eligible-farmers'),
  getAllTransfers: () => api.get('/psnp/transfers'),
};