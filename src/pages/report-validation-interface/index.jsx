// src/pages/report-validation-interface/index.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';

import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Button from '../../components/ui/Button';

import PDFViewer from './components/PDFViewer';
import ValidationChecklist from './components/ValidationChecklist';
import CommentSystem from './components/CommentSystem';
import ValidationActions from './components/ValidationActions';
import ValidationHistory from './components/ValidationHistory';

import { teacherReportsAPI } from '../../services/api';
import { getToken } from '../../lib/auth';

const ReportValidationInterface = () => {
  const location = useLocation();
  const { reportId: urlReportId } = useParams();
  const navigate = useNavigate();

  const reportId = location.state?.reportId || urlReportId;

  // Layout
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('validation');

  // Data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [comments, setComments] = useState([]);
  const [validationHistory, setValidationHistory] = useState([]);
  const [checklistData, setChecklistData] = useState({});
  const [checklistProgress, setChecklistProgress] = useState(0); // â† NOUVEAU: Ã‰tat sÃ©parÃ© pour la progression
  const [saving, setSaving] = useState(false);

  const currentUser = {
    name: 'Leila Trabelsi',
    initials: 'LT',
    role: 'Enseignant'
  };

  useEffect(() => {
    if (!reportId) {
      navigate('/teacher/dashboard', { replace: true });
      return;
    }
    fetchReport();
  }, [reportId, navigate]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await teacherReportsAPI.getReportById(reportId);
      if (!response.success || !response.data) throw new Error('Rapport non trouvÃ©');

      const report = response.data;

      // CRITICAL: Generate secure streaming URL
      const token = getToken();
      const securePdfUrl = token 
        ? `http://localhost:5000/api/secure-pdf/view/${report.id}?token=${token}`
        : null;

      setReportData({
        id: report.id,
        title: report.title || 'Sans titre',
        studentName: `${report.author_first_name || ''} ${report.author_last_name || ''}`.trim(),
        studentEmail: report.student_email || report.email || 'N/A',
        specialty: report.specialty || 'Non spÃ©cifiÃ©',
        submissionDate: new Date(report.submission_date),
        fileSize: report.file_size ? `${(report.file_size / 1024 / 1024).toFixed(2)} MB` : 'N/A',
        file_url: report.file_url,
        secure_url: securePdfUrl,
        status: report.status,
        validatedBy: report.validated_by_name,
        validatedAt: report.validated_at
      });

      setComments((report.comments || []).map(c => ({
        id: c.id,
        content: c.content,
        author: c.teacher_name || 'Enseignant',
        date: new Date(c.created_at),
        updatedAt: c.updated_at ? new Date(c.updated_at) : null
      })));

      setValidationHistory(report.validation_history || []);
      
      // âœ… Restaurer les donnÃ©es du checklist ET la progression
      const savedChecklist = report.checklist_data || {};
      setChecklistData(savedChecklist);
      
      // Restaurer la progression sauvegardÃ©e
      const savedProgress = report.checklist_progress !== undefined 
        ? report.checklist_progress 
        : 0;
      setChecklistProgress(savedProgress);
      
      console.log('ðŸ“Š Checklist restaurÃ©e:', savedChecklist);
      console.log('ðŸ“ˆ Progression restaurÃ©e:', savedProgress + '%');

    } catch (err) {
      console.error('Failed to load report:', err);
      setError(err.message || 'Impossible de charger le rapport');
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = async (decision, comment = '') => {
    setSaving(true);
    try {
      await teacherReportsAPI.validateReport(reportId, { decision, comments: comment });
      await fetchReport(); // Refresh
    } catch (err) {
      alert('Erreur lors de la validation');
    } finally {
      setSaving(false);
    }
  };

  // âœ… CORRECTION: Recevoir les donnÃ©es avec la progression et les sauvegarder
  const handleChecklistUpdate = async (data) => {
    // data contient maintenant { checklist, progress }
    setChecklistData(data.checklist);
    setChecklistProgress(data.progress.percentage);
    
    console.log('ðŸ’¾ Sauvegarde checklist:', data.progress.percentage + '%');
    
    // âœ… Sauvegarder automatiquement dans la base de donnÃ©es
    try {
      await teacherReportsAPI.updateChecklist(reportId, {
        checklist: data.checklist,
        progress: data.progress.percentage
      });
      console.log('âœ… Checklist sauvegardÃ©e avec succÃ¨s');
    } catch (err) {
      console.error('âŒ Erreur lors de la sauvegarde du checklist:', err);
      // On n'affiche pas d'alerte pour ne pas perturber l'UX
    }
  };

  const handleAddComment = (comment) => {
    setComments(prev => [...prev, { ...comment, id: Date.now() }]);
  };

  const handleUpdateComment = (id, updates) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleDeleteComment = (id) => {
    setComments(prev => prev.filter(c => c.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p>Chargement du rapport...</p>
        </div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur</h2>
          <p>{error || 'Rapport introuvable'}</p>
          <Button onClick={() => navigate('/teacher/dashboard')} className="mt-4">
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <BreadcrumbTrail
            items={[
              { label: 'Tableau de bord', href: '/teacher/dashboard' },
              { label: 'Validation', href: '/teacher/dashboard' },
              { label: reportData.title }
            ]}
          />

          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{reportData.title}</h1>
                <p className="text-gray-600 mt-1">
                  Par <strong>{reportData.studentName}</strong> â€¢ {reportData.specialty}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Soumis le</div>
                <div className="font-medium">{reportData.submissionDate.toLocaleDateString('fr-FR')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* PDF Viewer â€“ 2 colonnes */}
          <div className="xl:col-span-2">
            <PDFViewer 
              reportData={reportData} 
              reviewerInfo={currentUser} 
            />
          </div>

          {/* Sidebar droite */}
          <div className="space-y-6">
            {/* Onglets Validation / Historique */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex border-b">
                <button onClick={() => setActiveTab('validation')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'validation' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
                  Validation
                </button>
                <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
                  Historique
                </button>
              </div>
              <div className="p-5">
                {activeTab === 'validation' ? (
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-blue-600">{Math.round(checklistProgress)}%</div>
                      <div className="text-xs text-gray-600">Checklist</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-blue-600">{comments.length}</div>
                      <div className="text-xs text-gray-600">Commentaires</div>
                    </div>
                  </div>
                ) : (
                  <ValidationHistory reportData={reportData} historyData={validationHistory} />
                )}
              </div>
            </div>

            <ValidationActions
              reportData={reportData}
              onValidate={(data) => handleValidation('validated', data.comment)}
              onReject={(data) => handleValidation('rejected', data.comment)}
              onRequestRevision={(data) => handleValidation('revision_requested', data.comment)}
              checklistProgress={checklistProgress} // â† Passe maintenant la vraie progression
              hasComments={comments.length > 0}
            />
          </div>
        </div>

        {/* Checklist + Commentaires */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ValidationChecklist
            reportData={reportData}
            onChecklistUpdate={handleChecklistUpdate}
            checklistData={checklistData}
          />
          <CommentSystem
            reportData={reportData}
            comments={comments}
            onAddComment={handleAddComment}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
            currentUser={currentUser}
          />
        </div>
      </main>
    </div>
  );
};

export default ReportValidationInterface;