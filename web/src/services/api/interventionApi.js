import api from '../axios';

export const interventionApi = {
  getInterventions: () => api.get('/ncm/interventions'),
  createIntervention: (data) => api.post('/ncm/interventions', data),
  updateIntervention: (id, data) => api.put(`/ncm/interventions/${id}`, data),
  deleteIntervention: (id) => api.delete(`/ncm/interventions/${id}`),
};