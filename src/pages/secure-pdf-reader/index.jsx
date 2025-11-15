import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import NavigationBreadcrumbs from '../../components/ui/NavigationBreadcrumbs';
import StatusIndicatorBanner from '../../components/ui/StatusIndicatorBanner';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import PDFViewer from './components/PDFViewer';
import DocumentInfo from './components/DocumentInfo';
import SessionTimer from './components/SessionTimer';
import SecurityMonitor from './components/SecurityMonitor';

const SecurePDFReader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get document info from navigation state or use default
  const documentFromState = location?.state?.document;
  
  const [currentUser] = useState({
    name: "Jean Dupont",
    email: "jean.dupont@esprim.tn",
    role: "Étudiant",
    id: "STU-2024-001"
  });

  const [currentDocument] = useState(documentFromState || {
    id: "DOC-2024-156",
    title: "Développement d'un Système IoT pour la Gestion Énergétique",
    author: "Ahmed Ben Salem",
    supervisor: "Dr. Fatma Gharbi",
    year: "2024",
    specialty: "Génie Informatique",
    department: "Informatique et Télécommunications",
    keywords: ["IoT", "Gestion énergétique", "Capteurs intelligents", "Machine Learning"],
    abstract: `Ce projet présente le développement d'un système IoT innovant pour la gestion énergétique intelligente dans les bâtiments industriels. L'objectif principal est de créer une solution complète permettant la surveillance en temps réel de la consommation énergétique et l'optimisation automatique des équipements.

Le système développé intègre des capteurs IoT avancés, des algorithmes d'apprentissage automatique et une interface utilisateur intuitive. Les résultats montrent une réduction de 25% de la consommation énergétique et une amélioration significative de l'efficacité opérationnelle.

Cette solution contribue aux objectifs de développement durable et offre des perspectives prometteuses pour l'industrie 4.0.`,
    defenseDate: "15/06/2024",
    company: "TechnoSmart Solutions",
    pages: 156,
    fileSize: "12.5 MB",
    uploadDate: "10/06/2024",
    validationDate: "12/06/2024",
    validator: "Prof. Mohamed Trabelsi",
    pdfUrl: "/sample-report.pdf"
  });

  const [sessionInfo] = useState({
    id: "SEC-2025-001",
    startTime: new Date(),
    maxDuration: 7200, // 2 hours
    canExtend: true
  });

  const [showStatusBanner, setShowStatusBanner] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState([]);

  // Initialize security measures on component mount
  useEffect(() => {
    // Disable browser shortcuts and context menu
    const handleKeyDown = (e) => {
      // Block F12, Ctrl+Shift+I, Ctrl+U, etc.
      if (
        e?.key === 'F12' ||
        (e?.ctrlKey && e?.shiftKey && e?.key === 'I') ||
        (e?.ctrlKey && e?.key === 'u') ||
        (e?.ctrlKey && e?.key === 's') ||
        (e?.ctrlKey && e?.key === 'p')
      ) {
        e?.preventDefault();
        handleSecurityViolation({
          type: 'blocked_shortcut',
          key: e?.key,
          timestamp: new Date()
        });
      }
    };

    const handleContextMenu = (e) => {
      e?.preventDefault();
      handleSecurityViolation({
        type: 'right_click_blocked',
        timestamp: new Date()
      });
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    // Cleanup on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  const handleSecurityViolation = (violation) => {
    setSecurityAlerts(prev => [...prev, violation]);
    console.warn('Security violation detected:', violation);
  };

  const handleSessionExpired = () => {
    setShowStatusBanner(true);
    // Redirect to library after a delay
    setTimeout(() => {
      navigate('/public-library-catalog', {
        state: { 
          message: 'Session expirée. Veuillez vous reconnecter pour continuer la consultation.' 
        }
      });
    }, 3000);
  };

  const handleExtendSession = async () => {
    // Simulate session extension
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Session extended');
        resolve();
      }, 1000);
    });
  };

  const handleAddBookmark = (document) => {
    setIsBookmarked(true);
    console.log('Document bookmarked:', document?.title);
  };

  const handleRemoveBookmark = (documentId) => {
    setIsBookmarked(false);
    console.log('Bookmark removed for document:', documentId);
  };

  const handleBackToLibrary = () => {
    navigate('/public-library-catalog');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        {/* Status Banner */}
        {showStatusBanner && (
          <StatusIndicatorBanner
            type="session"
            message="Session de consultation sécurisée active. Toutes les interactions sont surveillées pour la protection du document."
            isVisible={showStatusBanner}
            onDismiss={() => setShowStatusBanner(false)}
            autoHide={true}
            autoHideDelay={8000}
            showProgress={true}
            actionLabel="OK"
            onAction={() => setShowStatusBanner(false)}
          />
        )}

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumbs */}
          <NavigationBreadcrumbs />

          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleBackToLibrary}
                iconName="ArrowLeft"
                iconPosition="left"
              >
                Retour à la bibliothèque
              </Button>
              
              <div className="hidden md:block">
                <h1 className="text-2xl font-heading font-bold text-foreground">
                  Lecteur PDF Sécurisé
                </h1>
                <p className="text-muted-foreground">
                  Consultation protégée avec mesures anti-plagiat
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="lg:hidden"
              >
                <Icon name={sidebarCollapsed ? "PanelRightOpen" : "PanelRightClose"} size={20} />
              </Button>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="Shield" size={16} className="text-success" />
                <span>Sécurisé</span>
              </div>
            </div>
          </div>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* PDF Viewer - Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-card border border-border rounded-academic academic-shadow-lg overflow-hidden">
                <PDFViewer
                  documentUrl={currentDocument?.pdfUrl}
                  documentTitle={currentDocument?.title}
                  onSecurityViolation={handleSecurityViolation}
                  userInfo={currentUser}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className={`lg:col-span-1 space-y-6 ${sidebarCollapsed ? 'hidden lg:block' : 'block'}`}>
              {/* Session Timer */}
              <SessionTimer
                maxDuration={sessionInfo?.maxDuration}
                onSessionExpired={handleSessionExpired}
                onExtendSession={handleExtendSession}
                canExtend={sessionInfo?.canExtend}
              />

              {/* Document Information */}
              <DocumentInfo
                document={currentDocument}
                onAddBookmark={handleAddBookmark}
                onRemoveBookmark={handleRemoveBookmark}
                isBookmarked={isBookmarked}
              />

              {/* Security Monitor */}
              <SecurityMonitor
                onSecurityAlert={handleSecurityViolation}
                sessionId={sessionInfo?.id}
              />

              {/* Quick Actions */}
              <div className="bg-card border border-border rounded-academic p-4 academic-shadow-sm">
                <h3 className="font-heading font-medium text-foreground mb-3">
                  Actions Rapides
                </h3>
                
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    iconName="Search"
                    iconPosition="left"
                    onClick={() => navigate('/public-library-catalog')}
                  >
                    Rechercher d'autres documents
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    iconName="History"
                    iconPosition="left"
                  >
                    Historique de consultation
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    iconName="BookmarkPlus"
                    iconPosition="left"
                    onClick={() => handleAddBookmark(currentDocument)}
                    disabled={isBookmarked}
                  >
                    {isBookmarked ? 'Déjà en favoris' : 'Ajouter aux favoris'}
                  </Button>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-warning/10 border border-warning/20 rounded-academic p-4">
                <div className="flex items-start space-x-2">
                  <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-warning-foreground">
                      Notice de Sécurité
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ce document est protégé par des mesures anti-plagiat. 
                      Toute tentative de copie ou d'extraction est surveillée et enregistrée.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SecurePDFReader;