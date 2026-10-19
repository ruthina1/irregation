import api from '../axios';

export const locationApi = {
    // Zone Endpoints
    getZones: () => api.get('/zones'),
    createZone: (payload) => api.post('/zones', payload),
    updateZone: (id, payload) => api.put(`/zones/${id}`, payload),
    deleteZone: (id) => api.delete(`/zones/${id}`),

    // Woreda Endpoints
    getWoredas: (zoneId = null) => {
        const url = zoneId ? `/woredas?zone_id=${zoneId}` : '/woredas';
        return api.get(url);
    },
    createWoreda: (payload) => api.post('/woredas', payload),
    updateWoreda: (id, payload) => api.put(`/woredas/${id}`, payload),
    deleteWoreda: (id) => api.delete(`/woredas/${id}`),

    // Kebele Endpoints
    getKebeles: (woredaId = null) => {
        const url = woredaId ? `/kebeles?woreda_id=${woredaId}` : '/kebeles';
        return api.get(url);
    },
    createKebele: (payload) => api.post('/kebeles', payload),
    updateKebele: (id, payload) => api.put(`/kebeles/${id}`, payload),
    deleteKebele: (id) => api.delete(`/kebeles/${id}`),
};