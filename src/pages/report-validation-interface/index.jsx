import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavigationHeader from '../../components/ui/NavigationHeader';
import RoleBasedSidebar from '../../components/ui/RoleBasedSidebar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

// Import all components
import PDFViewer from './components/PDFViewer';
import ValidationChecklist from './components/ValidationChecklist';
import CommentSystem from './components/CommentSystem';
import ValidationActions from './components/ValidationActions';
import ValidationHistory from './components/ValidationHistory';

const ReportValidationInterface = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Layout state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('validation'); // validation, history
  
  // PDF viewer state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(45);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Validation state
  const [checklistData, setChecklistData] = useState({});
  const [comments, setComments] = useState([]);
  const [validationHistory, setValidationHistory] = useState([]);
  
  // Mock report data
  const reportData = {
    id: 'RPT-2024-001',
    title: 'Développement d\'une Application Mobile de Gestion Académique',
    studentName: 'Ahmed Ben Salem',
    studentEmail: 'ahmed.bensalem@esprim.tn',
    specialty: 'Génie Logiciel',
    year: '2024',
    submissionDate: new Date(Date.now() - 86400000 * 7),
    status: 'pending',
    fileSize: '2.4 MB',
    supervisor: 'Dr. Marie Dubois',
    department: 'Informatique',
    keywords: ['Application Mobile', 'Gestion Académique', 'React Native', 'Node.js'],
    abstract: `Ce projet présente le développement d'une application mobile innovante destinée à la gestion académique des établissements d'enseignement supérieur. L'application vise à digitaliser et optimiser les processus administratifs tout en offrant une interface utilisateur intuitive pour les étudiants, enseignants et administrateurs.`,
    company: 'TechSolutions Tunisia',duration: '6 mois'
  };

  // Current user (reviewer)
  const currentUser = {
    name: 'Marie Dubois',
    role: 'teacher',
    email: 'marie.dubois@esprim.tn',
    department: 'Génie Logiciel'
  };

  // Calculate checklist progress
  const getChecklistProgress = () => {
    const allSections = Object.values(checklistData);
    if (allSections?.length === 0) return 0;
    
    let totalItems = 0;
    let completedItems = 0;
    
    allSections?.forEach(section => {
      const items = Object.values(section);
      totalItems += items?.length;
      completedItems += items?.filter(Boolean)?.length;
    });
    
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  // Handle validation actions
  const handleValidate = async (decisionData) => {
    console.log('Validating report:', decisionData);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    navigate('/teacher-validation-dashboard', { 
      state: { message: 'Rapport validé avec succès' }
    });
  };

  const handleReject = async (decisionData) => {
    console.log('Rejecting report:', decisionData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    navigate('/teacher-validation-dashboard', { 
      state: { message: 'Rapport rejeté' }
    });
  };

  const handleRequestRevision = async (decisionData) => {
    console.log('Requesting revision:', decisionData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    navigate('/teacher-validation-dashboard', { 
      state: { message: 'Révision demandée' }
    });
  };

  // Handle comments
  const handleAddComment = (comment) => {
    setComments(prev => [...prev, comment]);
  };

  const handleUpdateComment = (commentId, updates) => {
    setComments(prev => prev?.map(comment => 
      comment?.id === commentId ? { ...comment, ...updates } : comment
    ));
  };

  const handleDeleteComment = (commentId) => {
    setComments(prev => prev?.filter(comment => comment?.id !== commentId));
  };

  // Handle checklist updates
  const handleChecklistUpdate = (updatedChecklist) => {
    setChecklistData(updatedChecklist);
  };

  // Custom breadcrumbs
  const breadcrumbs = [
    { label: 'Accueil', path: '/' },
    { label: 'Validation', path: null },
    { label: 'Interface de Validation', path: '/report-validation-interface' }
  ];

  const checklistProgress = getChecklistProgress();
  const hasComments = comments?.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <NavigationHeader
        isCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        userRole={currentUser?.role}
        userName={currentUser?.name}
        institutionName="ESPRIM"
      />
      {/* Sidebar */}
      <RoleBasedSidebar
        isCollapsed={sidebarCollapsed}
        isOpen={sidebarOpen}
        onToggle={() => {
          setSidebarCollapsed(!sidebarCollapsed);
          setSidebarOpen(false);
        }}
        userRole={currentUser?.role}
      />
      {/* Main Content */}
      <main className={`pt-16 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        <div className="p-6">
          {/* Breadcrumb */}
          <BreadcrumbTrail customBreadcrumbs={breadcrumbs} />

          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-heading font-semibold text-text-primary mb-2">
                  Interface de Validation
                </h1>
                <p className="text-text-secondary font-caption">
                  Révision et validation du rapport de projet de fin d'études
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/teacher-validation-dashboard')}
                  iconName="ArrowLeft"
                  iconPosition="left"
                >
                  Retour au tableau de bord
                </Button>
                
                <Button
                  variant="outline"
                  iconName="ExternalLink"
                  iconPosition="right"
                >
                  Ouvrir dans un nouvel onglet
                </Button>
              </div>
            </div>

            {/* Report Info Card */}
            <div className="bg-surface border border-border rounded-lg shadow-academic p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="font-heading font-medium text-text-primary mb-2">
                    {reportData?.title}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-caption text-text-secondary">
                    <div>
                      <span className="block font-medium text-text-primary">Étudiant</span>
                      {reportData?.studentName}
                    </div>
                    <div>
                      <span className="block font-medium text-text-primary">Spécialité</span>
                      {reportData?.specialty}
                    </div>
                    <div>
                      <span className="block font-medium text-text-primary">Année</span>
                      {reportData?.year}
                    </div>
                    <div>
                      <span className="block font-medium text-text-primary">Soumis le</span>
                      {reportData?.submissionDate?.toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-right text-sm font-caption text-text-secondary">
                    <div>ID: {reportData?.id}</div>
                    <div>{reportData?.fileSize}</div>
                  </div>
                  <Icon name="FileText" size={24} className="text-accent" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Interface */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - PDF Viewer */}
            <div className="xl:col-span-2">
              <PDFViewer
                reportData={reportData}
                currentPage={currentPage}
                totalPages={totalPages}
                zoomLevel={zoomLevel}
                searchTerm={searchTerm}
                onPageChange={setCurrentPage}
                onZoomChange={setZoomLevel}
                onSearchChange={setSearchTerm}
                reviewerInfo={currentUser}
              />
            </div>

            {/* Right Column - Validation Panel */}
            <div className="space-y-6">
              {/* Tab Navigation */}
              <div className="bg-surface border border-border rounded-lg shadow-academic">
                <div className="flex border-b border-border">
                  <button
                    onClick={() => setActiveTab('validation')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-academic ${
                      activeTab === 'validation' ?'bg-accent text-accent-foreground border-b-2 border-accent' :'text-text-secondary hover:text-text-primary hover:bg-muted/50'
                    }`}
                  >
                    <Icon name="CheckSquare" size={16} className="inline mr-2" />
                    Validation
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-academic ${
                      activeTab === 'history' ?'bg-accent text-accent-foreground border-b-2 border-accent' :'text-text-secondary hover:text-text-primary hover:bg-muted/50'
                    }`}
                  >
                    <Icon name="History" size={16} className="inline mr-2" />
                    Historique
                  </button>
                </div>

                <div className="p-4">
                  {activeTab === 'validation' ? (
                    <div className="space-y-4">
                      {/* Progress Overview */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-heading font-semibold text-accent">
                            {checklistProgress}%
                          </div>
                          <div className="text-xs font-caption text-text-secondary">
                            Checklist
                          </div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-heading font-semibold text-accent">
                            {comments?.length}
                          </div>
                          <div className="text-xs font-caption text-text-secondary">
                            Commentaires
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Icon name="History" size={32} className="text-text-secondary mx-auto mb-2" />
                      <p className="text-sm text-text-secondary">
                        Historique des validations
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Validation Actions */}
              <ValidationActions
                reportData={reportData}
                onValidate={handleValidate}
                onReject={handleReject}
                onRequestRevision={handleRequestRevision}
                checklistProgress={checklistProgress}
                hasComments={hasComments}
              />
            </div>
          </div>

          {/* Bottom Section - Detailed Panels */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Validation Checklist */}
            <ValidationChecklist
              reportData={reportData}
              onChecklistUpdate={handleChecklistUpdate}
              checklistData={checklistData}
            />

            {/* Comment System */}
            <CommentSystem
              reportData={reportData}
              comments={comments}
              onAddComment={handleAddComment}
              onUpdateComment={handleUpdateComment}
              onDeleteComment={handleDeleteComment}
              currentUser={currentUser}
            />
          </div>

          {/* Validation History - Full Width */}
          <div className="mt-6">
            <ValidationHistory
              reportData={reportData}
              historyData={validationHistory}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportValidationInterface;