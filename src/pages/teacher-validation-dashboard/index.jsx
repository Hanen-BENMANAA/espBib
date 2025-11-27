import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Clock, CheckCircle, AlertTriangle, XCircle, Eye, MessageSquare, Download, Filter, ChevronDown, ChevronUp, Settings, Zap, FileText, Users, Library, Grid3x3, Menu, X, User, Search } from 'lucide-react';

// ✅ Import the API service
import { teacherReportsAPI } from '../../services/api';

const TeacherValidationDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [selectedReports, setSelectedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data from API
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    total_assigned: 0,
    pending_validation: 0,
    validated: 0,
    rejected: 0
  });

  const [filters, setFilters] = useState({
    search: '',
    specialty: '',
    status: 'all'
  });

  // ✅ Fixed: Use teacherReportsAPI instead of generic fetch
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the unified API service
        const [assignedData, pendingData, statsData] = await Promise.all([
          teacherReportsAPI.getAssignedReports(),
          teacherReportsAPI.getPendingReports(),
          teacherReportsAPI.getTeacherStats()
        ]);

        console.log('API Response - Assigned:', assignedData);
        console.log('API Response - Pending:', pendingData);
        console.log('API Response - Stats:', statsData);

        // Merge and deduplicate reports
        const allReports = [
          ...(assignedData.success ? assignedData.data : []),
          ...(pendingData.success ? pendingData.data : [])
        ];

        const uniqueReports = allReports.filter((r, i, a) =>
          a.findIndex(t => t.id === r.id) === i
        );

        // ✅ Map API response to component data structure
        const formattedReports = uniqueReports.map(report => ({
          id: report.id,
          studentName: `${report.author_first_name || ''} ${report.author_last_name || ''}`.trim(),
          studentEmail: report.student_email || report.email || 'N/A',
          projectTitle: report.title || 'Sans titre',
          company: report.company || 'N/A',
          specialty: report.specialty || 'Non spécifié',
          submissionDate: formatDate(report.submission_date || report.created_at),
          status: report.status || 'pending',
          daysWaiting: calculateDaysWaiting(report.submission_date || report.created_at)
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

  // ✅ Helper function to format dates
  const formatDate = (date) => {
    if (!date) return 'Date inconnue';
    try {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return 'Date invalide';
    }
  };

  // ✅ Helper function to calculate days waiting
  const calculateDaysWaiting = (submissionDate) => {
    if (!submissionDate) return 0;
    try {
      const submitted = new Date(submissionDate);
      const today = new Date();
      const diffTime = Math.abs(today - submitted);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (e) {
      return 0;
    }
  };

  const specialtyOptions = [
    { value: '', label: 'Toutes les spécialités' },
    { value: 'informatique', label: 'Génie Informatique' },
    { value: 'industriel', label: 'Génie Industriel' },
    { value: 'civil', label: 'Génie Civil' },
    { value: 'electrique', label: 'Génie Électrique' },
    { value: 'mecanique', label: 'Génie Mécanique' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'En Attente' },
    { value: 'reviewing', label: 'En Révision' },
    { value: 'all', label: 'Tous les Statuts' }
  ];

  const getPriorityLevel = (daysWaiting) => {
    if (daysWaiting > 7) return 'high';
    if (daysWaiting > 3) return 'medium';
    return 'low';
  };

  const getPriorityColor = (level) => {
    const colors = {
      high: 'text-red-600',
      medium: 'text-orange-600',
      low: 'text-green-600'
    };
    return colors[level] || colors.low;
  };

  const handleSelectReport = (reportId, checked) => {
    if (checked) {
      setSelectedReports(prev => [...prev, reportId]);
    } else {
      setSelectedReports(prev => prev.filter(id => id !== reportId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedReports(filteredReports.map(report => report.id));
    } else {
      setSelectedReports([]);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = !filters.search ||
      report.studentName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      report.projectTitle?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesSpecialty = !filters.specialty || report.specialty === filters.specialty;
    const matchesStatus = filters.status === 'all' || report.status === filters.status;

    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  const handleViewReport = (reportId) => {
    navigate(`/report-validation-interface/${reportId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement de vos rapports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
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
                <span className="text-white text-sm font-medium">LT</span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">Leila Trabelsi</p>
                <p className="text-xs text-gray-500">Enseignant</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}>
          <div className="flex flex-col h-full pt-20 lg:pt-4">
            <nav className="flex-1 px-4 space-y-2">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Grid3x3 size={20} />
                <span className="font-medium">Tableau de Bord</span>
              </button>

              <button
                onClick={() => setActiveView('library')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'library'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Library size={20} />
                <span className="font-medium">Bibliothèque</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => window.location.reload()}
                className="ml-4 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm font-medium"
              >
                Réessayer
              </button>
            </div>
          )}

          {activeView === 'dashboard' ? (
            <>
              {/* Page Title */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Tableau de Bord de Validation
                </h2>
                <p className="text-gray-600">
                  Gérez et validez les rapports de Projet de Fin d'Études soumis par les étudiants
                </p>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Clock className="text-orange-600" size={24} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stats.pending_validation}</p>
                  <p className="text-sm text-gray-600">Rapports en Attente</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="text-green-600" size={24} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stats.validated}</p>
                  <p className="text-sm text-gray-600">Rapports Validés</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="text-blue-600" size={24} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stats.total_assigned}</p>
                  <p className="text-sm text-gray-600">Total Assignés</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <XCircle className="text-red-600" size={24} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
                  <p className="text-sm text-gray-600">Rapports Rejetés</p>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white border border-gray-200 rounded-lg mb-6">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Filter size={20} className="text-gray-400" />
                    <h3 className="font-medium text-gray-900">Filtres de Recherche</h3>
                    {filteredReports.length > 0 && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                        {filteredReports.length} résultat{filteredReports.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setFiltersExpanded(!filtersExpanded)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    {filtersExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                <div className="p-4 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="search"
                      placeholder="Rechercher par nom d'étudiant, titre de projet..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {filtersExpanded && (
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Spécialité</label>
                        <select
                          value={filters.specialty}
                          onChange={(e) => handleFilterChange('specialty', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {specialtyOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                        <select
                          value={filters.status}
                          onChange={(e) => handleFilterChange('status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reports Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Rapports assignés ({filteredReports.length})
                  </h3>
                </div>

                {selectedReports.length > 0 && (
                  <div className="bg-blue-50 border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        {selectedReports.length} rapport{selectedReports.length > 1 ? 's' : ''} sélectionné{selectedReports.length > 1 ? 's' : ''}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center space-x-1">
                          <CheckCircle size={14} />
                          <span>Valider</span>
                        </button>
                        <button className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center space-x-1">
                          <XCircle size={14} />
                          <span>Rejeter</span>
                        </button>
                        <button
                          onClick={() => setSelectedReports([])}
                          className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center space-x-1"
                        >
                          <X size={14} />
                          <span>Annuler</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {filteredReports.length === 0 ? (
                  <div className="text-center py-16">
                    <FileText size={64} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-xl text-gray-600">Aucun rapport trouvé</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {reports.length === 0
                        ? "Aucun rapport ne vous est assigné pour le moment."
                        : "Aucun rapport ne correspond aux critères de recherche actuels."}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="w-12 p-4">
                            <input
                              type="checkbox"
                              checked={selectedReports.length === filteredReports.length && filteredReports.length > 0}
                              onChange={(e) => handleSelectAll(e.target.checked)}
                              className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                            />
                          </th>
                          <th className="text-left p-4 text-sm font-medium text-gray-700">Étudiant</th>
                          <th className="text-left p-4 text-sm font-medium text-gray-700">Titre du Projet</th>
                          <th className="text-left p-4 text-sm font-medium text-gray-700">Spécialité</th>
                          <th className="text-left p-4 text-sm font-medium text-gray-700">Date de Soumission</th>
                          <th className="text-left p-4 text-sm font-medium text-gray-700">Priorité</th>
                          <th className="text-left p-4 text-sm font-medium text-gray-700">Statut</th>
                          <th className="text-right p-4 text-sm font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReports.map((report) => {
                          const priorityLevel = getPriorityLevel(report.daysWaiting || 0);
                          const isSelected = selectedReports.includes(report.id);

                          return (
                            <tr
                              key={report.id}
                              className={`border-b border-gray-200 hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                            >
                              <td className="p-4">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => handleSelectReport(report.id, e.target.checked)}
                                  className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                                />
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-medium text-white">
                                      {report.studentName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">{report.studentName}</div>
                                    <div className="text-sm text-gray-500">{report.studentEmail}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="max-w-xs">
                                  <div className="font-medium text-gray-900 truncate" title={report.projectTitle}>
                                    {report.projectTitle}
                                  </div>
                                  {report.company && report.company !== 'N/A' && (
                                    <div className="text-sm text-gray-500">{report.company}</div>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                                  {report.specialty}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="text-sm text-gray-900">{report.submissionDate}</div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 rounded-full ${priorityLevel === 'high' ? 'bg-red-600' :
                                    priorityLevel === 'medium' ? 'bg-orange-600' : 'bg-green-600'
                                    }`} />
                                  <span className={`text-sm ${getPriorityColor(priorityLevel)}`}>
                                    {report.daysWaiting} jour{report.daysWaiting > 1 ? 's' : ''}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4">
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
                                   report.status === 'revision_requested' ? 'Révision demandée' :
                                   'Inconnu'}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-end space-x-2">
                                  <button onClick={() => handleViewReport(report.id)}>
                                    Voir
                                  </button>
                                  <button className="p-2 hover:bg-gray-100 rounded-lg flex items-center space-x-1 text-sm text-gray-700">
                                    <MessageSquare size={14} />
                                    <span>Note</span>
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
            </>
          ) : (
            // Library View Placeholder
            <div className="text-center py-16">
              <Library size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-xl text-gray-600">Bibliothèque</p>
              <p className="text-sm text-gray-500 mt-2">
                Accédez à la bibliothèque de rapports validés
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TeacherValidationDashboard;