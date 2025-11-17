// src/lib/auth.js → OBLIGATOIRE POUR LA SÉCURITÉ
import { authAPI } from '../services/api';

/**
 * Récupère l'utilisateur actuellement connecté
 * @returns {Object|null} Objet utilisateur ou null si non connecté
 */
export const getUser = () => {
  try {
    const session = localStorage.getItem('esprim_session');
    
    // Debug: Log pour voir si la session existe
    console.log('[Auth] Checking session...', session ? 'Found' : 'Not found');
    
    if (!session) {
      console.log('[Auth] No session found');
      return null;
    }

    const data = JSON.parse(session);
    
    // Vérification de l'expiration de la session
    if (data.expiresAt < Date.now()) {
      console.log('[Auth] Session expired');
      localStorage.removeItem('esprim_session');
      return null;
    }

    // Vérification que le rôle existe
    if (!data.userRole) {
      console.error('[Auth] Session exists but no userRole found');
      return null;
    }

    const user = {
      role: data.userRole,      // 'student' | 'teacher' | 'admin'
      name: data.userName,
      email: data.userEmail,
      token: data.token,
      loginTime: data.loginTime
    };

    console.log('[Auth] User retrieved:', { role: user.role, email: user.email });
    return user;

  } catch (error) {
    console.error('[Auth] Error getting user:', error);
    // En cas d'erreur, nettoyer la session corrompue
    localStorage.removeItem('esprim_session');
    return null;
  }
};

/**
 * Vérifie si l'utilisateur est authentifié
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const user = getUser();
  const isAuth = !!user;
  console.log('[Auth] Is authenticated:', isAuth);
  return isAuth;
};

/**
 * Récupère le token d'authentification
 * @returns {string|null}
 */
export const getToken = () => {
  try {
    const session = localStorage.getItem('esprim_session');
    if (!session) return null;
    
    const data = JSON.parse(session);
    if (data.expiresAt < Date.now()) {
      localStorage.removeItem('esprim_session');
      return null;
    }
    
    return data.token;
  } catch {
    return null;
  }
};

/**
 * Connexion utilisateur
 * @param {Object} credentials - Email et mot de passe
 * @returns {Object} Résultat de la connexion
 */
export const login = async (credentials) => {
  try {
    console.log('[Auth] Attempting login...');
    const response = await authAPI.login(credentials);

    // Cas 2FA requis
    if (response.requiresTwoFactor) {
      console.log('[Auth] 2FA required');
      return { 
        requiresTwoFactor: true, 
        user: response.user, 
        method: response.method 
      };
    }

    // Vérification que le rôle existe
    if (!response.user.role) {
      throw new Error('User role is missing from server response');
    }

    // Stockage de la session
    const session = {
      userEmail: response.user.email,
      userName: response.user.name || response.user.email.split('@')[0],
      userRole: response.user.role,
      token: response.token,
      loginTime: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 heures
    };

    localStorage.setItem('esprim_session', JSON.stringify(session));
    console.log('[Auth] Login successful:', { 
      role: session.userRole, 
      email: session.userEmail 
    });

    return { success: true, user: response.user };

  } catch (error) {
    console.error('[Auth] Login error:', error);
    throw new Error(error.message || 'Login failed');
  }
};

/**
 * Vérification du code 2FA
 * @param {string} userId - ID de l'utilisateur
 * @param {string} code - Code de vérification
 * @param {string} method - Méthode 2FA (email/sms/authenticator)
 * @returns {Object} Résultat de la vérification
 */
export const verify2FA = async (userId, code, method) => {
  try {
    console.log('[Auth] Verifying 2FA...');
    const response = await authAPI.verify2FA({ userId, code, method });

    // Vérification que le rôle existe
    if (!response.user.role) {
      throw new Error('User role is missing from server response');
    }

    // Stockage de la session
    const session = {
      userEmail: response.user.email,
      userName: response.user.name || response.user.email.split('@')[0],
      userRole: response.user.role,
      token: response.token,
      loginTime: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 heures
    };

    localStorage.setItem('esprim_session', JSON.stringify(session));
    console.log('[Auth] 2FA verification successful:', { 
      role: session.userRole, 
      email: session.userEmail 
    });

    return { success: true, user: response.user };

  } catch (error) {
    console.error('[Auth] 2FA verification error:', error);
    throw new Error(error.message || '2FA verification failed');
  }
};

/**
 * Déconnexion utilisateur
 */
export const logout = () => {
  console.log('[Auth] Logging out...');
  localStorage.removeItem('esprim_session');
  localStorage.removeItem('esprim_draft_data');
  localStorage.removeItem('esprim_draft_timestamp');
  console.log('[Auth] Logout complete');
};

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 * @param {string} requiredRole - Le rôle requis
 * @returns {boolean}
 */
export const hasRole = (requiredRole) => {
  const user = getUser();
  if (!user) return false;
  return user.role === requiredRole;
};

/**
 * Rafraîchit le token d'authentification
 * @returns {boolean} True si le refresh a réussi
 */
export const refreshSession = () => {
  try {
    const session = localStorage.getItem('esprim_session');
    if (!session) return false;

    const data = JSON.parse(session);
    
    // Prolonger la session de 24h
    data.expiresAt = Date.now() + (24 * 60 * 60 * 1000);
    
    localStorage.setItem('esprim_session', JSON.stringify(data));
    console.log('[Auth] Session refreshed');
    return true;
  } catch (error) {
    console.error('[Auth] Error refreshing session:', error);
    return false;
  }
};

/**
 * Fonction utilitaire pour simuler une connexion (DEV ONLY)
 * À RETIRER EN PRODUCTION
 */
export const mockLogin = (role = 'student') => {
  console.warn('[Auth] MOCK LOGIN - FOR DEVELOPMENT ONLY');
  
  const mockUsers = {
    student: {
      email: 'student@esprim.tn',
      name: 'Test Student',
      role: 'student'
    },
    teacher: {
      email: 'teacher@esprim.tn',
      name: 'Test Teacher',
      role: 'teacher'
    },
    admin: {
      email: 'admin@esprim.tn',
      name: 'Test Admin',
      role: 'admin'
    }
  };

  const user = mockUsers[role];
  
  const session = {
    userEmail: user.email,
    userName: user.name,
    userRole: user.role,
    token: 'mock-token-' + Date.now(),
    loginTime: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000)
  };

  localStorage.setItem('esprim_session', JSON.stringify(session));
  console.log('[Auth] Mock login successful:', user);
  return user;
};

// Export par défaut de toutes les fonctions
export default {
  getUser,
  isAuthenticated,
  getToken,
  login,
  verify2FA,
  logout,
  hasRole,
  refreshSession,
  mockLogin
};