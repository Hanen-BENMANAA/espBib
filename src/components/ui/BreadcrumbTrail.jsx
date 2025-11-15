import React from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const BreadcrumbTrail = ({ customBreadcrumbs = null }) => {
  const location = useLocation();

  // Route to breadcrumb mapping
  const routeBreadcrumbs = {
    '/login-authentication': [
      { label: 'Accueil', path: '/' },
      { label: 'Authentification', path: '/login-authentication' }
    ],
    '/teacher-validation-dashboard': [
      { label: 'Accueil', path: '/' },
      { label: 'Validation', path: null },
      { label: 'Tableau de Bord', path: '/teacher-validation-dashboard' }
    ],
    '/report-validation-interface': [
      { label: 'Accueil', path: '/' },
      { label: 'Validation', path: null },
      { label: 'Interface de Validation', path: '/report-validation-interface' }
    ],
    '/user-management-panel': [
      { label: 'Accueil', path: '/' },
      { label: 'Administration', path: null },
      { label: 'Gestion des Utilisateurs', path: '/user-management-panel' }
    ],
    '/system-configuration': [
      { label: 'Accueil', path: '/' },
      { label: 'Administration', path: null },
      { label: 'Configuration Système', path: '/system-configuration' }
    ]
  };

  // Get breadcrumbs for current route
  const getBreadcrumbs = () => {
    if (customBreadcrumbs) {
      return customBreadcrumbs;
    }
    
    return routeBreadcrumbs?.[location?.pathname] || [
      { label: 'Accueil', path: '/' },
      { label: 'Page Actuelle', path: location?.pathname }
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  // Don't render breadcrumbs on home page or if only one item
  if (location?.pathname === '/' || breadcrumbs?.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm font-caption mb-6" aria-label="Fil d'Ariane">
      {breadcrumbs?.map((crumb, index) => {
        const isLast = index === breadcrumbs?.length - 1;
        const isClickable = crumb?.path && !isLast;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <Icon 
                name="ChevronRight" 
                size={14} 
                className="text-text-secondary flex-shrink-0"
              />
            )}
            {isClickable ? (
              <a
                href={crumb?.path}
                className="text-accent hover:text-accent/80 transition-academic hover:underline"
              >
                {crumb?.label}
              </a>
            ) : (
              <span 
                className={`${
                  isLast 
                    ? 'text-text-primary font-medium' :'text-text-secondary'
                }`}
              >
                {crumb?.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default BreadcrumbTrail;