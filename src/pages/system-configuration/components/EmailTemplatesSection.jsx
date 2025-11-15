import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const EmailTemplatesSection = ({ onSave }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('validation_approved');
  const [showPreview, setShowPreview] = useState(false);

  const emailTemplates = {
    validation_approved: {
      name: 'Rapport Validé',
      subject: 'Votre rapport PFE a été validé',
      content: `Bonjour {{student_name}},\n\nNous avons le plaisir de vous informer que votre rapport de Projet de Fin d'Études intitulé "{{report_title}}" a été validé par {{validator_name}}.\n\nVotre rapport est maintenant disponible dans la bibliothèque virtuelle ESPRIM.\n\nFélicitations pour ce travail de qualité !\n\nCordialement,\nL'équipe ESPRIM`,
      variables: ['student_name', 'report_title', 'validator_name', 'validation_date']
    },
    validation_rejected: {
      name: 'Rapport Rejeté',
      subject: 'Votre rapport PFE nécessite des modifications',
      content: `Bonjour {{student_name}},\n\nVotre rapport de Projet de Fin d'Études "{{report_title}}" a été examiné par {{validator_name}}.\n\nMalheureusement, des modifications sont nécessaires avant validation :\n\n{{rejection_comments}}\n\nVeuillez apporter les corrections demandées et soumettre une nouvelle version.\n\nCordialement,\nL'équipe ESPRIM`,
      variables: ['student_name', 'report_title', 'validator_name', 'rejection_comments', 'submission_deadline']
    },
    submission_received: {
      name: 'Soumission Reçue',
      subject: 'Confirmation de soumission de votre rapport PFE',
      content: `Bonjour {{student_name}},\n\nNous confirmons la réception de votre rapport PFE "{{report_title}}".\n\nNuméro de référence : {{report_id}}\nDate de soumission : {{submission_date}}\n\nVotre rapport sera examiné dans les prochains jours. Vous recevrez une notification dès que la validation sera terminée.\n\nCordialement,\nL'équipe ESPRIM`,
      variables: ['student_name', 'report_title', 'report_id', 'submission_date']
    },
    system_alert: {
      name: 'Alerte Système',subject: 'Alerte de sécurité - ESPRIM Virtual Library',
      content: `Alerte de sécurité détectée :\n\nType : {{alert_type}}\nUtilisateur : {{user_name}}\nAdresse IP : {{ip_address}}\nHeure : {{timestamp}}\n\nDescription : {{alert_description}}\n\nAction recommandée : {{recommended_action}}\n\nCeci est un message automatique du système ESPRIM.`,
      variables: ['alert_type', 'user_name', 'ip_address', 'timestamp', 'alert_description', 'recommended_action']
    }
  };

  const [templates, setTemplates] = useState(emailTemplates);
  const [hasChanges, setHasChanges] = useState(false);

  const templateOptions = Object.entries(templates)?.map(([key, template]) => ({
    value: key,
    label: template?.name
  }));

  const currentTemplate = templates?.[selectedTemplate];

  const handleTemplateChange = (field, value) => {
    setTemplates(prev => ({
      ...prev,
      [selectedTemplate]: {
        ...prev?.[selectedTemplate],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave('emailTemplates', templates);
    setHasChanges(false);
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const generatePreview = () => {
    let preview = currentTemplate?.content;
    currentTemplate?.variables?.forEach(variable => {
      const sampleData = {
        student_name: 'Marie Dubois',
        report_title: 'Développement d\'une application IoT pour la gestion énergétique',
        validator_name: 'Prof. Ahmed Ben Salem',
        validation_date: '14/11/2024',
        rejection_comments: 'La méthodologie doit être clarifiée dans le chapitre 3.',
        report_id: 'PFE-2024-001',
        submission_date: '10/11/2024',
        alert_type: 'Tentative d\'accès non autorisé',
        user_name: 'user@example.com',
        ip_address: '192.168.1.100',
        timestamp: '14/11/2024 20:49',
        alert_description: 'Tentatives de connexion multiples échouées',
        recommended_action: 'Vérifier l\'identité de l\'utilisateur'
      };
      
      preview = preview?.replace(new RegExp(`{{${variable}}}`, 'g'), sampleData?.[variable] || `[${variable}]`);
    });
    
    return preview;
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Icon name="Mail" size={20} className="text-primary" />
            <h3 className="text-lg font-heading font-medium text-text-primary">
              Modèles d'Email
            </h3>
          </div>
          
          <Button
            variant="outline"
            onClick={handlePreview}
            iconName="Eye"
            iconPosition="left"
          >
            Aperçu
          </Button>
        </div>
        
        <Select
          label="Sélectionner un modèle"
          options={templateOptions}
          value={selectedTemplate}
          onChange={setSelectedTemplate}
        />
      </div>
      {/* Template Editor */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="space-y-4">
          <Input
            label="Nom du modèle"
            value={currentTemplate?.name}
            onChange={(e) => handleTemplateChange('name', e?.target?.value)}
          />
          
          <Input
            label="Objet de l'email"
            value={currentTemplate?.subject}
            onChange={(e) => handleTemplateChange('subject', e?.target?.value)}
          />
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Contenu du message
            </label>
            <textarea
              className="w-full h-64 px-3 py-2 border border-border rounded-lg bg-input text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
              value={currentTemplate?.content}
              onChange={(e) => handleTemplateChange('content', e?.target?.value)}
              placeholder="Contenu de l'email..."
            />
          </div>
          
          {/* Available Variables */}
          <div className="bg-muted rounded-lg p-4">
            <h4 className="text-sm font-medium text-text-primary mb-2">
              Variables disponibles :
            </h4>
            <div className="flex flex-wrap gap-2">
              {currentTemplate?.variables?.map(variable => (
                <span
                  key={variable}
                  className="inline-flex items-center px-2 py-1 bg-accent/10 text-accent text-xs font-mono rounded cursor-pointer hover:bg-accent/20 transition-academic"
                  onClick={() => {
                    const textarea = document.querySelector('textarea');
                    const cursorPos = textarea?.selectionStart;
                    const textBefore = currentTemplate?.content?.substring(0, cursorPos);
                    const textAfter = currentTemplate?.content?.substring(cursorPos);
                    const newContent = textBefore + `{{${variable}}}` + textAfter;
                    handleTemplateChange('content', newContent);
                  }}
                >
                  {`{{${variable}}}`}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-200 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-heading font-medium text-text-primary">
                Aperçu de l'Email
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPreview(false)}
                iconName="X"
              />
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary">Objet :</label>
                  <p className="text-text-primary font-medium">{currentTemplate?.subject}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-text-secondary">Message :</label>
                  <div className="mt-2 p-4 bg-muted rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-text-primary font-caption">
                      {generatePreview()}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-2 text-sm font-caption text-text-secondary">
          <Icon name="Info" size={16} />
          <span>Cliquez sur une variable pour l'insérer</span>
        </div>
        
        <Button
          variant="default"
          onClick={handleSave}
          disabled={!hasChanges}
          iconName="Save"
          iconPosition="left"
        >
          Enregistrer les Modèles
        </Button>
      </div>
    </div>
  );
};

export default EmailTemplatesSection;