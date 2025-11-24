import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
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

// Import API service
import { teacherReportsAPI } from '../../services/api';

const ReportValidationInterface = () => {
  const location = useLocation();
  const { reportId: urlReportId } = useParams(); // Récupère l'ID depuis l'URL
  const navigate = useNavigate();

  // CETTE LIGNE DOIT ÊTRE EN PREMIER !
  const reportId = location.state?.reportId || urlReportId;

  // DEBUG : Tu verras l'ID dans la console
  console.log('Report ID reçu dans ReportValidationInterface →', reportId);

  // Layout state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('validation');

  // PDF viewer state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(45);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');

  // Validation state
  const [checklistData, setChecklistData] = useState({});
  const [comments, setComments] = useState([]);
  const [validationHistory, setValidationHistory] = useState([]);

  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Report data from API
  const [reportData, setReportData] = useState(null);

  // Current user
  const [currentUser] = useState({
    name: 'Marie Dubois',
    role: 'teacher',
    email: 'marie.dubois@esprim.tn',
    department: 'Génie Logiciel'
  });

  // Chargement du rapport
  useEffect(() => {
    if (!reportId) {
      console.warn('Aucun ID de rapport → redirection');
      navigate('/teacher/dashboard', { replace: true });
      return;
    }

    const fetchReportData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await teacherReportsAPI.getReportById(reportId);

        if (response.success && response.data) {
          const report = response.data;

          setReportData({
            id: report.id,
            title: report.title || 'Sans titre',
            studentName: `${report.author_first_name || ''} ${report.author_last_name || ''}`.trim(),
            studentEmail: report.student_email || report.email || 'N/A',
            specialty: report.specialty || 'Non spécifié',
            year: report.academic_year || new Date().getFullYear().toString(),
            submissionDate: report.submission_date ? new Date(report.submission_date) : new Date(),
            status: report.status || 'pending_validation',
            fileSize: report.file_size ? `${(report.file_size / 1024 / 1024).toFixed(2)} MB` : 'N/A',
            supervisor: report.supervisor_name || currentUser.name,
            department: report.department || 'Informatique',
            keywords: report.keywords || [],
            abstract: report.abstract || 'Aucun résumé disponible.',
            company: report.company || 'N/A',
            duration: report.duration || 'N/A',
            pdfUrl: report.pdf_url || report.file_url || null
          });

          setComments(
            Array.isArray(report.comments)
              ? report.comments.map(c => ({
                  id: c.id,
                  content: c.content,
                  author: c.teacher_name || 'Enseignant',
                  date: new Date(c.created_at),
                  updatedAt: c.updated_at ? new Date(c.updated_at) : null
                }))
              : []
          );

          setValidationHistory(
            Array.isArray(report.validation_history)
              ? report.validation_history.map(h => ({
                  id: h.id,
                  action: h.action,
                  message: h.message || '',
                  teacher: h.teacher_name || 'Enseignant',
                  date: new Date(h.created_at)
                }))
              : []
          );

        } else {
          throw new Error('Rapport non trouvé');
        }
      } catch (err) {
        console.error('Erreur chargement:', err);
        setError('Impossible de charger le rapport. Il a peut-être été supprimé.');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [reportId, navigate]);

  // Calcul du progrès
  const getChecklistProgress = () => {
    const sections = Object.values(checklistData);
    if (sections.length === 0) return 0;
    let total = 0, completed = 0;
    sections.forEach(section => {
      const items = Object.values(section);
      total += items.length;
      completed += items.filter(Boolean).length;
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const checklistProgress = getChecklistProgress();
  const hasComments = comments.length > 0;

  // Actions
  const handleValidate = async (data) => {
    await teacherReportsAPI.validateReport(reportId, { decision: 'validated', comments: data.comments });
    navigate('/teacher/dashboard', { state: { message: 'Rapport validé !', type: 'success' } });
  };

  const handleReject = async (data) => {
    await teacherReportsAPI.validateReport(reportId, { decision: 'rejected', comments: data.comments });
    navigate('/teacher/dashboard', { state: { message: 'Rapport rejeté', type: 'error' } });
  };

  const handleRequestRevision = async (data) => {
    await teacherReportsAPI.validateReport(reportId, { decision: 'revision_requested', comments: data.notes });
    navigate('/teacher/dashboard', { state: { message: 'Révision demandée', type: 'info' } });
  };

  const handleAddComment = async (content) => {
    const res = await teacherReportsAPI.addComment(reportId, content);
    if (res.success) {
      setComments(prev => [...prev, { ...res.data, author: currentUser.name, date: new Date() }]);
    }
  };

  const handleUpdateComment = async (id, content) => {
    await teacherReportsAPI.updateComment(id, { content });
    setComments(prev => prev.map(c => c.id === id ? { ...c, content, updatedAt: new Date() } : c));
  };

  const handleDeleteComment = async (id) => {
    await teacherReportsAPI.deleteComment(id);
    setComments(prev => prev.filter(c => c.id !== id));
  };

  const handleChecklistUpdate = (data) => setChecklistData(data);

  // Rendu
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          <p className="mt-4 text-text-secondary">Chargement du rapport...</p>
        </div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <Icon name="AlertCircle" size={64} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-3">Erreur</h2>
          <p className="text-text-secondary mb-6">{error || 'Rapport introuvable'}</p>
          <Button onClick={() => navigate('/teacher/dashboard')} iconName="ArrowLeft">
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Ton beau rendu ici (inchangé) */}
      <NavigationHeader isCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} userRole={currentUser.role} userName={currentUser.name} institutionName="ESPRIM" />
      <RoleBasedSidebar isCollapsed={sidebarCollapsed} isOpen={sidebarOpen} onToggle={() => { setSidebarCollapsed(!sidebarCollapsed); setSidebarOpen(false); }} userRole={currentUser.role} />

      <main className={`pt-16 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-6">
          <BreadcrumbTrail customBreadcrumbs={[{ label: 'Accueil', path: '/' }, { label: 'Tableau de bord', path: '/teacher/dashboard' }, { label: 'Validation du rapport', path: null }]} />

          <div className="mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Validation du Rapport</h1>
              <p className="text-text-secondary">Révision du projet de fin d'études</p>
            </div>
            <Button variant="ghost" onClick={() => navigate('/teacher/dashboard')} iconName="ArrowLeft">Retour</Button>
          </div>

          <div className="bg-surface border border-border rounded-lg p-6 mb-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold text-text-primary mb-3">{reportData.title}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><span className="font-medium">Étudiant :</span> {reportData.studentName}</div>
                  <div><span className="font-medium">Spécialité :</span> {reportData.specialty}</div>
                  <div><span className="font-medium">Soumis le :</span> {reportData.submissionDate.toLocaleDateString('fr-FR')}</div>
                  <div><span className="font-medium">Taille :</span> {reportData.fileSize}</div>
                </div>
              </div>
              <Icon name="FileText" size={48} className="text-accent opacity-20" />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <PDFViewer reportData={reportData} currentPage={currentPage} totalPages={totalPages} zoomLevel={zoomLevel} searchTerm={searchTerm}
                onPageChange={setCurrentPage} onZoomChange={setZoomLevel} onSearchChange={setSearchTerm} reviewerInfo={currentUser} />
            </div>

            <div className="space-y-6">
              <div className="bg-surface border border-border rounded-lg shadow-sm">
                <div className="flex border-b">
                  <button onClick={() => setActiveTab('validation')} className={`flex-1 py-3 px-4 text-sm font-medium ${activeTab === 'validation' ? 'bg-accent text-white' : 'text-text-secondary'}`}>Validation</button>
                  <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 px-4 text-sm font-medium ${activeTab === 'history' ? 'bg-accent text-white' : 'text-text-secondary'}`}>Historique</button>
                </div>
                <div className="p-4">
                  {activeTab === 'validation' ? (
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="text-3xl font-bold text-accent">{checklistProgress}%</div>
                        <div className="text-xs text-text-secondary">Checklist</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="text-3xl font-bold text-accent">{comments.length}</div>
                        <div className="text-xs text-text-secondary">Commentaires</div>
                      </div>
                    </div>
                  ) : (
                    <ValidationHistory reportData={reportData} historyData={validationHistory} />
                  )}
                </div>
              </div>

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

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ValidationChecklist reportData={reportData} onChecklistUpdate={handleChecklistUpdate} checklistData={checklistData} />
            <CommentSystem reportData={reportData} comments={comments} onAddComment={handleAddComment} onUpdateComment={handleUpdateComment} onDeleteComment={handleDeleteComment} currentUser={currentUser} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportValidationInterface;