import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const CreateUserModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    studentId: '',
    employeeId: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

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

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (formData.role === 'student' && !formData.studentId.trim()) {
      newErrors.studentId = 'L\'ID étudiant est requis';
    }

    if ((formData.role === 'teacher' || formData.role === 'admin') && !formData.employeeId.trim()) {
      newErrors.employeeId = 'L\'ID employé est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = () => {
    if (validateForm()) {
      const userData = {
        ...formData,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      onCreate(userData);
      // Reset form
      setFormData({
        name: '',
        email: '',
        role: '',
        department: '',
        studentId: '',
        employeeId: '',
        password: '',
        confirmPassword: ''
      });
      setErrors({});
    }
  };

  const roleOptions = [
    { value: 'student', label: 'Étudiant' },
    { value: 'teacher', label: 'Enseignant' },
    { value: 'admin', label: 'Administrateur' }
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
            Créer un nouvel utilisateur
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
          {/* Profile Picture Placeholder */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="UserPlus" size={32} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-text-primary">Nouvel utilisateur</h3>
              <p className="text-sm text-text-secondary">Remplissez les informations ci-dessous</p>
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

            {/* Password */}
            <div>
              <Input
                label="Mot de passe"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={errors.password}
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <Input
                label="Confirmer le mot de passe"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
                required
              />
            </div>
          </div>

          {/* Password Requirements */}
          <div className="bg-background-secondary rounded-lg p-4">
            <h4 className="text-sm font-medium text-text-primary mb-2">Exigences du mot de passe</h4>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Au moins 8 caractères</li>
              <li>• Combinaison de lettres, chiffres et symboles recommandée</li>
            </ul>
          </div>
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
            onClick={handleCreate}
          >
            Créer l'utilisateur
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateUserModal;
