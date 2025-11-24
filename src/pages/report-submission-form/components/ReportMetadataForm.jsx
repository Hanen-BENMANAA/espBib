import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const ReportMetadataForm = ({ formData, onFormChange, errors = {} }) => {
  const [keywords, setKeywords] = useState(formData?.keywords || []);
  const [keywordInput, setKeywordInput] = useState('');
  const [abstractLength, setAbstractLength] = useState(formData?.abstract?.length || 0);

  const specialtyOptions = [
    { value: 'informatique', label: 'Génie Informatique' },
    { value: 'electrique', label: 'Génie Électrique' },
    { value: 'mecanique', label: 'Génie Mécanique' },
    { value: 'civil', label: 'Génie Civil' },
    { value: 'industriel', label: 'Génie Industriel' },
    { value: 'telecom', label: 'Télécommunications' }
  ];

  const academicYearOptions = [
    { value: '2023-2024', label: '2023-2024' },
    { value: '2022-2023', label: '2022-2023' },
    { value: '2021-2022', label: '2021-2022' },
    { value: '2020-2021', label: '2020-2021' }
  ];

  const supervisorOptions = [
    { value: 'prof-ben-ahmed', label: 'Prof. Ahmed Ben Salah - Informatique' },
    { value: 'Leila Trabelsi', label: 'Prof. Leila Trabelsi - Électrique' },
    { value: 'prof-gharbi', label: 'Prof. Mohamed Gharbi - Mécanique' },
    { value: 'prof-mansouri', label: 'Prof. Fatma Mansouri - Civil' },
    { value: 'prof-khelifi', label: 'Prof. Karim Khelifi - Industriel' },
    { value: 'prof-bouaziz', label: 'Prof. Sonia Bouaziz - Télécommunications' }
  ];

  const handleInputChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    onFormChange(updatedData);
  };

  const handleAbstractChange = (e) => {
    const value = e?.target?.value;
    setAbstractLength(value?.length);
    handleInputChange('abstract', value);
  };

  const addKeyword = () => {
    if (keywordInput?.trim() && !keywords?.includes(keywordInput?.trim()) && keywords?.length < 10) {
      const newKeywords = [...keywords, keywordInput?.trim()];
      setKeywords(newKeywords);
      handleInputChange('keywords', newKeywords);
      setKeywordInput('');
    }
  };

  const removeKeyword = (keywordToRemove) => {
    const newKeywords = keywords?.filter(keyword => keyword !== keywordToRemove);
    setKeywords(newKeywords);
    handleInputChange('keywords', newKeywords);
  };

  const handleKeywordKeyPress = (e) => {
    if (e?.key === 'Enter') {
      e?.preventDefault();
      addKeyword();
    }
  };

  useEffect(() => {
    if (formData?.keywords) {
      setKeywords(formData?.keywords);
    }
  }, [formData?.keywords]);

  return (
    <div className="space-y-6">
      {/* Report Title */}
      <div>
        <Input
          label="Titre du Rapport"
          type="text"
          placeholder="Saisissez le titre complet de votre rapport PFE"
          value={formData?.title || ''}
          onChange={(e) => handleInputChange('title', e?.target?.value)}
          error={errors?.title}
          required
          maxLength={200}
          description="Maximum 200 caractères"
        />
      </div>
      {/* Author Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Prénom de l'Auteur"
          type="text"
          placeholder="Prénom"
          value={formData?.authorFirstName || ''}
          onChange={(e) => handleInputChange('authorFirstName', e?.target?.value)}
          error={errors?.authorFirstName}
          required
        />
        <Input
          label="Nom de l'Auteur"
          type="text"
          placeholder="Nom de famille"
          value={formData?.authorLastName || ''}
          onChange={(e) => handleInputChange('authorLastName', e?.target?.value)}
          error={errors?.authorLastName}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Numéro d'Étudiant"
          type="text"
          placeholder="Ex: ESP2024001"
          value={formData?.studentNumber || ''}
          onChange={(e) => handleInputChange('studentNumber', e?.target?.value)}
          error={errors?.studentNumber}
          required
        />
        <Input
          label="Email Institutionnel"
          type="email"
          placeholder="prenom.nom@esprim.tn"
          value={formData?.email || ''}
          onChange={(e) => handleInputChange('email', e?.target?.value)}
          error={errors?.email}
          required
        />
      </div>
      {/* Academic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Spécialité"
          options={specialtyOptions}
          value={formData?.specialty || ''}
          onChange={(value) => handleInputChange('specialty', value)}
          error={errors?.specialty}
          required
          placeholder="Sélectionnez votre spécialité"
        />
        <Select
          label="Année Académique"
          options={academicYearOptions}
          value={formData?.academicYear || ''}
          onChange={(value) => handleInputChange('academicYear', value)}
          error={errors?.academicYear}
          required
          placeholder="Sélectionnez l'année"
        />
      </div>
      {/* Supervisor Selection */}
      <div>
        <Select
          label="Encadrant Principal"
          options={supervisorOptions}
          value={formData?.supervisor || ''}
          onChange={(value) => handleInputChange('supervisor', value)}
          error={errors?.supervisor}
          required
          searchable
          placeholder="Recherchez et sélectionnez votre encadrant"
          description="Encadrant académique responsable de votre projet"
        />
      </div>
      {/* Co-supervisor (Optional) */}
      <div>
        <Select
          label="Co-encadrant (Optionnel)"
          options={supervisorOptions}
          value={formData?.coSupervisor || ''}
          onChange={(value) => handleInputChange('coSupervisor', value)}
          error={errors?.coSupervisor}
          searchable
          placeholder="Sélectionnez un co-encadrant si applicable"
          description="Encadrant secondaire ou industriel"
        />
      </div>
      {/* Company Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Entreprise d'Accueil (Optionnel)"
          type="text"
          placeholder="Nom de l'entreprise"
          value={formData?.hostCompany || ''}
          onChange={(e) => handleInputChange('hostCompany', e?.target?.value)}
          error={errors?.hostCompany}
        />
        <Input
          label="Date de Soutenance"
          type="date"
          value={formData?.defenseDate || ''}
          onChange={(e) => handleInputChange('defenseDate', e?.target?.value)}
          error={errors?.defenseDate}
          required
        />
      </div>
      {/* Keywords Section */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Mots-clés <span className="text-destructive">*</span>
        </label>
        <div className="space-y-3">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Ajoutez un mot-clé et appuyez sur Entrée"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e?.target?.value)}
                onKeyPress={handleKeywordKeyPress}
                maxLength={50}
              />
            </div>
            <button
              type="button"
              onClick={addKeyword}
              disabled={!keywordInput?.trim() || keywords?.length >= 10}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-academic hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed academic-transition"
            >
              <Icon name="Plus" size={16} />
            </button>
          </div>
          
          {keywords?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {keywords?.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                >
                  <span>{keyword}</span>
                  <button
                    type="button"
                    onClick={() => removeKeyword(keyword)}
                    className="hover:text-destructive academic-transition"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            {keywords?.length}/10 mots-clés • Minimum 3 requis
          </p>
          {errors?.keywords && (
            <p className="text-sm text-destructive">{errors?.keywords}</p>
          )}
        </div>
      </div>
      {/* Abstract */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Résumé <span className="text-destructive">*</span>
        </label>
        <textarea
          className="w-full min-h-[120px] p-3 border border-border rounded-academic focus:ring-2 focus:ring-ring focus:border-transparent resize-vertical"
          placeholder="Rédigez un résumé détaillé de votre projet (minimum 200 caractères, maximum 1000 caractères)"
          value={formData?.abstract || ''}
          onChange={handleAbstractChange}
          maxLength={1000}
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-muted-foreground">
            Minimum 200 caractères requis
          </p>
          <p className={`text-xs ${abstractLength > 1000 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {abstractLength}/1000 caractères
          </p>
        </div>
        {errors?.abstract && (
          <p className="text-sm text-destructive mt-1">{errors?.abstract}</p>
        )}
      </div>
      {/* Additional Options */}
      <div className="space-y-3">
        <Checkbox
          label="Autoriser la consultation publique"
          description="Permettre aux utilisateurs autorisés de consulter ce rapport"
          checked={formData?.allowPublicAccess || false}
          onChange={(e) => handleInputChange('allowPublicAccess', e?.target?.checked)}
        />
        
        <Checkbox
          label="Rapport confidentiel"
          description="Marquer ce rapport comme confidentiel (accès restreint)"
          checked={formData?.isConfidential || false}
          onChange={(e) => handleInputChange('isConfidential', e?.target?.checked)}
        />
      </div>
    </div>
  );
};

export default ReportMetadataForm;