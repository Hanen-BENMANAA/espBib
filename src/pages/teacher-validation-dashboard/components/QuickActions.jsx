import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActions = ({ onAction }) => {
  const actions = [
    {
      id: 'validate-all-priority',
      label: 'Valider Priorités',
      description: 'Valider tous les rapports prioritaires',
      icon: 'CheckCircle2',
      color: 'success',
      count: 7
    },
    {
      id: 'export-pending',
      label: 'Exporter Liste',
      description: 'Exporter les rapports en attente',
      icon: 'Download',
      color: 'accent',
      count: null
    },
    {
      id: 'bulk-review',
      label: 'Révision Groupée',
      description: 'Marquer plusieurs rapports en révision',
      icon: 'Eye',
      color: 'warning',
      count: null
    },
    {
      id: 'send-reminders',
      label: 'Rappels Étudiants',
      description: 'Envoyer des rappels automatiques',
      icon: 'Mail',
      color: 'neutral',
      count: 12
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      success: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
      accent: 'bg-accent/10 text-accent border-accent/20 hover:bg-accent/20',
      warning: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20',
      neutral: 'bg-muted text-text-secondary border-border hover:bg-muted/80'
    };
    return colorMap?.[color] || colorMap?.neutral;
  };

  return (
    <div className="bg-surface border border-border rounded-lg shadow-academic p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-heading font-semibold text-text-primary">
          Actions Rapides
        </h2>
        <Icon name="Zap" size={20} className="text-text-secondary" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions?.map((action) => (
          <button
            key={action?.id}
            onClick={() => onAction(action?.id)}
            className={`
              p-4 rounded-lg border text-left transition-academic group
              ${getColorClasses(action?.color)}
            `}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${getColorClasses(action?.color)?.split(' ')?.[0]} ${getColorClasses(action?.color)?.split(' ')?.[1]}`}>
                <Icon name={action?.icon} size={16} />
              </div>
              {action?.count && (
                <span className="px-2 py-1 bg-background text-text-primary text-xs font-caption rounded-full border border-border">
                  {action?.count}
                </span>
              )}
            </div>
            
            <div className="space-y-1">
              <div className="font-medium text-text-primary group-hover:text-current">
                {action?.label}
              </div>
              <div className="text-sm font-caption text-text-secondary">
                {action?.description}
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <Button
          variant="outline"
          fullWidth
          iconName="Settings"
          iconPosition="left"
          iconSize={16}
          onClick={() => onAction('configure-workflow')}
        >
          Configurer le Workflow
        </Button>
      </div>
    </div>
  );
};

export default QuickActions;