import React from 'react';
import Icon from '../../../components/AppIcon';

const ValidationStatsPanel = () => {
  const stats = [
    {
      id: 'pending',
      label: 'Rapports en Attente',
      value: 23,
      change: '+5',
      changeType: 'increase',
      icon: 'Clock',
      color: 'warning'
    },
    {
      id: 'validated',
      label: 'Validés Aujourd\'hui',
      value: 8,
      change: '+3',
      changeType: 'increase',
      icon: 'CheckCircle',
      color: 'success'
    },
    {
      id: 'avgTime',
      label: 'Temps Moyen (heures)',
      value: 2.4,
      change: '-0.3',
      changeType: 'decrease',
      icon: 'Timer',
      color: 'accent'
    },
    {
      id: 'priority',
      label: 'Priorité Élevée',
      value: 7,
      change: '+2',
      changeType: 'increase',
      icon: 'AlertTriangle',
      color: 'error'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      warning: 'bg-warning/10 text-warning border-warning/20',
      success: 'bg-success/10 text-success border-success/20',
      accent: 'bg-accent/10 text-accent border-accent/20',
      error: 'bg-error/10 text-error border-error/20'
    };
    return colorMap?.[color] || colorMap?.accent;
  };

  const getChangeColor = (changeType) => {
    return changeType === 'increase' ? 'text-success' : 'text-error';
  };

  return (
    <div className="bg-surface border border-border rounded-lg shadow-academic p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-heading font-semibold text-text-primary">
          Statistiques de Validation
        </h2>
        <Icon name="BarChart3" size={20} className="text-text-secondary" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats?.map((stat) => (
          <div
            key={stat?.id}
            className="bg-muted/50 border border-border rounded-lg p-4 hover:shadow-academic transition-academic"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${getColorClasses(stat?.color)}`}>
                <Icon name={stat?.icon} size={16} />
              </div>
              <span className={`text-sm font-caption ${getChangeColor(stat?.changeType)}`}>
                {stat?.change}
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="text-2xl font-heading font-semibold text-text-primary">
                {stat?.value}
              </div>
              <div className="text-sm font-caption text-text-secondary">
                {stat?.label}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm font-caption">
          <span className="text-text-secondary">Dernière mise à jour</span>
          <span className="text-text-primary">Il y a 2 minutes</span>
        </div>
      </div>
    </div>
  );
};

export default ValidationStatsPanel;