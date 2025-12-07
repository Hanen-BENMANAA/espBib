// src/pages/secure-pdf-reader/index.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import PDFViewer from './components/PDFViewer';
import { EnhancedSessionTimer, EnhancedSecurityMonitor, EnhancedDocumentInfo } from './components/EnhancedSidebarComponents';

const SecurePDFReader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getDocumentData = () => {
    if (location?.state?.document) {
      return location.state.document;
    }
    const stored = sessionStorage.getItem('selectedDocument');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    return {
      title: "Document non disponible",
      file_url: null
    };
  };

  const [currentDocument] = useState(getDocumentData());
  
  // ✅ GET REAL USER DATA FROM DOCUMENT
  const [currentUser] = useState({
    name: currentDocument?.author || currentDocument?.student_name || "Utilisateur",
    email: currentDocument?.student_email || currentDocument?.email || "user@esprim.tn",
    role: currentDocument?.role || "Étudiant",
    id: currentDocument?.student_id || currentDocument?.id || "N/A"
  });

  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [sessionId] = useState(`SEC-${Date.now()}`);

  const handleSecurityViolation = (alert) => {
    setSecurityAlerts(prev => [...prev, { ...alert, timestamp: new Date() }]);
  };

  const handleBackToLibrary = () => {
    sessionStorage.removeItem('selectedDocument');
    navigate('/public-library-catalog');
  };

  const handleSessionExpired = () => {
    alert('Votre session a expiré. Vous allez être redirigé.');
    handleBackToLibrary();
  };

  const handleExtendSession = async () => {
    console.log('Extending session...');
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  useEffect(() => {
    // ✅ DEBUG: Check what data we have
    console.log('📊 Current Document:', currentDocument);
    console.log('👤 Current User:', currentUser);
    
    return () => {
      sessionStorage.removeItem('selectedDocument');
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={handleBackToLibrary}
            className="text-blue-600 hover:text-blue-700 text-sm mb-3 flex items-center gap-2 font-medium transition-colors"
          >
            <Icon name="ArrowLeft" size={16} />
            <span>Retour à la bibliothèque</span>
          </button>
          
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {currentDocument?.title || "Document sans titre"}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Icon name="User" size={16} className="text-blue-600" />
                    {currentUser.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="Shield" size={16} className="text-green-600" />
                    Consultation sécurisée
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="Lock" size={16} className="text-blue-600" />
                    Mesures anti-plagiat actives
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  En ligne
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <PDFViewer
              reportData={currentDocument}
              userInfo={currentUser}
              onSecurityViolation={handleSecurityViolation}
              documentTitle={currentDocument?.title}
            />
          </div>

          <div className="space-y-6">
            <EnhancedSessionTimer
              maxDuration={7200}
              onSessionExpired={handleSessionExpired}
              onExtendSession={handleExtendSession}
              canExtend={true}
            />

            <EnhancedSecurityMonitor
              sessionId={sessionId}
              securityAlerts={securityAlerts}
            />

            <EnhancedDocumentInfo
              document={currentDocument}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default SecurePDFReader;
