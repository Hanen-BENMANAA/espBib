import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PDFViewer = ({ 
  reportData, 
  onPageChange, 
  currentPage = 1,
  totalPages = 1,
  zoomLevel = 100,
  onZoomChange,
  searchTerm = '',
  onSearchChange,
  reviewerInfo
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const viewerRef = useRef(null);

  // Mock PDF content for demonstration
  const mockPDFContent = `Rapport de Projet de Fin d'Études

Titre: ${reportData?.title || 'Développement d\'une Application Mobile de Gestion Académique'}

Étudiant: ${reportData?.studentName || 'Ahmed Ben Salem'}
Spécialité: ${reportData?.specialty || 'Génie Logiciel'}
Année: ${reportData?.year || '2024'}

Résumé:
Ce projet présente le développement d'une application mobile innovante destinée à la gestion académique des établissements d'enseignement supérieur. L'application vise à digitaliser et optimiser les processus administratifs tout en offrant une interface utilisateur intuitive pour les étudiants, enseignants et administrateurs.

Problématique:
Les établissements d'enseignement supérieur font face à des défis croissants dans la gestion de leurs processus académiques. Les systèmes traditionnels, souvent basés sur des méthodes manuelles ou des logiciels obsolètes, ne répondent plus aux besoins actuels de mobilité et d'efficacité.

Objectifs:
1. Développer une solution mobile native pour Android et iOS
2. Intégrer les fonctionnalités essentielles de gestion académique
3. Assurer une expérience utilisateur optimale
4. Garantir la sécurité et la confidentialité des données

Méthodologie:
Le projet suit une approche agile avec des sprints de deux semaines. L'architecture technique repose sur React Native pour le développement cross-platform, avec un backend Node.js et une base de données MongoDB.

Technologies utilisées:
- Frontend: React Native, Redux, React Navigation
- Backend: Node.js, Express.js, JWT Authentication
- Base de données: MongoDB, Mongoose ODM
- Services cloud: AWS S3, Firebase Push Notifications

Résultats obtenus:
L'application développée offre une interface moderne et responsive permettant aux utilisateurs d'accéder facilement aux informations académiques. Les tests utilisateurs montrent un taux de satisfaction de 92% et une réduction de 60% du temps de traitement des demandes administratives.

Conclusion:
Ce projet démontre l'importance de la digitalisation dans l'enseignement supérieur et propose une solution concrète aux défis actuels. L'application développée constitue une base solide pour de futures améliorations et extensions fonctionnelles.`;

  // Simulate search functionality
  useEffect(() => {
    if (searchTerm) {
      const results = [];
      const lines = mockPDFContent?.split('\n');
      lines?.forEach((line, index) => {
        if (line?.toLowerCase()?.includes(searchTerm?.toLowerCase())) {
          results?.push({ line: index + 1, text: line, page: Math.floor(index / 20) + 1 });
        }
      });
      setSearchResults(results);
      setCurrentSearchIndex(0);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, mockPDFContent]);

  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel + 25, 200);
    onZoomChange(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 25, 50);
    onZoomChange(newZoom);
  };

  const handlePageNavigation = (direction) => {
    if (direction === 'prev' && currentPage > 1) {
      onPageChange(currentPage - 1);
    } else if (direction === 'next' && currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleSearchNavigation = (direction) => {
    if (searchResults?.length === 0) return;
    
    if (direction === 'next') {
      setCurrentSearchIndex((prev) => (prev + 1) % searchResults?.length);
    } else {
      setCurrentSearchIndex((prev) => (prev - 1 + searchResults?.length) % searchResults?.length);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Prevent right-click context menu
  const handleContextMenu = (e) => {
    e?.preventDefault();
  };

  // Prevent text selection
  const handleSelectStart = (e) => {
    e?.preventDefault();
  };

  return (
    <div className={`bg-surface border border-border rounded-lg shadow-academic ${isFullscreen ? 'fixed inset-4 z-200' : 'h-full'}`}>
      {/* PDF Viewer Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
        <div className="flex items-center space-x-4">
          <h3 className="font-heading font-medium text-text-primary">
            {reportData?.title || 'Document PDF'}
          </h3>
          <div className="flex items-center space-x-2 text-sm font-caption text-text-secondary">
            <Icon name="FileText" size={16} />
            <span>PDF • {reportData?.fileSize || '2.4 MB'}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSearch(!showSearch)}
            className={showSearch ? 'bg-accent/10 text-accent' : ''}
          >
            <Icon name="Search" size={16} />
          </Button>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 bg-background border border-border rounded-lg">
            <Button variant="ghost" size="icon" onClick={handleZoomOut}>
              <Icon name="ZoomOut" size={16} />
            </Button>
            <span className="px-3 py-1 text-sm font-caption text-text-secondary min-w-[60px] text-center">
              {zoomLevel}%
            </span>
            <Button variant="ghost" size="icon" onClick={handleZoomIn}>
              <Icon name="ZoomIn" size={16} />
            </Button>
          </div>

          {/* Fullscreen Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            <Icon name={isFullscreen ? "Minimize2" : "Maximize2"} size={16} />
          </Button>
        </div>
      </div>
      {/* Search Bar */}
      {showSearch && (
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                placeholder="Rechercher dans le document..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e?.target?.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
            {searchResults?.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-caption text-text-secondary">
                  {currentSearchIndex + 1} sur {searchResults?.length}
                </span>
                <Button variant="ghost" size="icon" onClick={() => handleSearchNavigation('prev')}>
                  <Icon name="ChevronUp" size={16} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleSearchNavigation('next')}>
                  <Icon name="ChevronDown" size={16} />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* PDF Content Area */}
      <div 
        ref={viewerRef}
        className="flex-1 relative overflow-auto bg-slate-100"
        onContextMenu={handleContextMenu}
        onSelectStart={handleSelectStart}
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      >
        {/* Watermark Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 100px,
              rgba(30, 58, 138, 0.15) 100px,
              rgba(30, 58, 138, 0.15) 200px
            )`,
            backgroundSize: '200px 200px'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="text-primary/20 font-heading font-medium text-2xl transform rotate-45 select-none"
              style={{ fontSize: `${zoomLevel * 0.3}px` }}
            >
              {reviewerInfo?.name || 'Marie Dubois'} • {new Date()?.toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>

        {/* PDF Content */}
        <div 
          className="p-8 bg-white mx-auto shadow-academic-lg"
          style={{ 
            width: `${8.5 * zoomLevel}px`,
            minHeight: `${11 * zoomLevel}px`,
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center'
          }}
        >
          <div className="prose prose-sm max-w-none">
            {mockPDFContent?.split('\n')?.map((line, index) => {
              const isHighlighted = searchTerm && line?.toLowerCase()?.includes(searchTerm?.toLowerCase());
              return (
                <p 
                  key={index} 
                  className={`mb-2 ${isHighlighted ? 'bg-yellow-200' : ''}`}
                  style={{ fontSize: `${14 * (zoomLevel / 100)}px` }}
                >
                  {line || '\u00A0'}
                </p>
              );
            })}
          </div>
        </div>
      </div>
      {/* PDF Navigation Footer */}
      <div className="flex items-center justify-between p-4 border-t border-border bg-muted/50">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handlePageNavigation('prev')}
            disabled={currentPage <= 1}
          >
            <Icon name="ChevronLeft" size={16} />
          </Button>
          
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={(e) => onPageChange(parseInt(e?.target?.value) || 1)}
              className="w-16 px-2 py-1 text-center text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <span className="text-sm font-caption text-text-secondary">
              sur {totalPages}
            </span>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handlePageNavigation('next')}
            disabled={currentPage >= totalPages}
          >
            <Icon name="ChevronRight" size={16} />
          </Button>
        </div>

        <div className="flex items-center space-x-4 text-sm font-caption text-text-secondary">
          <div className="flex items-center space-x-2">
            <Icon name="Shield" size={16} className="text-accent" />
            <span>Protection anti-plagiat active</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Eye" size={16} className="text-success" />
            <span>Consultation sécurisée</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;