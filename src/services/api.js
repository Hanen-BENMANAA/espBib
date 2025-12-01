import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const session = JSON.parse(localStorage.getItem('esprim_session') || '{}');
  if (session.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('esprim_session');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials).then(r => r.data),
  logout: () => {
    localStorage.removeItem('esprim_session');
    window.location.href = '/login';
  }
};

export const studentReportsAPI = {
  submitReport: (formData) =>
    api.post('/reports/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data),

  getMySubmissions: () => api.get('/reports/my-submissions').then(r => r.data),

  getReportById: (id) => api.get(`/reports/${id}`).then(r => r.data)
};

export const teacherReportsAPI = {
  getAssignedReports: () => api.get('/reports/assigned-to-me').then(r => r.data),
  getPendingReports: () => api.get('/reports/pending-for-teacher').then(r => r.data),
  getTeacherStats: () => api.get('/reports/teacher-stats').then(r => r.data),

  getReportById: (id) => api.get(`/reports/${id}`).then(r => r.data),

  validateReport: (reportId, { decision, comments = '' }) =>
    api.put(`/reports/${reportId}/validate`, { decision, comments }).then(r => r.data),

  updateChecklist: (reportId, checklist) =>
    api.put(`/reports/${reportId}/checklist`, { checklist }).then(r => r.data),

  addComment: (reportId, content) =>
    api.post(`/reports/${reportId}/comments`, { content }).then(r => r.data),

  updateComment: (commentId, content) =>
    api.put(`/comments/${commentId}`, { content }).then(r => r.data),

  deleteComment: (commentId) =>
    api.delete(`/comments/${commentId}`).then(r => r.data),
};

export const notificationsAPI = {
  getMyNotifications: () => api.get('/notifications').then(r => r.data),

  getUnreadCount: () => api.get('/notifications/unread-count').then(r => r.data),

  markAsRead: (notificationId) =>
    api.put(`/notifications/${notificationId}/read`).then(r => r.data),

  markAllAsRead: () =>
    api.put('/notifications/mark-all-read').then(r => r.data),

  deleteNotification: (notificationId) =>
    api.delete(`/notifications/${notificationId}`).then(r => r.data),
};

export const adminReportsAPI = {
  getAllReports: () => api.get('/reports/all').then(r => r.data),
  getSystemStats: () => api.get('/reports/admin-stats').then(r => r.data)
};

export const getMyNotifications = () => notificationsAPI.getMyNotifications();
export const getUnreadCount = () => notificationsAPI.getUnreadCount();
export const markNotificationAsRead = (id) => notificationsAPI.markAsRead(id);

export const getMySubmissions = () => studentReportsAPI.getMySubmissions();
export const getPendingReports = () => teacherReportsAPI.getPendingReports();
export const getTeacherStats = () => teacherReportsAPI.getTeacherStats();
export const getAssignedReports = () => teacherReportsAPI.getAssignedReports();

export const validateReport = (id, decision, comments = '') =>
  teacherReportsAPI.validateReport(id, { decision, comments });

export const submitReport = (formData) => studentReportsAPI.submitReport(formData);
export const getReportById = (id) => teacherReportsAPI.getReportById(id);

export default api;
