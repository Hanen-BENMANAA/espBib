import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '../../components/ui/Header';
import NavigationBreadcrumbs from '../../components/ui/NavigationBreadcrumbs';
import StatusIndicatorBanner from '../../components/ui/StatusIndicatorBanner';
import QuickActionPanel from '../../components/ui/QuickActionPanel';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import ReportMetadataForm from './components/ReportMetadataForm';
import FileUploadSection from './components/FileUploadSection';
import SubmissionChecklist from './components/SubmissionChecklist';
import DraftAutoSave from './components/DraftAutoSave';

const ReportSubmissionForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
const [formData, setFormData] = useState({
  title: '',
  authorFirstName: '',
  authorLastName: '',
  studentNumber: '',
  email: '',
  specialty: '',
  academicYear: '',
  supervisor_id: null,        // ← CHANGED
  co_supervisor_id: null,     // ← CHANGED
  hostCompany: '',
  defenseDate: '',
  keywords: [],
  abstract: '',
  allowPublicAccess: true,
  isConfidential: false,
});
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [checklistData, setChecklistData] = useState({});
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerType, setBannerType] = useState('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const steps = [
    { id: 1, title: 'Métadonnées', description: 'Informations du rapport', icon: 'FileText' },
    { id: 2, title: 'Fichier', description: 'Téléchargement PDF', icon: 'Upload' },
    { id: 3, title: 'Vérification', description: 'Contrôle qualité', icon: 'CheckCircle' }
  ];

  // Charger le brouillon au montage
  useEffect(() => {
    const savedDraft = localStorage.getItem('esprim_draft_data');
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setFormData(draftData.formData || {});
        showStatusBanner('Brouillon chargé avec succès', 'success');
      } catch (error) {
        console.error('Échec du chargement du brouillon:', error);
      }
    }
  }, []);

  const showStatusBanner = useCallback((message, type = 'info') => {
    setBannerMessage(message);
    setBannerType(type);
    setShowBanner(true);
  }, []);

// In index.jsx
const validateStep = useMemo(() => {
  return (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.title || formData.title.length < 10) newErrors.title = 'Le titre doit contenir au moins 10 caractères';
      if (!formData.authorFirstName) newErrors.authorFirstName = 'Le prénom est requis';
      if (!formData.authorLastName) newErrors.authorLastName = 'Le nom est requis';
      if (!formData.studentNumber) newErrors.studentNumber = 'Le numéro d\'étudiant est requis';
      if (!formData.email || !formData.email.includes('@esprim.tn')) newErrors.email = 'Email @esprim.tn requis';
      if (!formData.specialty) newErrors.specialty = 'La spécialité est requise';
      if (!formData.academicYear) newErrors.academicYear = 'L\'année académique est requise';
      if (!formData.supervisor_id) newErrors.supervisor = 'L\'encadrant principal est requis'; // ← CHANGED
      if (!formData.defenseDate) newErrors.defenseDate = 'La date de soutenance est requise';
      if (!formData.keywords || formData.keywords.length < 3) newErrors.keywords = 'Au moins 3 mots-clés requis';
      if (!formData.abstract || formData.abstract.length < 200) newErrors.abstract = 'Le résumé doit contenir au moins 200 caractères';
    }
    if (step === 2 && !uploadedFile) newErrors.file = 'Le fichier PDF est requis';
    return Object.keys(newErrors).length === 0;
  };
}, [formData, uploadedFile]);

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
        showStatusBanner(`Étape ${currentStep} complétée`, 'success');
      }
    } else {
      showStatusBanner('Veuillez corriger les erreurs avant de continuer', 'error');
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleFormChange = (newFormData) => setFormData(newFormData);

  const handleFileSelect = (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadedFile(file);
          showStatusBanner('Fichier téléchargé avec succès', 'success');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

// RÉCUPÉRER LES RAPPORTS SOUMIS
  useEffect(() => {
    const fetchMyReports = async () => {
      try {
        const session = JSON.parse(localStorage.getItem('esprim_session') || '{}');
        const token = session.token;

        if (!token) {
          setError('Non connecté');
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:5000/api/reports/my-submissions', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

if (!response.ok) {
    const text = await response.text();
    console.error("Backend error response:", text);
    throw new Error(`Erreur: ${response.status}`);
}

        const data = await response.json();
        setMyReports(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyReports();
  }, []);




  const handleFileRemove = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    showStatusBanner('Fichier supprimé', 'info');
  };

  const handleChecklistChange = (checklist) => {
    setChecklistData(checklist);
  };

  const handleSaveDraft = () => {
    const draft = { formData, uploadedFileName: uploadedFile?.name || null, timestamp: Date.now() };
    localStorage.setItem('esprim_draft_data', JSON.stringify(draft));
    showStatusBanner('Brouillon sauvegardé', 'success');
  };

  // FONCTION DE SOUMISSION CORRIGÉE - PLUS JAMAIS DE 404
  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      showStatusBanner('Veuillez corriger toutes les erreurs', 'error');
      return;
    }
    if (Object.values(checklistData).filter(Boolean).length < 15) {
      showStatusBanner('Veuillez compléter tous les points de la checklist', 'warning');
      setCurrentStep(3);
      return;
    }
    if (!uploadedFile) {
      showStatusBanner('Fichier PDF manquant', 'error');
      setCurrentStep(2);
      return;
    }

    const session = JSON.parse(localStorage.getItem('esprim_session') || '{}');
    const token = session.token;
    if (!token) {
      showStatusBanner('Session expirée, reconnexion requise', 'error');
      setTimeout(() => window.location.href = '/auth/login', 2000);
      return;
    }

    setIsSubmitting(true);
    setIsUploading(true);

    const fd = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'keywords') {
        fd.append(key, JSON.stringify(formData[key]));
      } else {
        fd.append(key, formData[key] || '');
      }
    });
    fd.append('checklist', JSON.stringify(checklistData));
    fd.append('file', uploadedFile, uploadedFile.name);

    try {
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:5000/api/reports/submit', true);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percent);
          }
        };

        xhr.onload = () => {
          setIsUploading(false);
          if (xhr.status >= 200 && xhr.status < 300) {
            // SUCCÈS
            localStorage.removeItem('esprim_draft_data');
            localStorage.removeItem('esprim_draft_timestamp');
            showStatusBanner('Rapport soumis avec succès ! Redirection...', 'success');

            // REDIRECTION ABSOLUE → PLUS JAMAIS DE 404
            setTimeout(() => {
              window.location.href = '/student/dashboard';
            }, 2000);

            resolve();
          } else {
            showStatusBanner('Erreur lors de la soumission', 'error');
            reject(new Error('Submission failed'));
          }
        };

        xhr.onerror = () => {
          setIsUploading(false);
          showStatusBanner('Erreur réseau', 'error');
          reject(new Error('Network error'));
        };

        xhr.send(fd);
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

const isStepCompleted = (stepId) => {
  if (stepId === 1) {
    return formData.title?.length >= 10 &&
           formData.authorFirstName &&
           formData.authorLastName &&
           formData.studentNumber &&
           formData.email?.includes('@esprim.tn') &&
           formData.specialty &&
           formData.academicYear &&
           formData.supervisor_id &&  // ← CHANGED
           formData.defenseDate &&
           formData.keywords?.length >= 3 &&
           formData.abstract?.length >= 200;
  }
  if (stepId === 2) return !!uploadedFile;
  if (stepId === 3) return Object.values(checklistData).filter(Boolean).length >= 15;
  return false;
};

  const getStepContent = () => {
    switch (currentStep) {
      case 1: return <ReportMetadataForm formData={formData} onFormChange={handleFormChange} errors={errors} />;
      case 2: return <FileUploadSection onFileSelect={handleFileSelect} uploadedFile={uploadedFile} onFileRemove={handleFileRemove} uploadProgress={uploadProgress} isUploading={isUploading} />;
      case 3: return <SubmissionChecklist formData={formData} uploadedFile={uploadedFile} onChecklistChange={handleChecklistChange} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <NavigationBreadcrumbs />

        {showBanner && (
          <StatusIndicatorBanner
            type={bannerType}
            message={bannerMessage}
            isVisible={showBanner}
            onDismiss={() => setShowBanner(false)}
            autoHide={true}
            autoHideDelay={5000}
          />
        )}

        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
              Soumission de Rapport PFE
            </h1>
            <p className="text-muted-foreground">
              Soumettez votre rapport de Projet de Fin d'Études avec les métadonnées complètes
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center academic-transition ${
                      currentStep === step.id
                        ? 'bg-primary text-primary-foreground'
                        : isStepCompleted(step.id)
                        ? 'bg-success text-success-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {isStepCompleted(step.id) ? <Icon name="Check" size={20} /> : <Icon name={step.icon} size={20} />}
                    </div>
                    <div className="hidden sm:block">
                      <p className={`text-sm font-medium ${currentStep === step.id ? 'text-primary' : 'text-foreground'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${isStepCompleted(step.id) ? 'bg-success' : 'bg-muted'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-academic academic-shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-heading font-semibold text-foreground">
                    {steps[currentStep - 1]?.title}
                  </h2>
                  <span className="text-sm text-muted-foreground">Étape {currentStep} sur {steps.length}</span>
                </div>

                {getStepContent()}

                <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                  <div className="flex space-x-3">
                    <Button variant="outline" onClick={handlePreviousStep} disabled={currentStep === 1} iconName="ChevronLeft" iconPosition="left">
                      Précédent
                    </Button>
                    {currentStep < steps.length ? (
                      <Button variant="default" onClick={handleNextStep} iconName="ChevronRight" iconPosition="right">
                        Suivant
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        iconName="Send"
                        iconPosition="left"
                        disabled={Object.values(checklistData).filter(Boolean).length < 15}
                      >
                        {isSubmitting ? 'Soumission...' : 'Soumettre le Rapport'}
                      </Button>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" iconName="Save" iconPosition="left" onClick={handleSaveDraft}>
                      Sauvegarder
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-academic academic-shadow-sm p-4">
                <DraftAutoSave formData={formData} uploadedFile={uploadedFile} onManualSave={handleSaveDraft} />
              </div>
              {/* Aide & Conseils */}
              <div className="bg-card border border-border rounded-academic academic-shadow-sm p-4">
                <h3 className="text-sm font-heading font-medium text-foreground mb-3 flex items-center space-x-2">
                  <Icon name="HelpCircle" size={16} className="text-primary" />
                  <span>Aide & Conseils</span>
                </h3>
                <div className="space-y-3 text-xs text-muted-foreground">
                  <div className="flex items-start space-x-2"><Icon name="FileText" size={12} className="mt-0.5 text-primary" /><p>Utilisez un titre descriptif et précis</p></div>
                  <div className="flex items-start space-x-2"><Icon name="Tags" size={12} className="mt-0.5 text-primary" /><p>Choisissez des mots-clés pertinents</p></div>
                  <div className="flex items-start space-x-2"><Icon name="Upload" size={12} className="mt-0.5 text-primary" /><p>Respectez la charte graphique ESPRIM</p></div>
                  <div className="flex items-start space-x-2"><Icon name="Shield" size={12} className="mt-0.5 text-primary" /><p>Vérifiez l'originalité du contenu</p></div>
                </div>
                <div className="mt-4 pt-3 border-t border-border">
                  <Button variant="ghost" size="sm" fullWidth iconName="ExternalLink" iconPosition="right">
                    Guide de soumission
                  </Button>
                </div>
              </div>
              <div className="bg-accent/10 border border-accent/20 rounded-academic p-4">
                <h3 className="text-sm font-medium text-accent mb-2 flex items-center space-x-2">
                  <Icon name="MessageCircle" size={16} />
                  <span>Besoin d'aide ?</span>
                </h3>
                <p className="text-xs text-muted-foreground mb-3">Contactez le support technique</p>
                <Button variant="outline" size="sm" fullWidth iconName="Mail" iconPosition="left">
                  support@esprim.tn
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportSubmissionForm;