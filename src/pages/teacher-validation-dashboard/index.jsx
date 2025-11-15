import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../../components/ui/NavigationHeader';
import RoleBasedSidebar from '../../components/ui/RoleBasedSidebar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import ValidationStatsPanel from './components/ValidationStatsPanel';
import FilterPanel from './components/FilterPanel';
import ReportsTable from './components/ReportsTable';
import QuickActions from './components/QuickActions';

import Button from '../../components/ui/Button';

const TeacherValidationDashboard = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [filteredReports, setFilteredReports] = useState([]);

  // Mock data for pending reports
  const mockReports = [
    {
      id: 'RPT001',
      studentName: 'Amira Ben Salem',
      studentEmail: 'amira.bensalem@esprim.tn',
      projectTitle: 'Développement d\'une Application Mobile de Gestion des Ressources Humaines',
      specialty: 'Génie Informatique',
      department: 'Sciences & Technologies',
      company: 'TechnoSoft Solutions',
      submissionDate: '2024-11-07',
      daysWaiting: 7,
      status: 'pending',
      priority: 'high',
      fileSize: '15.2 MB',
      supervisor: 'Dr. Mohamed Trabelsi'
    },
    {
      id: 'RPT002',
      studentName: 'Youssef Karray',
      studentEmail: 'youssef.karray@esprim.tn',
      projectTitle: 'Optimisation des Processus de Production par Intelligence Artificielle',
      specialty: 'Génie Industriel',
      department: 'Ingénierie',
      company: 'IndusTech Manufacturing',
      submissionDate: '2024-11-10',
      daysWaiting: 4,
      status: 'pending',
      priority: 'medium',
      fileSize: '22.8 MB',
      supervisor: 'Dr. Fatma Gharbi'
    },
    {
      id: 'RPT003',
      studentName: 'Salma Mansouri',
      studentEmail: 'salma.mansouri@esprim.tn',
      projectTitle: 'Conception d\'un Système de Surveillance IoT pour Bâtiments Intelligents',
      specialty: 'Génie Électrique',
      department: 'Sciences & Technologies',
      company: 'SmartBuilding Corp',
      submissionDate: '2024-11-12',
      daysWaiting: 2,
      status: 'reviewing',
      priority: 'low',
      fileSize: '18.5 MB',
      supervisor: 'Dr. Ahmed Bouaziz'
    },
    {
      id: 'RPT004',
      studentName: 'Mehdi Jemli',
      studentEmail: 'mehdi.jemli@esprim.tn',
      projectTitle: 'Analyse Structurelle et Dimensionnement d\'un Pont Suspendu',
      specialty: 'Génie Civil',
      department: 'Ingénierie',
      company: 'Construction & Design Ltd',
      submissionDate: '2024-11-05',
      daysWaiting: 9,
      status: 'pending',
      priority: 'high',
      fileSize: '31.4 MB',
      supervisor: 'Dr. Nadia Hamdi'
    },
    {
      id: 'RPT005',
      studentName: 'Ines Chakroun',
      studentEmail: 'ines.chakroun@esprim.tn',
      projectTitle: 'Développement d\'un Système de Gestion de Chaîne Logistique',
      specialty: 'Génie Industriel',
      department: 'Management',
      company: 'LogiFlow Systems',
      submissionDate: '2024-11-11',
      daysWaiting: 3,
      status: 'pending',
      priority: 'medium',
      fileSize: '12.7 MB',
      supervisor: 'Dr. Karim Belhadj'
    },
    {
      id: 'RPT006',
      studentName: 'Omar Sfaxi',
      studentEmail: 'omar.sfaxi@esprim.tn',
      projectTitle: 'Conception et Réalisation d\'un Robot Autonome de Navigation',
      specialty: 'Génie Mécanique',
      department: 'Ingénierie',
      company: 'RoboTech Innovation',
      submissionDate: '2024-11-13',
      daysWaiting: 1,
      status: 'pending',
      priority: 'low',
      fileSize: '25.9 MB',
      supervisor: 'Dr. Leila Mnif'
    }
  ];

  // Filter reports based on current filters
  useEffect(() => {
    let filtered = mockReports;

    if (filters?.search) {
      const searchTerm = filters?.search?.toLowerCase();
      filtered = filtered?.filter(report => 
        report?.studentName?.toLowerCase()?.includes(searchTerm) ||
        report?.projectTitle?.toLowerCase()?.includes(searchTerm) ||
        report?.company?.toLowerCase()?.includes(searchTerm)
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

    if (filters?.priority) {
      filtered = filtered?.filter(report => {
        const daysWaiting = report?.daysWaiting;
        switch (filters?.priority) {
          case 'high':
            return daysWaiting > 7;
          case 'medium':
            return daysWaiting >= 3 && daysWaiting <= 7;
          case 'low':
            return daysWaiting < 3;
          default:
            return true;
        }
      });
    }

    if (filters?.status && filters?.status !== 'all') {
      filtered = filtered?.filter(report => report?.status === filters?.status);
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
  }, [filters]);

  // Initialize with all reports
  useEffect(() => {
    setFilteredReports(mockReports);
  }, []);

  const handleToggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleViewReport = (reportId) => {
    navigate(`/report-validation-interface?id=${reportId}`);
  };

  const handleAddNote = (reportId) => {
    console.log('Adding note for report:', reportId);
    // Implementation for adding internal notes
  };

  const handleBulkAction = (action, reportIds) => {
    console.log('Bulk action:', action, 'for reports:', reportIds);
    // Implementation for bulk operations
  };

  const handleQuickAction = (actionId) => {
    console.log('Quick action:', actionId);
    switch (actionId) {
      case 'validate-all-priority':
        // Validate all high priority reports
        break;
      case 'export-pending':
        // Export pending reports to CSV
        break;
      case 'bulk-review':
        // Mark multiple reports as reviewing
        break;
      case 'send-reminders':
        // Send reminder emails
        break;
      case 'configure-workflow': navigate('/system-configuration');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <NavigationHeader
        isCollapsed={sidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
        userRole="teacher"
        userName="Dr. Marie Dubois"
        institutionName="ESPRIM"
      />
      {/* Sidebar */}
      <RoleBasedSidebar
        isCollapsed={sidebarCollapsed}
        isOpen={sidebarOpen}
        onToggle={handleToggleSidebar}
        userRole="teacher"
      />
      {/* Main Content */}
      <main className={`
        pt-16 transition-all duration-300 ease-out
        ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
      `}>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <BreadcrumbTrail />

          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-heading font-semibold text-text-primary mb-2">
                Tableau de Bord de Validation
              </h1>
              <p className="text-text-secondary font-caption">
                Gérez et validez les rapports de Projet de Fin d'Études soumis par les étudiants
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Button
                variant="outline"
                iconName="RefreshCw"
                iconPosition="left"
                iconSize={16}
                onClick={() => window.location?.reload()}
              >
                Actualiser
              </Button>
              <Button
                variant="default"
                iconName="Plus"
                iconPosition="left"
                iconSize={16}
                onClick={() => navigate('/report-validation-interface')}
              >
                Nouvelle Validation
              </Button>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
            {/* Stats Panel */}
            <div className="xl:col-span-2">
              <ValidationStatsPanel />
            </div>
            
            {/* Quick Actions */}
            <div className="xl:col-span-2">
              <QuickActions onAction={handleQuickAction} />
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <FilterPanel
              onFiltersChange={handleFiltersChange}
              resultCount={filteredReports?.length}
            />
          </div>

          {/* Reports Table */}
          <div className="mb-6">
            <ReportsTable
              reports={filteredReports}
              onBulkAction={handleBulkAction}
              onViewReport={handleViewReport}
              onAddNote={handleAddNote}
            />
          </div>

          {/* Pagination */}
          {filteredReports?.length > 0 && (
            <div className="flex items-center justify-between bg-surface border border-border rounded-lg p-4">
              <div className="text-sm font-caption text-text-secondary">
                Affichage de 1 à {filteredReports?.length} sur {filteredReports?.length} résultats
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled iconName="ChevronLeft" iconSize={14}>
                  Précédent
                </Button>
                <Button variant="outline" size="sm" disabled iconName="ChevronRight" iconSize={14}>
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeacherValidationDashboard;