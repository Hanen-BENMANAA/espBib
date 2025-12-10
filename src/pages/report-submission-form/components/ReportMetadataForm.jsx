import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import api from '../../../services/api';

const ReportMetadataForm = ({ formData, onFormChange, errors = {} }) => {
  const [keywords, setKeywords] = useState(formData?.keywords || []);
  const [keywordInput, setKeywordInput] = useState('');
  const [abstractLength, setAbstractLength] = useState(formData?.abstract?.length || 0);
  const [supervisors, setSupervisors] = useState([]);
  const [loadingSupervisors, setLoadingSupervisors] = useState(true);

  // SPÉCIALITÉS (CORRIGÉ : à l'intérieur du composant)
  const specialiteOptions = [
    { value: 'dsai', label: 'Data Science & Intelligence Artificielle' },
    { value: 'web-mobile', label: 'Développement Avancé Web & Mobile' },
    { value: 'cloud-cyber', label: 'Cloud & Cybersécurité' },
    { value: 'mecatronique', label: 'Mécatronique' },
    { value: 'electronique-telecom', label: 'Électronique Embarquée & Télécom' },
    { value: 'systemes-automatises', label: 'Systèmes Automatisés & Maintenance Industrielle' },
    { value: 'genie-industriel-energetique', label: 'Génie Industriel et Systèmes Énergétiques' },
  ];

  // ANNÉES ACADÉMIQUES DYNAMIQUES
  const currentYear = new Date().getFullYear();
  const academicYearOptions = Array.from({ length: 7 }, (_, i) => {
    const year = currentYear - i;
    return { value: `${year}-${year + 1}`, label: `${year}-${year + 1}` };
  });

  // CHARGEMENT DES ENCADRANTS
  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        setLoadingSupervisors(true);
        const res = await api.get('/users/supervisors-public');
        if (res.data.success) {
          const options = res.data.data.map(s => ({
            value: s.id.toString(),
            label: `${s.first_name} ${s.last_name} - ${s.email}`
          }));
          setSupervisors(options);
        }
      } catch (err) {
        console.error("Erreur chargement encadrants", err);
      } finally {
        setLoadingSupervisors(false);
      }
    };
    fetchSupervisors();
  }, []);

  const handleInputChange = (field, value) => {
    onFormChange({ ...formData, [field]: value });
  };

  const handleAbstractChange = (e) => {
    const value = e?.target?.value || '';
    setAbstractLength(value.length);
    handleInputChange('abstract', value);
  };

  const addKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !keywords.includes(trimmed) && keywords.length < 10) {
      const newKeywords = [...keywords, trimmed];
      setKeywords(newKeywords);
      handleInputChange('keywords', newKeywords);
      setKeywordInput('');
    }
  };

  const removeKeyword = (kw) => {
    const newKeywords = keywords.filter(k => k !== kw);
    setKeywords(newKeywords);
    handleInputChange('keywords', newKeywords);
  };

  const handleKeywordKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div>
        <Input
          label="Titre du Rapport"
          placeholder="Saisissez le titre complet de votre rapport PFE"
          value={formData?.title || ''}
          onChange={(e) => handleInputChange('title', e.target.value)}
          error={errors?.title}
          required
          maxLength={200}
          description="Maximum 200 caractères"
        />
      </div>

      {/* Auteur */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Prénom" value={formData?.authorFirstName || ''} onChange={e => handleInputChange('authorFirstName', e.target.value)} required />
        <Input label="Nom" value={formData?.authorLastName || ''} onChange={e => handleInputChange('authorLastName', e.target.value)} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Numéro d'Étudiant" placeholder="Ex: ESP2024001" value={formData?.studentNumber || ''} onChange={e => handleInputChange('studentNumber', e.target.value)} required />
        <Input label="Email Institutionnel" type="email" placeholder="prenom.nom@esprim.tn" value={formData?.email || ''} onChange={e => handleInputChange('email', e.target.value)} required />
      </div>

      {/* Spécialité & Année */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Spécialité"
          options={specialiteOptions}
          value={formData?.specialty || ''}
          onChange={(value) => handleInputChange('specialty', value)}
          required
          placeholder="Sélectionnez votre spécialité"
        />
        <Select
          label="Année Académique"
          options={academicYearOptions}
          value={formData?.academicYear || ''}
          onChange={(value) => handleInputChange('academicYear', value)}
          required
          placeholder="Sélectionnez l'année"
        />
      </div>

      {/* Encadrant Principal */}
      <div>
        <Select
          label="Encadrant Principal"
          options={loadingSupervisors ? [{ value: '', label: 'Chargement...' }] : supervisors}
          value={formData?.supervisor_id?.toString() || ''}
          onChange={(value) => handleInputChange('supervisor_id', parseInt(value))}
          required
          searchable
          placeholder="Recherchez votre encadrant"
        />
      </div>

      {/* Co-encadrant */}
      <div>
        <Select
          label="Co-encadrant (Optionnel)"
          options={[{ value: '', label: 'Aucun' }, ...supervisors]}
          value={formData?.co_supervisor_id?.toString() || ''}
          onChange={(value) => handleInputChange('co_supervisor_id', value ? parseInt(value) : null)}
          searchable
          placeholder="Sélectionnez un co-encadrant"
        />
      </div>

      {/* Entreprise & Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Entreprise d'Accueil (Optionnel)" value={formData?.hostCompany || ''} onChange={e => handleInputChange('hostCompany', e.target.value)} />
        <Input label="Date de Soutenance" type="date" value={formData?.defenseDate || ''} onChange={e => handleInputChange('defenseDate', e.target.value)} required />
      </div>

      {/* Mots-clés */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Mots-clés <span className="text-destructive">*</span>
        </label>
        <div className="flex space-x-2">
          <Input
            placeholder="Ajoutez un mot-clé + Entrée"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyPress={handleKeywordKeyPress}
          />
          <button
            onClick={addKeyword}
            disabled={!keywordInput.trim() || keywords.length >= 10}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-academic hover:bg-primary/90 disabled:opacity-50"
          >
            <Icon name="Plus" size={16} />
          </button>
        </div>
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {keywords.map((kw, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm">
                {kw}
                <button onClick={() => removeKeyword(kw)} className="hover:text-destructive">
                  <Icon name="X" size={14} />
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-2">{keywords.length}/10 (minimum 3)</p>
      </div>

      {/* Résumé */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Résumé <span className="text-destructive">*</span>
        </label>
        <textarea
          className="w-full min-h-[120px] p-3 border rounded-academic focus:ring-2 focus:ring-ring resize-vertical"
          placeholder="Résumé détaillé (200 à 1000 caractères)"
          value={formData?.abstract || ''}
          onChange={handleAbstractChange}
          maxLength={1000}
        />
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-muted-foreground">Min 200 caractères</span>
          <span className={abstractLength >= 200 ? 'text-muted-foreground' : 'text-destructive'}>
            {abstractLength}/1000
          </span>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <Checkbox
          label="Autoriser la consultation publique"
          checked={formData?.allowPublicAccess ?? true}
          onChange={(e) => handleInputChange('allowPublicAccess', e.target.checked)}
        />
        <Checkbox
          label="Rapport confidentiel"
          checked={!!formData?.isConfidential}
          onChange={(e) => handleInputChange('isConfidential', e.target.checked)}
        />
      </div>
    </div>
  );
};

export default ReportMetadataForm;