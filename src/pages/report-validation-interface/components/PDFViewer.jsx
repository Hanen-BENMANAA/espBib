// PDFViewer.jsx - PRODUCTION VERSION 2025

import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const PDFViewer = ({ reportData, reviewerInfo }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Build PDF URL
  const pdfUrl = reportData?.file_url
    ? `http://localhost:5000${reportData.file_url}`
    : null;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden ${
      isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'h-full'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-3">
          <Icon name="FileText" size={20} className="text-blue-600" />
          <div>
            <h3 className="font-semibold text-lg truncate max-w-xl">
              {reportData?.title || 'Rapport sans titre'}
            </h3>
            <p className="text-sm text-gray-600">
              PDF • {reportData?.fileSize || 'Taille inconnue'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 hover:bg-gray-200 rounded-lg transition"
          title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
        >
          <Icon name={isFullscreen ? "Minimize2" : "Maximize2"} size={20} />
        </button>
      </div>

      {/* PDF Viewer */}
      <div className="h-full bg-gray-900" style={{ minHeight: isFullscreen ? '100vh' : '600px' }}>
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            width="100%"
            height="100%"
            className="border-0"
            title="Rapport PFE"
            allowFullScreen
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="text-center p-8">
              <Icon name="FileX" size={64} className="text-red-500 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-700">PDF non trouvé</p>
              <p className="text-gray-500 mt-2">
                Le fichier n'existe pas ou n'a pas été téléchargé correctement.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50 border-t text-xs text-gray-600 flex justify-between">
        <span>Enseignant: {reviewerInfo?.name || 'Inconnu'}</span>
        <span>{new Date().toLocaleString('fr-FR')}</span>
      </div>
    </div>
  );
};

export default PDFViewer;