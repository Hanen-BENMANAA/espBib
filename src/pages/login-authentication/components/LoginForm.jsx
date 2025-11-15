import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const LoginForm = ({ onSubmit, isLoading, error }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validateEmail = (email) => {
    if (!email) return "L'adresse email est requise";
    if (!email?.includes('@')) return "Format d'email invalide";
    if (!email?.endsWith('@Esprim.tn')) return "Seules les adresses @Esprim.tn sont autorisées";
    return null;
  };

  const validatePassword = (password) => {
    if (!password) return "Le mot de passe est requis";
    if (password?.length < 6) return "Le mot de passe doit contenir au moins 6 caractères";
    return null;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors?.[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    
    const errors = {};
    const emailError = validateEmail(formData?.email);
    const passwordError = validatePassword(formData?.password);
    
    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;
    
    setValidationErrors(errors);
    
    if (Object.keys(errors)?.length === 0) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Field */}
      <Input
        label="Adresse Email Institutionnelle"
        type="email"
        placeholder="votre.nom@Esprim.tn"
        value={formData?.email}
        onChange={(e) => handleInputChange('email', e?.target?.value)}
        error={validationErrors?.email}
        required
        disabled={isLoading}
        className="w-full"
      />
      {/* Password Field */}
      <div className="relative">
        <Input
          label="Mot de Passe"
          type={showPassword ? "text" : "password"}
          placeholder="Entrez votre mot de passe"
          value={formData?.password}
          onChange={(e) => handleInputChange('password', e?.target?.value)}
          error={validationErrors?.password}
          required
          disabled={isLoading}
          className="w-full pr-12"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-9 text-text-secondary hover:text-text-primary transition-academic"
          disabled={isLoading}
        >
          <Icon 
            name={showPassword ? "EyeOff" : "Eye"} 
            size={20}
          />
        </button>
      </div>
      {/* Global Error Message */}
      {error && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={16} className="text-error flex-shrink-0" />
            <p className="text-sm text-error font-caption">{error}</p>
          </div>
        </div>
      )}
      {/* Submit Button */}
      <Button
        type="submit"
        variant="default"
        size="lg"
        fullWidth
        loading={isLoading}
        disabled={isLoading}
        iconName="LogIn"
        iconPosition="right"
      >
        {isLoading ? 'Connexion en cours...' : 'Se Connecter'}
      </Button>
      {/* Help Text */}
      <div className="text-center">
        <p className="text-sm font-caption text-text-secondary">
          Utilisez vos identifiants institutionnels ESPRIM
        </p>
        <p className="text-xs font-caption text-text-secondary mt-1">
          Première connexion ? Votre profil sera créé automatiquement
        </p>
      </div>
    </form>
  );
};

export default LoginForm;