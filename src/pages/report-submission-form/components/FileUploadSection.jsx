import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FileUploadSection = ({ onFileSelect, uploadedFile, onFileRemove, uploadProgress, isUploading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null);
  const fileInputRef = useRef(null);

  const maxFileSize = 50 * 1024 * 1024; // 50MB in bytes

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === "dragenter" || e?.type === "dragover") {
      setDragActive(true);
    } else if (e?.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.[0]) {
      handleFileValidation(e?.dataTransfer?.files?.[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e?.target?.files && e?.target?.files?.[0]) {
      handleFileValidation(e?.target?.files?.[0]);
    }
  };

  const handleFileValidation = (file) => {
    setValidationStatus('validating');
    
    // File type validation
    if (file?.type !== 'application/pdf') {
      setValidationStatus('error');
      alert('Erreur: Seuls les fichiers PDF sont acceptés.');
      return;
    }

    // File size validation
    if (file?.size > maxFileSize) {
      setValidationStatus('error');
      alert('Erreur: La taille du fichier dépasse 50MB.');
      return;
    }

    // Simulate virus scanning and PDF/A validation
    setTimeout(() => {
      setValidationStatus('scanning');
      setTimeout(() => {
        setValidationStatus('success');
        onFileSelect(file);
      }, 2000);
    }, 1000);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  const getValidationStatusDisplay = () => {
    switch (validationStatus) {
      case 'validating':
        return {
          icon: 'Loader2',
          text: 'Validation du format PDF...',
          color: 'text-accent',
          bgColor: 'bg-accent/10'
        };
      case 'scanning':
        return {
          icon: 'Shield',
          text: 'Analyse antivirus en cours...',
          color: 'text-warning',
          bgColor: 'bg-warning/10'
        };
      case 'success':
        return {
          icon: 'CheckCircle',
          text: 'Fichier validé avec succès',
          color: 'text-success',
          bgColor: 'bg-success/10'
        };
      case 'error':
        return {
          icon: 'AlertCircle',
          text: 'Erreur de validation',
          color: 'text-destructive',
          bgColor: 'bg-destructive/10'
        };
      default:
        return null;
    }
  };

  const statusDisplay = getValidationStatusDisplay();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-medium text-foreground">
          Téléchargement du Rapport
        </h3>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Info" size={16} />
          <span>PDF uniquement • Max 50MB</span>
        </div>
      </div>
      {!uploadedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-academic p-8 text-center academic-transition ${
            dragActive
              ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="Upload" size={32} className="text-primary" />
            </div>
            
            <div>
              <p className="text-lg font-medium text-foreground mb-2">
                Glissez-déposez votre fichier PDF ici
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                ou cliquez pour parcourir vos fichiers
              </p>
              
              <Button
                variant="outline"
                onClick={() => fileInputRef?.current?.click()}
                iconName="FolderOpen"
                iconPosition="left"
              >
                Parcourir les fichiers
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Format accepté: PDF uniquement</p>
              <p>• Taille maximale: 50MB</p>
              <p>• Le fichier sera automatiquement scanné</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-border rounded-academic p-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-destructive/10 rounded-academic flex items-center justify-center flex-shrink-0">
              <Icon name="FileText" size={24} className="text-destructive" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-foreground truncate">
                  {uploadedFile?.name}
                </h4>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onFileRemove}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Icon name="X" size={16} />
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mb-3">
                {formatFileSize(uploadedFile?.size)} • PDF
              </p>
              
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Téléchargement...</span>
                    <span className="text-foreground font-medium">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full academic-transition"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {statusDisplay && (
        <div className={`flex items-center space-x-3 p-3 rounded-academic ${statusDisplay?.bgColor}`}>
          <Icon 
            name={statusDisplay?.icon} 
            size={20} 
            className={`${statusDisplay?.color} ${statusDisplay?.icon === 'Loader2' ? 'animate-spin' : ''}`} 
          />
          <span className={`text-sm font-medium ${statusDisplay?.color}`}>
            {statusDisplay?.text}
          </span>
        </div>
      )}
      {/* File Requirements */}
      <div className="bg-muted/50 rounded-academic p-4">
        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
          <Icon name="AlertTriangle" size={16} className="text-warning" />
          <span>Exigences du Fichier</span>
        </h4>
        <ul className="space-y-2 text-xs text-muted-foreground">
          <li className="flex items-center space-x-2">
            <Icon name="Check" size={14} className="text-success" />
            <span>Format PDF/A recommandé pour l'archivage</span>
          </li>
          <li className="flex items-center space-x-2">
            <Icon name="Check" size={14} className="text-success" />
            <span>Respecter la charte graphique ESPRIM</span>
          </li>
          <li className="flex items-center space-x-2">
            <Icon name="Check" size={14} className="text-success" />
            <span>Inclure page de garde, résumé, et bibliographie</span>
          </li>
          <li className="flex items-center space-x-2">
            <Icon name="Check" size={14} className="text-success" />
            <span>Numérotation des pages obligatoire</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FileUploadSection;