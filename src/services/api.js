// src/services/api.js - VERSION FINALE 2025 (COMPLETE & READY)

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor : ajoute le token automatiquement
api.interceptors.request.use(config => {
  const session = JSON.parse(localStorage.getItem('esprim_session') || '{}');
  if (session.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

// Interceptor : logout auto sur 401
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

// ============================================================================
// AUTH API
// ============================================================================
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials).then(r => r.data),
  logout: () => {
    localStorage.removeItem('esprim_session');
    window.location.href = '/login';
  }
};

// ============================================================================
// STUDENT REPORTS API
// ============================================================================
export const studentReportsAPI = {
  submitReport: (formData) =>
    api.post('/reports/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data),

  getMySubmissions: () => api.get('/reports/my-submissions').then(r => r.data),

  getReportById: (id) => api.get(`/reports/${id}`).then(r => r.data)
};

// ============================================================================
// TEACHER REPORTS API - FULLY UPDATED
// ============================================================================
export const teacherReportsAPI = {
  // Dashboard data
  getAssignedReports: () => api.get('/reports/assigned-to-me').then(r => r.data),
  getPendingReports: () => api.get('/reports/pending-for-teacher').then(r => r.data),
  getTeacherStats: () => api.get('/reports/teacher-stats').then(r => r.data),

  // Single report with comments + history
  getReportById: (id) => api.get(`/reports/${id}`).then(r => r.data),

  // Validation actions
  validateReport: (reportId, { decision, comments = '' }) =>
    api.put(`/reports/${reportId}/validate`, { decision, comments }).then(r => r.data),

  // Comments system
  addComment: (reportId, content) =>
    api.post(`/reports/${reportId}/comments`, { content }).then(r => r.data),

  updateComment: (commentId, content) =>
    api.put(`/comments/${commentId}`, { content }).then(r => r.data),

  deleteComment: (commentId) =>
    api.delete(`/comments/${commentId}`).then(r => r.data),
};

// ============================================================================
// ADMIN REPORTS API
// ============================================================================
export const adminReportsAPI = {
  getAllReports: () => api.get('/reports/all').then(r => r.data),
  getSystemStats: () => api.get('/reports/admin-stats').then(r => r.data)
};

// ============================================================================
// LEGACY EXPORTS (pour compatibilité avec ton ancien code)
// ============================================================================
export const getMySubmissions = () => studentReportsAPI.getMySubmissions();
export const getPendingReports = () => teacherReportsAPI.getPendingReports();
export const getTeacherStats = () => teacherReportsAPI.getTeacherStats();
export const getAssignedReports = () => teacherReportsAPI.getAssignedReports();

// Ancienne signature → redirigée vers la nouvelle (plus claire)
export const validateReport = (id, decision, comments = '') =>
  teacherReportsAPI.validateReport(id, { decision, comments });

// Pour les étudiants
export const submitReport = (formData) => studentReportsAPI.submitReport(formData);

// Utilisé dans ReportValidationInterface
export const getReportById = (id) => teacherReportsAPI.getReportById(id);

export default api;