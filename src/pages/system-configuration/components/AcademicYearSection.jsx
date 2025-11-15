import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const AcademicYearSection = ({ onSave }) => {
  const [academicSettings, setAcademicSettings] = useState({
    currentYear: '2024-2025',
    submissionDeadline: '2024-06-30',
    validationDeadline: '2024-07-15',
    archiveAfterYears: 7
  });

  const [specialties, setSpecialties] = useState([
    { id: 1, name: 'Génie Informatique', code: 'GI', department: 'Informatique', active: true },
    { id: 2, name: 'Génie Électrique', code: 'GE', department: 'Électrique', active: true },
    { id: 3, name: 'Génie Mécanique', code: 'GM', department: 'Mécanique', active: true },
    { id: 4, name: 'Génie Civil', code: 'GC', department: 'Civil', active: true },
    { id: 5, name: 'Génie Industriel', code: 'GIN', department: 'Industriel', active: false }
  ]);

  const [departments, setDepartments] = useState([
    { id: 1, name: 'Informatique', head: 'Prof. Ahmed Ben Salem', active: true },
    { id: 2, name: 'Électrique', head: 'Prof. Fatima Zahra', active: true },
    { id: 3, name: 'Mécanique', head: 'Prof. Mohamed Triki', active: true },
    { id: 4, name: 'Civil', head: 'Prof. Leila Mansouri', active: true },
    { id: 5, name: 'Industriel', head: 'Prof. Karim Bouaziz', active: false }
  ]);

  const [hasChanges, setHasChanges] = useState(false);
  const [showAddSpecialty, setShowAddSpecialty] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState({ name: '', code: '', department: '' });

  const handleSettingChange = (key, value) => {
    setAcademicSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSpecialtyToggle = (id) => {
    setSpecialties(prev => prev?.map(spec => 
      spec?.id === id ? { ...spec, active: !spec?.active } : spec
    ));
    setHasChanges(true);
  };

  const handleAddSpecialty = () => {
    if (newSpecialty?.name && newSpecialty?.code && newSpecialty?.department) {
      setSpecialties(prev => [...prev, {
        id: Math.max(...prev?.map(s => s?.id)) + 1,
        ...newSpecialty,
        active: true
      }]);
      setNewSpecialty({ name: '', code: '', department: '' });
      setShowAddSpecialty(false);
      setHasChanges(true);
    }
  };

  const handleSave = () => {
    onSave('academic', { 
      settings: academicSettings, 
      specialties, 
      departments 
    });
    setHasChanges(false);
  };

  const departmentOptions = departments?.filter(dept => dept?.active)?.map(dept => ({ value: dept?.name, label: dept?.name }));

  const yearOptions = [
    { value: '2023-2024', label: '2023-2024' },
    { value: '2024-2025', label: '2024-2025' },
    { value: '2025-2026', label: '2025-2026' }
  ];

  return (
    <div className="space-y-6">
      {/* Academic Year Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Icon name="Calendar" size={20} className="text-primary" />
          <h3 className="text-lg font-heading font-medium text-text-primary">
            Année Académique
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Année académique actuelle"
            options={yearOptions}
            value={academicSettings?.currentYear}
            onChange={(value) => handleSettingChange('currentYear', value)}
          />
          
          <Input
            label="Archivage après (années)"
            type="number"
            min="5"
            max="15"
            description="Durée de conservation des rapports"
            value={academicSettings?.archiveAfterYears}
            onChange={(e) => handleSettingChange('archiveAfterYears', parseInt(e?.target?.value))}
          />
          
          <Input
            label="Date limite de soumission"
            type="date"
            value={academicSettings?.submissionDeadline}
            onChange={(e) => handleSettingChange('submissionDeadline', e?.target?.value)}
          />
          
          <Input
            label="Date limite de validation"
            type="date"
            value={academicSettings?.validationDeadline}
            onChange={(e) => handleSettingChange('validationDeadline', e?.target?.value)}
          />
        </div>
      </div>
      {/* Departments */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Icon name="Building" size={20} className="text-primary" />
          <h3 className="text-lg font-heading font-medium text-text-primary">
            Départements
          </h3>
        </div>
        
        <div className="space-y-3">
          {departments?.map(dept => (
            <div key={dept?.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${dept?.active ? 'bg-success' : 'bg-error'}`} />
                <div>
                  <p className="font-medium text-text-primary">{dept?.name}</p>
                  <p className="text-sm font-caption text-text-secondary">Chef: {dept?.head}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-caption rounded ${
                  dept?.active ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                }`}>
                  {dept?.active ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Specialties */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Icon name="GraduationCap" size={20} className="text-primary" />
            <h3 className="text-lg font-heading font-medium text-text-primary">
              Spécialités
            </h3>
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowAddSpecialty(true)}
            iconName="Plus"
            iconPosition="left"
          >
            Ajouter
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {specialties?.map(specialty => (
            <div key={specialty?.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleSpecialtyToggle(specialty?.id)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-academic ${
                    specialty?.active 
                      ? 'bg-success border-success text-white' :'border-border bg-background'
                  }`}
                >
                  {specialty?.active && <Icon name="Check" size={12} />}
                </button>
                
                <div>
                  <p className="font-medium text-text-primary">
                    {specialty?.name} ({specialty?.code})
                  </p>
                  <p className="text-sm font-caption text-text-secondary">
                    Département: {specialty?.department}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Add Specialty Modal */}
      {showAddSpecialty && (
        <div className="fixed inset-0 bg-black/50 z-200 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-heading font-medium text-text-primary">
                Ajouter une Spécialité
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAddSpecialty(false)}
                iconName="X"
              />
            </div>
            
            <div className="p-6 space-y-4">
              <Input
                label="Nom de la spécialité"
                value={newSpecialty?.name}
                onChange={(e) => setNewSpecialty(prev => ({ ...prev, name: e?.target?.value }))}
                placeholder="ex: Génie Logiciel"
              />
              
              <Input
                label="Code"
                value={newSpecialty?.code}
                onChange={(e) => setNewSpecialty(prev => ({ ...prev, code: e?.target?.value?.toUpperCase() }))}
                placeholder="ex: GL"
              />
              
              <Select
                label="Département"
                options={departmentOptions}
                value={newSpecialty?.department}
                onChange={(value) => setNewSpecialty(prev => ({ ...prev, department: value }))}
              />
              
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAddSpecialty(false)}
                  fullWidth
                >
                  Annuler
                </Button>
                
                <Button
                  variant="default"
                  onClick={handleAddSpecialty}
                  disabled={!newSpecialty?.name || !newSpecialty?.code || !newSpecialty?.department}
                  fullWidth
                >
                  Ajouter
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-2 text-sm font-caption text-text-secondary">
          <Icon name="Info" size={16} />
          <span>Les modifications affectent les nouvelles soumissions</span>
        </div>
        
        <Button
          variant="default"
          onClick={handleSave}
          disabled={!hasChanges}
          iconName="Save"
          iconPosition="left"
        >
          Enregistrer la Configuration
        </Button>
      </div>
    </div>
  );
};

export default AcademicYearSection;