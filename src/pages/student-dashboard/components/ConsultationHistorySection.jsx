import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';


const ConsultationHistorySection = ({ recentReports, favoriteReports, onRemoveFavorite }) => {
  const [activeTab, setActiveTab] = useState('recent');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ReportCard = ({ report, showRemoveFavorite = false }) => (
    <div className="flex items-center space-x-4 p-4 border border-border rounded-academic hover:bg-muted/30 academic-transition">
      <div className="w-12 h-16 bg-muted rounded-academic flex items-center justify-center flex-shrink-0">
        <Icon name="FileText" size={20} className="text-muted-foreground" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-foreground truncate">
          {report?.title}
        </h4>
        <p className="text-xs text-muted-foreground mt-1">
          {report?.author} • {report?.specialty}
        </p>
        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
          <span>Année: {report?.academicYear}</span>
          <span>Consulté: {formatDate(report?.lastAccessed)}</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {showRemoveFavorite && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveFavorite(report?.id)}
            iconName="Heart"
            iconSize={14}
            className="text-error hover:text-error"
          />
        )}
        <Link to={`/secure-pdf-reader?id=${report?.id}`}>
          <Button
            variant="outline"
            size="sm"
            iconName="Eye"
            iconSize={14}
          >
            Consulter
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-academic academic-shadow-sm">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
          Historique de consultation
        </h3>
        
        <div className="flex space-x-1 bg-muted rounded-academic p-1">
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-academic academic-transition ${
              activeTab === 'recent' ?'bg-card text-foreground academic-shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Icon name="Clock" size={16} />
              <span>Récents</span>
              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                {recentReports?.length}
              </span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-academic academic-transition ${
              activeTab === 'favorites' ?'bg-card text-foreground academic-shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Icon name="Heart" size={16} />
              <span>Favoris</span>
              <span className="bg-accent/10 text-accent text-xs px-2 py-1 rounded-full">
                {favoriteReports?.length}
              </span>
            </div>
          </button>
        </div>
      </div>
      <div className="p-6">
        {activeTab === 'recent' && (
          <div className="space-y-4">
            {recentReports?.length > 0 ? (
              recentReports?.map((report) => (
                <ReportCard key={report?.id} report={report} />
              ))
            ) : (
              <div className="text-center py-8">
                <Icon name="Clock" size={48} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun rapport consulté récemment</p>
                <Link to="/public-library-catalog">
                  <Button variant="outline" size="sm" className="mt-4">
                    Explorer la bibliothèque
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="space-y-4">
            {favoriteReports?.length > 0 ? (
              favoriteReports?.map((report) => (
                <ReportCard 
                  key={report?.id} 
                  report={report} 
                  showRemoveFavorite={true}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <Icon name="Heart" size={48} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun rapport en favoris</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Ajoutez des rapports à vos favoris lors de la consultation
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="px-6 pb-6">
        <Link to="/public-library-catalog">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full"
            iconName="Library"
            iconPosition="left"
          >
            Voir toute la bibliothèque
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ConsultationHistorySection;