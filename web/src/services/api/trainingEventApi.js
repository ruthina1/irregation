import api from '../axios';

export const trainingEventApi = {
  getEvents: (params) => api.get('extension/training-events', { params }),
  createEvent: (data) => api.post('extension/training-events', data),
  updateEvent: (id, data) => api.put(`extension/training-events/${id}`, data),
  deleteEvent: (id) => api.delete(`extension/training-events/${id}`),
  approveEvent: (id, data) => api.patch(`extension/training-events/${id}/approve`, data),
};