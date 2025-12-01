// ValidationActions.jsx - FULLY REACTIVE VERSION

import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

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
  const [notifyStudent, setNotifyStudent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const decisionOptions = [
    { value: 'validated', label: 'Valider le rapport', icon: 'CheckCircle', color: 'success' },
    { value: 'rejected', label: 'Rejeter le rapport', icon: 'XCircle', color: 'error' },
    { value: 'revision_requested', label: 'Demander une révision', icon: 'RotateCcw', color: 'warning' }
  ];

  const handleDecisionSubmit = async () => {
    const requiresComment = decisionType === 'rejected' || decisionType === 'revision_requested';
    
    if (requiresComment && !decisionComment?.trim()) {
      alert('Un commentaire est obligatoire pour rejeter ou demander une révision');
      return;
    }

    setIsSubmitting(true);

    try {
      const decisionData = {
        comment: decisionComment,
        notifyStudent,
        timestamp: new Date()
      };

      switch (decisionType) {
        case 'validated':
          await onValidate(decisionData);
          break;
        case 'rejected':
          await onReject(decisionData);
          break;
        case 'revision_requested':
          await onRequestRevision(decisionData);
          break;
        default:
          throw new Error('Invalid decision type');
      }

      setShowDecisionModal(false);
      setDecisionComment('');
      
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      alert('Erreur lors de l\'enregistrement de la décision');
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

  const canValidate = checklistProgress >= 80;
  const requiresComment = decisionType === 'rejected' || decisionType === 'revision_requested';

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
            <Icon name="Gavel" size={20} className="text-blue-600" />
            <span>Actions de Validation</span>
          </h3>
        </div>

        {/* Status Overview */}
        <div className="p-4 space-y-4">
          {/* Progress Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${
                checklistProgress >= 100 ? 'bg-green-500' : 
                checklistProgress >= 50 ? 'bg-orange-500' : 'bg-red-500'
              }`} />
              <div>
                <div className="text-sm font-medium text-gray-900">Checklist</div>
                <div className="text-xs text-gray-600">
                  {checklistProgress}% complétée
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${hasComments ? 'bg-green-500' : 'bg-orange-500'}`} />
              <div>
                <div className="text-sm font-medium text-gray-900">Commentaires</div>
                <div className="text-xs text-gray-600">
                  {hasComments ? 'Feedback ajouté' : 'Aucun feedback'}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 rounded-full bg-blue-600" />
              <div>
                <div className="text-sm font-medium text-gray-900">Statut</div>
                <div className="text-xs text-gray-600">
                  {reportData?.status === 'pending_validation' ? 'En cours de révision' : 
                   reportData?.status === 'validated' ? 'Validé' :
                   reportData?.status === 'rejected' ? 'Rejeté' :
                   reportData?.status === 'revision_requested' ? 'Révision demandée' :
                   'En attente'}
                </div>
              </div>
            </div>
          </div>

          {/* Validation Requirements */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-blue-900 mb-1">Prérequis pour la validation</div>
                <ul className="text-gray-700 space-y-1 text-xs">
                  <li className={checklistProgress >= 80 ? 'text-green-600' : ''}>
                    • Checklist complétée à au moins 80% ({checklistProgress}%)
                  </li>
                  <li className={hasComments ? 'text-green-600' : 'text-orange-600'}>
                    • Commentaires de révision ajoutés {hasComments ? '✓' : '(recommandé)'}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={() => openDecisionModal('validated')}
              disabled={!canValidate || isReadOnly}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              iconName="CheckCircle"
            >
              Valider le rapport
            </Button>
            
            <Button
              onClick={() => openDecisionModal('revision_requested')}
              disabled={isReadOnly}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              iconName="RotateCcw"
            >
              Demander une révision
            </Button>
            
            <Button
              onClick={() => openDecisionModal('rejected')}
              disabled={isReadOnly}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              iconName="XCircle"
            >
              Rejeter le rapport
            </Button>
          </div>

          {!canValidate && (
            <p className="text-xs text-orange-600 mt-3 text-center">
              ⚠️ Complétez au moins 80% de la checklist pour valider
            </p>
          )}
        </div>
      </div>

      {/* Decision Modal */}
      {showDecisionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                  <Icon 
                    name={getDecisionConfig(decisionType)?.icon} 
                    size={20} 
                    className={`text-${getDecisionConfig(decisionType)?.color === 'success' ? 'green' : 
                                getDecisionConfig(decisionType)?.color === 'error' ? 'red' : 'orange'}-600`}
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
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {reportData?.title || 'Développement d\'une Application Mobile de Gestion Académique'}
                </div>
                <div className="text-xs text-gray-600">
                  Par {reportData?.studentName || 'Ahmed Ben Salem'} • {reportData?.specialty || 'Génie Logiciel'}
                </div>
              </div>

              {/* Decision Comment */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  {requiresComment ? 'Commentaire (obligatoire)' : 'Commentaire (optionnel)'}
                </label>
                <textarea
                  value={decisionComment}
                  onChange={(e) => setDecisionComment(e?.target?.value)}
                  placeholder={
                    decisionType === 'validated' 
                      ? 'Félicitations pour ce travail de qualité...'
                      : decisionType === 'rejected' 
                      ? 'Expliquez les raisons du rejet...' 
                      : 'Détaillez les modifications requises...'
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required={requiresComment}
                />
              </div>

              {/* Notification Option */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="notifyStudent"
                  checked={notifyStudent}
                  onChange={(e) => setNotifyStudent(e?.target?.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="notifyStudent" className="text-sm text-gray-900">
                  Notifier l'étudiant par email
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-end space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowDecisionModal(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleDecisionSubmit}
                  disabled={isSubmitting || (requiresComment && !decisionComment?.trim())}
                  className={`${
                    getDecisionConfig(decisionType)?.color === 'success' ? 'bg-green-600 hover:bg-green-700' :
                    getDecisionConfig(decisionType)?.color === 'error' ? 'bg-red-600 hover:bg-red-700' :
                    'bg-orange-600 hover:bg-orange-700'
                  } text-white`}
                  iconName={getDecisionConfig(decisionType)?.icon}
                >
                  {isSubmitting ? 'Enregistrement...' : 'Confirmer'}
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