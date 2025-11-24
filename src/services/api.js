// src/services/api.js - COMPLETE VERSION

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor pour ajouter le token automatiquement
api.interceptors.request.use(config => {
  const session = JSON.parse(localStorage.getItem('esprim_session') || '{}');
  if (session.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

// Interceptor 401 → logout auto
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
// TEACHER REPORTS API
// ============================================================================
export const teacherReportsAPI = {
  getAssignedReports: () => api.get('/reports/assigned-to-me').then(r => r.data),
  
  getPendingReports: () => api.get('/reports/pending-for-teacher').then(r => r.data),
  
  getTeacherStats: () => api.get('/reports/teacher-stats').then(r => r.data),
  
  validateReport: (id, action, comments = '') => 
    api.put(`/reports/${id}/validate`, { action, comments }).then(r => r.data)
};

// ============================================================================
// ADMIN REPORTS API
// ============================================================================
export const adminReportsAPI = {
  getAllReports: () => api.get('/reports/all').then(r => r.data),
  
  getSystemStats: () => api.get('/reports/admin-stats').then(r => r.data)
};

// ============================================================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================================================
export const getMySubmissions = () => studentReportsAPI.getMySubmissions();
export const getPendingReports = () => teacherReportsAPI.getPendingReports();
export const getTeacherStats = () => teacherReportsAPI.getTeacherStats();
export const getAssignedReports = () => teacherReportsAPI.getAssignedReports();
export const validateReport = (id, action, comments) => 
  teacherReportsAPI.validateReport(id, action, comments);
export const submitReport = (formData) => studentReportsAPI.submitReport(formData);
export const getReportById = (id) => studentReportsAPI.getReportById(id);

export default api;