// src/services/api.js → VERSION FINALE QUI MARCHE AVEC TOUT TON PROJET

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
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// FONCTIONS AUTH (nécessaires pour le login)
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials).then(r => r.data),
  logout: () => {
    localStorage.removeItem('esprim_session');
    window.location.href = '/login';
  }
};

// FONCTIONS RAPPORTS
export const getMySubmissions = () => api.get('/reports/my-submissions').then(r => r.data);
export const getPendingReports = () => api.get('/reports/pending-for-teacher').then(r => r.data);
export const getTeacherStats = () => api.get('/reports/teacher-stats').then(r => r.data);
export const validateReport = (id, action, comments = '') => 
  api.post(`/reports/validate/${id}`, { action, comments }).then(r => r.data);

export const submitReport = (formData) => 
  api.post('/reports/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data);

export const getReportById = (id) => api.get(`/reports/${id}`).then(r => r.data);

export default api;