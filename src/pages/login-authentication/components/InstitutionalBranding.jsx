import React from 'react';
import Icon from '../../../components/AppIcon';


const InstitutionalBranding = () => {
  return (
    <div className="text-center space-y-6">
      {/* ESPRIM Logo */}
      <div className="flex items-center justify-center space-x-4">
        <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-academic">
          <Icon name="BookOpen" size={32} className="text-primary-foreground" />
        </div>
        <div className="text-left">
          <h1 className="text-3xl font-heading font-bold text-text-primary">
            ESPRIM
          </h1>
          <p className="text-lg font-caption text-accent font-medium">
            Virtual Library
          </p>
        </div>
      </div>

      {/* Institution Description */}
      <div className="space-y-4">
        <h2 className="text-xl font-heading font-semibold text-text-primary">
          École Supérieure Privée d'Ingénierie et de Management
        </h2>
        <p className="text-base font-caption text-text-secondary max-w-md mx-auto leading-relaxed">
          Plateforme sécurisée de gestion documentaire pour les rapports de Projet de Fin d'Études
        </p>
      </div>

      {/* Security Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
        <div className="flex flex-col items-center space-y-2 p-4 bg-muted rounded-lg">
          <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
            <Icon name="Shield" size={20} className="text-success" />
          </div>
          <span className="text-sm font-caption text-text-secondary text-center">
            Accès Sécurisé
          </span>
        </div>

        <div className="flex flex-col items-center space-y-2 p-4 bg-muted rounded-lg">
          <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
            <Icon name="Users" size={20} className="text-accent" />
          </div>
          <span className="text-sm font-caption text-text-secondary text-center">
            Multi-Rôles
          </span>
        </div>

        <div className="flex flex-col items-center space-y-2 p-4 bg-muted rounded-lg">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon name="FileCheck" size={20} className="text-primary" />
          </div>
          <span className="text-sm font-caption text-text-secondary text-center">
            Validation
          </span>
        </div>
      </div>

      {/* Academic Year */}
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-center justify-center space-x-2">
          <Icon name="Calendar" size={16} className="text-primary" />
          <span className="text-sm font-caption text-primary font-medium">
            Année Académique 2024-2025
          </span>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="flex items-center justify-center space-x-6 text-xs font-caption text-text-secondary">
        <div className="flex items-center space-x-1">
          <Icon name="Award" size={14} className="text-accent" />
          <span>Certifié Tunisie</span>
        </div>
        <div className="flex items-center space-x-1">
          <Icon name="Lock" size={14} className="text-success" />
          <span>SSL Sécurisé</span>
        </div>
        <div className="flex items-center space-x-1">
          <Icon name="CheckCircle" size={14} className="text-primary" />
          <span>Conformité RGPD</span>
        </div>
      </div>
    </div>
  );
};

export default InstitutionalBranding;