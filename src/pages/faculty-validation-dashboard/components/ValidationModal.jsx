import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const ValidationModal = ({ isOpen, onClose, report, onValidate, onReject, onRequestModification }) => {
  const [activeTab, setActiveTab] = useState('preview');
  const [validationChecklist, setValidationChecklist] = useState({
    graphicCharter: false,
    contentQuality: false,
    appropriateness: false,
    formatting: false,
    references: false,
    plagiarism: false
  });
  const [internalNotes, setInternalNotes] = useState('');
  const [feedback, setFeedback] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('standard');

  if (!isOpen || !report) return null;

  const checklistItems = [
    {
      key: 'graphicCharter',
      label: 'Conformité à la charte graphique ESPRIM',
      description: 'Logo, couleurs, mise en page selon les standards'
    },
    {
      key: 'contentQuality',
      label: 'Qualité du contenu académique',
      description: 'Méthodologie, analyse, conclusions pertinentes'
    },
    {
      key: 'appropriateness',
      label: 'Pertinence du sujet',
      description: 'Adéquation avec la spécialité et le niveau requis'
    },
    {
      key: 'formatting',
      label: 'Formatage et structure',
      description: 'Organisation des chapitres, bibliographie, annexes'
    },
    {
      key: 'references',
      label: 'Références et citations',
      description: 'Sources académiques appropriées et bien citées'
    },
    {
      key: 'plagiarism',
      label: 'Vérification anti-plagiat',
      description: 'Originalité du contenu vérifié'
    }
  ];

  const emailTemplates = [
    { value: 'standard', label: 'Modèle standard' },
    { value: 'detailed', label: 'Modèle détaillé' },
    { value: 'custom', label: 'Personnalisé' }
  ];

  const handleChecklistChange = (key, checked) => {
    setValidationChecklist(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const getCompletionPercentage = () => {
    const checkedItems = Object.values(validationChecklist)?.filter(Boolean)?.length;
    return Math.round((checkedItems / checklistItems?.length) * 100);
  };

  const handleValidate = () => {
    const validationData = {
      checklist: validationChecklist,
      notes: internalNotes,
      feedback: feedback,
      emailTemplate: emailTemplate
    };
    onValidate(report, validationData);
    onClose();
  };

  const handleReject = () => {
    const rejectionData = {
      feedback: feedback,
      emailTemplate: emailTemplate,
      notes: internalNotes
    };
    onReject(report, rejectionData);
    onClose();
  };

  const handleRequestModification = () => {
    const modificationData = {
      feedback: feedback,
      emailTemplate: emailTemplate,
      notes: internalNotes,
      checklist: validationChecklist
    };
    onRequestModification(report, modificationData);
    onClose();
  };

  const tabs = [
    { id: 'preview', label: 'Aperçu', icon: 'Eye' },
    { id: 'validation', label: 'Validation', icon: 'CheckCircle' },
    { id: 'feedback', label: 'Commentaires', icon: 'MessageSquare' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-300 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden academic-shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Validation du Rapport</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {report?.studentName} • {report?.specialty}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 text-sm font-medium academic-transition ${
                  activeTab === tab?.id
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'preview' && (
            <div className="space-y-6">
              {/* Report Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-foreground mb-3">Informations du Rapport</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Titre:</span>
                      <span className="text-foreground font-medium">{report?.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Étudiant:</span>
                      <span className="text-foreground">{report?.studentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Superviseur:</span>
                      <span className="text-foreground">{report?.supervisor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Spécialité:</span>
                      <span className="text-foreground">{report?.specialty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date de soumission:</span>
                      <span className="text-foreground">
                        {new Date(report.submissionDate)?.toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-foreground mb-3">Détails Techniques</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taille du fichier:</span>
                      <span className="text-foreground">{report?.fileSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Format:</span>
                      <span className="text-foreground">{report?.fileFormat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pages:</span>
                      <span className="text-foreground">{report?.pageCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Statut antivirus:</span>
                      <span className="text-success">✓ Vérifié</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Abstract */}
              <div>
                <h3 className="font-medium text-foreground mb-3">Résumé</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {report?.abstract}
                </p>
              </div>

              {/* Keywords */}
              <div>
                <h3 className="font-medium text-foreground mb-3">Mots-clés</h3>
                <div className="flex flex-wrap gap-2">
                  {report?.keywords?.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'validation' && (
            <div className="space-y-6">
              {/* Progress */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    Progression de la validation
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {getCompletionPercentage()}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 academic-transition"
                    style={{ width: `${getCompletionPercentage()}%` }}
                  />
                </div>
              </div>

              {/* Checklist */}
              <div>
                <h3 className="font-medium text-foreground mb-4">Liste de Vérification</h3>
                <div className="space-y-4">
                  {checklistItems?.map((item) => (
                    <div key={item?.key} className="flex items-start space-x-3">
                      <Checkbox
                        checked={validationChecklist?.[item?.key]}
                        onChange={(e) => handleChecklistChange(item?.key, e?.target?.checked)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label className="text-sm font-medium text-foreground">
                          {item?.label}
                        </label>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item?.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <Input
                  label="Notes internes"
                  description="Ces notes ne seront pas visibles par l'étudiant"
                  type="text"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e?.target?.value)}
                  placeholder="Ajouter des notes pour l'équipe..."
                />
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-6">
              {/* Feedback */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Commentaires pour l'étudiant
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e?.target?.value)}
                  placeholder="Rédigez vos commentaires et suggestions..."
                  className="w-full h-32 px-3 py-2 border border-border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Email Template */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Modèle d'email
                </label>
                <div className="space-y-2">
                  {emailTemplates?.map((template) => (
                    <label key={template?.value} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="emailTemplate"
                        value={template?.value}
                        checked={emailTemplate === template?.value}
                        onChange={(e) => setEmailTemplate(e?.target?.value)}
                        className="text-primary"
                      />
                      <span className="text-sm text-foreground">{template?.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleReject}
              iconName="X"
              className="text-error hover:text-error"
            >
              Rejeter
            </Button>
            <Button
              variant="outline"
              onClick={handleRequestModification}
              iconName="Edit"
              className="text-warning hover:text-warning"
            >
              Demander Modifications
            </Button>
            <Button
              variant="default"
              onClick={handleValidate}
              iconName="CheckCircle"
              disabled={getCompletionPercentage() < 100}
            >
              Valider le Rapport
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationModal;