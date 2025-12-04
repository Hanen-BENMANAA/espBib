// src/pages/public-library-catalog/index.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import PublicLibraryCatalogContent from './PublicLibraryCatalogContent';

// Récupère le rôle
const getRole = () => {
  try {
    const session = localStorage.getItem('esprim_session') || sessionStorage.getItem('esprim_session');
    if (!session) return 'student';
    const user = JSON.parse(session);
    return user?.role || 'student';
  } catch {
    return 'student';
  }
};

const PublicLibraryCatalog = () => {
  // Everyone sees the same library catalog
  return <PublicLibraryCatalogContent />;
};

export default PublicLibraryCatalog;