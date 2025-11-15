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

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');

  // Mock data for current submission
  const currentSubmission = {
    id: 1,
    title: "Développement d\'une application mobile de gestion des ressources humaines",
    status: 'pending',
    submissionDate: '15/10/2024',
    specialty: 'Génie Informatique',
    supervisor: 'Dr. Ahmed Ben Salem',
    progress: 85,
    lastModified: '14/10/2024 16:30'
  };

  // Mock data for submission history
  const submissionHistory = [
    {
      id: 1,
      title: "Développement d\'une application mobile de gestion des ressources humaines",
      academicYear: '2023-2024',
      submissionDate: '15/10/2024',
      status: 'pending',
      specialty: 'Génie Informatique'
    },
    {
      id: 2,
      title: "Système de recommandation basé sur l'intelligence artificielle",
      academicYear: '2022-2023',
      submissionDate: '20/06/2023',
      status: 'validated',
      specialty: 'Génie Informatique'
    },
    {
      id: 3,
      title: "Analyse des performances des réseaux IoT",
      academicYear: '2021-2022',
      submissionDate: '15/06/2022',
      status: 'rejected',
      specialty: 'Réseaux et Télécommunications'
    }
  ];

  // Mock data for notifications
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
    },
    {
      id: 3,
      type: 'system',
      title: 'Sauvegarde automatique activée',
      message: 'Votre brouillon a été sauvegardé automatiquement.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      priority: 'low',
      read: true
    },
    {
      id: 4,
      type: 'validation',
      title: 'Rapport validé',
      message: 'Votre rapport "Système de recommandation IA" a été validé avec succès.',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
      priority: 'high',
      read: true
    }
  ];

  // Mock data for recent reports
  const recentReports = [
    {
      id: 101,
      title: "Intelligence artificielle appliquée à la médecine",
      author: "Sarah Trabelsi",
      specialty: "Génie Informatique",
      academicYear: "2023-2024",
      lastAccessed: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 102,
      title: "Optimisation des réseaux 5G",
      author: "Mohamed Karray",
      specialty: "Réseaux et Télécommunications",
      academicYear: "2023-2024",
      lastAccessed: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      id: 103,
      title: "Blockchain et sécurité des transactions",
      author: "Amina Bouaziz",
      specialty: "Sécurité Informatique",
      academicYear: "2022-2023",
      lastAccessed: new Date(Date.now() - 48 * 60 * 60 * 1000)
    }
  ];

  // Mock data for favorite reports
  const favoriteReports = [
    {
      id: 201,
      title: "Machine Learning pour la reconnaissance vocale",
      author: "Youssef Mansouri",
      specialty: "Génie Informatique",
      academicYear: "2023-2024",
      lastAccessed: new Date(Date.now() - 72 * 60 * 60 * 1000)
    },
    {
      id: 202,
      title: "Cybersécurité dans l\'industrie 4.0",
      author: "Leila Gharbi",
      specialty: "Sécurité Informatique",
      academicYear: "2022-2023",
      lastAccessed: new Date(Date.now() - 96 * 60 * 60 * 1000)
    }
  ];

  // Mock statistics
  const studentStats = {
    totalSubmissions: 3,
    validatedReports: 1,
    pendingReports: 1,
    draftReports: 2
  };

  // Auto-save simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setAutoSaveStatus('saving');
      setTimeout(() => setAutoSaveStatus('saved'), 1000);
    }, 120000); // Every 2 minutes

    return () => clearInterval(interval);
  }, []);

  const handleNewSubmission = () => {
    navigate('/report-submission-form');
  };

  const handleContinueDraft = () => {
    navigate('/report-submission-form?draft=true');
  };

  const handleViewDetails = (submissionId) => {
    console.log('View details for submission:', submissionId);
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
              <SubmissionStatusCard
                submission={currentSubmission}
                onViewDetails={handleViewDetails}
                onContinueDraft={handleContinueDraft}
              />
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
              draftCount={studentStats?.draftReports}
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