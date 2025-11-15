import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ReportCard = ({ report }) => {
  const getSpecialtyColor = (specialty) => {
    const colors = {
      'informatique': 'bg-blue-100 text-blue-800',
      'electrique': 'bg-yellow-100 text-yellow-800',
      'mecanique': 'bg-green-100 text-green-800',
      'civil': 'bg-purple-100 text-purple-800',
      'industriel': 'bg-orange-100 text-orange-800',
      'telecom': 'bg-pink-100 text-pink-800'
    };
    return colors?.[specialty] || 'bg-gray-100 text-gray-800';
  };

  const getAccessLevelIcon = (level) => {
    switch (level) {
      case 'public': return 'Globe';
      case 'restricted': return 'Lock';
      case 'internal': return 'Shield';
      default: return 'Eye';
    }
  };

  const getAccessLevelColor = (level) => {
    switch (level) {
      case 'public': return 'text-success';
      case 'restricted': return 'text-warning';
      case 'internal': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-academic academic-shadow-sm hover:academic-shadow-md academic-transition group">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-heading font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary academic-transition">
              {report?.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Icon name="User" size={14} />
              <span>{report?.authors?.join(', ')}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Icon name="Calendar" size={14} />
                <span>{report?.academicYear}</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon name="Building" size={14} />
                <span>{report?.department}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Icon 
              name={getAccessLevelIcon(report?.accessLevel)} 
              size={16} 
              className={getAccessLevelColor(report?.accessLevel)}
            />
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSpecialtyColor(report?.specialty)}`}>
              {report?.specialtyLabel}
            </span>
          </div>
        </div>

        {/* Abstract Preview */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {report?.abstractPreview}
          </p>
        </div>

        {/* Keywords */}
        {report?.keywords && report?.keywords?.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {report?.keywords?.slice(0, 4)?.map((keyword, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground"
                >
                  {keyword}
                </span>
              ))}
              {report?.keywords?.length > 4 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                  +{report?.keywords?.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between mb-4 pt-4 border-t border-border">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Icon name="Eye" size={12} />
              <span>{report?.viewCount} vues</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="Heart" size={12} />
              <span>{report?.favoriteCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="Download" size={12} />
              <span>{report?.downloadCount}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Icon name="Clock" size={12} />
            <span>Ajouté le {new Date(report.submissionDate)?.toLocaleDateString('fr-FR')}</span>
          </div>
        </div>

        {/* Supervisor & Company */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Icon name="UserCheck" size={14} />
            <span>Encadrant: {report?.supervisor}</span>
          </div>
          {report?.company && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Icon name="Building2" size={14} />
              <span>{report?.company}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              iconName="Heart"
              iconSize={14}
              className="text-muted-foreground hover:text-error"
            >
              Favoris
            </Button>
            <Button
              variant="ghost"
              size="sm"
              iconName="Share2"
              iconSize={14}
              className="text-muted-foreground"
            >
              Partager
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Info"
              iconSize={14}
            >
              Détails
            </Button>
            <Link to="/secure-pdf-reader">
              <Button
                variant="default"
                size="sm"
                iconName="Eye"
                iconSize={14}
              >
                Consulter
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;