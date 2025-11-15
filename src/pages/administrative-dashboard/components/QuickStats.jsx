import React from 'react';
import Icon from '../../../components/AppIcon';

const QuickStats = () => {
  const stats = [
    {
      label: 'Utilisateurs Actifs',
      value: '1,247',
      subtext: 'Dernières 24h',
      icon: 'Users',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Rapports Validés',
      value: '89',
      subtext: 'Cette semaine',
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      label: 'En Attente',
      value: '23',
      subtext: 'À traiter',
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      label: 'Espace Utilisé',
      value: '2.4 TB',
      subtext: '85% du total',
      icon: 'HardDrive',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      label: 'Sessions Actives',
      value: '156',
      subtext: 'En cours',
      icon: 'Activity',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    },
    {
      label: 'Alertes Sécurité',
      value: '2',
      subtext: 'Nécessitent attention',
      icon: 'Shield',
      color: 'text-error',
      bgColor: 'bg-error/10'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats?.map((stat, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-4 academic-shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat?.bgColor}`}>
              <Icon name={stat?.icon} size={16} className={stat?.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-foreground truncate">{stat?.value}</p>
            </div>
          </div>
          <p className="text-xs font-medium text-foreground mb-1">{stat?.label}</p>
          <p className="text-xs text-muted-foreground">{stat?.subtext}</p>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;