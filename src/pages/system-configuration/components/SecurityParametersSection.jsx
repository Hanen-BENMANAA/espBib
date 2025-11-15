import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const SecurityParametersSection = ({ onSave }) => {
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 30,
    require2FA: true,
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    maxLoginAttempts: 3,
    lockoutDuration: 15,
    ipWhitelist: '',
    allowMultipleSessions: false,
    forcePasswordChange: 90
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (key, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave('security', securitySettings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setSecuritySettings({
      sessionTimeout: 30,
      require2FA: true,
      passwordMinLength: 8,
      passwordRequireSpecial: true,
      passwordRequireNumbers: true,
      passwordRequireUppercase: true,
      maxLoginAttempts: 3,
      lockoutDuration: 15,
      ipWhitelist: '',
      allowMultipleSessions: false,
      forcePasswordChange: 90
    });
    setHasChanges(false);
  };

  const timeoutOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 heure' },
    { value: 120, label: '2 heures' },
    { value: 240, label: '4 heures' }
  ];

  return (
    <div className="space-y-6">
      {/* Session Management */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Icon name="Shield" size={20} className="text-primary" />
          <h3 className="text-lg font-heading font-medium text-text-primary">
            Gestion des Sessions
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Délai d'expiration de session"
            description="Durée d'inactivité avant déconnexion automatique"
            options={timeoutOptions}
            value={securitySettings?.sessionTimeout}
            onChange={(value) => handleSettingChange('sessionTimeout', value)}
          />
          
          <div className="space-y-4">
            <Checkbox
              label="Authentification à deux facteurs obligatoire"
              description="Exiger 2FA pour tous les enseignants et administrateurs"
              checked={securitySettings?.require2FA}
              onChange={(e) => handleSettingChange('require2FA', e?.target?.checked)}
            />
            
            <Checkbox
              label="Autoriser les sessions multiples"
              description="Permettre à un utilisateur d'être connecté sur plusieurs appareils"
              checked={securitySettings?.allowMultipleSessions}
              onChange={(e) => handleSettingChange('allowMultipleSessions', e?.target?.checked)}
            />
          </div>
        </div>
      </div>
      {/* Password Policies */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Icon name="Key" size={20} className="text-primary" />
          <h3 className="text-lg font-heading font-medium text-text-primary">
            Politiques de Mot de Passe
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Longueur minimale"
            type="number"
            min="6"
            max="20"
            value={securitySettings?.passwordMinLength}
            onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e?.target?.value))}
          />
          
          <Input
            label="Changement forcé (jours)"
            type="number"
            min="30"
            max="365"
            description="0 = jamais"
            value={securitySettings?.forcePasswordChange}
            onChange={(e) => handleSettingChange('forcePasswordChange', parseInt(e?.target?.value))}
          />
          
          <div className="md:col-span-2 space-y-3">
            <Checkbox
              label="Caractères spéciaux requis"
              checked={securitySettings?.passwordRequireSpecial}
              onChange={(e) => handleSettingChange('passwordRequireSpecial', e?.target?.checked)}
            />
            
            <Checkbox
              label="Chiffres requis"
              checked={securitySettings?.passwordRequireNumbers}
              onChange={(e) => handleSettingChange('passwordRequireNumbers', e?.target?.checked)}
            />
            
            <Checkbox
              label="Majuscules requises"
              checked={securitySettings?.passwordRequireUppercase}
              onChange={(e) => handleSettingChange('passwordRequireUppercase', e?.target?.checked)}
            />
          </div>
        </div>
      </div>
      {/* Access Control */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Icon name="Lock" size={20} className="text-primary" />
          <h3 className="text-lg font-heading font-medium text-text-primary">
            Contrôle d'Accès
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Tentatives de connexion max"
            type="number"
            min="3"
            max="10"
            value={securitySettings?.maxLoginAttempts}
            onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e?.target?.value))}
          />
          
          <Input
            label="Durée de verrouillage (minutes)"
            type="number"
            min="5"
            max="60"
            value={securitySettings?.lockoutDuration}
            onChange={(e) => handleSettingChange('lockoutDuration', parseInt(e?.target?.value))}
          />
          
          <div className="md:col-span-2">
            <Input
              label="Liste blanche IP"
              type="text"
              placeholder="192.168.1.0/24, 10.0.0.0/8 (optionnel)"
              description="Adresses IP autorisées, séparées par des virgules"
              value={securitySettings?.ipWhitelist}
              onChange={(e) => handleSettingChange('ipWhitelist', e?.target?.value)}
            />
          </div>
        </div>
      </div>
      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-2 text-sm font-caption text-text-secondary">
          <Icon name="Info" size={16} />
          <span>Les modifications prennent effet immédiatement</span>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            Réinitialiser
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

export default SecurityParametersSection;