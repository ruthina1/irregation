import api from '../axios';

export const extensionApi = {
  // FTC Endpoints
  getFtcs: (page = 1) => api.get(`/extension/ftcs?page=${page}`),
  createFtc: (payload) => api.post('/extension/ftcs', payload),
  updateFtc: (id, payload) => api.put(`/extension/ftcs/${id}`, payload),
  deleteFtc: (id) => api.delete(`/extension/ftcs/${id}`),
  
  approveFtc: (id, payload) => api.patch(`/extension/ftcs/${id}/approve`, payload),


  // ==================== MECHANIZATION MANAGEMENT ====================
  // Location Helpers
  getMechanizationZones: () => api.get('/extension/mechanization/zones'),
  getMechanizationWoredas: (zoneId) => api.get(`/extension/mechanization/woredas?zone_id=${zoneId}`),
  getMechanizationKebeles: (woredaId) => api.get(`/extension/mechanization/kebeles?woreda_id=${woredaId}`),
  getZones: () => api.get('/extension/mechanization/zones'),
  getWoredas: (zoneId) => api.get(`/extension/mechanization/woredas?zone_id=${zoneId}`),
  getKebeles: (woredaId) => api.get(`/extension/mechanization/kebeles?woreda_id=${woredaId}`),
  
  // Farmers (for dropdown)
  getMechanizationFarmers: (params) => api.get('/extension/mechanization/farmers', { params }),
  getFarmers: (params) => api.get('/extension/mechanization/farmers', { params }),
  
  // Statistics
  getMechanizationStats: () => api.get('/extension/mechanization/stats'),
  getStats: () => api.get('/extension/mechanization/stats'),
  
  // Equipments (Full names)
  getMechanizationEquipments: (params) => api.get('/extension/mechanization/equipments', { params }),
  createMechanizationEquipment: (data) => api.post('/extension/mechanization/equipments', data),
  getMechanizationEquipment: (id) => api.get(`/extension/mechanization/equipments/${id}`),
  updateMechanizationEquipment: (id, data) => api.put(`/extension/mechanization/equipments/${id}`, data),
  deleteMechanizationEquipment: (id) => api.delete(`/extension/mechanization/equipments/${id}`),
  approveMechanizationEquipment: (id) => api.post(`/extension/mechanization/equipments/${id}/approve`),
  submitMechanizationEquipment: (id) => api.post(`/extension/mechanization/equipments/${id}/submit`),

  // Equipments (Short aliases)
  getEquipments: (params) => api.get('/extension/mechanization/equipments', { params }),
  createEquipment: (data) => api.post('/extension/mechanization/equipments', data),
  getEquipment: (id) => api.get(`/extension/mechanization/equipments/${id}`),
  updateEquipment: (id, data) => api.put(`/extension/mechanization/equipments/${id}`, data),
  deleteEquipment: (id) => api.delete(`/extension/mechanization/equipments/${id}`),
  approveEquipment: (id) => api.post(`/extension/mechanization/equipments/${id}/approve`),
  submitEquipment: (id) => api.post(`/extension/mechanization/equipments/${id}/submit`),
  
  // Allocations (Full names)
  getMechanizationAllocations: (params) => api.get('/extension/mechanization/allocations', { params }),
  createMechanizationAllocation: (data) => api.post('/extension/mechanization/allocations', data),
  getMechanizationAllocation: (id) => api.get(`/extension/mechanization/allocations/${id}`),
  updateMechanizationAllocation: (id, data) => api.put(`/extension/mechanization/allocations/${id}`, data),
  deleteMechanizationAllocation: (id) => api.delete(`/extension/mechanization/allocations/${id}`),
  approveMechanizationAllocation: (id) => api.post(`/extension/mechanization/allocations/${id}/approve`),
  completeMechanizationAllocation: (id) => api.post(`/extension/mechanization/allocations/${id}/complete`),

  // Allocations (Short aliases)
  getAllocations: (params) => api.get('/extension/mechanization/allocations', { params }),
  createAllocation: (data) => api.post('/extension/mechanization/allocations', data),
  getAllocation: (id) => api.get(`/extension/mechanization/allocations/${id}`),
  updateAllocation: (id, data) => api.put(`/extension/mechanization/allocations/${id}`, data),
  deleteAllocation: (id) => api.delete(`/extension/mechanization/allocations/${id}`),
  approveAllocation: (id) => api.post(`/extension/mechanization/allocations/${id}/approve`),
  completeAllocation: (id) => api.post(`/extension/mechanization/allocations/${id}/complete`),
  
  // Maintenances (Full names)
  getMechanizationMaintenances: (params) => api.get('/extension/mechanization/maintenances', { params }),
  createMechanizationMaintenance: (data) => api.post('/extension/mechanization/maintenances', data),
  getMechanizationMaintenance: (id) => api.get(`/extension/mechanization/maintenances/${id}`),
  updateMechanizationMaintenance: (id, data) => api.put(`/extension/mechanization/maintenances/${id}`, data),
  deleteMechanizationMaintenance: (id) => api.delete(`/extension/mechanization/maintenances/${id}`),
  completeMechanizationMaintenance: (id) => api.post(`/extension/mechanization/maintenances/${id}/complete`),
  verifyMechanizationMaintenance: (id) => api.post(`/extension/mechanization/maintenances/${id}/verify`),

  // Maintenances (Short aliases)
  getMaintenances: (params) => api.get('/extension/mechanization/maintenances', { params }),
  createMaintenance: (data) => api.post('/extension/mechanization/maintenances', data),
  getMaintenance: (id) => api.get(`/extension/mechanization/maintenances/${id}`),
  updateMaintenance: (id, data) => api.put(`/extension/mechanization/maintenances/${id}`, data),
  deleteMaintenance: (id) => api.delete(`/extension/mechanization/maintenances/${id}`),
  completeMaintenance: (id) => api.post(`/extension/mechanization/maintenances/${id}/complete`),
  verifyMaintenance: (id) => api.post(`/extension/mechanization/maintenances/${id}/verify`),


  // ==================== COOPERATIVE MANAGEMENT ====================
  // Location Helpers
  getCooperativeZones: () => api.get('/extension/cooperative/zones'),
  getCooperativeWoredas: (zoneId) => api.get(`/extension/cooperative/woredas?zone_id=${zoneId}`),
  getCooperativeKebeles: (woredaId) => api.get(`/extension/cooperative/kebeles?woreda_id=${woredaId}`),

  // Farmers (for dropdown)
  getCooperativeFarmers: (params) => api.get('/extension/cooperative/farmers', { params }),

  // Statistics
  getCooperativeStats: () => api.get('/extension/cooperative/stats'),

  // Cooperatives
  getCooperatives: (params) => api.get('/extension/cooperative/cooperatives', { params }),
  createCooperative: (data) => api.post('/extension/cooperative/cooperatives', data),
  getCooperative: (id) => api.get(`/extension/cooperative/cooperatives/${id}`),
  updateCooperative: (id, data) => api.put(`/extension/cooperative/cooperatives/${id}`, data),
  deleteCooperative: (id) => api.delete(`/extension/cooperative/cooperatives/${id}`),
  approveCooperative: (id) => api.post(`/extension/cooperative/cooperatives/${id}/approve`),
  submitCooperative: (id) => api.post(`/extension/cooperative/cooperatives/${id}/submit`),

  // Members
  getCooperativeMembers: (params) => api.get('/extension/cooperative/members', { params }),
  createCooperativeMember: (data) => api.post('/extension/cooperative/members', data),
  getCooperativeMember: (id) => api.get(`/extension/cooperative/members/${id}`),
  updateCooperativeMember: (id, data) => api.put(`/extension/cooperative/members/${id}`, data),
  deleteCooperativeMember: (id) => api.delete(`/extension/cooperative/members/${id}`),
  approveCooperativeMember: (id) => api.post(`/extension/cooperative/members/${id}/approve`),

  // Activities
  getCooperativeActivities: (params) => api.get('/extension/cooperative/activities', { params }),
  createCooperativeActivity: (data) => api.post('/extension/cooperative/activities', data),
  getCooperativeActivity: (id) => api.get(`/extension/cooperative/activities/${id}`),
  updateCooperativeActivity: (id, data) => api.put(`/extension/cooperative/activities/${id}`, data),
  deleteCooperativeActivity: (id) => api.delete(`/extension/cooperative/activities/${id}`),
  approveCooperativeActivity: (id) => api.post(`/extension/cooperative/activities/${id}/approve`),
  completeCooperativeActivity: (id) => api.post(`/extension/cooperative/activities/${id}/complete`),
};

