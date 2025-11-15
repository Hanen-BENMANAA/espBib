import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import SecurityWatermark from './SecurityWatermark';

const PDFViewer = ({ 
  documentUrl = "/sample-report.pdf",
  documentTitle = "Développement d'un Système IoT pour la Gestion Énergétique",
  onSecurityViolation,
  userInfo
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(156);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const viewerRef = useRef(null);

  // Security monitoring
  useEffect(() => {
    const handleContextMenu = (e) => {
      e?.preventDefault();
      logSecurityEvent('right_click_blocked');
    };

    const handleKeyDown = (e) => {
      // Block common copy shortcuts
      if ((e?.ctrlKey || e?.metaKey) && ['c', 'a', 's', 'p']?.includes(e?.key?.toLowerCase())) {
        e?.preventDefault();
        logSecurityEvent('keyboard_shortcut_blocked', { key: e?.key });
      }
      
      // Block F12, Ctrl+Shift+I (DevTools)
      if (e?.key === 'F12' || (e?.ctrlKey && e?.shiftKey && e?.key === 'I')) {
        e?.preventDefault();
        logSecurityEvent('devtools_attempt');
      }
    };

    const handleSelectStart = (e) => {
      // Allow selection only within search input
      if (!e?.target?.closest('input[type="text"]')) {
        e?.preventDefault();
        logSecurityEvent('text_selection_blocked');
      }
    };

    const handlePrint = (e) => {
      e?.preventDefault();
      logSecurityEvent('print_blocked');
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', handleSelectStart);
    window.addEventListener('beforeprint', handlePrint);

    // Monitor for multiple tabs/windows
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logSecurityEvent('tab_switch_detected');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', handleSelectStart);
      window.removeEventListener('beforeprint', handlePrint);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const logSecurityEvent = (eventType, details = {}) => {
    const event = {
      type: eventType,
      timestamp: new Date()?.toISOString(),
      details,
      userAgent: navigator.userAgent
    };
    
    setSecurityAlerts(prev => [...prev, event]);
    
    if (onSecurityViolation) {
      onSecurityViolation(event);
    }
    
    console.warn('Security event logged:', event);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleZoomChange = (newZoom) => {
    const clampedZoom = Math.max(50, Math.min(200, newZoom));
    setZoomLevel(clampedZoom);
  };

  const handleSearch = async () => {
    if (!searchTerm?.trim()) return;
    
    setIsSearching(true);
    
    // Simulate search in PDF content
    setTimeout(() => {
      const mockResults = [
        { page: 15, context: "...système IoT permet de surveiller..." },
        { page: 23, context: "...gestion énergétique optimisée..." },
        { page: 45, context: "...capteurs IoT intégrés dans..." },
        { page: 67, context: "...analyse des données IoT..." }
      ]?.filter(result => 
        result?.context?.toLowerCase()?.includes(searchTerm?.toLowerCase())
      );
      
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 1000);
  };

  const goToSearchResult = (page) => {
    setCurrentPage(page);
    setShowSearch(false);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* PDF Viewer Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-heading font-semibold text-foreground truncate">
              {documentTitle}
            </h2>
            <p className="text-sm text-muted-foreground">
              Page {currentPage} sur {totalPages} • Zoom {zoomLevel}%
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Icon name="Search" size={20} />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleZoomChange(zoomLevel - 10)}
              disabled={zoomLevel <= 50}
            >
              <Icon name="ZoomOut" size={20} />
            </Button>
            
            <span className="text-sm font-mono text-muted-foreground min-w-[60px] text-center">
              {zoomLevel}%
            </span>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleZoomChange(zoomLevel + 10)}
              disabled={zoomLevel >= 200}
            >
              <Icon name="ZoomIn" size={20} />
            </Button>
          </div>
        </div>

        {/* Search Panel */}
        {showSearch && (
          <div className="bg-muted rounded-academic p-3 mb-3">
            <div className="flex items-center space-x-2 mb-3">
              <Input
                type="text"
                placeholder="Rechercher dans le document..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value)}
                onKeyPress={(e) => e?.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button
                variant="default"
                onClick={handleSearch}
                loading={isSearching}
                iconName="Search"
              >
                Rechercher
              </Button>
            </div>
            
            {searchResults?.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {searchResults?.length} résultat(s) trouvé(s)
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {searchResults?.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => goToSearchResult(result?.page)}
                      className="w-full text-left p-2 rounded bg-card hover:bg-muted academic-transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground">
                          Page {result?.page}
                        </span>
                        <Icon name="ExternalLink" size={14} />
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {result?.context}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              iconName="ChevronLeft"
            >
              Précédent
            </Button>
            
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={currentPage}
                onChange={(e) => handlePageChange(parseInt(e?.target?.value) || 1)}
                className="w-20 text-center"
                min="1"
                max={totalPages}
              />
              <span className="text-sm text-muted-foreground">
                / {totalPages}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              iconName="ChevronRight"
              iconPosition="right"
            >
              Suivant
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              Première page
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              Dernière page
            </Button>
          </div>
        </div>
      </div>
      {/* PDF Content Area */}
      <div className="flex-1 relative overflow-hidden bg-gray-100">
        <div 
          ref={viewerRef}
          className="w-full h-full overflow-auto p-4"
          style={{ 
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top left'
          }}
        >
          {/* Security Watermark Overlay */}
          <SecurityWatermark 
            userInfo={userInfo}
            documentTitle={documentTitle}
          />
          
          {/* Mock PDF Content */}
          <div className="max-w-4xl mx-auto bg-white academic-shadow-lg">
            <div className="p-8 min-h-[1000px]">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {documentTitle}
                </h1>
                <p className="text-gray-600">
                  Projet de Fin d'Études - ESPRIM 2024
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Présenté par: Ahmed Ben Salem
                </p>
                <p className="text-gray-500 text-sm">
                  Encadré par: Dr. Fatma Gharbi
                </p>
              </div>

              <div className="space-y-6 text-gray-800">
                <section>
                  <h2 className="text-xl font-semibold mb-3 text-primary">
                    Résumé
                  </h2>
                  <p className="text-justify leading-relaxed">
                    Ce projet présente le développement d'un système IoT innovant pour la gestion énergétique intelligente dans les bâtiments industriels. L'objectif principal 
                    est de créer une solution complète permettant la surveillance en temps réel 
                    de la consommation énergétique et l'optimisation automatique des équipements.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3 text-primary">
                    1. Introduction
                  </h2>
                  <p className="text-justify leading-relaxed mb-4">
                    La gestion énergétique représente un enjeu majeur dans le contexte actuel 
                    de transition écologique. Les systèmes IoT offrent des opportunités 
                    exceptionnelles pour optimiser la consommation d'énergie dans les 
                    environnements industriels.
                  </p>
                  <p className="text-justify leading-relaxed">
                    Notre approche combine capteurs intelligents, algorithmes d'apprentissage 
                    automatique et interfaces utilisateur intuitives pour créer un écosystème 
                    complet de gestion énergétique.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3 text-primary">
                    2. État de l'art
                  </h2>
                  <p className="text-justify leading-relaxed">
                    Les solutions existantes présentent plusieurs limitations en termes de 
                    scalabilité et d'interopérabilité. Notre étude comparative révèle des opportunités d'amélioration significatives dans l'intégration des 
                    protocoles de communication IoT.
                  </p>
                </section>

                {/* Page indicator */}
                <div className="text-center text-gray-400 text-sm mt-12 pt-4 border-t">
                  Page {currentPage}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Security Alert Indicator */}
      {securityAlerts?.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-error/10 border border-error/20 rounded-academic p-2">
          <div className="flex items-center space-x-2">
            <Icon name="Shield" size={16} className="text-error" />
            <span className="text-xs text-error-foreground">
              {securityAlerts?.length} événement(s) de sécurité détecté(s)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;