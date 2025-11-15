import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const TwoFactorAuth = ({
  userRole,
  onVerify,
  onCancel,
  isLoading,
  error,
  userEmail,
  userId
}) => {
  const [verificationMethod, setVerificationMethod] = useState('sms');
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [isSettingUp, setIsSettingUp] = useState(false);

  // Countdown timer for resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/2fa/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setCountdown(30);
      } else {
        console.error('Failed to send SMS');
      }
    } catch (err) {
      console.error('Error sending SMS:', err);
    }
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (verificationCode?.length === 6) {
      onVerify(verificationCode, verificationMethod);
    }
  };

  const generateQRCode = async () => {
    setIsSettingUp(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/2fa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, method: 'app' }),
      });

      if (response.ok) {
        const data = await response.json();
        setQrCodeData(data);
      } else {
        console.error('Failed to setup 2FA');
      }
    } catch (err) {
      console.error('Error setting up 2FA:', err);
    } finally {
      setIsSettingUp(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Shield" size={32} className="text-accent" />
        </div>
        <h3 className="text-xl font-heading font-semibold text-text-primary mb-2">
          Authentification à Deux Facteurs
        </h3>
        <p className="text-sm font-caption text-text-secondary">
          Sécurité renforcée requise pour les {userRole === 'teacher' ? 'enseignants' : 'administrateurs'}
        </p>
      </div>
      {/* Method Selection */}
      <div className="space-y-4">
        <h4 className="font-medium text-text-primary">Choisissez votre méthode :</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* SMS Method */}
          <button
            type="button"
            onClick={() => setVerificationMethod('sms')}
            className={`p-4 border-2 rounded-lg transition-academic ${
              verificationMethod === 'sms' ?'border-accent bg-accent/5' :'border-border hover:border-accent/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Icon
                name="Smartphone"
                size={24}
                className={verificationMethod === 'sms' ? 'text-accent' : 'text-text-secondary'}
              />
              <div className="text-left">
                <div className="font-medium text-text-primary">SMS</div>
                <div className="text-sm font-caption text-text-secondary">
                  Code par message
                </div>
              </div>
            </div>
          </button>

          {/* Authenticator App Method */}
          <button
            type="button"
            onClick={() => setVerificationMethod('app')}
            className={`p-4 border-2 rounded-lg transition-academic ${
              verificationMethod === 'app' ?'border-accent bg-accent/5' :'border-border hover:border-accent/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Icon
                name="Scan"
                size={24}
                className={verificationMethod === 'app' ? 'text-accent' : 'text-text-secondary'}
              />
              <div className="text-left">
                <div className="font-medium text-text-primary">App</div>
                <div className="text-sm font-caption text-text-secondary">
                  Google Authenticator
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
      {/* SMS Method Content */}
      {verificationMethod === 'sms' && (
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Info" size={16} className="text-accent" />
              <span className="text-sm font-medium text-text-primary">
                Numéro de téléphone
              </span>
            </div>
            <p className="text-sm font-caption text-text-secondary">
              Code envoyé au +216259022 (numéro enregistré)
            </p>
          </div>

          <Button
            variant="outline"
            onClick={handleSendCode}
            disabled={countdown > 0 || isLoading}
            iconName="Send"
            iconPosition="left"
            fullWidth
          >
            {countdown > 0 ? `Renvoyer dans ${countdown}s` : 'Envoyer le Code'}
          </Button>
        </div>
      )}
      {/* Authenticator App Method Content */}
      {verificationMethod === 'app' && (
        <div className="space-y-4">
          {!qrCodeData ? (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={generateQRCode}
                loading={isSettingUp}
                iconName="QrCode"
                iconPosition="left"
              >
                Générer le QR Code
              </Button>
              <p className="text-sm font-caption text-text-secondary mt-2">
                Scannez avec Google Authenticator
              </p>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="inline-block p-4 bg-white rounded-lg border">
                <img
                  src={qrCodeData.qrCode}
                  alt="QR Code pour configuration de l'authentification à deux facteurs ESPRIM"
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <div className="text-sm font-caption text-text-secondary space-y-1">
                <p>1. Ouvrez Google Authenticator</p>
                <p>2. Scannez ce QR code</p>
                <p>3. Entrez le code généré ci-dessous</p>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Verification Code Input */}
      <form onSubmit={handleVerify} className="space-y-4">
        <Input
          label="Code de Vérification"
          type="text"
          placeholder="123456"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e?.target?.value?.replace(/\D/g, '')?.slice(0, 6))}
          maxLength={6}
          required
          disabled={isLoading}
          className="text-center text-lg tracking-widest"
        />

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Icon name="AlertCircle" size={16} className="text-error flex-shrink-0" />
              <p className="text-sm text-error font-caption">{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="default"
            loading={isLoading}
            disabled={verificationCode?.length !== 6 || isLoading}
            iconName="Check"
            iconPosition="right"
            className="flex-1"
          >
            Vérifier
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TwoFactorAuth;
