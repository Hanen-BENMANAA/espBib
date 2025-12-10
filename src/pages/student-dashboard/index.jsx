import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import QuickActionPanel from '../../components/ui/QuickActionPanel';
import StudentStatsOverview from './components/StudentStatsOverview';
import SubmissionHistoryTable from './components/SubmissionHistoryTable';
import StatusIndicatorTrial from '../../components/ui/StatusIndicatorBanner';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const StudentDashboard = () => {
  const navigate = useNavigate();
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

        let reports = [];
        if (result && result.data && Array.isArray(result.data)) {
          reports = result.data;
        } else if (Array.isArray(result)) {
          reports = result;
        }

        // Log the structure to debug
        console.log('Rapports chargés :', reports);
        console.log('Premier rapport structure:', reports[0]);

        setSubmissions(reports);

      } catch (err) {
        console.error(err);
        setError('Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const safeSubmissions = Array.isArray(submissions) ? submissions : [];

  // Calculate stats based on actual status values from API
  const stats = {
    totalSubmissions: safeSubmissions.length,
    pendingReports: safeSubmissions.filter(r => 
      r.status === 'pending' || r.status === 'pending_validation'
    ).length,
    validatedReports: safeSubmissions.filter(r => 
      r.status === 'validated'
    ).length,
    draftReports: safeSubmissions.filter(r => 
      r.status === 'draft'
    ).length
  };

  const handleViewReport = (reportId) => {
    // Find the report to get its details
    const report = safeSubmissions.find(r => r.id === reportId);
    
    if (!report) {
      console.error('Report not found');
      return;
    }

    // Navigate with report ID - the PDF reader will fetch the file
    navigate(`/secure-pdf-reader?id=${reportId}`);
  };

  const handleDownloadReport = async (reportId) => {
    try {
      const session = JSON.parse(localStorage.getItem('esprim_session') || '{}');
      const token = session.token;

      const response = await fetch(`http://localhost:5000/api/reports/${reportId}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Erreur lors du téléchargement');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      alert('Erreur lors du téléchargement du rapport');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-7">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tableau de Bord Étudiant</h1>
            <p className="text-muted-foreground">
              Gérez vos soumissions PFE et consultez la bibliothèque virtuelle
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded text-red-800">
            {error}
          </div>
        )}

        <StudentStatsOverview stats={stats} />

        <div className="mt-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement de vos rapports...</p>
            </div>
          ) : (
            <SubmissionHistoryTable 
              submissions={safeSubmissions}
              onViewReport={handleViewReport}
              onDownloadReport={handleDownloadReport}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;