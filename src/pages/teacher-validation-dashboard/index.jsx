// src/pages/teacher-validation-dashboard/index.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  Filter,
  ChevronDown,
  ChevronUp,
  FileText,
  Library,
  Grid3x3,
  Menu,
  Search,
  AlertCircle,
} from 'lucide-react';

// AJOUT CRUCIAL : Le Header universel
import Header from '../../components/ui/Header';

import { teacherReportsAPI } from '../../services/api';

const TeacherValidationDashboard = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [selectedReports, setSelectedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    total_assigned: 0,
    pending_validation: 0,
    validated: 0,
    rejected: 0,
  });

  const [filters, setFilters] = useState({
    search: '',
    specialty: '',
    status: 'all',
  });

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setLoading(true);
        setError(null);

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
          company: report.company || 'N/A',
          specialty: report.specialty || 'Non spécifié',
          submissionDate: formatDate(report.submission_date || report.created_at),
          status: report.status || 'pending',
          daysWaiting: calculateDaysWaiting(report.submission_date || report.created_at),
        }));

        setReports(formattedReports);
        setStats(statsData.success ? statsData.data : stats);
      } catch (err) {
        console.error('Error loading teacher data:', err);
        setError('Impossible de charger vos rapports. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const calculateDaysWaiting = (dateString) => {
    if (!dateString) return 0;
    const diff = Date.now() - new Date(dateString).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const handleViewReport = (reportId) => {
    navigate(`/report-validation-interface/${reportId}`, {
      state: { reportId },
    });
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.studentName.toLowerCase().includes(filters.search.toLowerCase()) ||
      report.projectTitle.toLowerCase().includes(filters.search.toLowerCase());
    const matchesSpecialty = !filters.specialty || report.specialty === filters.specialty;
    const matchesStatus =
      filters.status === 'all' || report.status === filters.status;
    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  return (
    <>
      {/* LE HEADER IDENTIQUE À TOUT LE MONDE */}
      <Header />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* Titre */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tableau de Bord de Validation
            </h1>
            <p className="text-gray-600">
              Gérez et validez les rapports de Projet de Fin d'Études soumis par les étudiants
            </p>
          </div>

          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rapports assignés</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_assigned}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En attente</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{stats.pending_validation}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Validés</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.validated}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rejetés</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Filtres de Recherche</h2>
              <button
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                className="lg:hidden flex items-center gap-2 text-sm text-gray-600"
              >
                {filtersExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                {filtersExpanded ? 'Masquer' : 'Afficher'}
              </button>
            </div>

            <div className={`space-y-4 ${filtersExpanded ? 'block' : 'hidden lg:block'}`}>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Rechercher par étudiant ou titre..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <select
                  value={filters.specialty}
                  onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les spécialités</option>
                  <option value="informatique">Génie Informatique</option>
                  <option value="electrique">Génie Électrique</option>
                  {/* Ajoute les autres si besoin */}
                </select>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending_validation">En attente</option>
                  <option value="validated">Validé</option>
                  <option value="rejected">Rejeté</option>
                  <option value="revision_requested">Révision demandée</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tableau */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">
                Rapports assignés ({filteredReports.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="p-12 text-center text-red-600">{error}</div>
            ) : filteredReports.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                Aucun rapport trouvé
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-700">Étudiant</th>
                      <th className="text-left p-4 font-medium text-gray-700">Titre du Projet</th>
                      <th className="text-left p-4 font-medium text-gray-700">Spécialité</th>
                      <th className="text-left p-4 font-medium text-gray-700">Date de Soumission</th>
                      <th className="text-left p-4 font-medium text-gray-700">Priorité</th>
                      <th className="text-left p-4 font-medium text-gray-700">Statut</th>
                      <th className="text-right p-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report) => {
                      const priorityLevel =
                        report.daysWaiting > 14
                          ? 'high'
                          : report.daysWaiting > 7
                          ? 'medium'
                          : 'low';

                      return (
                        <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-4">
                            <div>
                              <div className="font-medium text-gray-900">{report.studentName}</div>
                              <div className="text-sm text-gray-500">{report.studentEmail}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-gray-900">{report.projectTitle}</div>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-gray-700">{report.specialty}</span>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-gray-900">{report.submissionDate}</div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  priorityLevel === 'high'
                                    ? 'bg-red-600'
                                    : priorityLevel === 'medium'
                                    ? 'bg-orange-600'
                                    : 'bg-green-600'
                                }`}
                              />
                              <span
                                className={`text-sm font-medium ${
                                  priorityLevel === 'high'
                                    ? 'text-red-600'
                                    : priorityLevel === 'medium'
                                    ? 'text-orange-600'
                                    : 'text-green-600'
                                }`}
                              >
                                {report.daysWaiting} jour{report.daysWaiting > 1 ? 's' : ''}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                report.status === 'pending_validation'
                                  ? 'bg-orange-100 text-orange-700'
                                  : report.status === 'validated'
                                  ? 'bg-green-100 text-green-700'
                                  : report.status === 'rejected'
                                  ? 'bg-red-100 text-red-700'
                                  : report.status === 'revision_requested'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {report.status === 'pending_validation'
                                ? 'En attente'
                                : report.status === 'validated'
                                ? 'Validé'
                                : report.status === 'rejected'
                                ? 'Rejeté'
                                : report.status === 'revision_requested'
                                ? 'Révision demandée'
                                : 'Inconnu'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end space-x-3">
                              <button
                                onClick={() => handleViewReport(report.id)}
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                              >
                                Voir
                              </button>
                              <button className="text-gray-600 hover:text-gray-800">
                                <MessageSquare size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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