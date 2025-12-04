// src/pages/public-library-catalog/PublicLibraryCatalogContent.jsx
import React, { useState, useEffect } from 'react';
import StatusIndicatorBanner from '../../components/ui/StatusIndicatorBanner';
import SearchFilters from './components/SearchFilters';
import ReportCard from './components/ReportCard';
import ResultsPagination from './components/ResultsPagination';
import MobileFilterDrawer from './components/MobileFilterDrawer';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const PublicLibraryCatalogContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    sortBy: 'date_desc',
    academicYear: '',
    specialty: '',
    supervisor: '',
    company: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ new_this_month: 0 });
  const [pagination, setPagination] = useState({});

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: resultsPerPage,
        sortBy: filters.sortBy,
      });
      if (searchQuery) params.append('search', searchQuery);
      Object.keys(filters).forEach(key => {
        if (filters[key] && key !== 'sortBy') params.append(key, filters[key]);
      });

      const response = await fetch(`http://localhost:5000/api/reports/public-library?${params}`);
      const data = await response.json();

      if (data.success) {
        setReports(data.data.reports);
        setPagination(data.data.pagination);
      } else {
        setReports([]);
        setPagination({});
      }
    } catch (err) {
      console.error(err);
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/reports/public-library/stats');
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchReports(); }, [searchQuery, filters, currentPage]);
  useEffect(() => { fetchStats(); }, []);

  const getSpecialtyLabel = (s) => {
    const map = {
      informatique: 'Génie Informatique',
      electrique: 'Génie Électrique',
      mecanique: 'Génie Mécanique',
      civil: 'Génie Civil',
      industriel: 'Génie Industriel',
      telecom: 'Télécommunications'
    };
    return map[s?.toLowerCase()] || s;
  };

  const formattedReports = reports.map(r => ({
    id: r.id,
    title: r.title,
    authors: [r.author_name],
    academicYear: r.academic_year,
    specialty: r.specialty?.toLowerCase(),
    specialtyLabel: getSpecialtyLabel(r.specialty),
    supervisor: r.supervisor_name,
    coSupervisor: r.co_supervisor_name,
    company: r.host_company,
    abstractPreview: (r.abstract || '').substring(0, 200) + '...',
    keywords: Array.isArray(r.keywords) ? r.keywords : [],
    submissionDate: r.validated_at || r.submission_date,
    viewCount: parseInt(r.view_count) || 0,
    favoriteCount: parseInt(r.favorite_count) || 0,
    downloadCount: parseInt(r.download_count) || 0,
    accessLevel: 'public',
    fileUrl: r.file_url
  }));

  return (
    <>
      {/* Banner */}
      {showBanner && stats.new_this_month > 0 && (
        <StatusIndicatorBanner
          type="info"
          message={`Catalogue mis à jour avec ${stats.new_this_month} nouveaux rapports PFE ce mois-ci`}
          isVisible={showBanner}
          onDismiss={() => setShowBanner(false)}
          autoHide autoHideDelay={8000}
          showProgress
        />
      )}

      {/* Title */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Catalogue Bibliothèque ESPRIM
          </h1>
          <p className="text-gray-600">
            Découvrez et consultez les rapports de Projet de Fin d'Études validés
          </p>
        </div>
        <Button
          variant="outline"
          className="lg:hidden"
          onClick={() => setIsMobileFilterOpen(true)}
          iconName="Filter"
          iconPosition="left"
        >
          Filtres
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="mb-8">
        <SearchFilters
          searchQuery={searchQuery}
          onSearchChange={q => { setSearchQuery(q); setCurrentPage(1); }}
          filters={filters}
          onFiltersChange={f => { setFilters(f); setCurrentPage(1); }}
          resultCount={pagination.totalResults || 0}
          onClearFilters={() => {
            setFilters({ sortBy: 'date_desc', academicYear: '', specialty: '', supervisor: '', company: '' });
            setSearchQuery('');
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : formattedReports.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {formattedReports.map(report => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <ResultsPagination
              currentPage={currentPage}
              totalPages={pagination.totalPages || 1}
              totalResults={pagination.totalResults || 0}
              resultsPerPage={resultsPerPage}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg border">
          <Icon name="Search" size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-2xl font-semibold mb-2">Aucun rapport trouvé</h3>
          <p className="text-gray-600 mb-6">Modifiez vos filtres et réessayez</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Réinitialiser
          </Button>
        </div>
      )}

      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={() => setFilters({ sortBy: 'date_desc' })}
      />
    </>
  );
};

export default PublicLibraryCatalogContent;