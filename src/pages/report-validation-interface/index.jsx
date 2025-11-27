import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Menu, Grid3x3, Library, FileText } from 'lucide-react';

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

  // PDF Viewer
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');

  // Data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [comments, setComments] = useState([]);
  const [validationHistory, setValidationHistory] = useState([]);
  const [checklistData, setChecklistData] = useState({});

  const currentUser = {
    name: 'Leila Trabelsi',
    initials: 'LT',
    role: 'Enseignant'
  };

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

useEffect(() => {
  if (!reportId) {
    navigate('/teacher/dashboard', { replace: true });
    return;
  }

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await teacherReportsAPI.getReportById(reportId);

      // 🔥 ADD THESE DEBUG LOGS
      console.log('=== REPORT API RESPONSE ===');
      console.log('Full Response:', response);
      console.log('Success:', response.success);
      console.log('Report Data:', response.data);
      console.log('File URL:', response.data?.file_url);
      console.log('========================');

      if (!response.success || !response.data) {
        throw new Error('Rapport non trouvé ou accès refusé');
      }

      const report = response.data;

      setReportData({
        id: report.id,
        title: report.title || 'Sans titre',
        studentName: `${report.author_first_name || ''} ${report.author_last_name || ''}`.trim(),
        studentEmail: report.student_email || 'N/A',
        specialty: report.specialty || 'Non spécifié',
        submissionDate: new Date(report.submission_date),
        fileSize: report.file_size ? `${(report.file_size / 1024 / 1024).toFixed(2)} MB` : 'N/A',
        file_url: report.file_url  // Make sure this is being set
      });

      // 🔥 LOG WHAT WE'RE SETTING
      console.log('📋 SET REPORT DATA:', {
        id: report.id,
        title: report.title,
        file_url: report.file_url
      });

      setComments(Array.isArray(report.comments) ? report.comments.map(c => ({
        id: c.id,
        content: c.content,
        author: c.teacher_name || 'Enseignant',
        date: new Date(c.created_at),
        updatedAt: c.updated_at ? new Date(c.updated_at) : null
      })) : []);

      setValidationHistory(Array.isArray(report.validation_history) ? report.validation_history.map(h => ({
        id: h.id,
        action: h.action,
        message: h.message || '',
        teacher: h.teacher_name || 'Enseignant',
        date: new Date(h.created_at)
      })) : []);

    } catch (err) {
      console.error('❌ Error loading report:', err);
      setError(err.message || 'Impossible de charger le rapport');
    } finally {
      setLoading(false);
    }
  };

  fetchReport();
}, [reportId, navigate, API_BASE]);

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

  // Handlers
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement du rapport...</p>
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
      {/* Header identique */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
              <Menu size={24} />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <FileText className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">ESPRIM</h1>
                <p className="text-sm text-gray-500">Virtual Library</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Session active</span>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{currentUser.initials}</span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.role}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar identique */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="flex flex-col h-full pt-20 lg:pt-4">
            <nav className="flex-1 px-4 space-y-2">
              <button
                onClick={() => navigate('/teacher/dashboard')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === '/teacher/dashboard' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Grid3x3 size={20} />
                <span className="font-medium">Tableau de Bord</span>
              </button>
              <button
                onClick={() => navigate('/teacher/library')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${location.pathname.includes('/library') ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Library size={20} />
                <span className="font-medium">Bibliothèque</span>
              </button>
            </nav>
          </div>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        <main className="flex-1 pt-16">
          <div className="p-6">
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
              <Button variant="ghost" onClick={() => navigate('/teacher/dashboard')}>Retour</Button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-semibold mb-3">{reportData.title}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><span className="font-medium">Étudiant :</span> {reportData.studentName}</div>
                    <div><span className="font-medium">Spécialité :</span> {reportData.specialty}</div>
                    <div><span className="font-medium">Soumis le :</span> {reportData.submissionDate.toLocaleDateString('fr-FR')}</div>
                    <div><span className="font-medium">Taille :</span> {reportData.fileSize}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <PDFViewer
                  reportData={reportData}
                  reviewerInfo={currentUser}
                />
              </div>

              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="flex border-b">
                    <button onClick={() => setActiveTab('validation')} className={`flex-1 py-3 px-4 text-sm font-medium ${activeTab === 'validation' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>Validation</button>
                    <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 px-4 text-sm font-medium ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>Historique</button>
                  </div>
                  <div className="p-4">
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
                  onValidate={() => teacherReportsAPI.validateReport(reportId, { decision: 'validated' }).then(() => navigate('/teacher/dashboard'))}
                  onReject={() => teacherReportsAPI.validateReport(reportId, { decision: 'rejected' }).then(() => navigate('/teacher/dashboard'))}
                  onRequestRevision={() => teacherReportsAPI.validateReport(reportId, { decision: 'revision_requested' }).then(() => navigate('/teacher/dashboard'))}
                  checklistProgress={checklistProgress}
                  hasComments={hasComments}
                />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ValidationChecklist reportData={reportData} onChecklistUpdate={setChecklistData} checklistData={checklistData} />
              <CommentSystem reportData={reportData} comments={comments} onAddComment={handleAddComment} onUpdateComment={handleUpdateComment} onDeleteComment={handleDeleteComment} currentUser={currentUser} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportValidationInterface;