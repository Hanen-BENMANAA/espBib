import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import QuickActionPanel from '../../components/ui/QuickActionPanel';
import StudentStatsOverview from './components/StudentStatsOverview';
import SubmissionHistoryTable from './components/SubmissionHistoryTable';
import StatusIndicatorTrial from '../../components/ui/StatusIndicatorBanner';

const StudentDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

useEffect(() => {
  const fetchReports = async () => {
    try {
      const session = JSON.parse(localStorage.getItem('esprim_session') || '{}');
      const token = session.token;

      if (!token) {
        setError('Token manquant');
        setLoading(false);
        return;
      }

      const res = await fetch('http://localhost:5000/api/reports/my-submissions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Erreur serveur');

      const result = await res.json();

      // CORRECTION FINALE : on prend le bon champ
      let reports = [];
      if (result && result.data && Array.isArray(result.data)) {
        reports = result.data;
      } else if (Array.isArray(result)) {
        reports = result;
      }

      setSubmissions(reports);
      console.log('Rapports chargés :', reports); // Tu vas voir tes 3 rapports ici

    } catch (err) {
      console.error(err);
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  fetchReports();
}, []);
  // Protection contre les erreurs de .filter
  const safeSubmissions = Array.isArray(submissions) ? submissions : [];

  const stats = {
    totalSubmissions: safeSubmissions.length,
    pendingReports: safeSubmissions.filter(r => r.status === 'pending').length,
    validatedReports: safeSubmissions.filter(r => r.status === 'validated').length,
    draftReports: 0
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Tableau de Bord Étudiant</h1>
        <p className="text-muted-foreground mb-8">
          Gérez vos soumissions PFE et consultez la bibliothèque virtuelle
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded text-red-800">
            {error}
          </div>
        )}

        <StudentStatsOverview stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            {loading ? (
              <p className="text-center py-12">Chargement de vos rapports...</p>
            ) : (
              <SubmissionHistoryTable submissions={safeSubmissions} />
            )}
          </div>
          <div>
            <QuickActionPanel />
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;