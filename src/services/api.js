// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to add auth token
api.interceptors.request.use(config => {
  const session = JSON.parse(localStorage.getItem('esprim_session') || '{}');
  if (session.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

// Response interceptor to handle 401 errors
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

// ==================== HELPER FUNCTIONS ====================

/**
 * Normalize file URL to always return a complete URL
 */
const normalizeFileUrl = (fileUrl) => {
  if (!fileUrl) return null;
  
  // If it's already a full URL, return as-is
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl;
  }
  
  // Remove leading slash if present
  const cleanPath = fileUrl.startsWith('/') ? fileUrl.substring(1) : fileUrl;
  
  // Construct full URL
  return `http://localhost:5000/${cleanPath}`;
};

/**
 * Test if a PDF file is accessible
 */
const testPdfAccess = async (fileUrl) => {
  try {
    const response = await fetch(fileUrl, { method: 'HEAD' });
    console.log('🔍 PDF accessibility test:', {
      url: fileUrl,
      status: response.status,
      contentType: response.headers.get('content-type'),
      accessible: response.ok
    });
    return response.ok;
  } catch (error) {
    console.error('❌ PDF not accessible:', fileUrl, error);
    return false;
  }
};

// ==================== AUTH API ====================

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials).then(r => r.data),
  
  logout: () => {
    localStorage.removeItem('esprim_session');
    window.location.href = '/login';
  }
};

// ==================== STUDENT REPORTS API ====================

export const studentReportsAPI = {
  submitReport: (formData) =>
    api.post('/reports/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data),

  getMySubmissions: async () => {
    const response = await api.get('/reports/my-submissions');
    
    // Normalize file URLs in the response
    if (response.data.success && response.data.data) {
      response.data.data = response.data.data.map(report => ({
        ...report,
        file_url: normalizeFileUrl(report.file_url)
      }));
    }
    
    return response.data;
  },

  getReportById: async (id) => {
    const response = await api.get(`/reports/${id}`);
    
    // Normalize file URL
    if (response.data.success && response.data.data) {
      response.data.data.file_url = normalizeFileUrl(response.data.data.file_url);
      
      console.log('📄 Student report loaded:', {
        id: response.data.data.id,
        title: response.data.data.title,
        file_url: response.data.data.file_url
      });
    }
    
    return response.data;
  }
};

// ==================== TEACHER REPORTS API ====================

export const teacherReportsAPI = {
  getAssignedReports: async () => {
    const response = await api.get('/reports/assigned-to-me');
    
    // Normalize file URLs
    if (response.data.success && response.data.data) {
      response.data.data = response.data.data.map(report => ({
        ...report,
        file_url: normalizeFileUrl(report.file_url)
      }));
    }
    
    return response.data;
  },

  getPendingReports: async () => {
    const response = await api.get('/reports/pending-for-teacher');
    
    // Normalize file URLs
    if (response.data.success && response.data.data) {
      response.data.data = response.data.data.map(report => ({
        ...report,
        file_url: normalizeFileUrl(report.file_url)
      }));
    }
    
    return response.data;
  },

  getTeacherStats: () => api.get('/reports/teacher-stats').then(r => r.data),

  getReportById: async (id) => {
    try {
      const response = await api.get(`/reports/${id}`);
      
      if (response.data.success && response.data.data) {
        const report = response.data.data;
        
        // Normalize file URL
        report.file_url = normalizeFileUrl(report.file_url);
        
        console.log('📄 Teacher report loaded:', {
          id: report.id,
          title: report.title,
          file_url: report.file_url,
          status: report.status,
          student: `${report.author_first_name || ''} ${report.author_last_name || ''}`.trim()
        });
        
        // Test PDF access in background (non-blocking)
        if (report.file_url) {
          testPdfAccess(report.file_url).then(accessible => {
            if (!accessible) {
              console.warn('⚠️ PDF may not be accessible:', report.file_url);
            }
          });
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching teacher report:', error);
      throw error;
    }
  },

  validateReport: (reportId, { decision, comments = '' }) =>
    api.put(`/reports/${reportId}/validate`, { decision, comments }).then(r => r.data),

  updateChecklist: async (reportId, checklist) => {
    try {
      const response = await api.put(`/reports/${reportId}/checklist`, { checklist });
      console.log('✅ Checklist updated for report:', reportId);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating checklist:', error);
      throw error;
    }
  },

  addComment: async (reportId, content) => {
    try {
      const response = await api.post(`/reports/${reportId}/comments`, { content });
      console.log('✅ Comment added to report:', reportId);
      return response.data;
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      throw error;
    }
  },

  updateComment: async (commentId, content) => {
    try {
      const response = await api.put(`/comments/${commentId}`, { content });
      console.log('✅ Comment updated:', commentId);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating comment:', error);
      throw error;
    }
  },

  deleteComment: async (commentId) => {
    try {
      const response = await api.delete(`/comments/${commentId}`);
      console.log('✅ Comment deleted:', commentId);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting comment:', error);
      throw error;
    }
  },
};

// ==================== ADMIN REPORTS API ====================

export const adminReportsAPI = {
  getAllReports: async () => {
    const response = await api.get('/reports/all');
    
    // Normalize file URLs
    if (response.data.success && response.data.data) {
      response.data.data = response.data.data.map(report => ({
        ...report,
        file_url: normalizeFileUrl(report.file_url)
      }));
    }
    
    return response.data;
  },

  getSystemStats: () => api.get('/reports/admin-stats').then(r => r.data)
};

// ==================== NOTIFICATIONS API ====================

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

// ==================== FAVORITES API ====================

export const favoritesAPI = {
  // Get user's favorites
  getMyFavorites: async () => {
    try {
      console.log('📚 API: Fetching favorites...');
      const response = await api.get('/favorites');
      
      console.log('📦 API Response:', {
        success: response.data?.success,
        hasData: !!response.data?.data,
        dataType: typeof response.data?.data,
        hasFavorites: !!response.data?.data?.favorites,
        fullResponse: response.data
      });
      
      // ✅ FIX: Handle the nested structure correctly
      let favoritesArray = [];
      
      if (response.data?.success && response.data?.data) {
        // Backend returns: { success: true, data: { favorites: [...] } }
        if (Array.isArray(response.data.data.favorites)) {
          favoritesArray = response.data.data.favorites;
        }
        // Fallback: if data itself is an array
        else if (Array.isArray(response.data.data)) {
          favoritesArray = response.data.data;
        }
      }
      
      console.log('✅ Extracted favorites array:', favoritesArray.length, 'items');
      
      // Normalize file URLs
      const normalizedFavorites = favoritesArray.map(report => ({
        ...report,
        file_url: normalizeFileUrl(report.file_url)
      }));
      
      // ✅ IMPORTANT: Return in the same format as backend
      return {
        success: true,
        data: {
          favorites: normalizedFavorites
        },
        count: normalizedFavorites.length
      };
      
    } catch (error) {
      console.error('❌ API Error fetching favorites:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Return empty array on error
      return {
        success: false,
        data: {
          favorites: []
        },
        count: 0,
        error: error.message
      };
    }
  },
  
  // Add to favorites
  addFavorite: async (reportId) => {
    try {
      console.log('➕ API: Adding favorite:', reportId);
      const response = await api.post('/favorites', { reportId });
      console.log('✅ Added to favorites:', reportId);
      return response.data;
    } catch (error) {
      console.error('❌ API Error adding favorite:', error);
      throw error;
    }
  },
  
  // Remove from favorites
  removeFavorite: async (reportId) => {
    try {
      console.log('➖ API: Removing favorite:', reportId);
      const response = await api.delete(`/favorites/${reportId}`);
      console.log('✅ Removed from favorites:', reportId);
      return response.data;
    } catch (error) {
      console.error('❌ API Error removing favorite:', error);
      throw error;
    }
  },
  
  // Check if report is favorited
  isFavorited: async (reportId) => {
    try {
      const response = await api.get(`/favorites/check/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('❌ API Error checking favorite status:', error);
      return { success: false, isFavorited: false };
    }
  },
};

// ==================== DEBUGGING/UTILITY API ====================

export const debugAPI = {
  // Test backend health
  healthCheck: () => 
    fetch('http://localhost:5000/api/health').then(r => r.json()),
  
  // List all available PDF reports
  listReports: () => 
    fetch('http://localhost:5000/api/debug/list-reports').then(r => r.json()),
  
  // Test if a specific PDF file exists and is accessible
  testPdf: (filename) => 
    fetch(`http://localhost:5000/api/test-pdf/${filename}`).then(r => r.json()),
  
  // Test PDF file accessibility
  testPdfAccess: (fileUrl) => testPdfAccess(fileUrl),
};

// ==================== EXPORT SHORTCUTS ====================

// Notifications shortcuts
export const getMyNotifications = () => notificationsAPI.getMyNotifications();
export const getUnreadCount = () => notificationsAPI.getUnreadCount();
export const markNotificationAsRead = (id) => notificationsAPI.markAsRead(id);

// Reports shortcuts
export const getMySubmissions = () => studentReportsAPI.getMySubmissions();
export const getPendingReports = () => teacherReportsAPI.getPendingReports();
export const getTeacherStats = () => teacherReportsAPI.getTeacherStats();
export const getAssignedReports = () => teacherReportsAPI.getAssignedReports();
export const validateReport = (id, decision, comments = '') =>
  teacherReportsAPI.validateReport(id, { decision, comments });
export const submitReport = (formData) => studentReportsAPI.submitReport(formData);
export const getReportById = (id) => teacherReportsAPI.getReportById(id);

// Favorites shortcuts
export const getMyFavorites = () => favoritesAPI.getMyFavorites();
export const addFavorite = (reportId) => favoritesAPI.addFavorite(reportId);
export const removeFavorite = (reportId) => favoritesAPI.removeFavorite(reportId);
export const checkIfFavorited = (reportId) => favoritesAPI.isFavorited(reportId);

// Debug shortcuts
export const testBackend = () => debugAPI.healthCheck();
export const listAvailablePdfs = () => debugAPI.listReports();

export default api;