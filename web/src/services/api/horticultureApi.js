import api from '../axios';

export const horticultureApi = {
    // ==================== LOCATION HELPERS ====================
    getZones: () => api.get('/ncm/horticulture/zones'),
    getWoredas: (zoneId) => api.get(`/ncm/horticulture/woredas?zone_id=${zoneId}`),
    getKebeles: (woredaId) => api.get(`/ncm/horticulture/kebeles?woreda_id=${woredaId}`),

    // ==================== FARMERS (for dropdown) ====================
    getFarmers: (params) => api.get('/ncm/horticulture/farmers', { params }),

    // ==================== STATISTICS ====================
    getStats: () => api.get('/ncm/horticulture/stats'),

    // ==================== FARMS ====================
    getFarms: (params) => api.get('/ncm/horticulture/farms', { params }),
    createFarm: (data) => api.post('/ncm/horticulture/farms', data),
    getFarm: (id) => api.get(`/ncm/horticulture/farms/${id}`),
    updateFarm: (id, data) => api.put(`/ncm/horticulture/farms/${id}`, data),
    deleteFarm: (id) => api.delete(`/ncm/horticulture/farms/${id}`),
    approveFarm: (id) => api.post(`/ncm/horticulture/farms/${id}/approve`),
    submitFarm: (id) => api.post(`/ncm/horticulture/farms/${id}/submit`),

    // ==================== PRODUCTIONS ====================
    getProductions: (params) => api.get('/ncm/horticulture/productions', { params }),
    createProduction: (data) => api.post('/ncm/horticulture/productions', data),
    getProduction: (id) => api.get(`/ncm/horticulture/productions/${id}`),
    updateProduction: (id, data) => api.put(`/ncm/horticulture/productions/${id}`, data),
    deleteProduction: (id) => api.delete(`/ncm/horticulture/productions/${id}`),

    // ==================== HARVESTS ====================
    getHarvests: (params) => api.get('/ncm/horticulture/harvests', { params }),
    createHarvest: (data) => api.post('/ncm/horticulture/harvests', data),
    getHarvest: (id) => api.get(`/ncm/horticulture/harvests/${id}`),
    updateHarvest: (id, data) => api.put(`/ncm/horticulture/harvests/${id}`, data),
    deleteHarvest: (id) => api.delete(`/ncm/horticulture/harvests/${id}`),
    verifyHarvest: (id) => api.post(`/ncm/horticulture/harvests/${id}/verify`),
};

export default horticultureApi;