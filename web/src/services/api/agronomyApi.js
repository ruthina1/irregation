import api from '../axios';

const agronomyApi = {

    // ==================== LOCATION APIs ====================
    getZones: () => api.get('/zones'),
    getWoredas: (zoneId) => api.get('/woredas', { params: (zoneId && zoneId !== 'undefined') ? { zone_id: zoneId } : {} }),
    getKebeles: (woredaId) => api.get('/kebeles', { params: (woredaId && woredaId !== 'undefined') ? { woreda_id: woredaId } : {} }),

    // ==================== LAND PARCELS ==================== 
    createLandParcel: (data) => api.post('/agronomy/land-parcels', data),
    updateLandParcel: (id, data) => api.put(`/agronomy/land-parcels/${id}`, data),
    deleteLandParcel: (id) => api.delete(`/agronomy/land-parcels/${id}`),
    getLandParcels: (params) => api.get('/agronomy/land-parcels', { params }),
    getLandParcel: (id) => api.get(`/agronomy/land-parcels/${id}`),

    // ==================== SEASONAL CROPS ====================
    createSeasonalCrop: (data) => api.post('/agronomy/seasonal-crops', data),
    updateSeasonalCrop: (id, data) => api.put(`/agronomy/seasonal-crops/${id}`, data),
    getSeasonalCrops: (params) => api.get('/agronomy/seasonal-crops', { params }),
    getSeasonalCrop: (id) => api.get(`/agronomy/seasonal-crops/${id}`),

    // ==================== SEED MULTIPLICATIONS ====================
    createSeedMultiplication: (data) => api.post('/agronomy/seed-multiplications', data),
    getSeedMultiplications: (params) => api.get('/agronomy/seed-multiplications', { params }),
    getSeedMultiplication: (id) => api.get(`/agronomy/seed-multiplications/${id}`),

    // ==================== PEST / DISEASE / WEED REPORTS ====================
    createPestReport: (data) => api.post('/agronomy/pest-reports', data),
    getPestReports: (params) => api.get('/agronomy/pest-reports', { params }),
    getEmergencyReports: () => api.get('/agronomy/pest-reports/emergency'),
    getPestReport: (id) => api.get(`/agronomy/pest-reports/${id}`),
    getPestAnalytics: () => api.get('/agronomy/pest-reports/analytics'),

    // ==================== INPUT DISTRIBUTIONS ====================
    createInputDistribution: (data) => api.post('/agronomy/input-distributions', data),
    getInputDistributions: (params) => api.get('/agronomy/input-distributions', { params }),

    // ==================== INPUT REGISTRATIONS ====================
    createInputRegistration: (data) => api.post('/agronomy/input-registrations', data),
    updateInputRegistration: (id, data) => api.put(`/agronomy/input-registrations/${id}`, data),
    deleteInputRegistration: (id) => api.delete(`/agronomy/input-registrations/${id}`),
    getInputRegistrations: (params) => api.get('/agronomy/input-registrations', { params }),
    updateInputRegistrationStatus: (id, status) => api.patch(`/agronomy/input-registrations/${id}/status`, { approval_status: status }),

    // ==================== IRRIGATION PROJECTS ====================
    createIrrigationProject: (data) => api.post('/agronomy/irrigation-projects', data),
    updateIrrigationProject: (id, data) => api.put(`/agronomy/irrigation-projects/${id}`, data),
    deleteIrrigationProject: (id) => api.delete(`/agronomy/irrigation-projects/${id}`),
    getIrrigationProjects: (params) => api.get('/agronomy/irrigation-projects', { params }),
    getIrrigationProject: (id) => api.get(`/agronomy/irrigation-projects/${id}`),

    // ==================== FORESTRY MANAGEMENT ====================
    createForest: (data) => api.post('/agronomy/forestry/forests', data),
    updateForest: (id, data) => api.put(`/agronomy/forestry/forests/${id}`, data),
    deleteForest: (id) => api.delete(`/agronomy/forestry/forests/${id}`),
    getForests: (params) => api.get('/agronomy/forestry/forests', { params }),
    getForest: (id) => api.get(`/agronomy/forestry/forests/${id}`),
    approveForest: (id) => api.post(`/agronomy/forestry/forests/${id}/approve`),

    createPlantation: (data) => api.post('/agronomy/forestry/plantations', data),
    updatePlantation: (id, data) => api.put(`/agronomy/forestry/plantations/${id}`, data),
    deletePlantation: (id) => api.delete(`/agronomy/forestry/plantations/${id}`),
    getPlantations: (params) => api.get('/agronomy/forestry/plantations', { params }),
    getPlantation: (id) => api.get(`/agronomy/forestry/plantations/${id}`),

    createReforestationProject: (data) => api.post('/agronomy/forestry/projects', data),
    updateReforestationProject: (id, data) => api.put(`/agronomy/forestry/projects/${id}`, data),
    deleteReforestationProject: (id) => api.delete(`/agronomy/forestry/projects/${id}`),
    getReforestationProjects: (params) => api.get('/agronomy/forestry/projects', { params }),
    getReforestationProject: (id) => api.get(`/agronomy/forestry/projects/${id}`),
    approveReforestationProject: (id) => api.post(`/agronomy/forestry/projects/${id}/approve`),

    createForestProtection: (data) => api.post('/agronomy/forestry/protections', data),
    updateForestProtection: (id, data) => api.put(`/agronomy/forestry/protections/${id}`, data),
    deleteForestProtection: (id) => api.delete(`/agronomy/forestry/protections/${id}`),
    getForestProtections: (params) => api.get('/agronomy/forestry/protections', { params }),
    getForestProtection: (id) => api.get(`/agronomy/forestry/protections/${id}`),

    // Tree Nurseries
    getNurseries: (params) => api.get('/agronomy/nurseries', { params }),
    getNursery: (id) => api.get(`/agronomy/nurseries/${id}`),
    createNursery: (data) => api.post('/agronomy/nurseries', data),
    updateNursery: (id, data) => api.put(`/agronomy/nurseries/${id}`, data),
    deleteNursery: (id) => api.delete(`/agronomy/nurseries/${id}`),
    approveNursery: (id) => api.post(`/agronomy/nurseries/${id}/approve`),
    submitNursery: (id) => api.post(`/agronomy/nurseries/${id}/submit`),
    getNurseryStats: () => api.get('/agronomy/nursery/stats'),

    // ==================== LAND REHABILITATION MANAGEMENT ====================
    getRehabStats: () => api.get('/agronomy/rehabilitation/stats'),

    getRehabilitationProjects: (params) => api.get('/agronomy/rehabilitation/projects', { params }),
    createRehabilitationProject: (data) => api.post('/agronomy/rehabilitation/projects', data),
    getRehabilitationProject: (id) => api.get(`/agronomy/rehabilitation/projects/${id}`),
    updateRehabilitationProject: (id, data) => api.put(`/agronomy/rehabilitation/projects/${id}`, data),
    deleteRehabilitationProject: (id) => api.delete(`/agronomy/rehabilitation/projects/${id}`),
    approveRehabilitationProject: (id) => api.post(`/agronomy/rehabilitation/projects/${id}/approve`),
    submitRehabilitationProject: (id) => api.post(`/agronomy/rehabilitation/projects/${id}/submit`),

    getRehabilitationActivities: (params) => api.get('/agronomy/rehabilitation/activities', { params }),
    createRehabilitationActivity: (data) => api.post('/agronomy/rehabilitation/activities', data),
    getRehabilitationActivity: (id) => api.get(`/agronomy/rehabilitation/activities/${id}`),
    updateRehabilitationActivity: (id, data) => api.put(`/agronomy/rehabilitation/activities/${id}`, data),
    deleteRehabilitationActivity: (id) => api.delete(`/agronomy/rehabilitation/activities/${id}`),

    getRehabilitationAssessments: (params) => api.get('/agronomy/rehabilitation/assessments', { params }),
    createRehabilitationAssessment: (data) => api.post('/agronomy/rehabilitation/assessments', data),
    getRehabilitationAssessment: (id) => api.get(`/agronomy/rehabilitation/assessments/${id}`),
    updateRehabilitationAssessment: (id, data) => api.put(`/agronomy/rehabilitation/assessments/${id}`, data),
    deleteRehabilitationAssessment: (id) => api.delete(`/agronomy/rehabilitation/assessments/${id}`),
    verifyRehabilitationAssessment: (id) => api.post(`/agronomy/rehabilitation/assessments/${id}/verify`),
// ==================== CROP REGISTRATION MANAGEMENT ====================

// Statistics
getCropStats: () => api.get('/agronomy/crops/stats'),

// Registrations
getCropRegistrations: (params) => api.get('/agronomy/crops/registrations', { params }),
createCropRegistration: (data) => api.post('/agronomy/crops/registrations', data),
getCropRegistration: (id) => api.get(`/agronomy/crops/registrations/${id}`),
updateCropRegistration: (id, data) => api.put(`/agronomy/crops/registrations/${id}`, data),
deleteCropRegistration: (id) => api.delete(`/agronomy/crops/registrations/${id}`),
approveCropRegistration: (id) => api.post(`/agronomy/crops/registrations/${id}/approve`),
submitCropRegistration: (id) => api.post(`/agronomy/crops/registrations/${id}/submit`),
updateCropStatus: (id, data) => api.patch(`/agronomy/crops/registrations/${id}/status`, data),

// Productions
getCropProductions: (params) => api.get('/agronomy/crops/productions', { params }),
createCropProduction: (data) => api.post('/agronomy/crops/productions', data),
getCropProduction: (id) => api.get(`/agronomy/crops/productions/${id}`),
updateCropProduction: (id, data) => api.put(`/agronomy/crops/productions/${id}`, data),
deleteCropProduction: (id) => api.delete(`/agronomy/crops/productions/${id}`),

// Harvests
getCropHarvests: (params) => api.get('/agronomy/crops/harvests', { params }),
createCropHarvest: (data) => api.post('/agronomy/crops/harvests', data),
getCropHarvest: (id) => api.get(`/agronomy/crops/harvests/${id}`),
updateCropHarvest: (id, data) => api.put(`/agronomy/crops/harvests/${id}`, data),
deleteCropHarvest: (id) => api.delete(`/agronomy/crops/harvests/${id}`),
verifyCropHarvest: (id) => api.post(`/agronomy/crops/harvests/${id}/verify`),

// ==================== SEED REGISTRATION MANAGEMENT ====================
// Statistics
getSeedStats: () => api.get('/agronomy/seed/stats'),

// Seed Varieties
getSeedVarieties: (params) => api.get('/agronomy/seed/varieties', { params }),
createSeedVariety: (data) => api.post('/agronomy/seed/varieties', data),
getSeedVariety: (id) => api.get(`/agronomy/seed/varieties/${id}`),
updateSeedVariety: (id, data) => api.put(`/agronomy/seed/varieties/${id}`, data),
deleteSeedVariety: (id) => api.delete(`/agronomy/seed/varieties/${id}`),

// Seed Registrations
getSeedRegistrations: (params) => api.get('/agronomy/seed/registrations', { params }),
createSeedRegistration: (data) => api.post('/agronomy/seed/registrations', data),
getSeedRegistration: (id) => api.get(`/agronomy/seed/registrations/${id}`),
updateSeedRegistration: (id, data) => api.put(`/agronomy/seed/registrations/${id}`, data),
deleteSeedRegistration: (id) => api.delete(`/agronomy/seed/registrations/${id}`),
approveSeedRegistration: (id) => api.post(`/agronomy/seed/registrations/${id}/approve`),
submitSeedRegistration: (id) => api.post(`/agronomy/seed/registrations/${id}/submit`),
certifySeedRegistration: (id) => api.post(`/agronomy/seed/registrations/${id}/certify`),

// Seed Distributions
getSeedDistributions: (params) => api.get('/agronomy/seed/distributions', { params }),
createSeedDistribution: (data) => api.post('/agronomy/seed/distributions', data),
getSeedDistribution: (id) => api.get(`/agronomy/seed/distributions/${id}`),
updateSeedDistribution: (id, data) => api.put(`/agronomy/seed/distributions/${id}`, data),
deleteSeedDistribution: (id) => api.delete(`/agronomy/seed/distributions/${id}`),
verifySeedDistribution: (id) => api.post(`/agronomy/seed/distributions/${id}/verify`),
// ==================== IRRIGATION MAINTENANCE MANAGEMENT ====================
// Irrigation Projects (for dropdown)
getIrrigationMaintenanceProjects: (params) => api.get('/agronomy/irrigation-maintenance/projects', { params }),

// Statistics
getIrrigationMaintenanceStats: () => api.get('/agronomy/irrigation-maintenance/stats'),

// Maintenance CRUD
getIrrigationMaintenances: (params) => api.get('/agronomy/irrigation-maintenance', { params }),
createIrrigationMaintenance: (data) => api.post('/agronomy/irrigation-maintenance', data),
getIrrigationMaintenance: (id) => api.get(`/agronomy/irrigation-maintenance/${id}`),
updateIrrigationMaintenance: (id, data) => api.put(`/agronomy/irrigation-maintenance/${id}`, data),
deleteIrrigationMaintenance: (id) => api.delete(`/agronomy/irrigation-maintenance/${id}`),
approveIrrigationMaintenance: (id) => api.post(`/agronomy/irrigation-maintenance/${id}/approve`),
verifyIrrigationMaintenance: (id) => api.post(`/agronomy/irrigation-maintenance/${id}/verify`),
submitIrrigationMaintenance: (id) => api.post(`/agronomy/irrigation-maintenance/${id}/submit`),
completeIrrigationMaintenance: (id) => api.post(`/agronomy/irrigation-maintenance/${id}/complete`),

// Activities
getIrrigationMaintenanceActivities: (params) => api.get('/agronomy/irrigation-maintenance/activities', { params }),
createIrrigationMaintenanceActivity: (data) => api.post('/agronomy/irrigation-maintenance/activities', data),
getIrrigationMaintenanceActivity: (id) => api.get(`/agronomy/irrigation-maintenance/activities/${id}`),
updateIrrigationMaintenanceActivity: (id, data) => api.put(`/agronomy/irrigation-maintenance/activities/${id}`, data),
deleteIrrigationMaintenanceActivity: (id) => api.delete(`/agronomy/irrigation-maintenance/activities/${id}`),
completeIrrigationMaintenanceActivity: (id) => api.post(`/agronomy/irrigation-maintenance/activities/${id}/complete`),
};


export default agronomyApi;