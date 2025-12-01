import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const WatermarkCustomizationSection = ({ onSave }) => {
  const [watermarkSettings, setWatermarkSettings] = useState({
    enabled: true,
    opacity: 15,  
    position: 'diagonal',
    fontSize: 12,
    color: '#64748B',
    includeUserInfo: true,
    includeTimestamp: true,
    includeInstitution: true,
    customText: 'ESPRIM - Confidentiel',
    rotation: -45,
    spacing: 200
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (key, value) => {
    setWatermarkSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave('watermark', watermarkSettings);
    setHasChanges(false);
  };

  const positionOptions = [
    { value: 'diagonal', label: 'Diagonale (recommandé)' },
    { value: 'center', label: 'Centre' },
    { value: 'corners', label: 'Coins' },
    { value: 'grid', label: 'Grille' }
  ];

  const colorOptions = [
    { value: '#64748B', label: 'Gris (par défaut)' },
    { value: '#94A3B8', label: 'Gris clair' },
    { value: '#475569', label: 'Gris foncé' },
    { value: '#DC2626', label: 'Rouge' },
    { value: '#1E3A8A', label: 'Bleu ESPRIM' }
  ];

  const generatePreviewWatermark = () => {
    const elements = [];
    
    if (watermarkSettings?.includeInstitution) {
      elements?.push('ESPRIM');
    }
    
    if (watermarkSettings?.customText) {
      elements?.push(watermarkSettings?.customText);
    }
    
    if (watermarkSettings?.includeUserInfo) {
      elements?.push('Marie Dubois - Étudiant');
    }
    
    if (watermarkSettings?.includeTimestamp) {
      elements?.push('14/11/2024 20:49');
    }
    
    return elements?.join(' • ');
  };

  return (
    <div className="space-y-6">
      {/* Watermark Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Icon name="Image" size={20} className="text-primary" />
          <h3 className="text-lg font-heading font-medium text-text-primary">
            Configuration du Filigrane
          </h3>
        </div>
        
        <div className="space-y-4">
          <Checkbox
            label="Activer le filigrane"
            description="Appliquer un filigrane sur tous les documents PDF"
            checked={watermarkSettings?.enabled}
            onChange={(e) => handleSettingChange('enabled', e?.target?.checked)}
          />
          
          {watermarkSettings?.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-accent/20">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Opacité ({watermarkSettings?.opacity}%)
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={watermarkSettings?.opacity}
                  onChange={(e) => handleSettingChange('opacity', parseInt(e?.target?.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-text-secondary mt-1">
                  <span>5%</span>
                  <span>30%</span>
                </div>
              </div>
              
              <Select
                label="Position"
                options={positionOptions}
                value={watermarkSettings?.position}
                onChange={(value) => handleSettingChange('position', value)}
              />
              
              <Input
                label="Taille de police"
                type="number"
                min="8"
                max="20"
                value={watermarkSettings?.fontSize}
                onChange={(e) => handleSettingChange('fontSize', parseInt(e?.target?.value))}
              />
              
              <Select
                label="Couleur"
                options={colorOptions}
                value={watermarkSettings?.color}
                onChange={(value) => handleSettingChange('color', value)}
              />
              
              <Input
                label="Rotation (degrés)"
                type="number"
                min="-90"
                max="90"
                value={watermarkSettings?.rotation}
                onChange={(e) => handleSettingChange('rotation', parseInt(e?.target?.value))}
              />
              
              <Input
                label="Espacement (px)"
                type="number"
                min="100"
                max="400"
                value={watermarkSettings?.spacing}
                onChange={(e) => handleSettingChange('spacing', parseInt(e?.target?.value))}
              />
            </div>
          )}
        </div>
      </div>
      {/* Content Settings */}
      {watermarkSettings?.enabled && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Icon name="Type" size={20} className="text-primary" />
            <h3 className="text-lg font-heading font-medium text-text-primary">
              Contenu du Filigrane
            </h3>
          </div>
          
          <div className="space-y-4">
            <Input
              label="Texte personnalisé"
              value={watermarkSettings?.customText}
              onChange={(e) => handleSettingChange('customText', e?.target?.value)}
              placeholder="Texte à afficher dans le filigrane"
            />
            
            <div className="space-y-3">
              <Checkbox
                label="Inclure les informations utilisateur"
                description="Nom et rôle de l'utilisateur consultant le document"
                checked={watermarkSettings?.includeUserInfo}
                onChange={(e) => handleSettingChange('includeUserInfo', e?.target?.checked)}
              />
              
              <Checkbox
                label="Inclure l'horodatage"
                description="Date et heure de consultation"
                checked={watermarkSettings?.includeTimestamp}
                onChange={(e) => handleSettingChange('includeTimestamp', e?.target?.checked)}
              />
              
              <Checkbox
                label="Inclure le nom de l'institution"
                description="ESPRIM - École Supérieure Privée d'Ingénierie"
                checked={watermarkSettings?.includeInstitution}
                onChange={(e) => handleSettingChange('includeInstitution', e?.target?.checked)}
              />
            </div>
          </div>
        </div>
      )}
      {/* Preview */}
      {watermarkSettings?.enabled && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Icon name="Eye" size={20} className="text-primary" />
            <h3 className="text-lg font-heading font-medium text-text-primary">
              Aperçu du Filigrane
            </h3>
          </div>
          
          <div className="relative bg-muted rounded-lg h-64 overflow-hidden">
            {/* Simulated PDF background */}
            <div className="absolute inset-0 bg-white m-4 rounded shadow-academic-lg">
              <div className="p-6 space-y-3">
                <div className="h-4 bg-text-secondary/20 rounded w-3/4"></div>
                <div className="h-4 bg-text-secondary/20 rounded w-full"></div>
                <div className="h-4 bg-text-secondary/20 rounded w-2/3"></div>
                <div className="h-4 bg-text-secondary/20 rounded w-5/6"></div>
              </div>
              
              {/* Watermark overlay */}
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  transform: `rotate(${watermarkSettings?.rotation}deg)`,
                  opacity: watermarkSettings?.opacity / 100
                }}
              >
                <div 
                  className="text-center font-mono whitespace-nowrap"
                  style={{ 
                    color: watermarkSettings?.color,
                    fontSize: `${watermarkSettings?.fontSize}px`
                  }}
                >
                  {generatePreviewWatermark()}
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-sm font-caption text-text-secondary mt-3">
            Aperçu du filigrane tel qu'il apparaîtra sur les documents PDF
          </p>
        </div>
      )}
      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-2 text-sm font-caption text-text-secondary">
          <Icon name="Shield" size={16} />
          <span>Le filigrane protège contre la copie non autorisée</span>
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

export default WatermarkCustomizationSection;