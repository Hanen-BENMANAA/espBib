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
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCodeData, setQrCodeData] = useState(null);
  const [manualEntryKey, setManualEntryKey] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);

  // Check if user needs to set up 2FA first
  useEffect(() => {
    console.log('TwoFactorAuth mounted:', { userId, userEmail, userRole });
  }, []);

  // ==================== GENERATE QR CODE ====================
  const generateQRCode = async () => {
    const id = userId || userEmail;
    if (!id) {
      console.error('No userId or userEmail provided');
      return;
    }

    setIsSettingUp(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, method: 'app' })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setQrCodeData(data.qrCode);
        setManualEntryKey(data.secret);
        console.log('✅ QR Code generated successfully');
      } else {
        console.error('❌ QR generation failed:', data.error);
      }
    } catch (error) {
      console.error('❌ Error generating QR code:', error);
    } finally {
      setIsSettingUp(false);
    }
  };

  // ==================== VERIFY SETUP CODE ====================
  const handleVerifySetup = async () => {
    if (verificationCode.length !== 6) {
      return;
    }

    const id = userId || userEmail;

    try {
      const response = await fetch('http://localhost:5000/api/auth/2fa/verify-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: id,
          code: verificationCode,
          method: 'app'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Authenticator app configured successfully!');
        setSetupComplete(true);
        
        // After 2 seconds, allow user to log in with the code
        setTimeout(() => {
          setQrCodeData(null);
          setSetupComplete(false);
          setVerificationCode('');
        }, 2000);
      } else {
        console.error('❌ Setup verification failed:', data.error);
      }
    } catch (error) {
      console.error('❌ Error verifying setup:', error);
    }
  };

  // ==================== VERIFY LOGIN CODE ====================
  const handleVerifyLogin = (e) => {
    e.preventDefault();
    
    if (verificationCode.length === 6) {
      onVerify(verificationCode, 'app');
    }
  };

  // ==================== RENDER SETUP MODE ====================
  if (qrCodeData && !setupComplete) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Scan" size={32} className="text-accent" />
          </div>
          <h3 className="text-xl font-heading font-semibold mb-2">
            Configuration de l'Authentificateur
          </h3>
          <p className="text-sm text-text-secondary">
            Configurez votre application d'authentification
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Icon name="Info" size={16} />
              Étape 1: Téléchargez une application
            </h4>
            <p className="text-sm text-blue-800">
              Installez Google Authenticator, Microsoft Authenticator, Authy ou toute autre application TOTP compatible.
            </p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
              <Icon name="QrCode" size={16} />
              Étape 2: Scannez le QR Code
            </h4>
            
            {/* QR Code */}
            <div className="flex justify-center mb-3">
              <div className="p-4 bg-white rounded-lg border-2 border-blue-300">
                <img 
                  src={qrCodeData} 
                  alt="QR Code 2FA" 
                  className="w-48 h-48"
                />
              </div>
            </div>

            {/* Manual Entry Option */}
            <div className="text-center">
              <button
                onClick={() => setShowManualEntry(!showManualEntry)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {showManualEntry ? 'Masquer' : 'Impossible de scanner? Saisie manuelle'}
              </button>
              
              {showManualEntry && manualEntryKey && (
                <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Clé de configuration:</p>
                  <code className="text-sm font-mono font-bold text-gray-900 select-all break-all">
                    {manualEntryKey}
                  </code>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
              <Icon name="Key" size={16} />
              Étape 3: Entrez le code de vérification
            </h4>
            <Input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="text-center tracking-widest text-2xl font-mono"
            />
            <p className="text-xs text-blue-700 mt-2">
              Entrez le code à 6 chiffres généré par votre application
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              setQrCodeData(null);
              setVerificationCode('');
              setShowManualEntry(false);
            }}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            variant="default"
            onClick={handleVerifySetup}
            disabled={verificationCode.length !== 6}
            className="flex-1"
          >
            Vérifier et Activer
          </Button>
        </div>
      </div>
    );
  }

  // ==================== RENDER SUCCESS STATE ====================
  if (setupComplete) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
          <Icon name="CheckCircle" size={32} className="text-success" />
        </div>
        <h3 className="text-xl font-heading font-semibold text-success">
          Configuration Réussie!
        </h3>
        <p className="text-sm text-text-secondary">
          Votre authentificateur est maintenant activé. Vous pouvez maintenant vous connecter.
        </p>
      </div>
    );
  }

  // ==================== RENDER LOGIN MODE ====================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Shield" size={32} className="text-accent" />
        </div>
        <h3 className="text-xl font-heading font-semibold mb-2">
          Authentification à Deux Facteurs
        </h3>
        <p className="text-sm text-text-secondary">
          Sécurité renforcée requise pour les {userRole === 'teacher' ? 'enseignants' : 'administrateurs'}
        </p>
      </div>

      {/* Method Display */}
      <div className="p-4 border-2 border-accent bg-accent/5 rounded-lg">
        <div className="flex items-center space-x-3">
          <Icon name="Scan" size={24} className="text-accent" />
          <div>
            <div className="font-medium">Application d'Authentification</div>
            <div className="text-xs text-text-secondary">
              Entrez le code de votre application
            </div>
          </div>
        </div>
      </div>

      {/* Setup Button (if not configured) */}
      {!qrCodeData && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3 mb-3">
            <Icon name="AlertTriangle" size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Première connexion avec 2FA</p>
              <p>Vous devez d'abord configurer votre application d'authentification.</p>
            </div>
          </div>
          
          <Button
            variant="default"
            onClick={generateQRCode}
            loading={isSettingUp}
            iconName="QrCode"
            iconPosition="left"
            fullWidth
          >
            Configurer l'Authentificateur
          </Button>
        </div>
      )}

      {/* Code Input (if already configured) */}
      {!qrCodeData && (
        <form onSubmit={handleVerifyLogin} className="space-y-4">
          <Input
            label="Code de Vérification"
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            className="text-center tracking-widest text-2xl font-mono"
          />

          <div className="text-xs text-center text-text-secondary">
            Ouvrez votre application d'authentification et entrez le code à 6 chiffres
          </div>

          {error && (
            <div className="p-3 bg-error/10 text-error border border-error/20 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={onCancel} 
              className="flex-1"
              type="button"
            >
              Annuler
            </Button>
            <Button
              variant="default"
              type="submit"
              loading={isLoading}
              disabled={verificationCode.length !== 6}
              className="flex-1"
            >
              Vérifier
            </Button>
          </div>
        </form>
      )}

      {/* Help Text */}
      <div className="text-center text-xs text-text-secondary">
        <p>Les codes changent toutes les 30 secondes</p>
      </div>
    </div>
  );
};

export default TwoFactorAuth;