import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ManagementPanel = () => {
  const managementActions = [
    {
      title: 'Gestion des Utilisateurs',
      description: 'Administrer les comptes étudiants et enseignants',
      icon: 'Users',
      path: '/user-management',
      badge: '12 nouveaux',
      badgeType: 'info',
      actions: [
        { label: 'Ajouter Utilisateur', icon: 'UserPlus' },
        { label: 'Import CSV', icon: 'Upload' },
        { label: 'Exporter Liste', icon: 'Download' }
      ]
    },
    {
      title: 'Configuration Système',
      description: 'Paramètres de sécurité et notifications',
      icon: 'Settings',
      path: '/system-config',
      badge: '3 alertes',
      badgeType: 'warning',
      actions: [
        { label: 'Sécurité', icon: 'Shield' },
        { label: 'Email Templates', icon: 'Mail' },
        { label: 'Watermark', icon: 'Image' }
      ]
    },
    {
      title: 'Journaux d\'Audit',
      description: 'Historique des actions et événements système',
      icon: 'FileSearch',
      path: '/audit-logs',
      badge: 'Temps réel',
      badgeType: 'success',
      actions: [
        { label: 'Voir Logs', icon: 'Eye' },
        { label: 'Filtrer', icon: 'Filter' },
        { label: 'Exporter', icon: 'Download' }
      ]
    },
    {
      title: 'Rapports Système',
      description: 'Statistiques détaillées et analyses',
      icon: 'BarChart3',
      path: '/system-reports',
      badge: 'Mis à jour',
      badgeType: 'success',
      actions: [
        { label: 'Générer Rapport', icon: 'FileBarChart' },
        { label: 'Planifier', icon: 'Calendar' },
        { label: 'Historique', icon: 'History' }
      ]
    }
  ];

  const getBadgeColor = (type) => {
    switch (type) {
      case 'info': return 'bg-primary/10 text-primary';
      case 'warning': return 'bg-warning/10 text-warning';
      case 'success': return 'bg-success/10 text-success';
      case 'error': return 'bg-error/10 text-error';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 academic-shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Panneau de Gestion
        </h3>
        <Button variant="outline" size="sm" iconName="Settings" iconPosition="left">
          Configurer
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {managementActions?.map((action, index) => (
          <div key={index} className="border border-border rounded-lg p-4 hover:bg-muted/50 academic-transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name={action?.icon} size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{action?.title}</h4>
                  <p className="text-sm text-muted-foreground">{action?.description}</p>
                </div>
              </div>
              
              {action?.badge && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBadgeColor(action?.badgeType)}`}>
                  {action?.badge}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {action?.actions?.map((subAction, subIndex) => (
                <Button
                  key={subIndex}
                  variant="ghost"
                  size="sm"
                  iconName={subAction?.icon}
                  iconPosition="left"
                  iconSize={14}
                  className="text-xs"
                >
                  {subAction?.label}
                </Button>
              ))}
            </div>

            <Link to={action?.path}>
              <Button variant="outline" size="sm" fullWidth iconName="ArrowRight" iconPosition="right">
                Accéder au Module
              </Button>
            </Link>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={16} />
              <span>Dernière synchronisation: 16/10/2025 09:25</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>Système opérationnel</span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" iconName="RefreshCw" iconSize={16}>
              Actualiser
            </Button>
            <Button variant="ghost" size="sm" iconName="Download" iconSize={16}>
              Export Global
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementPanel;