// src/pages/public-library-catalog/index.jsx
import React from 'react';
import Header from '../../components/ui/Header';
import PublicLibraryCatalogContent from './PublicLibraryCatalogContent';

const PublicLibraryCatalog = () => {
  return (
    <>
      <Header />
      <PublicLibraryCatalogContent />
    </>
  );
};

export default PublicLibraryCatalog;