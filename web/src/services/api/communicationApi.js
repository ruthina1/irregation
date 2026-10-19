import api from '../axios'; 

export const communicationApi = {
  sendBulkSms: (payload) => api.post('/communication/send-sms', payload),
  getSmsLogs: (page = 1, search = '') => api.get(`/communication/logs?page=${page}&search=${search}`),
  getSmsStats: () => api.get('/communication/stats'),
};