import api from '../axios';

export const modelVillageApi = {
  getCertifications: () => api.get('/psnp/model-villages'),
  createCertification: (data) => api.post('/psnp/model-villages', data),
  updateCertification: (id, data) => api.put(`/psnp/model-villages/${id}`, data),
  deleteCertification: (id) => api.delete(`/psnp/model-villages/${id}`),

  approveCertification: (id, data) => api.patch(`/psnp/village-certifications/${id}/approve`, data),
};