import api from '../axios';

export const meraApi = {
  getSummary: (filters = {}) => 
    api.get('/mera/summary', { params: filters }),

  getAdminSummary: () => 
    api.get('/mera/admin-summary'),

  getLiveMetrics: () => 
    api.get('/mera/metrics'),

  getSettings: () => 
    api.get('/mera/settings'),

 
  exportDataToExcel: (type, filters = {}) => {
    return api.get(`/mera/export/${type}`, {
      params: filters,
      responseType: 'blob',
    });
  },

  getTableData: (type, filters = {}, page = 1) => 
    api.get(`/mera/table-data/${type}`, { params: { ...filters, page } }),

  updateSettings: (settingsArray) =>
    api.post('/mera/settings', { settings: settingsArray }),

  getBackups: () => 
    api.get('/mera/backups'),

  triggerBackup: () => 
    api.post('/mera/backups/create'),

  downloadBackupFile: (id) => {
    window.open(`/api/v1/mera/backups/${id}/download`, '_blank');
  },

  restoreBackup: (id) =>
    api.post(`/mera/backups/${id}/restore`),

  deleteBackup: (id) =>
    api.delete(`/mera/backups/${id}`),

  getLogs: (page = 1, severity = '') => {
    const params = { page };
    if (severity && severity.trim() !== '') {
      params.severity = severity;
    }
    return api.get('/mera/logs', { params });
  },

  clearAllLogs: () =>
    api.delete('/mera/logs/clear'),

  clearSystemCache: () =>
    api.post('/mera/actions/clear-cache'),

  restartQueueWorkers: () =>
    api.post('/mera/actions/restart-queue'),

  toggleMaintenanceMode: (enabled) =>
    api.post('/mera/actions/toggle-maintenance', {
      maintenance: enabled,
    }),

  getAnalyticsOverview: (filters = {}) => 
    api.get('/mera/analytics/overview', { params: filters }),


  getStrategicPlans: (params) => api.get('/mera/strategic-plans', { params }),
  createStrategicPlan: (data) => api.post('/mera/strategic-plans', data),
  updateStrategicPlan: (id, data) => api.put(`/mera/strategic-plans/${id}`, data),
  deleteStrategicPlan: (id) => api.delete(`/mera/strategic-plans/${id}`),
  updatePlanMetric: (id, data) => api.put(`/mera/plan-metrics/${id}`, data),
  approveStrategicPlan: (id, data) => api.patch(`/mera/strategic-plans/${id}/approve`, data),

   getAnnualReport: (year) => api.get('/mera/annual-report', { params: { year } }),

   
};