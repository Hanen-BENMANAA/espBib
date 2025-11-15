import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';


const QuickActionsPanel = ({ draftCount, onNewSubmission, onContinueDraft }) => {
  const quickActions = [
    {
      title: 'Nouveau rapport',
      description: 'Commencer une nouvelle soumission PFE',
      icon: 'Plus',
      variant: 'default',
      action: onNewSubmission,
      path: '/report-submission-form'
    },
    {
      title: 'Continuer brouillon',
      description: `${draftCount} brouillon(s) en attente`,
      icon: 'Edit',
      variant: 'outline',
      action: onContinueDraft,
      disabled: draftCount === 0
    },
    {
      title: 'Bibliothèque',
      description: 'Consulter les rapports validés',
      icon: 'Library',
      variant: 'ghost',
      path: '/public-library-catalog'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-academic p-6 academic-shadow-sm">
      <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
        Actions rapides
      </h3>
      <div className="space-y-3">
        {quickActions?.map((action, index) => {
          const ButtonComponent = action?.path ? Link : 'button';
          const buttonProps = action?.path 
            ? { to: action?.path }
            : { onClick: action?.action, disabled: action?.disabled };

          return (
            <ButtonComponent
              key={index}
              {...buttonProps}
              className={`w-full p-4 text-left border border-border rounded-academic hover:bg-muted/50 academic-transition ${
                action?.disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-academic ${
                  action?.variant === 'default' ? 'bg-primary text-primary-foreground' :
                  action?.variant === 'outline' ? 'bg-muted text-foreground' :
                  'bg-muted/50 text-muted-foreground'
                }`}>
                  <Icon name={action?.icon} size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground mb-1">
                    {action?.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {action?.description}
                  </p>
                </div>
                <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
              </div>
            </ButtonComponent>
          );
        })}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Sauvegarde automatique activée</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span>Connecté</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsPanel;