import api from '../axios';

export const landUseApi = {
  getLandUseClassifications: () => api.get('/ncm/land-use-classifications'),
  
  createLandUseClassification: (data) => api.post('/ncm/land-use-classifications', data),
  
  updateLandUseClassification: (id, data) => api.put(`/ncm/land-use-classifications/${id}`, data),
  
  deleteLandUseClassification: (id) => api.delete(`/ncm/land-use-classifications/${id}`),
};