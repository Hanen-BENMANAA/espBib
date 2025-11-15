import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const DraftAutoSave = ({ formData, uploadedFile, onManualSave }) => {
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving', 'saved', 'error', 'unsaved'
  const [lastSaved, setLastSaved] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Auto-save every 2 minutes
  useEffect(() => {
    if (!autoSaveEnabled) return;

    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges()) {
        performAutoSave();
      }
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(autoSaveInterval);
  }, [formData, uploadedFile, autoSaveEnabled]);

  // Check for unsaved changes
  const hasUnsavedChanges = () => {
    const savedData = localStorage.getItem('esprim_draft_data');
    const currentData = JSON.stringify({ formData, uploadedFile: uploadedFile?.name });
    return savedData !== currentData;
  };

  // Perform auto-save
  const performAutoSave = async () => {
    setSaveStatus('saving');
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage (in real app, this would be an API call)
      const draftData = {
        formData,
        uploadedFile: uploadedFile ? {
          name: uploadedFile?.name,
          size: uploadedFile?.size,
          type: uploadedFile?.type,
          lastModified: uploadedFile?.lastModified
        } : null,
        savedAt: new Date()?.toISOString(),
        version: Date.now()
      };
      
      localStorage.setItem('esprim_draft_data', JSON.stringify(draftData));
      localStorage.setItem('esprim_draft_timestamp', Date.now()?.toString());
      
      setSaveStatus('saved');
      setLastSaved(new Date());
    } catch (error) {
      setSaveStatus('error');
      console.error('Auto-save failed:', error);
    }
  };

  // Manual save
  const handleManualSave = async () => {
    setSaveStatus('saving');
    
    try {
      await performAutoSave();
      if (onManualSave) {
        onManualSave();
      }
    } catch (error) {
      setSaveStatus('error');
    }
  };

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('esprim_draft_data');
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setLastSaved(new Date(draftData.savedAt));
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, []);

  // Format time ago
  const formatTimeAgo = (date) => {
    if (!date) return 'Jamais';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  };

  const getStatusConfig = () => {
    switch (saveStatus) {
      case 'saving':
        return {
          icon: 'Loader2',
          text: 'Sauvegarde...',
          color: 'text-accent',
          bgColor: 'bg-accent/10',
          animate: true
        };
      case 'saved':
        return {
          icon: 'Check',
          text: 'Sauvegardé',
          color: 'text-success',
          bgColor: 'bg-success/10',
          animate: false
        };
      case 'error':
        return {
          icon: 'AlertCircle',
          text: 'Erreur de sauvegarde',
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          animate: false
        };
      default:
        return {
          icon: 'Clock',
          text: 'Non sauvegardé',
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          animate: false
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="space-y-4">
      {/* Auto-save Status */}
      <div className={`flex items-center justify-between p-3 rounded-academic ${statusConfig?.bgColor}`}>
        <div className="flex items-center space-x-3">
          <Icon 
            name={statusConfig?.icon} 
            size={16} 
            className={`${statusConfig?.color} ${statusConfig?.animate ? 'animate-spin' : ''}`} 
          />
          <div>
            <p className={`text-sm font-medium ${statusConfig?.color}`}>
              {statusConfig?.text}
            </p>
            <p className="text-xs text-muted-foreground">
              Dernière sauvegarde: {formatTimeAgo(lastSaved)}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleManualSave}
          disabled={saveStatus === 'saving'}
          className="text-xs text-primary hover:text-primary/80 font-medium academic-transition disabled:opacity-50"
        >
          Sauvegarder maintenant
        </button>
      </div>
      {/* Auto-save Settings */}
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-academic">
        <div className="flex items-center space-x-3">
          <Icon name="Settings" size={16} className="text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Sauvegarde automatique
            </p>
            <p className="text-xs text-muted-foreground">
              Sauvegarde toutes les 2 minutes
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full academic-transition ${
            autoSaveEnabled ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white academic-transition ${
              autoSaveEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      {/* Draft Information */}
      <div className="text-xs text-muted-foreground space-y-1">
        <div className="flex items-center space-x-2">
          <Icon name="Info" size={12} />
          <span>Les brouillons sont conservés pendant 30 jours</span>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="Shield" size={12} />
          <span>Vos données sont sauvegardées de manière sécurisée</span>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="Clock" size={12} />
          <span>Sauvegarde automatique toutes les 2 minutes si activée</span>
        </div>
      </div>
      {/* Draft Recovery (if available) */}
      {lastSaved && (
        <div className="p-3 bg-accent/10 border border-accent/20 rounded-academic">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="RotateCcw" size={16} className="text-accent" />
            <p className="text-sm font-medium text-accent">
              Brouillon disponible
            </p>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Un brouillon de ce rapport a été sauvegardé le {lastSaved?.toLocaleDateString('fr-FR')} à {lastSaved?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.
          </p>
          <div className="flex space-x-2">
            <button className="text-xs text-accent hover:text-accent/80 font-medium academic-transition">
              Restaurer le brouillon
            </button>
            <button className="text-xs text-muted-foreground hover:text-foreground academic-transition">
              Supprimer le brouillon
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftAutoSave;