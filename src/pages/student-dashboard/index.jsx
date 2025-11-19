import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import NavigationBreadcrumbs from '../../components/ui/NavigationBreadcrumbs';
import StatusIndicatorBanner from '../../components/ui/StatusIndicatorBanner';
import SubmissionStatusCard from './components/SubmissionStatusCard';
import SubmissionHistoryTable from './components/SubmissionHistoryTable';
import QuickActionsPanel from './components/QuickActionsPanel';
import NotificationsPanel from './components/NotificationsPanel';
import ConsultationHistorySection from './components/ConsultationHistorySection';
import StudentStatsOverview from './components/StudentStatsOverview';
import { 
  getCurrentSubmission, 
  getMySubmissions, 
  getMyStats 
} from '../../services/reportsApi';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');
  
  // State for real data
  const [loading, setLoading] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [studentStats, setStudentStats] = useState({
    totalSubmissions: 0,
    validatedReports: 0,
    pendingReports: 0,
    draftReports: 0
  });
  const [error, setError] = useState(null);

  // Mock data for features not yet connected to backend
  const notifications = [
    {
      id: 1,
      type: 'feedback',
      title: 'Nouveau commentaire sur votre rapport',
      message: 'Dr. Ahmed Ben Salem a ajouté des commentaires sur votre soumission.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      priority: 'high',
      read: false
    },
    {
      id: 2,
      type: 'deadline',
      title: 'Rappel de délai',
      message: 'La date limite de soumission pour les corrections est dans 3 jours.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      priority: 'medium',
      read: false
    }
  ];

  const recentReports = [
    {
      id: 101,
      title: "Intelligence artificielle appliquée à la médecine",
      author: "Sarah Trabelsi",
      specialty: "Génie Informatique",
      academicYear: "2023-2024",
      lastAccessed: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
  ];

  const favoriteReports = [
    {
      id: 201,
      title: "Machine Learning pour la reconnaissance vocale",
      author: "Youssef Mansouri",
      specialty: "Génie Informatique",
      academicYear: "2023-2024",
      lastAccessed: new Date(Date.now() - 72 * 60 * 60 * 1000)
    }
  ];

  // Fetch all data on component mount
  useEffect(() => {
    //fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [currentSubResult, historyResult, statsResult] = await Promise.all([
        getCurrentSubmission(),
        getMySubmissions(),
        getMyStats()
      ]);

      // Set current submission
      if (currentSubResult.success && currentSubResult.data) {
        setCurrentSubmission(transformCurrentSubmission(currentSubResult.data));
      }

      // Set submission history
      if (historyResult.success) {
        setSubmissionHistory(transformSubmissionHistory(historyResult.data));
      }

      // Set statistics
      if (statsResult.success) {
        setStudentStats({
          totalSubmissions: parseInt(statsResult.data.total_submissions) || 0,
          validatedReports: parseInt(statsResult.data.validated_reports) || 0,
          pendingReports: parseInt(statsResult.data.pending_reports) || 0,
          draftReports: parseInt(statsResult.data.draft_reports) || 0
        });
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Erreur lors du chargement des données. Veuillez réessayer.');
      setLoading(false);
    }
  };

  // Transform current submission data
  const transformCurrentSubmission = (data) => {
    return {
      id: data.id,
      title: data.title,
      status: data.status,
      submissionDate: formatDate(data.submission_date),
      specialty: data.specialty,
      supervisor: data.supervisor,
      progress: calculateProgress(data.status),
      lastModified: formatDate(data.last_modified)
    };
  };

  // Transform submission history data
  const transformSubmissionHistory = (dataArray) => {
    return dataArray.map(item => ({
      id: item.id,
      title: item.title,
      academicYear: item.academic_year,
      submissionDate: formatDate(item.submission_date),
      status: item.status,
      specialty: item.specialty
    }));
  };

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateProgress = (status) => {
    switch (status) {
      case 'draft': return 30;
      case 'pending': return 85;
      case 'validated': return 100;
      case 'rejected': return 100;
      default: return 0;
    }
  };

  // Auto-save simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setAutoSaveStatus('saving');
      setTimeout(() => setAutoSaveStatus('saved'), 1000);
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  // Event handlers
  const handleNewSubmission = () => {
    navigate('/student/submit-report');
  };

  const handleContinueDraft = () => {
    navigate('/student/submit-report?draft=true');
  };

  const handleViewDetails = (submissionId) => {
    navigate(`/student/view-report/${submissionId}`);
  };

  const handleViewReport = (reportId) => {
    navigate(`/secure-pdf-reader?id=${reportId}`);
  };

  const handleDownloadReport = (reportId) => {
    console.log('Download report:', reportId);
  };

  const handleMarkAsRead = (notificationId) => {
    console.log('Mark notification as read:', notificationId);
  };

  const handleMarkAllAsRead = () => {
    console.log('Mark all notifications as read');
  };

  const handleRemoveFavorite = (reportId) => {
    console.log('Remove from favorites:', reportId);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-error/10 border border-error/20 rounded-academic p-6 text-center">
            <p className="text-error font-medium mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-academic hover:bg-primary/90"
            >
              Réessayer
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <NavigationBreadcrumbs />
        
        {showBanner && (
          <div className="mb-6">
            <StatusIndicatorBanner
              type="session"
              message="Session active - Sauvegarde automatique activée toutes les 2 minutes"
              isVisible={showBanner}
              onDismiss={() => setShowBanner(false)}
              autoHide={true}
              autoHideDelay={10000}
              showProgress={true}
              actionLabel="OK"
              onAction={() => setShowBanner(false)}
            />
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">
                Tableau de Bord Étudiant
              </h1>
              <p className="text-muted-foreground mt-2">
                Gérez vos soumissions PFE et consultez la bibliothèque virtuelle
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${
                autoSaveStatus === 'saving' ? 'bg-warning animate-pulse' : 'bg-success'
              }`}></div>
              <span>
                {autoSaveStatus === 'saving' ? 'Sauvegarde...' : 'Sauvegardé'}
              </span>
            </div>
          </div>

          <StudentStatsOverview stats={studentStats} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Submission Status */}
            <div>
              <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                Soumission actuelle
              </h2>
              {currentSubmission ? (
                <SubmissionStatusCard
                  submission={currentSubmission}
                  onViewDetails={handleViewDetails}
                  onContinueDraft={handleContinueDraft}
                />
              ) : (
                <div className="bg-card border border-border rounded-academic p-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    Aucune soumission en cours
                  </p>
                  <button
                    onClick={handleNewSubmission}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-academic hover:bg-primary/90"
                  >
                    Commencer une nouvelle soumission
                  </button>
                </div>
              )}
            </div>

            {/* Submission History */}
            <div>
              <SubmissionHistoryTable
                submissions={submissionHistory}
                onViewReport={handleViewReport}
                onDownloadReport={handleDownloadReport}
              />
            </div>

            {/* Consultation History */}
            <div>
              <ConsultationHistorySection
                recentReports={recentReports}
                favoriteReports={favoriteReports}
                onRemoveFavorite={handleRemoveFavorite}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActionsPanel
              draftCount={studentStats.draftReports}
              onNewSubmission={handleNewSubmission}
              onContinueDraft={handleContinueDraft}
            />

            {/* Notifications */}
            <NotificationsPanel
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;