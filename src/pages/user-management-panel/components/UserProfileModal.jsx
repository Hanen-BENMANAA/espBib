import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const UserProfileModal = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    studentId: '',
    employeeId: '',
    status: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || '',
        department: user.department || '',
        studentId: user.studentId || '',
        employeeId: user.employeeId || '',
        status: user.status || ''
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.role) {
      newErrors.role = 'Le rôle est requis';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Le département est requis';
    }

    if (formData.role === 'student' && !formData.studentId.trim()) {
      newErrors.studentId = 'L\'ID étudiant est requis';
    }

    if (formData.role === 'teacher' && !formData.employeeId.trim()) {
      newErrors.employeeId = 'L\'ID employé est requis';
    }

    if (formData.role === 'admin' && !formData.employeeId.trim()) {
      newErrors.employeeId = 'L\'ID employé est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const roleOptions = [
    { value: 'student', label: 'Étudiant' },
    { value: 'teacher', label: 'Enseignant' },
    { value: 'admin', label: 'Administrateur' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
    { value: 'suspended', label: 'Suspendu' }
  ];

  const departmentOptions = [
    { value: 'Informatique', label: 'Informatique' },
    { value: 'Génie Civil', label: 'Génie Civil' },
    { value: 'Génie Électrique', label: 'Génie Électrique' },
    { value: 'Génie Mécanique', label: 'Génie Mécanique' },
    { value: 'Génie Industriel', label: 'Génie Industriel' },
    { value: 'Administration', label: 'Administration' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-heading font-bold text-text-primary">
            {user ? 'Modifier l\'utilisateur' : 'Nouveau utilisateur'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            iconName="X"
            iconSize={20}
          />
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="User" size={32} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-text-primary">{formData.name || 'Nouvel utilisateur'}</h3>
              <p className="text-sm text-text-secondary">{formData.email || 'Email non défini'}</p>
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <Input
                label="Nom complet"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name}
                required
              />
            </div>

            {/* Email */}
            <div>
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
                required
              />
            </div>

            {/* Role */}
            <div>
              <Select
                label="Rôle"
                options={roleOptions}
                value={formData.role}
                onChange={(value) => handleInputChange('role', value)}
                error={errors.role}
                required
              />
            </div>

            {/* Department */}
            <div>
              <Select
                label="Département"
                options={departmentOptions}
                value={formData.department}
                onChange={(value) => handleInputChange('department', value)}
                error={errors.department}
                required
              />
            </div>

            {/* Student ID (conditional) */}
            {formData.role === 'student' && (
              <div>
                <Input
                  label="ID Étudiant"
                  value={formData.studentId}
                  onChange={(e) => handleInputChange('studentId', e.target.value)}
                  error={errors.studentId}
                  required
                />
              </div>
            )}

            {/* Employee ID (conditional) */}
            {(formData.role === 'teacher' || formData.role === 'admin') && (
              <div>
                <Input
                  label="ID Employé"
                  value={formData.employeeId}
                  onChange={(e) => handleInputChange('employeeId', e.target.value)}
                  error={errors.employeeId}
                  required
                />
              </div>
            )}

            {/* Status */}
            <div>
              <Select
                label="Statut"
                options={statusOptions}
                value={formData.status}
                onChange={(value) => handleInputChange('status', value)}
              />
            </div>
          </div>

          {/* Additional Info */}
          {user && (
            <div className="bg-background-secondary rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-medium text-text-primary">Informations supplémentaires</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text-secondary">Dernière connexion:</span>
                  <div className="text-text-primary">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'}
                  </div>
                </div>
                <div>
                  <span className="text-text-secondary">Créé le:</span>
                  <div className="text-text-primary">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Annuler
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
          >
            Sauvegarder
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
