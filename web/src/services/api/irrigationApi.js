import api from '../axios';

/**
 * Universal CRUD helper generating REST endpoints for an Irrigation resource.
 */
const crud = (path) => ({
  list: (params) => api.get(`/irrigation/${path}`, { params }),
  get: (id) => api.get(`/irrigation/${path}/${id}`),
  create: (data) => api.post(`/irrigation/${path}`, data),
  update: (id, data) => api.put(`/irrigation/${path}/${id}`, data),
  patch: (id, data) => api.patch(`/irrigation/${path}/${id}`, data),
  remove: (id) => api.delete(`/irrigation/${path}/${id}`),
});

// =========================================================================
// 1. IRRIGATION STUDY & DESIGN API
// =========================================================================
export const irrigationStudyDesignApi = {
  pipeline: {
    ...crud('pipeline'),
    screen: (id, data) => api.patch(`/irrigation/pipeline/${id}/screening`, data),
  },
  studyDesign: {
    ...crud('study-design'),
    reviewQa: (id, data) => api.patch(`/irrigation/study-design/${id}/review-qa`, data),
    dashboard: (params) => api.get('/irrigation/study-design/dashboard', { params }),
  },
  documentReview: crud('document-review'),
  qualityAssurance: crud('quality-assurance'),
  constructionReady: {
    list: (params) => api.get('/irrigation/construction-ready', { params }),
    get: (id) => api.get(`/irrigation/construction-ready/${id}`),
    patch: (id, data) => api.patch(`/irrigation/construction-ready/${id}`, data),
    handover: (id, data) => api.post(`/irrigation/construction-ready/${id}/handover`, data),
  },
  professionalTraining: crud('capacity-building'),
  inputs: {
    ...crud('inputs'),
    dispatch: (id, data) => api.post(`/irrigation/inputs/${id}/dispatch`, data),
  },
  options: () => api.get('/irrigation/options'),
};

// =========================================================================
// 2. IRRIGATION CONSTRUCTION & MONITORING API
// =========================================================================
export const irrigationConstructionApi = {
  projects: {
    ...crud('construction/projects'),
    evaluateProgress: (id, data) => api.put(`/irrigation/construction/projects/${id}/progress`, data),
  },
  progress: crud('construction/progress'),
  completion: crud('construction/completion'),
  funding: {
    ...crud('construction/funding'),
    disburse: (id, data) => api.post(`/irrigation/construction/funding/${id}/disburse`, data),
  },
  benefits: crud('construction/benefits'),
  options: () => api.get('/irrigation/options'),
};

// =========================================================================
// 3. IRRIGATION INSTITUTIONS MANAGEMENT API
// =========================================================================
export const irrigationInstitutionsApi = {
  waterUsersAssociations: crud('institutions/water-users-associations'),
  associationAudits: {
    list: (params) => api.get('/irrigation/institutions/assessment-audit', { params }),
    get: (id) => api.get(`/irrigation/institutions/assessment-audit/${id}`),
    update: (id, data) => api.put(`/irrigation/institutions/assessment-audit/${id}`, data),
    patch: (id, data) => api.patch(`/irrigation/institutions/assessment-audit/${id}`, data),
    remove: (id) => api.delete(`/irrigation/institutions/assessment-audit/${id}`),
  },
  associationTrainings: crud('institutions/capacity-building'),
  schemeMaintenance: crud('institutions/maintenance-cleaning'),
  options: () => api.get('/irrigation/options'),
};

// =========================================================================
// 4. IRRIGATION WATER UTILIZATION API
// =========================================================================
export const irrigationWaterUtilizationApi = {
  irrigatedArea: crud('water-utilization/irrigated-area'),
  waterSources: crud('water-utilization/water-sources'),
  options: () => api.get('/irrigation/options'),
};

// =========================================================================
// 5. IRRIGATION CROP PRODUCTION & YIELD API
// =========================================================================
export const irrigationCropProductionApi = {
  seasonalProduction: crud('production/seasonal-production'),
  highlandWheat: crud('production/highland-wheat'),
  productionOverview: (params) => api.get('/irrigation/production/overview', { params }),
  options: () => api.get('/irrigation/options'),
};

// =========================================================================
// 6. ANALYTICS & REPORTS API
// =========================================================================
export const irrigationReportsApi = {
  getReport: (name, params) => api.get(`/irrigation/reports/${name}`, { params }),
  options: () => api.get('/irrigation/options'),
};

// =========================================================================
// UNIFIED IRRIGATION API OBJECT
// =========================================================================
export const irrigationApi = {
  // 1. Irrigation Study & Design
  pipeline: irrigationStudyDesignApi.pipeline,
  studyDesign: irrigationStudyDesignApi.studyDesign,
  documentReview: irrigationStudyDesignApi.documentReview,
  qualityAssurance: irrigationStudyDesignApi.qualityAssurance,
  constructionReady: irrigationStudyDesignApi.constructionReady,
  professionalTraining: irrigationStudyDesignApi.professionalTraining,
  inputs: irrigationStudyDesignApi.inputs,

  // 2. Irrigation Construction & Monitoring
  constructionProjects: irrigationConstructionApi.projects,
  constructionProgress: irrigationConstructionApi.progress,
  constructionCompletion: irrigationConstructionApi.completion,
  constructionFunding: irrigationConstructionApi.funding,
  constructionBenefits: irrigationConstructionApi.benefits,

  // 3. Irrigation Institutions Management
  waterUsersAssociations: irrigationInstitutionsApi.waterUsersAssociations,
  associationAudits: irrigationInstitutionsApi.associationAudits,
  associationTrainings: irrigationInstitutionsApi.associationTrainings,
  schemeMaintenance: irrigationInstitutionsApi.schemeMaintenance,

  // 4. Irrigation Water Utilization
  irrigatedArea: irrigationWaterUtilizationApi.irrigatedArea,
  waterSources: irrigationWaterUtilizationApi.waterSources,

  // 5. Irrigation Crop Production & Yield
  seasonalProduction: irrigationCropProductionApi.seasonalProduction,
  highlandWheat: irrigationCropProductionApi.highlandWheat,
  productionOverview: irrigationCropProductionApi.productionOverview,

  // 6. Analytics & Reports
  report: irrigationReportsApi.getReport,

  // Common options
  options: () => api.get('/irrigation/options'),
};

export default irrigationApi;
