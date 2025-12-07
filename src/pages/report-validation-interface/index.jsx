// src/pages/report-validation-interface/index.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';

import Header from '../../components/ui/Header';                 // ← HEADER UNIVERSEL (comme le dashboard)
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Button from '../../components/ui/Button';

import PDFViewer from './components/PDFViewer';
import ValidationChecklist from './components/ValidationChecklist';
import CommentSystem from './components/CommentSystem';
import ValidationActions from './components/ValidationActions';
import ValidationHistory from './components/ValidationHistory';

import { teacherReportsAPI } from '../../services/api';

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
      if (!response.success || !response.data) throw new Error('Rapport non trouvé');

      const report = response.data;

      setReportData({
        id: report.id,
        title: report.title || 'Sans titre',
        studentName: `${report.author_first_name || ''} ${report.author_last_name || ''}`.trim(),
        studentEmail: report.student_email || report.email || 'N/A',
        specialty: report.specialty || 'Non spécifié',
        submissionDate: new Date(report.submission_date),
        fileSize: report.file_size ? `${(report.file_size / 1024 / 1024).toFixed(2)} MB` : 'N/A',
        file_url: report.file_url,
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

      setValidationHistory((report.validation_history || []).map(h => ({
        id: h.id,
        action: h.action,
        message: h.message || '',
        teacher: h.teacher_name || 'Enseignant',
        date: new Date(h.created_at)
      })));

      setChecklistData(report.checklist || {});

    } catch (err) {
      console.error('Error loading report:', err);
      setError(err.message || 'Impossible de charger le rapport');
    } finally {
      setLoading(false);
    }
  };

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

  // ──────── HANDLERS (inchangés) ────────
  const handleChecklistUpdate = async (updatedChecklist) => {
    setChecklistData(updatedChecklist);
    try {
      setSaving(true);
      await teacherReportsAPI.updateChecklist(reportId, updatedChecklist);
    } catch (err) {
      alert('Erreur lors de la sauvegarde de la checklist');
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async (content) => {
    try {
      const res = await teacherReportsAPI.addComment(reportId, content);
      if (res.success) {
        setComments(prev => [...prev, {
          id: res.data.id,
          content: res.data.content,
          author: res.data.teacher_name || currentUser.name,
          date: new Date(res.data.created_at)
        }]);
      }
    } catch (err) {
      alert('Erreur lors de l\'ajout du commentaire');
    }
  };

  const handleUpdateComment = async (id, content) => {
    try {
      await teacherReportsAPI.updateComment(id, { content });
      setComments(prev => prev.map(c => c.id === id ? { ...c, content, updatedAt: new Date() } : c));
    } catch (err) {
      alert('Erreur lors de la mise à jour du commentaire');
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      await teacherReportsAPI.deleteComment(id);
      setComments(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert('Erreur lors de la suppression du commentaire');
    }
  };

  const handleValidation = async (decision, comment) => {
    try {
      setSaving(true);
      const res = await teacherReportsAPI.validateReport(reportId, { decision, comments: comment });
      if (res.success) {
        alert(`Rapport ${decision === 'validated' ? 'validé' : decision === 'rejected' ? 'rejeté' : 'mis en révision'} !`);
        navigate('/teacher/dashboard');
      }
    } catch (err) {
      alert('Erreur lors de la validation');
    } finally {
      setSaving(false);
    }
  };

  // ──────── RENDU ────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement du rapport…</p>
        </div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <h2 className="text-2xl font-bold mb-4">Erreur</h2>
          <p className="text-gray-600 mb-6">{error || 'Rapport introuvable'}</p>
          <Button onClick={() => navigate('/teacher/dashboard')}>Retour au tableau de bord</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER UNIVERSEL – exactement le même que le dashboard */}
      <Header />

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <BreadcrumbTrail customBreadcrumbs={[
          { label: 'Accueil', path: '/' },
          { label: 'Tableau de bord', path: '/teacher/dashboard' },
          { label: 'Validation du rapport', path: null }
        ]} />

        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Validation du Rapport</h1>
            <p className="text-gray-600">Révision du projet de fin d'études</p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/teacher/dashboard')}>
            Retour
          </Button>
        </div>

        {/* Report Info Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">{reportData.title}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div><span className="font-medium">Étudiant :</span> {reportData.studentName}</div>
            <div><span className="font-medium">Spécialité :</span> {reportData.specialty}</div>
            <div><span className="font-medium">Soumis le :</span> {reportData.submissionDate.toLocaleDateString('fr-FR')}</div>
            <div><span className="font-medium">Taille :</span> {reportData.fileSize}</div>
          </div>
        </div>

        {/* Layout principal */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* PDF Viewer – 2 colonnes */}
          <div className="xl:col-span-2">
            <PDFViewer reportData={reportData} reviewerInfo={currentUser} />
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
                      <div className="text-3xl font-bold text-blue-600">{checklistProgress}%</div>
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
              checklistProgress={checklistProgress}
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