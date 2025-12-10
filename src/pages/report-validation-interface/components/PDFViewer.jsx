// src/pages/report-validation-interface/components/PDFViewer.jsx
import React, { useState, useEffect } from 'react';
import { getToken } from '../../../lib/auth';

const PDFViewer = ({ reportData }) => {
  const [pdfUrl, setPdfUrl] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (reportData?.id) {
      const token = getToken();
      
      console.log('🔍 PDFViewer Debug:', {
        reportId: reportData.id,
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'NO TOKEN'
      });

      if (!token) {
        setError('Token d\'authentification manquant');
        setLoading(false);
        return;
      }

      // Build the secure PDF URL with clean parameter
      const url = `http://localhost:5000/api/secure-pdf/view/${reportData.id}?token=${token}&clean=true`;
      console.log('📄 PDF URL:', url);
      
      setPdfUrl(url);
      setLoading(false);

      // Test the URL
      fetch(url, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        console.log('✅ PDF accessibility test:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      })
      .catch(err => {
        console.error('❌ PDF access failed:', err);
        setError(`Erreur d'accès au PDF: ${err.message}`);
      });
    }
  }, [reportData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500">Chargement du rapport...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg border-2 border-red-200">
        <div className="text-center p-6">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-red-800 mb-2">Erreur de chargement</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <p className="text-gray-500">URL du rapport non disponible</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">

      <iframe
        src={pdfUrl}
        className="w-full h-screen border-0"
        title="Rapport"
        allowFullScreen
        onError={(e) => {
          console.error('❌ iframe error:', e);
          setError('Erreur lors du chargement du PDF dans l\'iframe');
        }}
      />
    </div>
  );
};

export default PDFViewer;