import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const QuickActionPanel = ({ userRole = 'student', isCollapsed = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  const getActionsForRole = () => {
    switch (userRole) {
      case 'student':
        return [
          {
            label: 'Nouveau Rapport',
            description: 'Soumettre un nouveau rapport',
            path: '/report-submission-form',
            icon: 'Plus',
            variant: 'default',
            badge: null
          },
          {
            label: 'Mes Soumissions',
            description: 'Voir l\'état de mes rapports',
            path: '/student-dashboard',
            icon: 'FileText',
            variant: 'outline',
            badge: '3'
          },
          {
            label: 'Rechercher',
            description: 'Explorer la bibliothèque',
            path: '/public-library-catalog',
            icon: 'Search',
            variant: 'ghost',
            badge: null
          },
          {
            label: 'Brouillons',
            description: 'Continuer un rapport',
            path: '/drafts',
            icon: 'Edit',
            variant: 'ghost',
            badge: '2'
          }
        ];
      
      case 'faculty':
        return [
          {
            label: 'Valider Rapports',
            description: 'Examiner les soumissions',
            path: '/faculty-validation-dashboard',
            icon: 'CheckCircle',
            variant: 'default',
            badge: '7'
          },
          {
            label: 'Mes Évaluations',
            description: 'Historique des validations',
            path: '/my-evaluations',
            icon: 'History',
            variant: 'outline',
            badge: null
          },
          {
            label: 'Bibliothèque',
            description: 'Consulter les documents',
            path: '/public-library-catalog',
            icon: 'Library',
            variant: 'ghost',
            badge: null
          },
          {
            label: 'Statistiques',
            description: 'Voir les métriques',
            path: '/faculty-stats',
            icon: 'BarChart3',
            variant: 'ghost',
            badge: null
          }
        ];
      
      case 'admin':
        return [
          {
            label: 'Tableau de Bord',
            description: 'Vue d\'ensemble système',
            path: '/administrative-dashboard',
            icon: 'LayoutDashboard',
            variant: 'default',
            badge: null
          },
          {
            label: 'Gestion Utilisateurs',
            description: 'Administrer les comptes',
            path: '/user-management',
            icon: 'Users',
            variant: 'outline',
            badge: '12'
          },
          {
            label: 'Rapports Système',
            description: 'Analyser l\'activité',
            path: '/system-reports',
            icon: 'TrendingUp',
            variant: 'ghost',
            badge: null
          },
          {
            label: 'Configuration',
            description: 'Paramètres système',
            path: '/system-config',
            icon: 'Settings',
            variant: 'ghost',
            badge: null
          }
        ];
      
      default:
        return [
          {
            label: 'Catalogue',
            description: 'Explorer la bibliothèque',
            path: '/public-library-catalog',
            icon: 'Library',
            variant: 'default',
            badge: null
          },
          {
            label: 'Recherche Avancée',
            description: 'Filtres détaillés',
            path: '/advanced-search',
            icon: 'Search',
            variant: 'outline',
            badge: null
          }
        ];
    }
  };

  const actions = getActionsForRole();
  const isCurrentPath = (path) => location?.pathname === path;

  // Mobile floating action button
  const MobileFloatingButton = () => (
    <div className="fixed bottom-6 right-6 z-200 lg:hidden">
      <Button
        variant="default"
        size="icon"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-14 h-14 rounded-full academic-shadow-lg"
      >
        <Icon name={isExpanded ? "X" : "Plus"} size={24} />
      </Button>
      
      {isExpanded && (
        <div className="absolute bottom-16 right-0 w-64 bg-card border border-border rounded-academic academic-shadow-xl">
          <div className="p-4">
            <h3 className="font-heading font-medium text-sm text-foreground mb-3">
              Actions Rapides
            </h3>
            <div className="space-y-2">
              {actions?.slice(0, 3)?.map((action, index) => (
                <Link
                  key={index}
                  to={action?.path}
                  onClick={() => setIsExpanded(false)}
                  className={`flex items-center space-x-3 p-3 rounded-academic academic-transition ${
                    isCurrentPath(action?.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <Icon name={action?.icon} size={18} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {action?.label}
                    </p>
                  </div>
                  {action?.badge && (
                    <span className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full">
                      {action?.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Desktop sidebar panel
  const DesktopPanel = () => (
    <div className={`hidden lg:block fixed right-6 top-24 w-80 bg-card border border-border rounded-academic academic-shadow-lg z-150 academic-transition-layout ${
      isCollapsed ? 'w-16' : 'w-80'
    }`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-heading font-medium text-foreground ${isCollapsed ? 'hidden' : 'block'}`}>
            Actions Rapides
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8"
          >
            <Icon name={isCollapsed ? "ChevronLeft" : "ChevronRight"} size={16} />
          </Button>
        </div>
        
        <div className="space-y-3">
          {actions?.map((action, index) => (
            <Link
              key={index}
              to={action?.path}
              className={`group flex items-center space-x-3 p-3 rounded-academic academic-transition ${
                isCurrentPath(action?.path)
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <div className="relative">
                <Icon name={action?.icon} size={20} />
                {action?.badge && (
                  <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {action?.badge}
                  </span>
                )}
              </div>
              
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {action?.label}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {action?.description}
                  </p>
                </div>
              )}
            </Link>
          ))}
        </div>

        {!isCollapsed && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Icon name="Clock" size={14} />
              <span>Dernière activité: il y a 2h</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <MobileFloatingButton />
      <DesktopPanel />
    </>
  );
};

export default QuickActionPanel;