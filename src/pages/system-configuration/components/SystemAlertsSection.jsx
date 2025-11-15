import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const SystemAlertsSection = ({ onSave }) => {
  const [alertSettings, setAlertSettings] = useState({
    suspiciousLoginAttempts: 5,
    multipleSessionAlert: true,
    downloadAttemptAlert: true,
    unusualAccessPattern: true,
    storageThresholdAlert: 80,
    validationDelayAlert: 7,
    emailNotifications: true,
    smsNotifications: false,
    adminDashboardAlert: true,
    logRetentionDays: 730
  });

  const [alertRules] = useState([
    {
      id: 1,
      name: 'Tentatives de connexion suspectes',
      description: 'Détecte les tentatives de connexion multiples échouées',
      severity: 'high',
      enabled: true,
      threshold: '5 tentatives en 10 minutes'
    },
    {
      id: 2,
      name: 'Accès depuis une nouvelle IP',
      description: 'Alerte lors d\'un accès depuis une adresse IP inconnue',
      severity: 'medium',
      enabled: true,
      threshold: 'Première connexion'
    },
    {
      id: 3,
      name: 'Téléchargement massif',
      description: 'Détecte les tentatives de téléchargement en masse',
      severity: 'high',
      enabled: true,
      threshold: '10 documents en 1 heure'
    },
    {
      id: 4,
      name: 'Session prolongée',
      description: 'Alerte pour les sessions anormalement longues',
      severity: 'low',
      enabled: false,
      threshold: '4 heures continues'
    },
    {
      id: 5,
      name: 'Accès hors horaires',
      description: 'Connexions en dehors des heures normales',
      severity: 'medium',
      enabled: true,
      threshold: '22h00 - 06h00'
    }
  ]);

  const [recentAlerts] = useState([
    {
      id: 1,
      type: 'Tentatives de connexion suspectes',
      user: 'user@external.com',
      timestamp: '2024-11-14 20:30:15',
      severity: 'high',
      status: 'active',
      details: '7 tentatives échouées depuis 192.168.1.100'
    },
    {
      id: 2,
      type: 'Nouvelle IP détectée',
      user: 'marie.dubois@esprim.tn',
      timestamp: '2024-11-14 19:45:22',
      severity: 'medium',
      status: 'resolved',
      details: 'Connexion depuis 10.0.0.50 (première fois)'
    },
    {
      id: 3,
      type: 'Seuil de stockage atteint',
      user: 'Système',
      timestamp: '2024-11-14 18:20:10',
      severity: 'medium',
      status: 'active',
      details: 'Utilisation à 85% de la capacité totale'
    }
  ]);

  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (key, value) => {
    setAlertSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave('alerts', alertSettings);
    setHasChanges(false);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-error bg-error/10 border-error/20';
      case 'medium': return 'text-warning bg-warning/10 border-warning/20';
      case 'low': return 'text-accent bg-accent/10 border-accent/20';
      default: return 'text-text-secondary bg-muted border-border';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-error bg-error/10';
      case 'resolved': return 'text-success bg-success/10';
      case 'investigating': return 'text-warning bg-warning/10';
      default: return 'text-text-secondary bg-muted';
    }
  };

  const retentionOptions = [
    { value: 365, label: '1 an' },
    { value: 730, label: '2 ans (recommandé)' },
    { value: 1095, label: '3 ans' },
    { value: 1825, label: '5 ans' }
  ];

  return (
    <div className="space-y-6">
      {/* Alert Configuration */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Icon name="AlertTriangle" size={20} className="text-primary" />
          <h3 className="text-lg font-heading font-medium text-text-primary">
            Configuration des Alertes
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Tentatives de connexion suspectes"
            type="number"
            min="3"
            max="10"
            description="Nombre d'échecs avant alerte"
            value={alertSettings?.suspiciousLoginAttempts}
            onChange={(e) => handleSettingChange('suspiciousLoginAttempts', parseInt(e?.target?.value))}
          />
          
          <Input
            label="Seuil de stockage (%)"
            type="number"
            min="70"
            max="95"
            description="Déclencher une alerte de stockage"
            value={alertSettings?.storageThresholdAlert}
            onChange={(e) => handleSettingChange('storageThresholdAlert', parseInt(e?.target?.value))}
          />
          
          <Input
            label="Délai de validation (jours)"
            type="number"
            min="3"
            max="14"
            description="Alerte si validation en retard"
            value={alertSettings?.validationDelayAlert}
            onChange={(e) => handleSettingChange('validationDelayAlert', parseInt(e?.target?.value))}
          />
          
          <Select
            label="Rétention des logs"
            description="Durée de conservation des journaux"
            options={retentionOptions}
            value={alertSettings?.logRetentionDays}
            onChange={(value) => handleSettingChange('logRetentionDays', value)}
          />
        </div>
      </div>
      {/* Notification Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Icon name="Bell" size={20} className="text-primary" />
          <h3 className="text-lg font-heading font-medium text-text-primary">
            Méthodes de Notification
          </h3>
        </div>
        
        <div className="space-y-4">
          <Checkbox
            label="Notifications par email"
            description="Envoyer les alertes par email aux administrateurs"
            checked={alertSettings?.emailNotifications}
            onChange={(e) => handleSettingChange('emailNotifications', e?.target?.checked)}
          />
          
          <Checkbox
            label="Notifications SMS"
            description="Envoyer les alertes critiques par SMS"
            checked={alertSettings?.smsNotifications}
            onChange={(e) => handleSettingChange('smsNotifications', e?.target?.checked)}
          />
          
          <Checkbox
            label="Alertes dans le tableau de bord"
            description="Afficher les alertes dans l'interface administrateur"
            checked={alertSettings?.adminDashboardAlert}
            onChange={(e) => handleSettingChange('adminDashboardAlert', e?.target?.checked)}
          />
        </div>
      </div>
      {/* Alert Rules */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Icon name="Shield" size={20} className="text-primary" />
          <h3 className="text-lg font-heading font-medium text-text-primary">
            Règles de Sécurité
          </h3>
        </div>
        
        <div className="space-y-3">
          {alertRules?.map(rule => (
            <div key={rule?.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${rule?.enabled ? 'bg-success' : 'bg-error'}`} />
                  <span className={`px-2 py-1 text-xs font-caption rounded border ${getSeverityColor(rule?.severity)}`}>
                    {rule?.severity === 'high' ? 'Élevé' : rule?.severity === 'medium' ? 'Moyen' : 'Faible'}
                  </span>
                </div>
                
                <div>
                  <p className="font-medium text-text-primary">{rule?.name}</p>
                  <p className="text-sm font-caption text-text-secondary">{rule?.description}</p>
                  <p className="text-xs font-caption text-text-secondary mt-1">
                    Seuil: {rule?.threshold}
                  </p>
                </div>
              </div>
              
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  rule?.enabled ? 'bg-success' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    rule?.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Recent Alerts */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Icon name="Activity" size={20} className="text-primary" />
            <h3 className="text-lg font-heading font-medium text-text-primary">
              Alertes Récentes
            </h3>
          </div>
          
          <Button
            variant="outline"
            iconName="RefreshCw"
            iconPosition="left"
          >
            Actualiser
          </Button>
        </div>
        
        <div className="space-y-3">
          {recentAlerts?.map(alert => (
            <div key={alert?.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-center space-y-1">
                  <Icon name="AlertCircle" size={16} className="text-warning" />
                  <span className={`px-2 py-1 text-xs font-caption rounded ${getStatusColor(alert?.status)}`}>
                    {alert?.status === 'active' ? 'Actif' : alert?.status === 'resolved' ? 'Résolu' : 'En cours'}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-text-primary">{alert?.type}</p>
                    <span className={`px-2 py-1 text-xs font-caption rounded border ${getSeverityColor(alert?.severity)}`}>
                      {alert?.severity === 'high' ? 'Élevé' : alert?.severity === 'medium' ? 'Moyen' : 'Faible'}
                    </span>
                  </div>
                  <p className="text-sm font-caption text-text-secondary">{alert?.user}</p>
                  <p className="text-xs font-caption text-text-secondary mt-1">{alert?.details}</p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-caption text-text-secondary">{alert?.timestamp}</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  iconName="Eye"
                />
                
                {alert?.status === 'active' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    iconName="Check"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-2 text-sm font-caption text-text-secondary">
          <Icon name="Info" size={16} />
          <span>Les alertes sont vérifiées en temps réel</span>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            iconName="TestTube"
            iconPosition="left"
          >
            Tester les Alertes
          </Button>
          
          <Button
            variant="default"
            onClick={handleSave}
            disabled={!hasChanges}
            iconName="Save"
            iconPosition="left"
          >
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SystemAlertsSection;