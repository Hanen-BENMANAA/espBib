import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const StorageQuotaSection = ({ onSave }) => {
  const [storageSettings, setStorageSettings] = useState({
    maxFileSize: 50,
    totalQuota: 1000,
    userQuota: 200,
    cleanupAfterDays: 30,
    autoCleanup: true,
    compressionEnabled: true,
    alertThreshold: 80
  });

  const [storageStats] = useState({
    totalUsed: 650,
    totalAvailable: 1000,
    userCount: 245,
    averageFileSize: 12.5,
    largestFile: 48.2,
    oldestFile: '2023-09-15'
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (key, value) => {
    setStorageSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave('storage', storageSettings);
    setHasChanges(false);
  };

  const formatSize = (sizeInMB) => {
    if (sizeInMB >= 1000) {
      return `${(sizeInMB / 1000)?.toFixed(1)} GB`;
    }
    return `${sizeInMB} MB`;
  };

  const getUsagePercentage = () => {
    return Math.round((storageStats?.totalUsed / storageStats?.totalAvailable) * 100);
  };

  const getUsageColor = () => {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return 'text-error';
    if (percentage >= storageSettings?.alertThreshold) return 'text-warning';
    return 'text-success';
  };

  const fileSizeOptions = [
    { value: 25, label: '25 MB' },
    { value: 50, label: '50 MB (recommandé)' },
    { value: 100, label: '100 MB' },
    { value: 200, label: '200 MB' }
  ];

  const quotaOptions = [
    { value: 500, label: '500 GB' },
    { value: 1000, label: '1 TB (actuel)' },
    { value: 2000, label: '2 TB' },
    { value: 5000, label: '5 TB' }
  ];

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Icon name="HardDrive" size={20} className="text-primary" />
          <h3 className="text-lg font-heading font-medium text-text-primary">
            Vue d'Ensemble du Stockage
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Usage Chart */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text-primary">Utilisation Totale</span>
              <span className={`text-sm font-medium ${getUsageColor()}`}>
                {getUsagePercentage()}%
              </span>
            </div>
            
            <div className="w-full bg-muted rounded-full h-3 mb-4">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  getUsagePercentage() >= 90 ? 'bg-error' :
                  getUsagePercentage() >= storageSettings?.alertThreshold ? 'bg-warning' : 'bg-success'
                }`}
                style={{ width: `${getUsagePercentage()}%` }}
              />
            </div>
            
            <div className="flex justify-between text-sm font-caption text-text-secondary">
              <span>{formatSize(storageStats?.totalUsed)} utilisés</span>
              <span>{formatSize(storageStats?.totalAvailable)} total</span>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Utilisateurs:</span>
              <span className="text-sm font-medium text-text-primary">{storageStats?.userCount}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Taille moyenne:</span>
              <span className="text-sm font-medium text-text-primary">{storageStats?.averageFileSize} MB</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Plus gros fichier:</span>
              <span className="text-sm font-medium text-text-primary">{storageStats?.largestFile} MB</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Plus ancien:</span>
              <span className="text-sm font-medium text-text-primary">{storageStats?.oldestFile}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Quota Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Icon name="Settings" size={20} className="text-primary" />
          <h3 className="text-lg font-heading font-medium text-text-primary">
            Configuration des Quotas
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Taille maximale par fichier"
            description="Limite pour les uploads de rapports PDF"
            options={fileSizeOptions}
            value={storageSettings?.maxFileSize}
            onChange={(value) => handleSettingChange('maxFileSize', value)}
          />
          
          <Select
            label="Quota total du système"
            description="Espace de stockage total disponible"
            options={quotaOptions}
            value={storageSettings?.totalQuota}
            onChange={(value) => handleSettingChange('totalQuota', value)}
          />
          
          <Input
            label="Quota par utilisateur (MB)"
            type="number"
            min="50"
            max="1000"
            description="Espace alloué par étudiant"
            value={storageSettings?.userQuota}
            onChange={(e) => handleSettingChange('userQuota', parseInt(e?.target?.value))}
          />
          
          <Input
            label="Seuil d'alerte (%)"
            type="number"
            min="50"
            max="95"
            description="Déclencher une alerte à ce pourcentage"
            value={storageSettings?.alertThreshold}
            onChange={(e) => handleSettingChange('alertThreshold', parseInt(e?.target?.value))}
          />
        </div>
      </div>
      {/* Cleanup Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Icon name="Trash2" size={20} className="text-primary" />
          <h3 className="text-lg font-heading font-medium text-text-primary">
            Nettoyage Automatique
          </h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium text-text-primary">Nettoyage automatique</p>
              <p className="text-sm font-caption text-text-secondary">
                Supprimer automatiquement les brouillons expirés
              </p>
            </div>
            
            <button
              onClick={() => handleSettingChange('autoCleanup', !storageSettings?.autoCleanup)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                storageSettings?.autoCleanup ? 'bg-success' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  storageSettings?.autoCleanup ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {storageSettings?.autoCleanup && (
            <div className="pl-4 border-l-2 border-accent/20">
              <Input
                label="Supprimer les brouillons après (jours)"
                type="number"
                min="7"
                max="90"
                value={storageSettings?.cleanupAfterDays}
                onChange={(e) => handleSettingChange('cleanupAfterDays', parseInt(e?.target?.value))}
              />
            </div>
          )}
          
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium text-text-primary">Compression des fichiers</p>
              <p className="text-sm font-caption text-text-secondary">
                Compresser les PDF pour économiser l'espace
              </p>
            </div>
            
            <button
              onClick={() => handleSettingChange('compressionEnabled', !storageSettings?.compressionEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                storageSettings?.compressionEnabled ? 'bg-success' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  storageSettings?.compressionEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
      {/* Storage Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Icon name="Zap" size={20} className="text-primary" />
          <h3 className="text-lg font-heading font-medium text-text-primary">
            Actions de Maintenance
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            iconName="Trash2"
            iconPosition="left"
            className="justify-start"
          >
            Nettoyer Maintenant
          </Button>
          
          <Button
            variant="outline"
            iconName="Archive"
            iconPosition="left"
            className="justify-start"
          >
            Archiver Anciens
          </Button>
          
          <Button
            variant="outline"
            iconName="Download"
            iconPosition="left"
            className="justify-start"
          >
            Rapport d'Usage
          </Button>
        </div>
      </div>
      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-2 text-sm font-caption text-text-secondary">
          <Icon name="AlertTriangle" size={16} />
          <span>Les modifications de quota prennent effet immédiatement</span>
        </div>
        
        <Button
          variant="default"
          onClick={handleSave}
          disabled={!hasChanges}
          iconName="Save"
          iconPosition="left"
        >
          Enregistrer la Configuration
        </Button>
      </div>
    </div>
  );
};

export default StorageQuotaSection;