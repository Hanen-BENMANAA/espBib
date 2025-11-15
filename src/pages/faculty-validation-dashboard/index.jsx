import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import NavigationBreadcrumbs from '../../components/ui/NavigationBreadcrumbs';
import StatusIndicatorBanner from '../../components/ui/StatusIndicatorBanner';
import QuickActionPanel from '../../components/ui/QuickActionPanel';
import ValidationStatsPanel from './components/ValidationStatsPanel';
import FilterToolbar from './components/FilterToolbar';
import ReportsTable from './components/ReportsTable';
import ValidationModal from './components/ValidationModal';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const FacultyValidationDashboard = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filters, setFilters] = useState({});
  const [selectedReport, setSelectedReport] = useState(null);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerType, setBannerType] = useState('info');
  const [showBanner, setShowBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for pending reports
  const mockReports = [
    {
      id: 1,
      studentName: "Amira Ben Salem",
      studentEmail: "amira.bensalem@esprim.tn",
      title: "Développement d'une Application Mobile de Gestion des Ressources Humaines avec Intelligence Artificielle",
      submissionDate: "2024-10-14T09:30:00Z",
      specialty: "Génie Informatique",
      department: "Département Informatique",
      supervisor: "Dr. Ben Ahmed",
      priority: "high",
      daysWaiting: 2,
      fileSize: "12.5 MB",
      fileFormat: "PDF/A",
      pageCount: 85,
      abstract: `Ce projet présente le développement d'une application mobile innovante pour la gestion des ressources humaines, intégrant des technologies d'intelligence artificielle pour optimiser les processus de recrutement et d'évaluation des performances. L'application utilise des algorithmes de machine learning pour analyser les profils des candidats et recommander les meilleurs matches pour les postes disponibles.`,
      keywords: ["Intelligence Artificielle", "Mobile", "RH", "Machine Learning", "Recrutement"],
      hostCompany: "TechSoft Solutions"
    },
    {
      id: 2,
      studentName: "Mohamed Trabelsi",
      studentEmail: "mohamed.trabelsi@esprim.tn",
      title: "Conception et Réalisation d\'un Système de Surveillance IoT pour l\'Agriculture de Précision",
      submissionDate: "2024-10-13T14:15:00Z",
      specialty: "Génie Électrique",
      department: "Département Électrique",
      supervisor: "Prof. Gharbi",
      priority: "medium",
      daysWaiting: 3,
      fileSize: "18.2 MB",
      fileFormat: "PDF/A",
      pageCount: 92,
      abstract: `Cette étude porte sur la conception d'un système IoT complet pour l'agriculture de précision, permettant la surveillance en temps réel des conditions environnementales des cultures. Le système intègre des capteurs de température, d'humidité, de pH du sol et de luminosité, connectés via un réseau LoRaWAN pour une couverture étendue.`,
      keywords: ["IoT", "Agriculture", "LoRaWAN", "Capteurs", "Surveillance"],
      hostCompany: "AgriTech Innovation"
    },
    {
      id: 3,
      studentName: "Fatma Khelifi",
      studentEmail: "fatma.khelifi@esprim.tn",
      title: "Optimisation des Processus de Production par Simulation et Analyse des Données",
      submissionDate: "2024-10-12T11:45:00Z",
      specialty: "Génie Industriel",
      department: "Département Industriel",
      supervisor: "Dr. Mansouri",
      priority: "medium",
      daysWaiting: 4,
      fileSize: "15.8 MB",
      fileFormat: "PDF/A",
      pageCount: 78,
      abstract: `Ce travail présente une approche d'optimisation des processus de production industrielle basée sur la simulation numérique et l'analyse avancée des données. L'étude utilise des techniques de modélisation discrète pour identifier les goulots d'étranglement et proposer des solutions d'amélioration de la productivité.`,
      keywords: ["Optimisation", "Simulation", "Production", "Analyse de données", "Industrie 4.0"],
      hostCompany: "ManufacTech Industries"
    },
    {
      id: 4,
      studentName: "Ahmed Bouazizi",
      studentEmail: "ahmed.bouazizi@esprim.tn",
      title: "Étude et Dimensionnement d\'une Structure en Béton Armé Résistante aux Séismes",
      submissionDate: "2024-10-11T16:20:00Z",
      specialty: "Génie Civil",
      department: "Département Civil",
      supervisor: "Prof. Trabelsi",
      priority: "low",
      daysWaiting: 5,
      fileSize: "22.1 MB",
      fileFormat: "PDF/A",
      pageCount: 105,
      abstract: `Cette recherche porte sur l'étude et le dimensionnement d'une structure en béton armé conçue pour résister aux sollicitations sismiques selon les normes tunisiennes et européennes. Le projet inclut une analyse dynamique complète et des recommandations pour l'amélioration de la résistance parasismique.`,
      keywords: ["Béton armé", "Séismes", "Structure", "Dimensionnement", "Normes"],
      hostCompany: "BTP Construct"
    },
    {
      id: 5,
      studentName: "Sarra Mejri",
      studentEmail: "sarra.mejri@esprim.tn",
      title: "Développement d\'un Système de Contrôle Automatique pour Ligne de Production Pharmaceutique",
      submissionDate: "2024-10-10T08:30:00Z",
      specialty: "Génie Électrique",
      department: "Département Électrique",
      supervisor: "Dr. Khelifi",
      priority: "high",
      daysWaiting: 6,
      fileSize: "14.7 MB",
      fileFormat: "PDF/A",
      pageCount: 88,
      abstract: `Ce projet présente la conception et l'implémentation d'un système de contrôle automatique pour une ligne de production pharmaceutique, garantissant la qualité et la traçabilité des produits. Le système utilise des automates programmables et des interfaces homme-machine pour optimiser les processus de fabrication.`,
      keywords: ["Automatisation", "Pharmaceutique", "Contrôle", "PLC", "Qualité"],
      hostCompany: "PharmaLine Systems"
    }
  ];

  useEffect(() => {
    // Simulate loading
    const loadReports = async () => {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setReports(mockReports);
      setFilteredReports(mockReports);
      setIsLoading(false);
      
      // Show welcome banner
      setBannerMessage("Bienvenue dans votre tableau de bord de validation. Vous avez 23 rapports en attente de validation.");
      setBannerType("info");
      setShowBanner(true);
    };

    loadReports();
  }, []);

  // Filter reports based on active filters
  useEffect(() => {
    let filtered = [...reports];

    if (filters?.searchQuery) {
      const query = filters?.searchQuery?.toLowerCase();
      filtered = filtered?.filter(report =>
        report?.studentName?.toLowerCase()?.includes(query) ||
        report?.title?.toLowerCase()?.includes(query) ||
        report?.keywords?.some(keyword => keyword?.toLowerCase()?.includes(query))
      );
    }

    if (filters?.specialty) {
      filtered = filtered?.filter(report => 
        report?.specialty?.toLowerCase()?.includes(filters?.specialty?.toLowerCase())
      );
    }

    if (filters?.department) {
      filtered = filtered?.filter(report => 
        report?.department?.toLowerCase()?.includes(filters?.department?.toLowerCase())
      );
    }

    if (filters?.supervisor) {
      filtered = filtered?.filter(report => 
        report?.supervisor?.toLowerCase()?.includes(filters?.supervisor?.toLowerCase())
      );
    }

    if (filters?.priority) {
      filtered = filtered?.filter(report => report?.priority === filters?.priority);
    }

    if (filters?.dateFrom) {
      filtered = filtered?.filter(report => 
        new Date(report.submissionDate) >= new Date(filters.dateFrom)
      );
    }

    if (filters?.dateTo) {
      filtered = filtered?.filter(report => 
        new Date(report.submissionDate) <= new Date(filters.dateTo)
      );
    }

    setFilteredReports(filtered);
  }, [filters, reports]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setIsValidationModalOpen(true);
  };

  const handleValidateReport = (report, validationData) => {
    // Update report status
    setReports(prevReports => 
      prevReports?.filter(r => r?.id !== report?.id)
    );
    
    setBannerMessage(`Rapport "${report?.title}" validé avec succès. L'étudiant a été notifié par email.`);
    setBannerType("success");
    setShowBanner(true);
  };

  const handleRejectReport = (report, rejectionData) => {
    // Update report status
    setReports(prevReports => 
      prevReports?.filter(r => r?.id !== report?.id)
    );
    
    setBannerMessage(`Rapport "${report?.title}" rejeté. L'étudiant a été notifié avec les commentaires.`);
    setBannerType("error");
    setShowBanner(true);
  };

  const handleRequestModification = (report, modificationData) => {
    // Update report status
    setReports(prevReports => 
      prevReports?.map(r => 
        r?.id === report?.id 
          ? { ...r, status: 'modification_requested', priority: 'medium' }
          : r
      )
    );
    
    setBannerMessage(`Demande de modification envoyée pour "${report?.title}". L'étudiant a été notifié.`);
    setBannerType("warning");
    setShowBanner(true);
  };

  const handleBannerDismiss = () => {
    setShowBanner(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Icon name="Loader2" size={32} className="animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement des rapports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <NavigationBreadcrumbs />
        
        {/* Status Banner */}
        <StatusIndicatorBanner
          type={bannerType}
          message={bannerMessage}
          isVisible={showBanner}
          onDismiss={handleBannerDismiss}
          autoHide={true}
          autoHideDelay={5000}
          showProgress={true}
          actionLabel=""
          onAction={() => {}}
        />

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Validation des Rapports PFE
            </h1>
            <p className="text-muted-foreground">
              Examinez et validez les rapports de projet de fin d'études soumis par les étudiants
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <Button
              variant="outline"
              iconName="Download"
              onClick={() => {
                setBannerMessage("Export des données en cours...");
                setBannerType("info");
                setShowBanner(true);
              }}
            >
              Exporter
            </Button>
            <Link to="/administrative-dashboard">
              <Button variant="outline" iconName="Settings">
                Administration
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Filter Toolbar */}
            <FilterToolbar
              onFiltersChange={handleFiltersChange}
              activeFilters={filters}
            />

            {/* Reports Table */}
            <ReportsTable
              reports={filteredReports}
              onViewReport={handleViewReport}
              onValidateReport={(report) => {
                setSelectedReport(report);
                setIsValidationModalOpen(true);
              }}
              onRejectReport={(report) => {
                setSelectedReport(report);
                setIsValidationModalOpen(true);
              }}
              onRequestModification={(report) => {
                setSelectedReport(report);
                setIsValidationModalOpen(true);
              }}
            />

            {/* Results Summary */}
            {filteredReports?.length !== reports?.length && (
              <div className="bg-card border border-border rounded-lg p-4 academic-shadow-sm">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Icon name="Filter" size={16} />
                  <span>
                    Affichage de {filteredReports?.length} rapport(s) sur {reports?.length} total
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1">
            <ValidationStatsPanel />
          </div>
        </div>
      </main>
      {/* Validation Modal */}
      <ValidationModal
        isOpen={isValidationModalOpen}
        onClose={() => {
          setIsValidationModalOpen(false);
          setSelectedReport(null);
        }}
        report={selectedReport}
        onValidate={handleValidateReport}
        onReject={handleRejectReport}
        onRequestModification={handleRequestModification}
      />
      {/* Quick Action Panel */}
      <QuickActionPanel userRole="faculty" />
    </div>
  );
};

export default FacultyValidationDashboard;