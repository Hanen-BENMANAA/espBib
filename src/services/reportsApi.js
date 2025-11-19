import axios from 'axios';
import { getToken } from '../lib/auth';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getMySubmissions = async () => {
  try {
    const response = await api.get('/reports/my-submissions');
    return response.data;
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw error;
  }
};

export const getCurrentSubmission = async () => {
  try {
    const response = await api.get('/reports/current-submission');
    return response.data;
  } catch (error) {
    console.error('Error fetching current submission:', error);
    throw error;
  }
};

export const getMyStats = async () => {
  try {
    const response = await api.get('/reports/my-stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

export const submitReport = async (formData) => {
  try {
    const response = await api.post('/reports/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting report:', error);
    throw error;
  }
};

export const getAssignedReports = async () => {
  try {
    const response = await api.get('/reports/assigned-to-me');
    return response.data;
  } catch (error) {
    console.error('Error fetching assigned reports:', error);
    throw error;
  }
};

export const getPendingReports = async () => {
  try {
    const response = await api.get('/reports/pending-validation');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending reports:', error);
    throw error;
  }
};

export const validateReport = async (reportId, action, comments, checklist) => {
  try {
    const response = await api.put(`/reports/${reportId}/validate`, {
      action,
      comments,
      checklist,
    });
    return response.data;
  } catch (error) {
    console.error('Error validating report:', error);
    throw error;
  }
};

export const getTeacherStats = async () => {
  try {
    const response = await api.get('/reports/teacher-stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching teacher stats:', error);
    throw error;
  }
};

export const getReportById = async (reportId) => {
  try {
    const response = await api.get(`/reports/${reportId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching report:', error);
    throw error;
  }
};

export const downloadReport = async (reportId) => {
  try {
    const response = await api.get(`/reports/${reportId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading report:', error);
    throw error;
  }
};

export default api;