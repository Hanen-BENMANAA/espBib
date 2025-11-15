import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import NavigationBreadcrumbs from '../../components/ui/NavigationBreadcrumbs';
import StatusIndicatorBanner from '../../components/ui/StatusIndicatorBanner';
import QuickActionPanel from '../../components/ui/QuickActionPanel';
import SearchFilters from './components/SearchFilters';
import ReportCard from './components/ReportCard';
import RecommendationsPanel from './components/RecommendationsPanel';
import ResultsPagination from './components/ResultsPagination';
import MobileFilterDrawer from './components/MobileFilterDrawer';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const PublicLibraryCatalog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    sortBy: 'relevance',
    academicYear: '',
    specialty: '',
    department: '',
    supervisor: '',
    company: '',
    keywords: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  // Mock data for reports
  const mockReports = [
    {
      id: 1,
      title: "Développement d\'une application mobile de gestion des transports urbains intelligents",
      authors: ["Amira Ben Salem", "Mohamed Trabelsi"],
      academicYear: "2023-2024",
      specialty: "informatique",
      specialtyLabel: "Génie Informatique",
      department: "Département Informatique",
      supervisor: "Dr. Karim Hadj Ali",
      company: "Tunisie Telecom",
      abstractPreview: "Ce projet vise à développer une solution mobile innovante pour optimiser la gestion des transports urbains en Tunisie. L'application utilise des algorithmes d'intelligence artificielle pour prédire les flux de trafic et proposer des itinéraires optimaux aux usagers...",
      keywords: ["Transport intelligent", "Application mobile", "IA", "Optimisation", "Tunisie"],
      submissionDate: "2024-06-15",
      viewCount: 245,
      favoriteCount: 18,
      downloadCount: 67,
      accessLevel: "public",
      matchScore: 95
    },
    {
      id: 2,
      title: "Conception et réalisation d\'un système de surveillance énergétique pour bâtiments intelligents",
      authors: ["Fatma Bouaziz"],
      academicYear: "2023-2024",
      specialty: "electrique",
      specialtyLabel: "Génie Électrique",
      department: "Département Électrique",
      supervisor: "Prof. Ahmed Mansouri",
      company: "STEG",
      abstractPreview: "L'objectif de ce travail est de concevoir un système IoT pour la surveillance et l'optimisation de la consommation énergétique dans les bâtiments intelligents. Le système intègre des capteurs sans fil, une interface web de monitoring...",
      keywords: ["IoT", "Énergie", "Bâtiment intelligent", "Surveillance", "Optimisation"],
      submissionDate: "2024-06-10",
      viewCount: 189,
      favoriteCount: 23,
      downloadCount: 45,
      accessLevel: "restricted",
      matchScore: 87
    },
    {
      id: 3,
      title: "Étude et optimisation des performances d\'un moteur thermique hybride pour véhicules légers",
      authors: ["Youssef Gharbi", "Sarra Mejri"],
      academicYear: "2023-2024",
      specialty: "mecanique",
      specialtyLabel: "Génie Mécanique",
      department: "Département Mécanique",
      supervisor: "Dr. Nabil Khouja",
      company: "Wallys Car",
      abstractPreview: "Cette étude porte sur l'optimisation des performances d'un moteur thermique hybride destiné aux véhicules légers. L'analyse comprend la modélisation thermodynamique, l'optimisation des paramètres de combustion...",
      keywords: ["Moteur hybride", "Optimisation", "Véhicule léger", "Thermodynamique", "Performance"],
      submissionDate: "2024-06-08",
      viewCount: 156,
      favoriteCount: 12,
      downloadCount: 34,
      accessLevel: "internal",
      matchScore: 78
    },
    {
      id: 4,
      title: "Analyse structurelle et dimensionnement d\'un pont suspendu en zone sismique",
      authors: ["Rim Sassi"],
      academicYear: "2022-2023",
      specialty: "civil",
      specialtyLabel: "Génie Civil",
      department: "Département Génie Civil",
      supervisor: "Prof. Moncef Zouari",
      company: "SCET Tunisie",
      abstractPreview: "Ce projet traite de l'analyse structurelle et du dimensionnement d'un pont suspendu en tenant compte des contraintes sismiques spécifiques à la région méditerranéenne. L'étude utilise des méthodes de calcul avancées...",
      keywords: ["Pont suspendu", "Analyse sismique", "Structure", "Dimensionnement", "Génie civil"],
      submissionDate: "2023-06-20",
      viewCount: 298,
      favoriteCount: 31,
      downloadCount: 89,
      accessLevel: "public",
      matchScore: 72
    },
    {
      id: 5,
      title: "Optimisation de la chaîne logistique dans l\'industrie textile tunisienne",
      authors: ["Mariem Jemli", "Karim Ben Amor"],
      academicYear: "2023-2024",
      specialty: "industriel",
      specialtyLabel: "Génie Industriel",
      department: "Département Industriel",
      supervisor: "Dr. Sonia Hammami",
      company: "Groupe Sitex",
      abstractPreview: "L'objectif de ce travail est d'optimiser la chaîne logistique dans l'industrie textile tunisienne en utilisant des outils de simulation et d'optimisation. L'étude porte sur l'amélioration des flux de production...",
      keywords: ["Chaîne logistique", "Industrie textile", "Optimisation", "Simulation", "Production"],
      submissionDate: "2024-06-12",
      viewCount: 167,
      favoriteCount: 19,
      downloadCount: 52,
      accessLevel: "restricted",
      matchScore: 83
    },
    {
      id: 6,
      title: "Développement d\'un système de communication 5G pour applications IoT industrielles",
      authors: ["Omar Belhadj"],
      academicYear: "2023-2024",
      specialty: "telecom",
      specialtyLabel: "Télécommunications",
      department: "Département Télécommunications",
      supervisor: "Prof. Leila Kamoun",
      company: "Orange Tunisie",
      abstractPreview: "Ce projet vise à développer un système de communication 5G optimisé pour les applications IoT industrielles. L'étude comprend la conception d'antennes adaptées, l'optimisation des protocoles de communication...",
      keywords: ["5G", "IoT industriel", "Communication", "Antennes", "Protocoles"],
      submissionDate: "2024-06-05",
      viewCount: 203,
      favoriteCount: 27,
      downloadCount: 71,
      accessLevel: "public",
      matchScore: 91
    }
  ];

  // Mock recommendations
  const mockRecommendations = [
    {
      id: 7,
      title: "Intelligence artificielle appliquée à la reconnaissance vocale en arabe tunisien",
      authors: ["Ines Chakroun"],
      academicYear: "2022-2023",
      specialty: "informatique",
      specialtyLabel: "Génie Informatique",
      abstractPreview: "Développement d\'un système de reconnaissance vocale spécialisé dans le dialecte tunisien utilisant des réseaux de neurones profonds...",
      viewCount: 134,
      matchScore: 89
    },
    {
      id: 8,
      title: "Système de gestion intelligente de l\'éclairage public urbain",
      authors: ["Mehdi Agrebi"],
      academicYear: "2022-2023",
      specialty: "electrique",
      specialtyLabel: "Génie Électrique",
      abstractPreview: "Conception d\'un système IoT pour la gestion automatisée et optimisée de l\'éclairage public dans les villes tunisiennes...",
      viewCount: 178,
      matchScore: 76
    }
  ];

  // Mock user history
  const mockUserHistory = [
    { keyword: "Intelligence artificielle" },
    { keyword: "IoT" },
    { keyword: "Optimisation" },
    { keyword: "Application mobile" },
    { keyword: "Système embarqué" }
  ];

  // Filter and search logic
  const filteredReports = mockReports?.filter(report => {
    const matchesSearch = !searchQuery || 
      report?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      report?.abstractPreview?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      report?.authors?.some(author => author?.toLowerCase()?.includes(searchQuery?.toLowerCase())) ||
      report?.keywords?.some(keyword => keyword?.toLowerCase()?.includes(searchQuery?.toLowerCase()));

    const matchesFilters = 
      (!filters?.academicYear || report?.academicYear === filters?.academicYear) &&
      (!filters?.specialty || report?.specialty === filters?.specialty) &&
      (!filters?.department || report?.department?.toLowerCase()?.includes(filters?.department?.toLowerCase())) &&
      (!filters?.supervisor || report?.supervisor?.toLowerCase()?.includes(filters?.supervisor?.toLowerCase())) &&
      (!filters?.company || report?.company?.toLowerCase()?.includes(filters?.company?.toLowerCase())) &&
      (!filters?.keywords || filters?.keywords?.split(',')?.some(keyword => 
        report?.keywords?.some(reportKeyword => 
          reportKeyword?.toLowerCase()?.includes(keyword?.trim()?.toLowerCase())
        )
      ));

    return matchesSearch && matchesFilters;
  });

  // Sort results
  const sortedReports = [...filteredReports]?.sort((a, b) => {
    switch (filters?.sortBy) {
      case 'date_desc':
        return new Date(b.submissionDate) - new Date(a.submissionDate);
      case 'date_asc':
        return new Date(a.submissionDate) - new Date(b.submissionDate);
      case 'title_asc':
        return a?.title?.localeCompare(b?.title);
      case 'title_desc':
        return b?.title?.localeCompare(a?.title);
      case 'popularity':
        return b?.viewCount - a?.viewCount;
      default:
        return b?.matchScore - a?.matchScore;
    }
  });

  // Pagination
  const totalResults = sortedReports?.length;
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const paginatedReports = sortedReports?.slice(startIndex, startIndex + resultsPerPage);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      sortBy: 'relevance',
      academicYear: '',
      specialty: '',
      department: '',
      supervisor: '',
      company: '',
      keywords: ''
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResultsPerPageChange = (newResultsPerPage) => {
    setResultsPerPage(newResultsPerPage);
    setCurrentPage(1);
  };

  // Simulate loading
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, filters, currentPage]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <NavigationBreadcrumbs />
        
        {/* Status Banner */}
        {showBanner && (
          <div className="mb-6">
            <StatusIndicatorBanner
              type="info"
              message="Catalogue mis à jour avec 1,247 nouveaux rapports PFE pour l'année académique 2023-2024"
              isVisible={showBanner}
              onDismiss={() => setShowBanner(false)}
              autoHide={true}
              autoHideDelay={8000}
              showProgress={true}
              actionLabel="Voir les nouveautés"
              onAction={() => {
                setFilters({ ...filters, academicYear: '2023-2024' });
                setShowBanner(false);
              }}
            />
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
                    Catalogue Bibliothèque ESPRIM
                  </h1>
                  <p className="text-muted-foreground">
                    Découvrez et consultez les rapports de Projet de Fin d'Études validés
                  </p>
                </div>
                
                {/* Mobile Filter Button */}
                <div className="lg:hidden">
                  <Button
                    variant="outline"
                    onClick={() => setIsMobileFilterOpen(true)}
                    iconName="Filter"
                    iconPosition="left"
                  >
                    Filtres
                  </Button>
                </div>
              </div>
            </div>

            {/* Search Filters */}
            <div className="mb-6">
              <SearchFilters
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                resultCount={totalResults}
                onClearFilters={handleClearFilters}
              />
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="text-muted-foreground">Recherche en cours...</span>
                </div>
              </div>
            )}

            {/* Results */}
            {!isLoading && (
              <>
                {paginatedReports?.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    {paginatedReports?.map((report) => (
                      <ReportCard key={report?.id} report={report} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                      Aucun rapport trouvé
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Essayez de modifier vos critères de recherche ou vos filtres
                    </p>
                    <Button variant="outline" onClick={handleClearFilters}>
                      Effacer tous les filtres
                    </Button>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <ResultsPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalResults={totalResults}
                    resultsPerPage={resultsPerPage}
                    onPageChange={handlePageChange}
                    onResultsPerPageChange={handleResultsPerPageChange}
                  />
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block w-80 space-y-6">
            <RecommendationsPanel 
              recommendations={mockRecommendations}
              userHistory={mockUserHistory}
            />
            
            {/* Quick Stats */}
            <div className="bg-card border border-border rounded-academic academic-shadow-sm p-6">
              <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
                Statistiques
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total rapports</span>
                  <span className="text-sm font-medium text-foreground">1,247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Nouveaux ce mois</span>
                  <span className="text-sm font-medium text-success">89</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Consultations aujourd'hui</span>
                  <span className="text-sm font-medium text-accent">156</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Spécialités actives</span>
                  <span className="text-sm font-medium text-foreground">6</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />
      <QuickActionPanel userRole="student" />
    </div>
  );
};

export default PublicLibraryCatalog;