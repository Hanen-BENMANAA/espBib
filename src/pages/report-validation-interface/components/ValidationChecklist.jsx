import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';

const ValidationChecklist = ({ 
  reportData, 
  onChecklistUpdate, 
  checklistData = {},
  isReadOnly = false 
}) => {
  const [checklist, setChecklist] = useState({
    academicStandards: {
      titlePage: checklistData?.academicStandards?.titlePage || false,
      abstract: checklistData?.academicStandards?.abstract || false,
      introduction: checklistData?.academicStandards?.introduction || false,
      methodology: checklistData?.academicStandards?.methodology || false,
      results: checklistData?.academicStandards?.results || false,
      conclusion: checklistData?.academicStandards?.conclusion || false,
      bibliography: checklistData?.academicStandards?.bibliography || false
    },
    formatting: {
      pageNumbers: checklistData?.formatting?.pageNumbers || false,
      margins: checklistData?.formatting?.margins || false,
      fontConsistency: checklistData?.formatting?.fontConsistency || false,
      headingStructure: checklistData?.formatting?.headingStructure || false,
      figuresCaptions: checklistData?.formatting?.figuresCaptions || false,
      tableFormatting: checklistData?.formatting?.tableFormatting || false
    },
    contentQuality: {
      originalityCheck: checklistData?.contentQuality?.originalityCheck || false,
      technicalAccuracy: checklistData?.contentQuality?.technicalAccuracy || false,
      languageQuality: checklistData?.contentQuality?.languageQuality || false,
      citationAccuracy: checklistData?.contentQuality?.citationAccuracy || false,
      dataValidation: checklistData?.contentQuality?.dataValidation || false,
      ethicalCompliance: checklistData?.contentQuality?.ethicalCompliance || false
    }
  });

  const checklistSections = [
    {
      id: 'academicStandards',
      title: 'Standards Académiques',
      icon: 'GraduationCap',
      items: [
        { key: 'titlePage', label: 'Page de titre complète et conforme', required: true },
        { key: 'abstract', label: 'Résumé présent et pertinent', required: true },
        { key: 'introduction', label: 'Introduction claire et structurée', required: true },
        { key: 'methodology', label: 'Méthodologie détaillée et justifiée', required: true },
        { key: 'results', label: 'Résultats présentés clairement', required: true },
        { key: 'conclusion', label: 'Conclusion cohérente avec les objectifs', required: true },
        { key: 'bibliography', label: 'Bibliographie complète et formatée', required: true }
      ]
    },
    {
      id: 'formatting',
      title: 'Mise en Forme',
      icon: 'Layout',
      items: [
        { key: 'pageNumbers', label: 'Numérotation des pages correcte', required: true },
        { key: 'margins', label: 'Marges conformes aux standards', required: true },
        { key: 'fontConsistency', label: 'Police et taille cohérentes', required: true },
        { key: 'headingStructure', label: 'Hiérarchie des titres respectée', required: true },
        { key: 'figuresCaptions', label: 'Figures et légendes numérotées', required: false },
        { key: 'tableFormatting', label: 'Tableaux correctement formatés', required: false }
      ]
    },
    {
      id: 'contentQuality',
      title: 'Qualité du Contenu',
      icon: 'CheckCircle2',
      items: [
        { key: 'originalityCheck', label: 'Vérification d\'originalité effectuée', required: true },
        { key: 'technicalAccuracy', label: 'Précision technique validée', required: true },
        { key: 'languageQuality', label: 'Qualité linguistique acceptable', required: true },
        { key: 'citationAccuracy', label: 'Citations et références exactes', required: true },
        { key: 'dataValidation', label: 'Données et calculs vérifiés', required: false },
        { key: 'ethicalCompliance', label: 'Conformité éthique respectée', required: true }
      ]
    }
  ];

  const getSectionProgress = (sectionId) => {
    const section = checklist?.[sectionId];
    const sectionConfig = checklistSections?.find(s => s?.id === sectionId);
    const requiredItems = sectionConfig?.items?.filter(item => item?.required);
    const completedRequired = requiredItems?.filter(item => section?.[item?.key])?.length;
    
    return {
      completed: completedRequired,
      total: requiredItems?.length,
      percentage: Math.round((completedRequired / requiredItems?.length) * 100)
    };
  };

  const getOverallProgress = () => {
    let totalRequired = 0;
    let totalCompleted = 0;
    
    checklistSections?.forEach(section => {
      const progress = getSectionProgress(section?.id);
      totalRequired += progress?.total;
      totalCompleted += progress?.completed;
    });
    
    return {
      completed: totalCompleted,
      total: totalRequired,
      percentage: Math.round((totalCompleted / totalRequired) * 100)
    };
  };

  // CORRECTION: Envoyer les données avec le pourcentage au parent
  const handleCheckboxChange = (sectionId, itemKey, checked) => {
    if (isReadOnly) return;

    const updatedChecklist = {
      ...checklist,
      [sectionId]: {
        ...checklist?.[sectionId],
        [itemKey]: checked
      }
    };
    
    setChecklist(updatedChecklist);
    
    // Calculer la progression AVANT d'envoyer au parent
    let totalRequired = 0;
    let totalCompleted = 0;
    
    checklistSections?.forEach(section => {
      const sectionData = updatedChecklist?.[section?.id];
      const sectionConfig = checklistSections?.find(s => s?.id === section?.id);
      const requiredItems = sectionConfig?.items?.filter(item => item?.required);
      const completedRequired = requiredItems?.filter(item => sectionData?.[item?.key])?.length;
      
      totalRequired += requiredItems?.length;
      totalCompleted += completedRequired;
    });
    
    const percentage = Math.round((totalCompleted / totalRequired) * 100);
    
    // Envoyer les données ET le pourcentage
    onChecklistUpdate({
      checklist: updatedChecklist,
      progress: {
        completed: totalCompleted,
        total: totalRequired,
        percentage: percentage
      }
    });
  };

  // CORRECTION: Notifier le parent avec la progression calculée des données initiales
  useEffect(() => {
    // Calculer la progression avec les données qui viennent du backend (checklistData prop)
    let totalRequired = 0;
    let totalCompleted = 0;
    
    checklistSections?.forEach(section => {
      const sectionData = checklist?.[section?.id]; // Utilise checklist (state local initialisé)
      const sectionConfig = checklistSections?.find(s => s?.id === section?.id);
      const requiredItems = sectionConfig?.items?.filter(item => item?.required);
      const completedRequired = requiredItems?.filter(item => sectionData?.[item?.key])?.length;
      
      totalRequired += requiredItems?.length;
      totalCompleted += completedRequired;
    });
    
    const percentage = totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0;
    
    // Envoyer la progression calculée au parent
    onChecklistUpdate({
      checklist: checklist,
      progress: {
        completed: totalCompleted,
        total: totalRequired,
        percentage: percentage
      }
    });
  }, []); // Exécute une seule fois au montage, avec les données initiales

  const overallProgress = getOverallProgress();

  return (
    <div className="bg-surface border border-border rounded-lg shadow-academic">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-medium text-text-primary flex items-center space-x-2">
            <Icon name="CheckSquare" size={20} className="text-accent" />
            <span>Liste de Validation</span>
          </h3>
          {isReadOnly && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-muted rounded-lg">
              <Icon name="Lock" size={14} className="text-text-secondary" />
              <span className="text-sm font-caption text-text-secondary">Lecture seule</span>
            </div>
          )}
        </div>
        
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-caption text-text-secondary">Progression globale</span>
            <span className="font-medium text-text-primary">
              {overallProgress?.completed}/{overallProgress?.total} ({overallProgress?.percentage}%)
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-accent rounded-full h-2 transition-all duration-300"
              style={{ width: `${overallProgress?.percentage}%` }}
            />
          </div>
        </div>
      </div>
      {/* Checklist Sections */}
      <div className="p-4 space-y-6">
        {checklistSections?.map((section) => {
          const progress = getSectionProgress(section?.id);
          
          return (
            <div key={section?.id} className="space-y-3">
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-medium text-text-primary flex items-center space-x-2">
                  <Icon name={section?.icon} size={18} className="text-accent" />
                  <span>{section?.title}</span>
                </h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-caption text-text-secondary">
                    {progress?.completed}/{progress?.total}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${
                    progress?.percentage === 100 ? 'bg-success' : 
                    progress?.percentage > 0 ? 'bg-warning' : 'bg-error'
                  }`} />
                </div>
              </div>
              {/* Section Progress Bar */}
              <div className="w-full bg-muted rounded-full h-1.5">
                <div 
                  className={`rounded-full h-1.5 transition-all duration-300 ${
                    progress?.percentage === 100 ? 'bg-success' : 
                    progress?.percentage > 0 ? 'bg-warning' : 'bg-error'
                  }`}
                  style={{ width: `${progress?.percentage}%` }}
                />
              </div>
              {/* Checklist Items */}
              <div className="space-y-2">
                {section?.items?.map((item) => (
                  <div key={item?.key} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-academic">
                    <Checkbox
                      checked={checklist?.[section?.id]?.[item?.key]}
                      onChange={(e) => handleCheckboxChange(section?.id, item?.key, e?.target?.checked)}
                      disabled={isReadOnly}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${
                          checklist?.[section?.id]?.[item?.key] 
                            ? 'text-text-primary line-through' :'text-text-primary'
                        }`}>
                          {item?.label}
                        </span>
                        {item?.required && (
                          <span className="text-xs font-caption text-error">*</span>
                        )}
                      </div>
                    </div>
                    {checklist?.[section?.id]?.[item?.key] && (
                      <Icon name="Check" size={16} className="text-success mt-0.5" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-sm font-caption">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-error">*</span>
              <span className="text-text-secondary">Critères obligatoires</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Info" size={14} className="text-accent" />
              <span className="text-text-secondary">
                {overallProgress?.percentage === 100 ? 'Validation complète' : 'Validation en cours'}
              </span>
            </div>
          </div>
          
          {!isReadOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const resetChecklist = {};
                checklistSections?.forEach(section => {
                  resetChecklist[section.id] = {};
                  section?.items?.forEach(item => {
                    resetChecklist[section.id][item.key] = false;
                  });
                });
                setChecklist(resetChecklist);
                onChecklistUpdate({
                  checklist: resetChecklist,
                  progress: {
                    completed: 0,
                    total: getOverallProgress().total,
                    percentage: 0
                  }
                });
              }}
            >
              <Icon name="RotateCcw" size={14} className="mr-2" />
              Réinitialiser
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidationChecklist;