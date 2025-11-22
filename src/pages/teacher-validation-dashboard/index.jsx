import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { 
  getPendingReports, 
  getTeacherStats,
  validateReport 
} from '../../services/api';

const TeacherValidationDashboard = () => {
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [assignedReports, setAssignedReports] = useState([]);
  const [pendingReports, setPendingReports] = useState([]);
  const [stats, setStats] = useState({
    total_assigned: 0,
    pending_validation: 0,
    validated: 0,
    rejected: 0
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationAction, setValidationAction] = useState('validate');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [assignedResult, pendingResult, statsResult] = await Promise.all([
        getAssignedReports(),
        getPendingReports(),
        getTeacherStats()
      ]);

      if (assignedResult.success) {
        setAssignedReports(assignedResult.data);
      }

      if (pendingResult.success) {
        setPendingReports(pendingResult.data);
      }

      if (statsResult.success) {
        setStats(statsResult.data);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching teacher dashboard data:', err);
      setError('Erreur lors du chargement des données');
      setLoading(false);
    }
  };

  const handleValidateClick = (report) => {
    setSelectedReport(report);
    setValidationAction('validate');
    setComments('');
    setShowValidationModal(true);
  };

  const handleRejectClick = (report) => {
    setSelectedReport(report);
    setValidationAction('reject');
    setComments('');
    setShowValidationModal(true);
  };

 const handleSubmitValidation = async () => {
  if (validationAction === 'reject' && !comments.trim()) {
    alert('Les commentaires sont obligatoires pour un rejet');
    return;
  }

  setSubmitting(true);
  try {
    await validateReport(
      selectedReport.id,
      validationAction === 'validate' ? 'validate' : 'reject',
      comments
    );

    // Recharge les données
    fetchDashboardData();
    setShowValidationModal(false);
    alert('Rapport traité avec succès !');
  } catch (err) {
    alert('Erreur lors du traitement');
  } finally {
    setSubmitting(false);
  }
};

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const configs = {
      validated: { 
        color: 'text-success', 
        bg: 'bg-success/10', 
        label: 'Validé', 
        icon: 'CheckCircle' 
      },
      rejected: { 
        color: 'text-error', 
        bg: 'bg-error/10', 
        label: 'Rejeté', 
        icon: 'XCircle' 
      },
      pending: { 
        color: 'text-warning', 
        bg: 'bg-warning/10', 
        label: 'En attente', 
        icon: 'Clock' 
      }
    };
    
    const config = configs[status] || configs.pending;
    
    return (
      <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
        <Icon name={config.icon} size={12} />
        <span>{config.label}</span>
      </div>
    );
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Validation des Rapports PFE
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez et validez les rapports qui vous sont assignés
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-academic p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-academic bg-primary/10">
                <Icon name="FileText" size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.total_assigned || 0}
                </p>
                <p className="text-xs text-muted-foreground">Total assignés</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-academic p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-academic bg-warning/10">
                <Icon name="Clock" size={20} className="text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.pending_validation || 0}
                </p>
                <p className="text-xs text-muted-foreground">En attente</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-academic p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-academic bg-success/10">
                <Icon name="CheckCircle" size={20} className="text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.validated || 0}
                </p>
                <p className="text-xs text-muted-foreground">Validés</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-academic p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-academic bg-error/10">
                <Icon name="XCircle" size={20} className="text-error" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.rejected || 0}
                </p>
                <p className="text-xs text-muted-foreground">Rejetés</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-card border border-border rounded-academic">
          <div className="border-b border-border p-1">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex-1 px-4 py-3 text-sm font-medium rounded-academic transition-colors ${
                  activeTab === 'pending'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Icon name="Clock" size={16} />
                  <span>En attente de validation</span>
                  <span className="bg-warning/20 text-warning px-2 py-1 rounded-full text-xs">
                    {pendingReports.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 px-4 py-3 text-sm font-medium rounded-academic transition-colors ${
                  activeTab === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Icon name="FileText" size={16} />
                  <span>Tous mes rapports</span>
                  <span className="bg-muted px-2 py-1 rounded-full text-xs">
                    {assignedReports.length}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Reports Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">
                    Étudiant
                  </th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">
                    Titre du rapport
                  </th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">
                    Spécialité
                  </th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">
                    Date soumission
                  </th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">
                    Statut
                  </th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(activeTab === 'pending' ? pendingReports : assignedReports).map((report) => (
                  <tr key={report.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {report.author_first_name} {report.author_last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {report.student_email}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-foreground max-w-md truncate">
                        {report.title}
                      </p>
                    </td>
                    <td className="py-4 px-6 text-sm text-foreground">
                      {report.specialty}
                    </td>
                    <td className="py-4 px-6 text-sm text-foreground">
                      {formatDate(report.submission_date)}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {report.status === 'pending' && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleValidateClick(report)}
                              iconName="CheckCircle"
                              iconSize={14}
                            >
                              Valider
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectClick(report)}
                              iconName="XCircle"
                              iconSize={14}
                            >
                              Rejeter
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="Eye"
                          iconSize={14}
                        >
                          Voir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(activeTab === 'pending' ? pendingReports : assignedReports).length === 0 && (
            <div className="text-center py-12">
              <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {activeTab === 'pending' 
                  ? 'Aucun rapport en attente de validation'
                  : 'Aucun rapport assigné'}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Validation Modal */}
      {showValidationModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-academic max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">
              {validationAction === 'validate' ? 'Valider le rapport' : 'Rejeter le rapport'}
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Rapport:</p>
              <p className="text-foreground font-medium">{selectedReport.title}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Par: {selectedReport.author_first_name} {selectedReport.author_last_name}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Commentaires {validationAction === 'reject' && '(requis)'}
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-academic bg-background text-foreground"
                rows={4}
                placeholder="Ajoutez vos commentaires..."
              />
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="default"
                onClick={handleSubmitValidation}
                disabled={submitting || (validationAction === 'reject' && !comments.trim())}
                iconName={validationAction === 'validate' ? 'CheckCircle' : 'XCircle'}
              >
                {submitting ? 'En cours...' : (validationAction === 'validate' ? 'Valider' : 'Rejeter')}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowValidationModal(false)}
                disabled={submitting}
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherValidationDashboard;