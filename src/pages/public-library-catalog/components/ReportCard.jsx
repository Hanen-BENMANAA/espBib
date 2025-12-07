import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { addFavorite, removeFavorite, checkIfFavorited } from "./../../../services/api";
const ReportCard = ({ report }) => {
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(report?.favoriteCount || 0);

  // Check if already favorited on mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const response = await checkIfFavorited(report.id);
        setIsFavorited(response.isFavorited);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };
    checkFavoriteStatus();
  }, [report.id]);

  const getSpecialtyColor = (specialty) => {
    const colors = {
      'informatique': 'bg-green-50 text-green-700 border-green-200',
      'electrique': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'mecanique': 'bg-blue-50 text-blue-700 border-blue-200',
      'civil': 'bg-purple-50 text-purple-700 border-purple-200',
      'industriel': 'bg-orange-50 text-orange-700 border-orange-200',
      'telecom': 'bg-pink-50 text-pink-700 border-pink-200'
    };
    return colors?.[specialty] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // ✅ HANDLE FAVORITE TOGGLE
  const handleFavoriteToggle = async (e) => {
    e.stopPropagation();
    
    setIsLoadingFavorite(true);
    try {
      if (isFavorited) {
        await removeFavorite(report.id);
        setIsFavorited(false);
        setFavoriteCount(prev => Math.max(0, prev - 1));
        console.log('✅ Removed from favorites');
      } else {
        await addFavorite(report.id);
        setIsFavorited(true);
        setFavoriteCount(prev => prev + 1);
        console.log('✅ Added to favorites');
      }
    } catch (error) {
      console.error('❌ Favorite error:', error);
      alert('Erreur lors de la mise à jour des favoris');
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  const openSecureReader = () => {
    if (!report.fileUrl) {
      alert('Erreur: Le document n\'a pas de fichier PDF associé');
      return;
    }

    const documentData = {
      id: report.id,
      title: report.title || 'Sans titre',
      file_url: report.fileUrl,
      author: report.authors?.[0] || 'Auteur inconnu',
      supervisor: report.supervisor || 'Non spécifié',
      year: report.academicYear,
      specialty: report.specialtyLabel,
      keywords: report.keywords || [],
      abstract: report.abstractPreview || '',
      company: report.company || null,
      submissionDate: report.submissionDate,
      viewCount: report.viewCount,
      favoriteCount: favoriteCount,
      downloadCount: report.downloadCount
    };

    sessionStorage.setItem('selectedDocument', JSON.stringify(documentData));
    navigate('/secure-pdf-reader', {
      replace: false,
      state: { document: documentData }
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="p-5">
        {/* Header: Title + Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-lg font-semibold text-gray-900 leading-snug flex-1">
            {report?.title}
          </h3>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded border text-xs font-medium whitespace-nowrap ${getSpecialtyColor(report?.specialty)}`}>
            <Icon name="Globe" size={12} />
            {report?.specialtyLabel}
          </span>
        </div>

        {/* Author */}
        <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-2">
          <Icon name="User" size={14} />
          <span>{report?.authors?.join(', ')}</span>
        </div>

        {/* Year */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
          <Icon name="Calendar" size={14} />
          <span>{report?.academicYear}</span>
          <span className="mx-1">•</span>
          <Icon name="Copy" size={14} />
        </div>

        {/* Abstract Preview */}
        <div className="mb-4">
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
            {report?.abstractPreview}
          </p>
        </div>

        {/* Keywords */}
        {report?.keywords && report?.keywords?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {report?.keywords?.slice(0, 3)?.map((keyword, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
              >
                {keyword}
              </span>
            ))}
            {report?.keywords?.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                +{report.keywords.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Stats Bar */}
        <div className="flex items-center justify-between text-xs text-gray-500 py-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Icon name="Eye" size={13} />
              <span>{report?.viewCount} vues</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="Heart" size={13} />
              <span>{favoriteCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="Download" size={13} />
              <span>{report?.downloadCount}</span>
            </div>
          </div>
        </div>

        {/* Supervisor Info */}
        <div className="text-xs text-gray-600 mb-1">
          <span className="font-medium">Encadrant:</span> {report?.supervisor}
        </div>

        {/* Company */}
        {report?.company && (
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
            <Icon name="Building2" size={12} />
            <span>{report?.company}</span>
          </div>
        )}

        {/* Submission Date */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
          <Icon name="Clock" size={12} />
          <span>Ajouté le {formatDate(report?.submissionDate)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* ✅ FAVORITE BUTTON */}
          <button 
            onClick={handleFavoriteToggle}
            disabled={isLoadingFavorite}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-all ${
              isFavorited 
                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                : 'text-gray-600 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200'
            } ${isLoadingFavorite ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Icon 
              name="Heart" 
              size={14} 
              fill={isFavorited ? "currentColor" : "none"}
              strokeWidth={isFavorited ? 0 : 2}
            />
            {isLoadingFavorite ? '...' : isFavorited ? 'Favori' : 'Favoris'}
          </button>

          <button className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
            <Icon name="Share2" size={14} />
            Partager
          </button>
          
          <button className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors ml-auto">
            <Icon name="Info" size={14} />
            Détails
          </button>

          <button
            onClick={openSecureReader}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            disabled={!report?.fileUrl}
          >
            <Icon name="Eye" size={14} />
            Consulter
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;