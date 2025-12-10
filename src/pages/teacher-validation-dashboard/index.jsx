import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  XCircle,
} from 'lucide-react';

import Header from '../../components/ui/Header';
import TeacherNotificationPanel from '../../components/notifications/TeacherNotificationPanel';
import { teacherReportsAPI } from '../../services/api';

const TeacherValidationDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    total_assigned: 0,
    pending_validation: 0,
    validated: 0,
    rejected: 0,
  });

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setLoading(true);

        const [assignedData, pendingData, statsData] = await Promise.all([
          teacherReportsAPI.getAssignedReports(),
          teacherReportsAPI.getPendingReports(),
          teacherReportsAPI.getTeacherStats(),
        ]);

        const allReports = [
          ...(assignedData.success ? assignedData.data : []),
          ...(pendingData.success ? pendingData.data : []),
        ];

        const uniqueReports = allReports.filter(
          (r, i, a) => a.findIndex((t) => t.id === r.id) === i
        );

        const formattedReports = uniqueReports.map((report) => ({
          id: report.id,
          studentName: `${report.author_first_name || ''} ${report.author_last_name || ''}`.trim(),
          studentEmail: report.student_email || report.email || 'N/A',
          projectTitle: report.title || 'Sans titre',
          submissionDate: formatDate(report.submission_date || report.created_at),
          status: report.status || 'pending',
          daysWaiting: calculateDaysWaiting(report.submission_date || report.created_at),
        }));

        setReports(formattedReports);
        setStats({
          total_assigned: assignedData.success ? assignedData.data.length : 0,
          pending_validation: pendingData.success ? pendingData.data.length : 0,
          validated: statsData.success ? statsData.data.validated || 0 : 0,
          rejected: statsData.success ? statsData.data.rejected || 0 : 0,
        });
      } catch (err) {
        console.error('Error loading teacher data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const calculateDaysWaiting = (dateString) => {
    if (!dateString) return 0;
    const diff = Date.now() - new Date(dateString).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const handleViewReport = (reportId) => {
    navigate(`/report-validation-interface/${reportId}`);
  };

  return (
    <>
      <Header>
        <TeacherNotificationPanel />
      </Header>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* TITLE – EXACTLY LIKE STUDENT DASHBOARD */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Tableau de Bord Enseignant
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Gérez et validez les rapports de stage (PFE) de vos étudiants
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total assignés</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_assigned}</p>
                </div>
                <BarChart3 className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En attente</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{stats.pending_validation}</p>
                </div>
                <Clock className="h-12 w-12 text-orange-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Validés</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.validated}</p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejetés</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
                </div>
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
            </div>
          </div>

          {/* TABLE CARD WITH RED-PINK TOP BAR */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-red-600 to-pink-600"></div>

            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Rapports en attente de validation
              </h2>
            </div>

            {loading ? (
              <div className="p-16 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement des rapports...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="p-16 text-center text-gray-500">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Aucun rapport en attente</p>
                <p className="text-sm mt-2">Vous êtes à jour !</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Étudiant</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Titre du projet</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Soumis le</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Délai</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Statut</th>
                      <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-5">
                          <div>
                            <p className="font-medium text-gray-900">{report.studentName || 'N/A'}</p>
                            <p className="text-sm text-gray-500">{report.studentEmail}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="font-medium text-gray-900 max-w-xs truncate">{report.projectTitle}</p>
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-600">{report.submissionDate}</td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            report.daysWaiting > 7 ? 'bg-red-100 text-red-800' :
                            report.daysWaiting > 3 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {report.daysWaiting} jour{report.daysWaiting > 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            report.status === 'pending_validation' ? 'bg-orange-100 text-orange-700' :
                            report.status === 'validated' ? 'bg-green-100 text-green-700' :
                            report.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            report.status === 'revision_requested' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {report.status === 'pending_validation' ? 'En attente' :
                             report.status === 'validated' ? 'Validé' :
                             report.status === 'rejected' ? 'Rejeté' :
                             report.status === 'revision_requested' ? 'Révision demandée' : 'Inconnu'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-4">
                            <button
                              onClick={() => handleViewReport(report.id)}
                              className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1 transition-colors"
                            >
                              <Eye size={18} />
                              Voir
                            </button>
                            <button className="text-gray-500 hover:text-gray-700">
                              <MessageSquare size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TeacherValidationDashboard;