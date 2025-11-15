import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ValidationActions = ({ 
  reportData, 
  onValidate, 
  onReject, 
  onRequestRevision,
  checklistProgress = 0,
  hasComments = false,
  isReadOnly = false 
}) => {
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionType, setDecisionType] = useState('');
  const [decisionComment, setDecisionComment] = useState('');
  const [revisionDeadline, setRevisionDeadline] = useState('');
  const [notifyStudent, setNotifyStudent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const decisionOptions = [
    { value: 'validate', label: 'Valider le rapport', icon: 'CheckCircle', color: 'success' },
    { value: 'reject', label: 'Rejeter le rapport', icon: 'XCircle', color: 'error' },
    { value: 'revision', label: 'Demander une révision', icon: 'RotateCcw', color: 'warning' }
  ];

  const revisionDeadlineOptions = [
    { value: '7', label: '7 jours' },
    { value: '14', label: '14 jours' },
    { value: '21', label: '21 jours' },
    { value: '30', label: '30 jours' },
    { value: 'custom', label: 'Date personnalisée' }
  ];

  const handleDecisionSubmit = async () => {
    if (!decisionComment?.trim() && (decisionType === 'reject' || decisionType === 'revision')) {
      return;
    }

    setIsSubmitting(true);

    try {
      const decisionData = {
        comment: decisionComment,
        notifyStudent,
        timestamp: new Date(),
        reviewer: 'Marie Dubois'
      };

      if (decisionType === 'revision') {
        decisionData.deadline = revisionDeadline;
      }

      switch (decisionType) {
        case 'validate':
          await onValidate(decisionData);
          break;
        case 'reject':
          await onReject(decisionData);
          break;
        case 'revision':
          await onRequestRevision(decisionData);
          break;
      }

      setShowDecisionModal(false);
      setDecisionComment('');
      setRevisionDeadline('');
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDecisionModal = (type) => {
    setDecisionType(type);
    setShowDecisionModal(true);
  };

  const getDecisionConfig = (type) => {
    return decisionOptions?.find(option => option?.value === type);
  };

  const canValidate = checklistProgress >= 80; // Au moins 80% de la checklist complétée
  const requiresComment = decisionType === 'reject' || decisionType === 'revision';

  return (
    <>
      <div className="bg-surface border border-border rounded-lg shadow-academic">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h3 className="font-heading font-medium text-text-primary flex items-center space-x-2">
            <Icon name="Gavel" size={20} className="text-accent" />
            <span>Actions de Validation</span>
          </h3>
        </div>

        {/* Status Overview */}
        <div className="p-4 space-y-4">
          {/* Progress Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${
                checklistProgress >= 100 ? 'bg-success' : 
                checklistProgress >= 50 ? 'bg-warning' : 'bg-error'
              }`} />
              <div>
                <div className="text-sm font-medium text-text-primary">Checklist</div>
                <div className="text-xs font-caption text-text-secondary">
                  {checklistProgress}% complétée
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${hasComments ? 'bg-success' : 'bg-warning'}`} />
              <div>
                <div className="text-sm font-medium text-text-primary">Commentaires</div>
                <div className="text-xs font-caption text-text-secondary">
                  {hasComments ? 'Feedback ajouté' : 'Aucun feedback'}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <div>
                <div className="text-sm font-medium text-text-primary">Statut</div>
                <div className="text-xs font-caption text-text-secondary">
                  En cours de révision
                </div>
              </div>
            </div>
          </div>

          {/* Validation Requirements */}
          <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <Icon name="Info" size={16} className="text-accent mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-accent mb-1">Prérequis pour la validation</div>
                <ul className="text-text-secondary space-y-1 text-xs">
                  <li className={checklistProgress >= 80 ? 'text-success' : ''}>
                    • Checklist complétée à au moins 80% ({checklistProgress}%)
                  </li>
                  <li className={hasComments ? 'text-success' : 'text-warning'}>
                    • Commentaires de révision ajoutés {hasComments ? '✓' : '(recommandé)'}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!isReadOnly && (
          <div className="p-4 border-t border-border bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant="success"
                onClick={() => openDecisionModal('validate')}
                disabled={!canValidate}
                iconName="CheckCircle"
                iconPosition="left"
                className="justify-center"
              >
                Valider
              </Button>

              <Button
                variant="warning"
                onClick={() => openDecisionModal('revision')}
                iconName="RotateCcw"
                iconPosition="left"
                className="justify-center"
              >
                Révision
              </Button>

              <Button
                variant="danger"
                onClick={() => openDecisionModal('reject')}
                iconName="XCircle"
                iconPosition="left"
                className="justify-center"
              >
                Rejeter
              </Button>
            </div>

            {!canValidate && (
              <div className="mt-3 text-xs font-caption text-warning text-center">
                Complétez la checklist pour activer la validation
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" iconName="Download">
                Télécharger PDF
              </Button>
              <Button variant="ghost" size="sm" iconName="Printer">
                Imprimer
              </Button>
              <Button variant="ghost" size="sm" iconName="Share2">
                Partager
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 text-sm font-caption text-text-secondary">
              <Icon name="Clock" size={14} />
              <span>Dernière modification: {new Date()?.toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Decision Modal */}
      {showDecisionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-200 p-4">
          <div className="bg-surface border border-border rounded-lg shadow-academic-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-medium text-text-primary flex items-center space-x-2">
                  <Icon 
                    name={getDecisionConfig(decisionType)?.icon} 
                    size={20} 
                    className={`text-${getDecisionConfig(decisionType)?.color}`} 
                  />
                  <span>{getDecisionConfig(decisionType)?.label}</span>
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDecisionModal(false)}
                >
                  <Icon name="X" size={16} />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4">
              {/* Report Info */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-sm font-medium text-text-primary mb-1">
                  {reportData?.title || 'Développement d\'une Application Mobile de Gestion Académique'}
                </div>
                <div className="text-xs font-caption text-text-secondary">
                  Par {reportData?.studentName || 'Ahmed Ben Salem'} • {reportData?.specialty || 'Génie Logiciel'}
                </div>
              </div>

              {/* Decision Comment */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">
                  {requiresComment ? 'Commentaire (obligatoire)' : 'Commentaire (optionnel)'}
                </label>
                <textarea
                  value={decisionComment}
                  onChange={(e) => setDecisionComment(e?.target?.value)}
                  placeholder={
                    decisionType === 'validate' ?'Félicitations pour ce travail de qualité...'
                      : decisionType === 'reject' ?'Expliquez les raisons du rejet...' :'Détaillez les modifications requises...'
                  }
                  className="w-full p-3 bg-background border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  rows={4}
                  required={requiresComment}
                />
              </div>

              {/* Revision Deadline */}
              {decisionType === 'revision' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">
                    Délai de révision
                  </label>
                  <Select
                    options={revisionDeadlineOptions}
                    value={revisionDeadline}
                    onChange={setRevisionDeadline}
                    placeholder="Sélectionner un délai"
                  />
                  {revisionDeadline === 'custom' && (
                    <Input
                      type="date"
                      label="Date limite personnalisée"
                      className="mt-2"
                    />
                  )}
                </div>
              )}

              {/* Notification Option */}
              <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <input
                  type="checkbox"
                  id="notifyStudent"
                  checked={notifyStudent}
                  onChange={(e) => setNotifyStudent(e?.target?.checked)}
                  className="w-4 h-4 text-accent bg-background border-border rounded focus:ring-accent focus:ring-2"
                />
                <label htmlFor="notifyStudent" className="text-sm text-text-primary">
                  Notifier l'étudiant par email
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-muted/30">
              <div className="flex items-center justify-end space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowDecisionModal(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  variant={getDecisionConfig(decisionType)?.color}
                  onClick={handleDecisionSubmit}
                  disabled={isSubmitting || (requiresComment && !decisionComment?.trim())}
                  loading={isSubmitting}
                  iconName={getDecisionConfig(decisionType)?.icon}
                  iconPosition="left"
                >
                  Confirmer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ValidationActions;