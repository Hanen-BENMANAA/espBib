// src/lib/auth.js → OBLIGATOIRE POUR LA SÉCURITÉ
import { authAPI } from '../services/api';

export const getUser = () => {
  try {
    const session = localStorage.getItem('esprim_session');
    if (!session) return null;
    const data = JSON.parse(session);
    if (data.expiresAt < Date.now()) {
      localStorage.removeItem('esprim_session');
      return null;
    }
    return {
      role: data.userRole,      // 'student' | 'teacher' | 'admin'
      name: data.userName,
      email: data.userEmail
    };
  } catch {
    return null;
  }
};

export const isAuthenticated = () => !!getUser();

// New functions for API integration
export const login = async (credentials) => {
  try {
    const response = await authAPI.login(credentials);

    if (response.requiresTwoFactor) {
      return { requiresTwoFactor: true, user: response.user, method: response.method };
    }

    // Store session data including token
    const session = {
      userEmail: response.user.email,
      userName: response.user.name || response.user.email.split('@')[0],
      userRole: response.user.role,
      token: response.token,
      loginTime: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };

    localStorage.setItem('esprim_session', JSON.stringify(session));
    return { success: true, user: response.user };
  } catch (error) {
    throw new Error(error.message || 'Login failed');
  }
};

export const verify2FA = async (userId, code, method) => {
  try {
    const response = await authAPI.verify2FA({ userId, code, method });

    // Store session data including token
    const session = {
      userEmail: response.user.email,
      userName: response.user.name || response.user.email.split('@')[0],
      userRole: response.user.role,
      token: response.token,
      loginTime: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };

    localStorage.setItem('esprim_session', JSON.stringify(session));
    return { success: true, user: response.user };
  } catch (error) {
    throw new Error(error.message || '2FA verification failed');
  }
};

export const logout = () => {
  localStorage.removeItem('esprim_session');
};
