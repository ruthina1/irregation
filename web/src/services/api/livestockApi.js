import api from '../axios';

export const livestockApi = {
    // Location Helpers
    getZones: () => api.get('/livestock/zones'),
    getWoredas: (zoneId) => api.get(`/livestock/woredas?zone_id=${zoneId}`),
    getKebeles: (woredaId) => api.get(`/livestock/kebeles?woreda_id=${woredaId}`),
    
    // Farmers (for dropdown)
    getFarmers: (params) => api.get('/livestock/farmers', { params }),
    
    // Statistics
    getStats: () => api.get('/livestock/stats'),
    
    // Farms
    getFarms: (params) => api.get('/livestock/farms', { params }),
    createFarm: (data) => api.post('/livestock/farms', data),
    getFarm: (id) => api.get(`/livestock/farms/${id}`),
    updateFarm: (id, data) => api.put(`/livestock/farms/${id}`, data),
    deleteFarm: (id) => api.delete(`/livestock/farms/${id}`),
    approveFarm: (id) => api.post(`/livestock/farms/${id}/approve`),
    submitFarm: (id) => api.post(`/livestock/farms/${id}/submit`),
    
    // Animals
    getAnimals: (params) => api.get('/livestock/animals', { params }),
    createAnimal: (data) => api.post('/livestock/animals', data),
    getAnimal: (id) => api.get(`/livestock/animals/${id}`),
    updateAnimal: (id, data) => api.put(`/livestock/animals/${id}`, data),
    deleteAnimal: (id) => api.delete(`/livestock/animals/${id}`),
    
    // Productions
    getProductions: (params) => api.get('/livestock/productions', { params }),
    createProduction: (data) => api.post('/livestock/productions', data),
    getProduction: (id) => api.get(`/livestock/productions/${id}`),
    updateProduction: (id, data) => api.put(`/livestock/productions/${id}`, data),
    deleteProduction: (id) => api.delete(`/livestock/productions/${id}`),
    verifyProduction: (id) => api.post(`/livestock/productions/${id}/verify`),
};