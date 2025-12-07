import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import { getMyFavorites, removeFavorite } from '../../services/api';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('📥 Fetching favorites...');
      const response = await getMyFavorites();
      console.log('✅ Favorites response:', response);
      
      if (response.success) {
        console.log('📊 Favorites data:', response.data);
        const favs = response.data.favorites || [];
        console.log('📋 Setting favorites:', favs.length, 'items');
        setFavorites(favs);
      } else {
        console.error('❌ Response not successful:', response);
        setError('Erreur lors du chargement des favoris');
        setFavorites([]);
      }
    } catch (error) {
      console.error('❌ Error fetching favorites:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.response?.data?.message || 'Erreur lors du chargement des favoris');
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (reportId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Retirer ce rapport de vos favoris ?')) {
      return;
    }

    try {
      console.log('🗑️ Removing favorite:', reportId);
      await removeFavorite(reportId);
      setFavorites(prev => prev.filter(fav => fav.id !== reportId));
      console.log('✅ Removed from favorites');
    } catch (error) {
      console.error('❌ Error removing favorite:', error);
      alert('Erreur lors de la suppression du favori');
    }
  };

  const openReport = (report) => {
    console.log('📖 Opening report:', report);
    
    const documentData = {
      id: report.id,
      title: report.title,
      file_url: report.file_url,
      author: report.author_name,
      supervisor: report.supervisor_name,
      year: report.academic_year,
      specialty: report.specialty,
      keywords: report.keywords || [],
      abstract: report.abstract || '',
    };
    
    sessionStorage.setItem('selectedDocument', JSON.stringify(documentData));
    navigate('/secure-pdf-reader', { state: { document: documentData } });
  };

  const getSpecialtyColor = (specialty) => {
    const colors = {
      'informatique': 'bg-green-50 text-green-700 border-green-200',
      'Génie Informatique': 'bg-green-50 text-green-700 border-green-200',
      'electrique': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Génie Électrique': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'mecanique': 'bg-blue-50 text-blue-700 border-blue-200',
      'Génie Mécanique': 'bg-blue-50 text-blue-700 border-blue-200',
      'civil': 'bg-purple-50 text-purple-700 border-purple-200',
      'industriel': 'bg-orange-50 text-orange-700 border-orange-200',
      'telecom': 'bg-pink-50 text-pink-700 border-pink-200',
    };
    return colors[specialty] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  console.log('🎨 Rendering FavoritesPage:', {
    isLoading,
    error,
    favoritesCount: favorites.length,
    favorites: favorites
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Icon name="Heart" size={32} className="text-red-600" />
                Mes Favoris
              </h1>
              <p className="text-gray-600">
                {favorites.length} rapport{favorites.length > 1 ? 's' : ''} sauvegardé{favorites.length > 1 ? 's' : ''}
              </p>
            </div>
            
            <button
              onClick={() => navigate('/public-library-catalog')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Icon name="Search" size={16} />
              Parcourir le catalogue
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <Icon name="AlertCircle" size={20} />
              <p className="font-medium">{error}</p>
            </div>
            <button
              onClick={fetchFavorites}
              className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Filtrer par:</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilter('recent')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === 'recent' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Récents
            </button>
          </div>
        </div>

        {/* Favorites Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
            <p className="text-gray-600">Chargement de vos favoris...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <Icon name="Heart" size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun favori
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez à ajouter des rapports à vos favoris
            </p>
            <button
              onClick={() => navigate('/public-library-catalog')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Explorer le catalogue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {favorites.map(report => (
              <div 
                key={report.id} 
                className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow p-5 cursor-pointer"
                onClick={() => openReport(report)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">
                    {report.title}
                  </h3>
                  <button
                    onClick={(e) => handleRemoveFavorite(report.id, e)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors flex-shrink-0"
                    title="Retirer des favoris"
                  >
                    <Icon name="Heart" size={18} fill="currentColor" />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Icon name="User" size={14} />
                    <span>{report.author_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Icon name="Calendar" size={14} />
                    <span>{report.academic_year}</span>
                  </div>
                  {report.supervisor_name && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Icon name="UserCheck" size={14} />
                      <span>Encadrant: {report.supervisor_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium ${getSpecialtyColor(report.specialty)}`}>
                      <Icon name="Award" size={12} />
                      {report.specialty}
                    </span>
                  </div>
                </div>

                {/* Abstract Preview */}
                {report.abstract && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {report.abstract}
                  </p>
                )}

                {/* Keywords */}
                {report.keywords && report.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {report.keywords.slice(0, 3).map((keyword, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        {keyword}
                      </span>
                    ))}
                    {report.keywords.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        +{report.keywords.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Favorited Date */}
                {report.favorited_at && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <Icon name="Clock" size={12} />
                    <span>Ajouté le {formatDate(report.favorited_at)}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openReport(report);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Icon name="Eye" size={16} />
                    Consulter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FavoritesPage;