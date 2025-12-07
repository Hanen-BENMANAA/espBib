// src/pages/secure-pdf-reader/components/PDFViewer.jsx
// ✅ COMPLETE VERSION - Using secure streaming route

import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import { getToken } from '../../../lib/auth';
import EnhancedSecurityWatermark from './EnhancedSecurityWatermark';

const PDFViewer = ({ reportData, userInfo, onSecurityViolation, documentTitle }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [securityAlert, setSecurityAlert] = useState(null);
  const iframeRef = useRef(null);
  const alertTimeoutRef = useRef(null);

  // ✅ FIXED: Use secure streaming route with token
  useEffect(() => {
    const token = getToken();
    
    if (!token) {
      console.error('❌ No authentication token found');
      setLoadError(true);
      setIsLoading(false);
      return;
    }

    if (reportData?.id) {
      // ✅ USE SECURE STREAMING ROUTE
      const backendUrl = 'http://localhost:5000';
      const streamUrl = `${backendUrl}/api/secure-pdf/view/${reportData.id}?token=${token}`;
      
      console.log('📄 Using SECURE streaming route');
      console.log('📋 Report ID:', reportData.id);
      console.log('🔑 Token present:', !!token);
      
      setPdfUrl(streamUrl);
    } else if (reportData?.file_url) {
      // ⚠️ Fallback to direct URL (may have CSP issues)
      const backendUrl = 'http://localhost:5000';
      const directUrl = `${backendUrl}${reportData.file_url}`;
      
      console.warn('⚠️ Using direct file access (may have CSP issues):', directUrl);
      console.warn('💡 Tip: Pass reportData.id to use streaming route');
      setPdfUrl(directUrl);
    } else {
      console.error('❌ Missing data:', { 
        hasId: !!reportData?.id,
        hasFileUrl: !!reportData?.file_url,
        hasToken: !!token,
        reportData
      });
      setLoadError(true);
      setIsLoading(false);
    }
  }, [reportData]);

  // ═══════════════════════════════════════════════════════════════════
  // 🚨 SHOW RED ALERT BANNER
  // ═══════════════════════════════════════════════════════════════════
  const showAlert = (message, type = 'error') => {
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
    }

    setSecurityAlert({ message, type });

    alertTimeoutRef.current = setTimeout(() => {
      setSecurityAlert(null);
    }, 3000);

    onSecurityViolation?.({ 
      type: type, 
      message: message, 
      timestamp: new Date() 
    });

    console.warn(`🚨 BLOCKED: ${message}`);
  };

  // ═══════════════════════════════════════════════════════════════════
  // 🔒 SECURITY PROTECTIONS
  // ═══════════════════════════════════════════════════════════════════
  useEffect(() => {
    const safePrevent = (e) => {
      const target = e.target;
      if (!target || typeof target.closest !== 'function') {
        e.preventDefault();
        return true;
      }
      if (target.closest('.allow-selection, button, input, textarea, a, [contenteditable], details, summary')) {
        return false;
      }
      e.preventDefault();
      return true;
    };

    const blockContextMenu = (e) => {
      if (safePrevent(e)) {
        showAlert('⚠️ Clic droit désactivé - Document protégé', 'context_menu');
      }
    };

    const blockDragStart = (e) => {
      if (safePrevent(e)) {
        showAlert('⚠️ Glisser-déposer bloqué', 'drag');
      }
    };

    const blockShortcuts = (e) => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;

      const shortcuts = {
        'c': '🚫 Copie bloquée (Ctrl+C)',
        'a': '🚫 Sélection totale bloquée (Ctrl+A)',
        's': '🚫 Sauvegarde bloquée (Ctrl+S)',
        'p': '🚫 Impression bloquée (Ctrl+P)',
        'u': '🚫 Code source bloqué (Ctrl+U)',
        'f': '🚫 Recherche bloquée (Ctrl+F)'
      };

      if (e.key === 'PrintScreen') {
        e.preventDefault();
        showAlert('📸 Capture d\'écran détectée', 'screenshot');
      } else if (ctrl && shortcuts[key]) {
        e.preventDefault();
        showAlert(shortcuts[key], `ctrl_${key}`);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        showAlert('👁️ Changement d\'onglet détecté', 'tab_switch');
      }
    };

    let devtoolsOpen = false;
    const detectDevTools = () => {
      if (window.outerWidth - window.innerWidth > 100 || window.outerHeight - window.innerHeight > 100) {
        if (!devtoolsOpen) {
          devtoolsOpen = true;
          showAlert('🔧 Outils de développement détectés', 'devtools');
        }
      } else {
        devtoolsOpen = false;
      }
    };

    document.addEventListener('selectstart', safePrevent);
    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('dragstart', blockDragStart);
    document.addEventListener('keydown', blockShortcuts);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    const devToolsInterval = setInterval(detectDevTools, 1000);

    return () => {
      document.removeEventListener('selectstart', safePrevent);
      document.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('dragstart', blockDragStart);
      document.removeEventListener('keydown', blockShortcuts);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(devToolsInterval);
      
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
  }, [onSecurityViolation]);

  const handleIframeLoad = () => {
    console.log('✅ PDF iframe loaded successfully');
    setIsLoading(false);
    setLoadError(false);

    // Try to apply security inside iframe
    try {
      const iframeDoc = iframeRef.current?.contentDocument;
      
      if (iframeDoc) {
        // Block shortcuts in iframe
        iframeDoc.addEventListener('keydown', (e) => {
          const key = e.key.toLowerCase();
          const ctrl = e.ctrlKey || e.metaKey;
          
          if (ctrl && ['c', 'a', 's', 'p'].includes(key)) {
            e.preventDefault();
            showAlert(`🚫 ${key.toUpperCase()} bloqué dans le PDF`, 'iframe');
          }
        }, true);

        // Block right-click in iframe
        iframeDoc.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          showAlert('⚠️ Clic droit bloqué dans le PDF', 'iframe_context');
        }, true);

        console.log('✅ Security applied to iframe');
      }
    } catch (err) {
      console.log('⚠️ CORS - Parent security active');
    }
  };

  const handleIframeError = () => {
    console.error('❌ PDF iframe failed to load');
    setIsLoading(false);
    setLoadError(true);
  };

  return (
    <div className="relative bg-black rounded-xl overflow-hidden academic-shadow-lg h-full min-h-[800px] flex flex-col">
      {/* 🚨 RED SECURITY ALERT BANNER - TOP */}
      {securityAlert && (
        <div className="absolute top-0 left-0 right-0 z-[100]" style={{
          animation: 'slideDown 0.3s ease-out'
        }}>
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 shadow-2xl border-b-4 border-red-900 flex items-center gap-4">
            <div className="flex-shrink-0" style={{ animation: 'pulse 2s infinite' }}>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Icon name="ShieldAlert" size={24} className="text-red-600" />
              </div>
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg">{securityAlert.message}</div>
              <div className="text-sm text-red-100 mt-1">
                ⚠️ Cette action a été enregistrée • Session: {userInfo?.id}
              </div>
            </div>
            <button
              onClick={() => setSecurityAlert(null)}
              className="flex-shrink-0 text-white hover:bg-red-800 rounded-full p-2 transition-colors allow-selection"
            >
              <Icon name="X" size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Watermarks */}
      <EnhancedSecurityWatermark documentTitle={documentTitle} />

      {/* PDF Content */}
      <div className="flex-1 relative">
        {isLoading && pdfUrl && !loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white text-lg">Chargement du document sécurisé...</p>
              <p className="text-gray-400 text-sm mt-2">Veuillez patienter</p>
            </div>
          </div>
        )}

        {pdfUrl && !loadError ? (
          <iframe
            ref={iframeRef}
            src={pdfUrl}
            className="w-full h-full border-0"
            title="Document sécurisé"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            style={{ minHeight: '800px' }}
            allow="fullscreen"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            <div className="text-center p-10 bg-black/70 rounded-xl max-w-2xl">
              <Icon name="FileX" size={64} className="mx-auto mb-4 text-red-500" />
              <p className="text-2xl font-bold mb-2">PDF non disponible</p>
              <p className="text-gray-300 mb-4">
                {!pdfUrl
                  ? "Token d'authentification manquant ou invalide."
                  : "Impossible de charger le fichier PDF."}
              </p>

              <details className="mt-6 text-left text-sm allow-selection">
                <summary className="cursor-pointer text-blue-400 hover:text-blue-300">
                  Debug info
                </summary>
                <div className="mt-3 bg-black/90 p-4 rounded overflow-auto text-xs font-mono">
                  <div><strong>ID:</strong> {reportData?.id || 'N/A'}</div>
                  <div><strong>Token présent:</strong> {getToken() ? 'Oui' : 'Non'}</div>
                  <div><strong>URL tentée:</strong> {pdfUrl || 'aucune'}</div>
                  <div><strong>file_url:</strong> {reportData?.file_url || 'N/A'}</div>
                </div>
              </details>
            </div>
          </div>
        )}
      </div>

      {/* Footer de sécurité */}
      <div className="bg-gray-900 text-gray-400 p-3 border-t border-gray-700 text-xs flex justify-between items-center select-none">
        <span>👤 {userInfo?.name || "Utilisateur"} • {userInfo?.email || "N/A"}</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-green-400">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Protection active avec alertes
          </span>
          <span>{new Date().toLocaleString('fr-FR')}</span>
        </div>
      </div>

      {/* Inline animations */}
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default PDFViewer;