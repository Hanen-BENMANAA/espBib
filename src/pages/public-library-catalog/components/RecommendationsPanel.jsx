import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecommendationsPanel = ({ recommendations, userHistory }) => {
  if (!recommendations || recommendations?.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-academic academic-shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-heading font-semibold text-foreground">
            Recommandations personnalisées
          </h3>
          <Icon name="Sparkles" size={20} className="text-accent" />
        </div>

        <div className="space-y-4">
          {recommendations?.map((report) => (
            <div key={report?.id} className="flex items-start gap-4 p-4 bg-muted/30 rounded-academic hover:bg-muted/50 academic-transition">
              <div className="w-12 h-12 bg-primary/10 rounded-academic flex items-center justify-center flex-shrink-0">
                <Icon name="FileText" size={20} className="text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground mb-1 line-clamp-1">
                  {report?.title}
                </h4>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {report?.abstractPreview}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                  <span>{report?.authors?.[0]}</span>
                  <span>{report?.academicYear}</span>
                  <span>{report?.specialtyLabel}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Icon name="Target" size={12} className="text-accent" />
                      <span className="text-xs text-accent font-medium">
                        {report?.matchScore}% similaire
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="Eye" size={12} />
                      <span className="text-xs text-muted-foreground">
                        {report?.viewCount} vues
                      </span>
                    </div>
                  </div>
                  
                  <Link to="/secure-pdf-reader">
                    <Button variant="ghost" size="sm" iconName="ArrowRight" iconSize={12}>
                      Voir
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Based on History */}
        {userHistory && userHistory?.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-sm font-medium text-foreground mb-3">
              Basé sur votre historique
            </h4>
            <div className="flex flex-wrap gap-2">
              {userHistory?.slice(0, 5)?.map((item, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent/10 text-accent"
                >
                  {item?.keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-border">
          <Button variant="ghost" size="sm" fullWidth iconName="RefreshCw" iconSize={14}>
            Actualiser les recommandations
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPanel;