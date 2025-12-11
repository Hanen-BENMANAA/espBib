import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';

const SubmissionChecklist = ({ formData, uploadedFile, onChecklistChange }) => {
  const [checkedItems, setCheckedItems] = useState({});
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Simplified checklist - only essential items
  const checklistItems = [
    {
      id: 'metadata_complete',
      label: 'Métadonnées complètes',
      description: 'Titre, auteur, encadrant, spécialité renseignés',
      required: true,
      autoCheck: () => 
        formData?.title?.length >= 10 &&
        formData?.authorFirstName &&
        formData?.authorLastName &&
        formData?.supervisor_id &&
        formData?.specialty &&
        formData?.academicYear
    },
    {
      id: 'keywords_abstract',
      label: 'Mots-clés et résumé',
      description: 'Minimum 3 mots-clés et résumé de 200 caractères',
      required: true,
      autoCheck: () => 
        formData?.keywords?.length >= 3 &&
        formData?.abstract?.length >= 200
    },
    {
      id: 'pdf_uploaded',
      label: 'Fichier PDF téléchargé',
      description: 'Document principal (max 50MB)',
      required: true,
      autoCheck: () => uploadedFile && uploadedFile?.size <= 50 * 1024 * 1024
    },
    {
      id: 'cover_page',
      label: 'Page de garde conforme',
      description: 'Logo ESPRIM, titre, auteur, encadrant, date',
      required: true,
      autoCheck: () => false
    },
    {
      id: 'structure',
      label: 'Structure du document',
      description: 'Sommaire, introduction, développement, conclusion, bibliographie',
      required: true,
      autoCheck: () => false
    },
    {
      id: 'originality',
      label: 'Originalité vérifiée',
      description: 'Contenu original avec sources citées correctement',
      required: true,
      autoCheck: () => false
    }
  ];

  // Handle checkbox changes
  const handleCheckboxChange = (itemId, checked) => {
    setCheckedItems(prevItems => {
      const newCheckedItems = { ...prevItems, [itemId]: checked };
      onChecklistChange(newCheckedItems);
      return newCheckedItems;
    });
  };

  // Calculate completion percentage
  useEffect(() => {
    const totalItems = checklistItems.length;
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
    const percentage = Math.round((checkedCount / totalItems) * 100);
    setCompletionPercentage(percentage);
  }, [checkedItems]);

  // Auto-check items when conditions are met
  useEffect(() => {
    const newCheckedItems = { ...checkedItems };
    let hasChanges = false;

    checklistItems.forEach(item => {
      const shouldBeChecked = item.autoCheck();
      const currentlyChecked = newCheckedItems[item.id];
      
      if (shouldBeChecked !== currentlyChecked) {
        newCheckedItems[item.id] = shouldBeChecked;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setCheckedItems(newCheckedItems);
      onChecklistChange(newCheckedItems);
    }
  }, [formData, uploadedFile]);

  const totalItems = checklistItems.length;
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const remainingItems = totalItems - checkedCount;

  const getStatusColor = () => {
    if (completionPercentage >= 100) return 'text-success';
    if (completionPercentage >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getProgressColor = () => {
    if (completionPercentage >= 100) return 'bg-success';
    if (completionPercentage >= 50) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-medium text-foreground">
          Vérification Finale
        </h3>
        <div className="flex items-center space-x-2">
          <span className={`text-xl font-bold ${getStatusColor()}`}>
            {checkedCount}/{totalItems}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full bg-muted rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          {completionPercentage}% complété
        </p>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {checklistItems.map(item => {
          const isChecked = checkedItems[item.id] || false;
          const isAutoChecked = item.autoCheck();
          
          return (
            <div 
              key={item.id} 
              className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all ${
                isChecked 
                  ? 'bg-success/5 border-success/30' 
                  : 'bg-card border-border hover:border-primary/50'
              }`}
            >
              <Checkbox
                checked={isChecked}
                onChange={(e) => handleCheckboxChange(item.id, e.target.checked)}
                disabled={isAutoChecked && isChecked}
                className="mt-0.5"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <p className={`text-sm font-medium ${
                      isChecked ? 'text-success line-through' : 'text-foreground'
                    }`}>
                      {item.label}
                    </p>
                    {item.required && !isChecked && (
                      <span className="text-xs text-destructive font-bold">*</span>
                    )}
                  </div>
                  
                  {isAutoChecked && isChecked && (
                    <Icon name="Zap" size={16} className="text-accent" title="Vérifié automatiquement" />
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground mt-1">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Alert */}
      <div className={`p-4 rounded-lg border-2 flex items-start space-x-3 ${
        completionPercentage >= 100 
          ? 'bg-success/10 border-success/30' 
          : 'bg-warning/10 border-warning/30'
      }`}>
        <Icon 
          name={completionPercentage >= 100 ? "CheckCircle2" : "AlertCircle"} 
          size={24} 
          className={completionPercentage >= 100 ? "text-success flex-shrink-0" : "text-warning flex-shrink-0"} 
        />
        <div>
          <p className={`font-semibold mb-1 ${
            completionPercentage >= 100 ? "text-success" : "text-warning"
          }`}>
            {completionPercentage >= 100 
              ? "✓ Prêt pour la soumission" 
              : `⚠ ${remainingItems} élément${remainingItems > 1 ? 's' : ''} à vérifier`}
          </p>
          <p className="text-sm text-muted-foreground">
            {completionPercentage >= 100 
              ? "Tous les critères sont validés. Vous pouvez soumettre votre rapport en toute confiance."
              : "Veuillez compléter tous les points de vérification avant de soumettre votre rapport."}
          </p>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <h4 className="text-sm font-semibold text-foreground flex items-center space-x-2">
          <Icon name="Info" size={16} className="text-primary" />
          <span>Points importants</span>
        </h4>
        <ul className="text-xs text-muted-foreground space-y-1.5 ml-6">
          <li>• La page de garde doit suivre le modèle ESPRIM officiel</li>
          <li>• Toutes les sources doivent être correctement citées</li>
          <li>• Le document doit être relu et corrigé avant soumission</li>
          <li>• Les annexes doivent être numérotées et référencées</li>
        </ul>
      </div>
    </div>
  );
};

export default SubmissionChecklist;