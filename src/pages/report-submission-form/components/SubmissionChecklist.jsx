import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';

const SubmissionChecklist = ({ formData, uploadedFile, onChecklistChange }) => {
  const [checkedItems, setCheckedItems] = useState({});
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const checklistItems = [
    {
      id: 'title',
      category: 'Métadonnées',
      label: 'Titre du rapport renseigné',
      description: 'Le titre doit être descriptif et précis',
      required: true,
      autoCheck: () => formData?.title && formData?.title?.length >= 10
    },
    {
      id: 'author',
      category: 'Métadonnées',
      label: 'Informations auteur complètes',
      description: 'Prénom, nom, et numéro d\'étudiant',
      required: true,
      autoCheck: () => formData?.authorFirstName && formData?.authorLastName && formData?.studentNumber
    },
    {
      id: 'supervisor',
      category: 'Métadonnées',
      label: 'Encadrant sélectionné',
      description: 'Encadrant principal obligatoire',
      required: true,
      autoCheck: () => formData?.supervisor
    },
    {
      id: 'academic',
      category: 'Métadonnées',
      label: 'Informations académiques',
      description: 'Spécialité et année académique',
      required: true,
      autoCheck: () => formData?.specialty && formData?.academicYear
    },
    {
      id: 'keywords',
      category: 'Métadonnées',
      label: 'Mots-clés (minimum 3)',
      description: 'Au moins 3 mots-clés pertinents',
      required: true,
      autoCheck: () => formData?.keywords && formData?.keywords?.length >= 3
    },
    {
      id: 'abstract',
      category: 'Métadonnées',
      label: 'Résumé détaillé',
      description: 'Minimum 200 caractères',
      required: true,
      autoCheck: () => formData?.abstract && formData?.abstract?.length >= 200
    },
    {
      id: 'defense_date',
      category: 'Métadonnées',
      label: 'Date de soutenance',
      description: 'Date de présentation du projet',
      required: true,
      autoCheck: () => formData?.defenseDate
    },
    {
      id: 'file_upload',
      category: 'Fichier',
      label: 'Fichier PDF téléchargé',
      description: 'Document principal au format PDF',
      required: true,
      autoCheck: () => uploadedFile
    },
    {
      id: 'file_size',
      category: 'Fichier',
      label: 'Taille de fichier valide',
      description: 'Fichier inférieur à 50MB',
      required: true,
      autoCheck: () => uploadedFile && uploadedFile?.size <= 50 * 1024 * 1024
    },
    {
      id: 'graphic_charter',
      category: 'Qualité',
      label: 'Charte graphique ESPRIM respectée',
      description: 'Logo, couleurs, et mise en page conformes',
      required: true,
      autoCheck: () => false // Manual check required
    },
    {
      id: 'page_numbering',
      category: 'Qualité',
      label: 'Numérotation des pages',
      description: 'Toutes les pages sont numérotées',
      required: true,
      autoCheck: () => false // Manual check required
    },
    {
      id: 'bibliography',
      category: 'Qualité',
      label: 'Bibliographie présente',
      description: 'Sources et références citées',
      required: true,
      autoCheck: () => false // Manual check required
    },
    {
      id: 'cover_page',
      category: 'Qualité',
      label: 'Page de garde complète',
      description: 'Titre, auteur, encadrant, date, logo ESPRIM',
      required: true,
      autoCheck: () => false // Manual check required
    },
    {
      id: 'content_quality',
      category: 'Qualité',
      label: 'Qualité du contenu vérifiée',
      description: 'Orthographe, grammaire, et structure',
      required: true,
      autoCheck: () => false // Manual check required
    },
    {
      id: 'plagiarism_check',
      category: 'Qualité',
      label: 'Vérification anti-plagiat',
      description: 'Contenu original et sources citées',
      required: true,
      autoCheck: () => false // Manual check required
    }
  ];

  // ✅ CORRECTION: Gérer les changements de checkbox et notifier le parent immédiatement
  const handleCheckboxChange = (itemId, checked) => {
    setCheckedItems(prevItems => {
      const newCheckedItems = { ...prevItems, [itemId]: checked };
      // Notifier le parent immédiatement avec les nouvelles données
      onChecklistChange(newCheckedItems);
      return newCheckedItems;
    });
  };

  // ✅ CORRECTION: Recalculer le pourcentage à chaque changement de checkedItems
  useEffect(() => {
    const totalItems = checklistItems.length;
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
    const percentage = Math.round((checkedCount / totalItems) * 100);
    setCompletionPercentage(percentage);
    
    console.log(`[Checklist] ${checkedCount}/${totalItems} items checked (${percentage}%)`);
  }, [checkedItems]);

  // ✅ CORRECTION: Auto-check basé sur formData et uploadedFile
  useEffect(() => {
    const newCheckedItems = { ...checkedItems };
    let hasChanges = false;

    checklistItems.forEach(item => {
      const shouldBeChecked = item.autoCheck();
      const currentlyChecked = newCheckedItems[item.id];
      
      // Auto-cocher si la condition est remplie et pas déjà coché
      if (shouldBeChecked && !currentlyChecked) {
        newCheckedItems[item.id] = true;
        hasChanges = true;
      }
      // Décocher si la condition n'est plus remplie (seulement pour les items auto)
      else if (!shouldBeChecked && currentlyChecked && item.autoCheck() !== false) {
        // Ne décocher que si c'était un auto-check (pas un check manuel)
        const isAutoCheckable = item.autoCheck !== (() => false);
        if (isAutoCheckable) {
          newCheckedItems[item.id] = false;
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setCheckedItems(newCheckedItems);
      onChecklistChange(newCheckedItems);
    }
  }, [formData, uploadedFile]);

  const groupedItems = checklistItems.reduce((groups, item) => {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
    return groups;
  }, {});

  const getCompletionColor = () => {
    if (completionPercentage >= 100) return 'text-success';
    if (completionPercentage >= 75) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getProgressBarColor = () => {
    if (completionPercentage >= 100) return 'bg-success';
    if (completionPercentage >= 75) return 'bg-warning';
    return 'bg-primary';
  };

  // Calculer le nombre d'éléments restants
  const totalItems = checklistItems.length;
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const remainingItems = totalItems - checkedCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-medium text-foreground">
          Liste de Vérification
        </h3>
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${getCompletionColor()}`}>
            {completionPercentage}%
          </span>
          <Icon 
            name={completionPercentage >= 100 ? "CheckCircle" : "Clock"} 
            size={16} 
            className={getCompletionColor()} 
          />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full academic-transition ${getProgressBarColor()}`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {checkedCount} sur {totalItems} éléments complétés
        </p>
      </div>

      {/* Checklist Items by Category */}
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center space-x-2">
              <Icon 
                name={
                  category === 'Métadonnées' ? 'FileText' :
                  category === 'Fichier' ? 'Upload' : 'CheckCircle'
                } 
                size={16} 
                className="text-primary" 
              />
              <span>{category}</span>
              <span className="text-xs text-muted-foreground">
                ({items.filter(item => checkedItems[item.id]).length}/{items.length})
              </span>
            </h4>
            
            <div className="space-y-2">
              {items.map(item => {
                const isChecked = checkedItems[item.id] || false;
                const isAutoChecked = item.autoCheck();
                
                return (
                  <div key={item.id} className="flex items-start space-x-3 p-3 bg-card border border-border rounded-academic">
                    <Checkbox
                      checked={isChecked}
                      onChange={(e) => handleCheckboxChange(item.id, e.target.checked)}
                      disabled={isAutoChecked && isChecked}
                      className="mt-0.5"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-foreground">
                          {item.label}
                        </p>
                        {item.required && (
                          <span className="text-xs text-destructive">*</span>
                        )}
                        {isAutoChecked && isChecked && (
                          <Icon name="Zap" size={12} className="text-accent" title="Vérifié automatiquement" />
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
          </div>
        ))}
      </div>

      {/* Submission Readiness */}
      <div className={`p-4 rounded-academic border ${
        completionPercentage >= 100 
          ? 'bg-success/10 border-success/20' 
          : 'bg-warning/10 border-warning/20'
      }`}>
        <div className="flex items-center space-x-3">
          <Icon 
            name={completionPercentage >= 100 ? "CheckCircle" : "AlertTriangle"} 
            size={20} 
            className={completionPercentage >= 100 ? "text-success" : "text-warning"} 
          />
          <div>
            <p className={`text-sm font-medium ${
              completionPercentage >= 100 ? "text-success" : "text-warning"
            }`}>
              {completionPercentage >= 100 
                ? "Prêt pour la soumission" 
                : "Éléments manquants"}
            </p>
            <p className="text-xs text-muted-foreground">
              {completionPercentage >= 100 
                ? "Tous les critères sont remplis. Vous pouvez soumettre votre rapport."
                : `Complétez les ${remainingItems} élément${remainingItems > 1 ? 's' : ''} restant${remainingItems > 1 ? 's' : ''} avant la soumission.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionChecklist;