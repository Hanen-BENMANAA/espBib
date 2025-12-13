import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import StatusIndicator from '../../../components/ui/StatusIndicator';

const ValidationHistory = ({ reportData, historyData = [] }) => {
  const [expandedEntry, setExpandedEntry] = useState(null);

  // Mock validation history data
  const mockHistory = [
  {
    id: 1,
    action: 'revision_requested',
    status: 'revision',
    reviewer: {
      name: 'Dr. Marie Dubois',
      role: 'Enseignant',
      department: 'GÃ©nie Logiciel',
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_11b715d60-1762273834012.png",
      avatarAlt: 'Professional headshot of middle-aged woman with brown hair in academic setting'
    },
    timestamp: new Date(Date.now() - 86400000 * 3), // 3 days ago
    comment: `RÃ©vision requise pour amÃ©liorer la mÃ©thodologie de recherche. Les sections suivantes nÃ©cessitent des modifications :\n\n1. Chapitre 2 : Ajouter plus de rÃ©fÃ©rences rÃ©centes (2022-2024)\n2. MÃ©thodologie : DÃ©tailler les critÃ¨res de sÃ©lection des participants\n3. Analyse : Inclure des tests statistiques appropriÃ©s`,
    deadline: new Date(Date.now() + 86400000 * 14), // 14 days from now
    changes: [
    'Statut changÃ© de "En rÃ©vision" Ã  "RÃ©vision requise"',
    'DÃ©lai de rÃ©vision fixÃ© Ã  14 jours',
    'Notification envoyÃ©e Ã  l\'Ã©tudiant']

  },
  {
    id: 2,
    action: 'submitted',
    status: 'pending',
    reviewer: {
      name: 'SystÃ¨me',
      role: 'Automatique'
    },
    timestamp: new Date(Date.now() - 86400000 * 7), // 7 days ago
    comment: 'Rapport soumis pour validation par l\'Ã©tudiant Ahmed Ben Salem.',
    changes: [
    'Document PDF tÃ©lÃ©chargÃ© (2.4 MB)',
    'MÃ©tadonnÃ©es validÃ©es',
    'AssignÃ© Ã  Dr. Marie Dubois pour rÃ©vision']

  },
  {
    id: 3,
    action: 'draft_created',
    status: 'draft',
    reviewer: {
      name: 'Ahmed Ben Salem',
      role: 'Ã‰tudiant'
    },
    timestamp: new Date(Date.now() - 86400000 * 14), // 14 days ago
    comment: 'Brouillon initial crÃ©Ã© avec les mÃ©tadonnÃ©es de base.',
    changes: [
    'Nouveau rapport crÃ©Ã©',
    'Titre dÃ©fini',
    'SpÃ©cialitÃ© et annÃ©e acadÃ©mique renseignÃ©es']

  }];


  const allHistory = [...mockHistory, ...historyData]?.sort((a, b) => b?.timestamp - a?.timestamp);

  const getActionConfig = (action) => {
    const configs = {
      submitted: {
        label: 'Soumis',
        icon: 'Upload',
        color: 'text-accent',
        bgColor: 'bg-accent/10'
      },
      revision_requested: {
        label: 'RÃ©vision demandÃ©e',
        icon: 'RotateCcw',
        color: 'text-warning',
        bgColor: 'bg-warning/10'
      },
      validated: {
        label: 'ValidÃ©',
        icon: 'CheckCircle',
        color: 'text-success',
        bgColor: 'bg-success/10'
      },
      rejected: {
        label: 'RejetÃ©',
        icon: 'XCircle',
        color: 'text-error',
        bgColor: 'bg-error/10'
      },
      draft_created: {
        label: 'Brouillon crÃ©Ã©',
        icon: 'FileText',
        color: 'text-neutral',
        bgColor: 'bg-muted'
      },
      comment_added: {
        label: 'Commentaire ajoutÃ©',
        icon: 'MessageSquare',
        color: 'text-accent',
        bgColor: 'bg-accent/10'
      }
    };
    return configs?.[action] || configs?.submitted;
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      return hours === 0 ? 'Maintenant' : `Il y a ${hours}h`;
    } else if (days === 1) {
      return 'Hier';
    } else if (days < 7) {
      return `Il y a ${days} jours`;
    } else {
      return timestamp?.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const toggleExpanded = (entryId) => {
    setExpandedEntry(expandedEntry === entryId ? null : entryId);
  };

  return (
    <div className="bg-surface border border-border rounded-lg shadow-academic">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-medium text-text-primary flex items-center space-x-2">
            <Icon name="History" size={20} className="text-accent" />
            <span>Historique de Validation</span>
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-caption text-text-secondary">
              {allHistory?.length} entrÃ©e{allHistory?.length !== 1 ? 's' : ''}
            </span>
            <Button variant="ghost" size="sm" iconName="Download">
              Exporter
            </Button>
          </div>
        </div>
      </div>
      {/* Timeline */}
      <div className="p-4">
        {allHistory?.length === 0 ?
        <div className="text-center py-8">
            <Icon name="History" size={48} className="text-text-secondary mx-auto mb-4" />
            <p className="text-text-secondary font-caption">
              Aucun historique disponible
            </p>
          </div> :

        <div className="space-y-4">
            {allHistory?.map((entry, index) => {
            const actionConfig = getActionConfig(entry?.action);
            const isExpanded = expandedEntry === entry?.id;
            const isLast = index === allHistory?.length - 1;

            return (
              <div key={entry?.id} className="relative">
                  {/* Timeline Line */}
                  {!isLast &&
                <div className="absolute left-6 top-12 w-0.5 h-full bg-border" />
                }
                  <div className="flex items-start space-x-4">
                    {/* Timeline Icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${actionConfig?.bgColor} border-2 border-background shadow-academic`}>
                      <Icon name={actionConfig?.icon} size={20} className={actionConfig?.color} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div
                      className="bg-muted/50 border border-border rounded-lg p-4 cursor-pointer hover:bg-muted/70 transition-academic"
                      onClick={() => toggleExpanded(entry?.id)}>

                        {/* Entry Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-text-primary">
                                {actionConfig?.label}
                              </span>
                              <StatusIndicator status={entry?.status} size="sm" />
                            </div>
                            
                            <div className="flex items-center space-x-2 text-sm font-caption text-text-secondary">
                              <span>{entry?.reviewer?.name}</span>
                              {entry?.reviewer?.role !== 'Automatique' &&
                            <>
                                  <span>â€¢</span>
                                  <span>{entry?.reviewer?.role}</span>
                                </>
                            }
                              <span>â€¢</span>
                              <span>{formatTimestamp(entry?.timestamp)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {entry?.deadline &&
                          <div className="text-xs font-caption text-warning">
                                Ã‰chÃ©ance: {entry?.deadline?.toLocaleDateString('fr-FR')}
                              </div>
                          }
                            <Icon
                            name={isExpanded ? "ChevronUp" : "ChevronDown"}
                            size={16}
                            className="text-text-secondary" />

                          </div>
                        </div>
                        
                        {/* Entry Preview */}
                        <div className="text-sm text-text-primary">
                          {entry?.comment?.length > 100 && !isExpanded ?
                        `${entry?.comment?.substring(0, 100)}...` :
                        entry?.comment
                        }
                        </div>
                      </div>
                      
                      {/* Expanded Details */}
                      {isExpanded &&
                    <div className="mt-3 ml-4 space-y-3">
                          {/* Reviewer Details */}
                          {entry?.reviewer?.avatar &&
                      <div className="flex items-center space-x-3 p-3 bg-background border border-border rounded-lg">
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                                <img
                            src={entry?.reviewer?.avatar}
                            alt={entry?.reviewer?.avatarAlt}
                            className="w-full h-full object-cover" />

                              </div>
                              <div>
                                <div className="font-medium text-text-primary text-sm">
                                  {entry?.reviewer?.name}
                                </div>
                                <div className="text-xs font-caption text-text-secondary">
                                  {entry?.reviewer?.role}
                                  {entry?.reviewer?.department && ` â€¢ ${entry?.reviewer?.department}`}
                                </div>
                              </div>
                            </div>
                      }
                          
                          {/* Changes Made */}
                          {entry?.changes && entry?.changes?.length > 0 &&
                      <div className="p-3 bg-background border border-border rounded-lg">
                              <div className="text-sm font-medium text-text-primary mb-2">
                                Modifications apportÃ©es :
                              </div>
                              <ul className="space-y-1">
                                {entry?.changes?.map((change, changeIndex) =>
                          <li key={changeIndex} className="text-sm text-text-secondary flex items-start space-x-2">
                                    <Icon name="ArrowRight" size={14} className="text-accent mt-0.5 flex-shrink-0" />
                                    <span>{change}</span>
                                  </li>
                          )}
                              </ul>
                            </div>
                      }
                          
                          {/* Full Comment */}
                          {entry?.comment?.length > 100 &&
                      <div className="p-3 bg-background border border-border rounded-lg">
                              <div className="text-sm font-medium text-text-primary mb-2">
                                Commentaire complet :
                              </div>
                              <div className="text-sm text-text-secondary whitespace-pre-wrap">
                                {entry?.comment}
                              </div>
                            </div>
                      }
                          
                          {/* Timestamp Details */}
                          <div className="text-xs font-caption text-text-secondary">
                            Date exacte : {entry?.timestamp?.toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                          </div>
                        </div>
                    }
                    </div>
                  </div>
                </div>);

          })}
          </div>
        }
      </div>
      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-sm font-caption text-text-secondary">
          <div className="flex items-center space-x-2">
            <Icon name="Info" size={14} />
            <span>Historique complet des actions de validation</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={14} />
            <span>Mis Ã  jour automatiquement</span>
          </div>
        </div>
      </div>
    </div>);

};

export default ValidationHistory;