import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const PasswordResetModal = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const VALID_RESET_CODE = "789456";

  const validateEmail = (email) => {
    if (!email) return 'L\'adresse e-mail est requise';
    if (!email?.endsWith('@esprim.tn')) {
      return 'Veuillez utiliser votre adresse e-mail institutionnelle';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Le mot de passe est requis';
    if (password?.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères';
    if (!/[A-Z]/?.test(password)) return 'Le mot de passe doit contenir au moins une majuscule';
    if (!/[a-z]/?.test(password)) return 'Le mot de passe doit contenir au moins une minuscule';
    if (!/[0-9]/?.test(password)) return 'Le mot de passe doit contenir au moins un chiffre';
    if (!/[!@#$%^&*]/?.test(password)) return 'Le mot de passe doit contenir au moins un caractère spécial';
    return '';
  };

  const handleSendCode = () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setStep('verification');
      setIsLoading(false);
    }, 1500);
  };

  const handleVerifyCode = () => {
    if (!verificationCode) {
      setErrors({ code: 'Le code de vérification est requis' });
      return;
    }

    if (verificationCode?.length !== 6) {
      setErrors({ code: 'Le code doit contenir 6 chiffres' });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      if (verificationCode === VALID_RESET_CODE) {
        setStep('newPassword');
        setErrors({});
      } else {
        setErrors({ code: 'Code de vérification incorrect' });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleResetPassword = () => {
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setErrors({ newPassword: passwordError });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Les mots de passe ne correspondent pas' });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      onSuccess();
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            Réinitialisation du mot de passe
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        <div className="p-6">
          {step === 'email' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                  <Icon name="Mail" size={24} color="var(--color-primary)" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Entrez votre adresse e-mail institutionnelle pour recevoir un code de vérification
                </p>
              </div>

              <Input
                label="Adresse e-mail institutionnelle"
                type="email"
                placeholder="prenom.nom@esprim.tn"
                value={email}
                onChange={(e) => {
                  setEmail(e?.target?.value);
                  setErrors({});
                }}
                error={errors?.email}
                required
              />

              <Button
                variant="default"
                fullWidth
                onClick={handleSendCode}
                loading={isLoading}
                iconName="Send"
                iconPosition="right"
              >
                Envoyer le code
              </Button>
            </div>
          )}

          {step === 'verification' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                  <Icon name="ShieldCheck" size={24} color="var(--color-primary)" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Un code de vérification a été envoyé à <strong>{email}</strong>
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Icon name="Info" size={20} color="#0EA5E9" className="flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    Code de test : <strong>{VALID_RESET_CODE}</strong>
                  </p>
                </div>
              </div>

              <Input
                label="Code de vérification"
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e?.target?.value?.replace(/\D/g, '')?.slice(0, 6));
                  setErrors({});
                }}
                error={errors?.code}
                maxLength={6}
                required
              />

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setStep('email')}
                >
                  Retour
                </Button>
                <Button
                  variant="default"
                  fullWidth
                  onClick={handleVerifyCode}
                  loading={isLoading}
                  disabled={verificationCode?.length !== 6}
                  iconName="ArrowRight"
                  iconPosition="right"
                >
                  Vérifier
                </Button>
              </div>
            </div>
          )}

          {step === 'newPassword' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-success/10 rounded-full mb-4">
                  <Icon name="Lock" size={24} color="var(--color-success)" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Créez un nouveau mot de passe sécurisé
                </p>
              </div>

              <Input
                label="Nouveau mot de passe"
                type="password"
                placeholder="Entrez votre nouveau mot de passe"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e?.target?.value);
                  setErrors({});
                }}
                error={errors?.newPassword}
                required
                description="Au moins 8 caractères avec majuscules, minuscules, chiffres et caractères spéciaux"
              />

              <Input
                label="Confirmer le mot de passe"
                type="password"
                placeholder="Confirmez votre nouveau mot de passe"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e?.target?.value);
                  setErrors({});
                }}
                error={errors?.confirmPassword}
                required
              />

              <Button
                variant="default"
                fullWidth
                onClick={handleResetPassword}
                loading={isLoading}
                iconName="Check"
                iconPosition="right"
              >
                Réinitialiser le mot de passe
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordResetModal;