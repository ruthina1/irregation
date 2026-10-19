import api from '../axios';

export const mediaApi = {
    // ==================== DOCUMENTS ====================
    getDocuments: (params) => api.get('/media/documents', { params }),
    createDocument: (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined && data[key] !== null) {
                formData.append(key, data[key]);
            }
        });
        return api.post('/media/documents', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    getDocument: (id) => api.get(`/media/documents/${id}`),
    updateDocument: (id, data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined && data[key] !== null) {
                formData.append(key, data[key]);
            }
        });
        formData.append('_method', 'PUT');
        return api.post(`/media/documents/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    deleteDocument: (id) => api.delete(`/media/documents/${id}`),
    downloadDocument: (id) => api.get(`/media/documents/${id}/download`, { responseType: 'blob' }),
    getDocumentStats: () => api.get('/media/documents/stats'),

    // ==================== GALLERIES ====================
    getGalleries: (params) => api.get('/media/galleries', { params }),
    createGallery: (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined && data[key] !== null) {
                formData.append(key, data[key]);
            }
        });
        return api.post('/media/galleries', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    getGallery: (id) => api.get(`/media/galleries/${id}`),
    updateGallery: (id, data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined && data[key] !== null) {
                formData.append(key, data[key]);
            }
        });
        formData.append('_method', 'PUT');
        return api.post(`/media/galleries/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    deleteGallery: (id) => api.delete(`/media/galleries/${id}`),
    getGalleryStats: () => api.get('/media/galleries/stats'),

    // ==================== VIDEOS ====================
    getVideos: (params) => api.get('/media/videos', { params }),
    createVideo: (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined && data[key] !== null) {
                formData.append(key, data[key]);
            }
        });
        return api.post('/media/videos', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    getVideo: (id) => api.get(`/media/videos/${id}`),
    updateVideo: (id, data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined && data[key] !== null) {
                formData.append(key, data[key]);
            }
        });
        formData.append('_method', 'PUT');
        return api.post(`/media/videos/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    deleteVideo: (id) => api.delete(`/media/videos/${id}`),
    getVideoStats: () => api.get('/media/videos/stats'),

    // ==================== NEWS ====================
    getNews: (params) => api.get('/media/news', { params }),
    createNews: (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined && data[key] !== null) {
                formData.append(key, data[key]);
            }
        });
        return api.post('/media/news', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    getNewsItem: (id) => api.get(`/media/news/${id}`),
    updateNews: (id, data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined && data[key] !== null) {
                formData.append(key, data[key]);
            }
        });
        formData.append('_method', 'PUT');
        return api.post(`/media/news/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    deleteNews: (id) => api.delete(`/media/news/${id}`),
    getNewsStats: () => api.get('/media/news/stats'),
    // ==================== FEEDBACK ====================
    submitFeedback: (data) => api.post('/feedback', data),
    getFeedbacks: (params) => api.get('/admin/feedback', { params }),
    updateFeedbackStatus: (id, status) => api.patch(`/admin/feedback/${id}/status`, { status }),
    deleteFeedback: (id) => api.delete(`/admin/feedback/${id}`),
};