// src/services/reportService.js
import { getToken } from '../lib/auth';

const API_BASE_URL = 'http://localhost:000/api';
// Helper pour les requêtes authentifiées
const fetchWithAuth = async (url, options = {}) => {
  const token = getToken();
  
  const headers = {
    ...options.headers,
  };
  
  // Ajouter le token seulement s'il existe
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Ne pas ajouter Content-Type pour FormData (le navigateur le fait automatiquement)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur réseau' }));
    throw new Error(error.message || `Erreur HTTP: ${response.status}`);
  }
  
  return response.json();
};

// ===================================================================
// FONCTIONS PRINCIPALES
// ===================================================================

/**
 * Soumettre un nouveau rapport
 * @param {Object} formData - Données du formulaire
 * @param {File} file - Fichier PDF
 * @param {Object} checklist - État de la checklist
 * @returns {Promise<Object>}
 */
export const submitReport = async (formData, file, checklist) => {
  try {
    console.log('[API] Submitting report...');
    
    // Créer un FormData pour envoyer le fichier
    const data = new FormData();
    
    // Ajouter toutes les données du formulaire
    Object.keys(formData).forEach(key => {
      if (key === 'keywords') {
        data.append(key, JSON.stringify(formData[key]));
      } else {
        data.append(key, formData[key]);
      }
    });
    
    // Ajouter le fichier
    if (file) {
      data.append('file', file);
    }
    
    // Ajouter la checklist
    data.append('checklist', JSON.stringify(checklist));
    
    const response = await fetchWithAuth(`${API_BASE_URL}/reports/submit`, {
      method: 'POST',
      body: data,
    });
    
    console.log('[API] Report submitted successfully:', response);
    return response;
    
  } catch (error) {
    console.error('[API] Error submitting report:', error);
    throw error;
  }
};

/**
 * Récupérer tous les rapports de l'utilisateur
 * @returns {Promise<Array>}
 */
export const getMyReports = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/reports/my-reports`);
    return response.reports || [];
  } catch (error) {
    console.error('[API] Error fetching reports:', error);
    throw error;
  }
};

/**
 * Récupérer la soumission actuelle (en attente)
 * @returns {Promise<Object|null>}
 */
export const getCurrentSubmission = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/reports/current-submission`);
    return response.currentSubmission || null;
  } catch (error) {
    console.error('[API] Error fetching current submission:', error);
    throw error;
  }
};

/**
 * Récupérer l'historique des soumissions
 * @returns {Promise<Array>}
 */
export const getSubmissionHistory = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/reports/history`);
    return response.submissions || [];
  } catch (error) {
    console.error('[API] Error fetching submission history:', error);
    throw error;
  }
};

/**
 * Sauvegarder un brouillon
 * @param {Object} formData - Données du formulaire
 * @returns {Promise<Object>}
 */
export const saveDraft = async (formData) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/reports/save-draft`, {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    
    console.log('[API] Draft saved:', response);
    return response;
  } catch (error) {
    console.error('[API] Error saving draft:', error);
    throw error;
  }
};

/**
 * Télécharger un rapport
 * @param {number} reportId - ID du rapport
 * @returns {Promise<Blob>}
 */
export const downloadReport = async (reportId) => {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement');
    }
    
    return await response.blob();
  } catch (error) {
    console.error('[API] Error downloading report:', error);
    throw error;
  }
};

/**
 * Récupérer les statistiques de l'étudiant
 * @returns {Promise<Object>}
 */
export const getStudentStats = async () => {
  try {
    const reports = await getMyReports();
    
    return {
      totalSubmissions: reports.length,
      validatedReports: reports.filter(r => r.status === 'validated').length,
      pendingReports: reports.filter(r => r.status === 'pending').length,
      draftReports: reports.filter(r => r.status === 'draft').length,
    };
  } catch (error) {
    console.error('[API] Error fetching stats:', error);
    return {
      totalSubmissions: 0,
      validatedReports: 0,
      pendingReports: 0,
      draftReports: 0,
    };
  }
};

export default {
  submitReport,
  getMyReports,
  getCurrentSubmission,
  getSubmissionHistory,
  saveDraft,
  downloadReport,
  getStudentStats,
};