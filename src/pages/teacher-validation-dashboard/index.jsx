// src/pages/teacher-validation-dashboard/index.jsx
import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { teacherReportsAPI } from '../../services/api'; 
const TeacherValidationDashboard = () => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    total_assigned: 0,
    pending_validation: 0,
    validated: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setLoading(true);
        
        // ✅ Use the unified API service
        const [assignedData, pendingData, statsData] = await Promise.all([
          teacherReportsAPI.getAssignedReports(),
          teacherReportsAPI.getPendingReports(),
          teacherReportsAPI.getTeacherStats()
        ]);

        // Merge and deduplicate reports
        const allReports = [
          ...(assignedData.success ? assignedData.data : []),
          ...(pendingData.success ? pendingData.data : [])
        ];

        const uniqueReports = allReports.filter((r, i, a) => 
          a.findIndex(t => t.id === r.id) === i
        );

        setReports(uniqueReports);
        setStats(statsData.success ? statsData.data : stats);
        
      } catch (err) {
        console.error('Error loading teacher data:', err);
        setError('Impossible de charger vos rapports');
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-8 py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Chargement de vos rapports...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Validation des Rapports PFE
          </h1>
          <p className="text-muted-foreground">
            Gérez les rapports qui vous sont assignés en tant que superviseur
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <Button onClick={() => window.location.reload()} className="ml-4" size="sm">
              Réessayer
            </Button>
          </div>
        )}

        {/* Stats identiques au student dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <Icon name="FileText" size={40} className="mx-auto text-primary mb-3" />
            <p className="text-3xl font-bold">{stats.total_assigned}</p>
            <p className="text-sm text-muted-foreground">Total assignés</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <Icon name="Clock" size={40} className="mx-auto text-orange-500 mb-3" />
            <p className="text-3xl font-bold">{stats.pending_validation}</p>
            <p className="text-sm text-muted-foreground">En attente</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <Icon name="CheckCircle" size={40} className="mx-auto text-green-500 mb-3" />
            <p className="text-3xl font-bold">{stats.validated}</p>
            <p className="text-sm text-muted-foreground">Validés</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <Icon name="XCircle" size={40} className="mx-auto text-red-500 mb-3" />
            <p className="text-3xl font-bold">{stats.rejected}</p>
            <p className="text-sm text-muted-foreground">Rejetés</p>
          </div>
        </div>

        {/* Tableau des rapports */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold">Rapports assignés ({reports.length})</h2>
          </div>
          {reports.length === 0 ? (
            <div className="text-center py-16">
              <Icon name="Inbox" size={64} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">
                Aucun rapport ne vous est assigné pour le moment
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Revenez plus tard ou contactez l'administration
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Étudiant</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Titre</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Soumis le</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Statut</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-muted/30">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium">{report.author_first_name} {report.author_last_name}</p>
                          <p className="text-sm text-muted-foreground">{report.student_email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 max-w-md">
                        <p className="truncate font-medium">{report.title}</p>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        {formatDate(report.submission_date)}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          report.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                          report.status === 'validated' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {report.status === 'pending' ? 'En attente' : 
                           report.status === 'validated' ? 'Validé' : 'Rejeté'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <Button size="sm" variant="ghost">
                          Voir le rapport
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeacherValidationDashboard;