import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const NavigationBreadcrumbs = () => {
  const location = useLocation();

  const breadcrumbMap = {
    '/student-dashboard': [
      { label: 'Accueil', path: '/' },
      { label: 'Tableau de Bord', path: '/student-dashboard' }
    ],
    '/report-submission-form': [
      { label: 'Accueil', path: '/' },
      { label: 'Tableau de Bord', path: '/student-dashboard' },
      { label: 'Soumission de Rapport', path: '/report-submission-form' }
    ],
    '/faculty-validation-dashboard': [
      { label: 'Accueil', path: '/' },
      { label: 'Validation des Rapports', path: '/faculty-validation-dashboard' }
    ],
    '/public-library-catalog': [
      { label: 'Accueil', path: '/' },
      { label: 'Catalogue Bibliothèque', path: '/public-library-catalog' }
    ],
    '/secure-pdf-reader': [
      { label: 'Accueil', path: '/' },
      { label: 'Bibliothèque', path: '/public-library-catalog' },
      { label: 'Lecteur PDF Sécurisé', path: '/secure-pdf-reader' }
    ],
    '/administrative-dashboard': [
      { label: 'Accueil', path: '/' },
      { label: 'Administration', path: '/administrative-dashboard' }
    ]
  };

  const currentBreadcrumbs = breadcrumbMap?.[location?.pathname] || [
    { label: 'Accueil', path: '/' }
  ];

  if (currentBreadcrumbs?.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground py-3" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {currentBreadcrumbs?.map((breadcrumb, index) => {
          const isLast = index === currentBreadcrumbs?.length - 1;
          const isFirst = index === 0;

          return (
            <li key={breadcrumb?.path} className="flex items-center">
              {!isFirst && (
                <Icon 
                  name="ChevronRight" 
                  size={14} 
                  className="mx-2 text-muted-foreground" 
                />
              )}
              {isLast ? (
                <span className="text-foreground font-medium" aria-current="page">
                  {breadcrumb?.label}
                </span>
              ) : (
                <Link
                  to={breadcrumb?.path}
                  className="hover:text-primary academic-transition"
                >
                  {breadcrumb?.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default NavigationBreadcrumbs;