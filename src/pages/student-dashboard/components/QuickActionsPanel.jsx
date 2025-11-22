import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../AppIcon';

const QuickActionPanel = () => {
  const actions = [
    {
      title: 'Nouveau Rapport',
      description: 'Soumettre un nouveau rapport PFE',
      icon: 'PlusCircle',
      to: '/student/submit',
      color: 'bg-primary text-primary-foreground'
    },
    {
      title: 'Mes Soumissions',
      description: 'Voir l’état de mes rapports',
      icon: 'FileText',
      to: '/student/dashboard',
      color: 'bg-muted text-foreground'
    },
    {
      title: 'Rechercher',
      description: 'Explorer la bibliothèque',
      icon: 'Search',
      to: '/public-library-catalog',
      color: 'bg-muted text-foreground'
    },
    {
      title: 'Brouillons',
      description: 'Continuer un rapport en cours',
      icon: 'Edit3',
      to: '#',
      color: 'bg-muted text-foreground',
      disabled: true
    }
  ];

  return (
    <div className="bg-card border border-border rounded-academic p-6 shadow-sm sticky top-6 z-10">
      {/* Titre */}
      <h3 className="text-lg font-heading font-semibold mb-5 text-foreground flex items-center justify-between">
        Actions Rapides
        <Icon name="Zap" size={20} className="text-primary" />
      </h3>

      {/* Liste des actions */}
      <div className="space-y-4">
        {actions.map((action, index) => (
          <Link
            key={index}
            to={action.disabled ? '#' : action.to}
            className={`block p-4 rounded-academic border border-border transition-all hover:shadow-md hover:-translate-y-0.5 ${
              action.disabled
                ? 'opacity-50 cursor-not-allowed pointer-events-none'
                : 'cursor-pointer hover:border-primary/30'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-2.5 rounded-academic flex-shrink-0 ${action.color}`}>
                <Icon name={action.icon} size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate">
                  {action.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {action.description}
                </p>
              </div>
              {!action.disabled && (
                <Icon name="ChevronRight" size={18} className="text-muted-foreground flex-shrink-0" />
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Pied de page */}
      <div className="mt-6 pt-5 border-t border-border">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Sauvegarde automatique</span>
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-success font-medium">Connecté</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionPanel;