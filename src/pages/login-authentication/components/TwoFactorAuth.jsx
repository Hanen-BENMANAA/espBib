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

  // ----------------------------
  // DEBUG
  // ----------------------------
  useEffect(() => {
    console.log('TwoFactorAuth props:', { userId, userEmail, userRole });
  }, []);

  // ----------------------------
  // COUNTDOWN
  // ----------------------------
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // ----------------------------
  // SEND SMS
  // ----------------------------
  const handleSendCode = async () => {
    const id = userId || userEmail;
    if (!id) return;

    try {
      const response = await fetch('http://localhost:5000/api/auth/2fa/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id })
      });

      if (response.ok) setCountdown(30);
    } catch (err) {
      console.error('SMS ERROR:', err);
    }
  };

  // ----------------------------
  // VERIFY CODE
  // ----------------------------
  const handleVerify = (e) => {
    e.preventDefault();
    if (verificationCode.length === 6) {
      onVerify(verificationCode, verificationMethod);
    }
  };

  // ----------------------------
  // GENERATE QR CODE
  // ----------------------------
  const generateQRCode = async () => {
    const id = userId || userEmail;
    if (!id) return;

    setIsSettingUp(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, method: 'app' })
      });

      if (response.ok) {
        const data = await response.json();
        setQrCodeData(data);
      }
    } finally {
      setIsSettingUp(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="text-center">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Shield" size={32} className="text-accent" />
        </div>

        <h3 className="text-xl font-heading font-semibold">
          Authentification à Deux Facteurs
        </h3>

        <p className="text-sm text-text-secondary">
          Sécurité renforcée requise pour les {userRole === 'teacher' ? 'enseignants' : 'administrateurs'}.
        </p>
      </div>

      {/* METHOD SELECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <button
          onClick={() => setVerificationMethod('sms')}
          className={`p-4 border-2 rounded-lg ${verificationMethod === 'sms' ? 'border-accent bg-accent/5' : 'border-border'}`}
        >
          <div className="flex items-center space-x-3">
            <Icon name="Smartphone" size={24} className="text-accent" />
            <div>
              <div className="font-medium">SMS</div>
              <div className="text-xs text-text-secondary">Code par message</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => setVerificationMethod('app')}
          className={`p-4 border-2 rounded-lg ${verificationMethod === 'app' ? 'border-accent bg-accent/5' : 'border-border'}`}
        >
          <div className="flex items-center space-x-3">
            <Icon name="Scan" size={24} className="text-accent" />
            <div>
              <div className="font-medium">Application</div>
              <div className="text-xs text-text-secondary">Google Authenticator</div>
            </div>
          </div>
        </button>

      </div>

      {/* SMS CONTENT */}
      {verificationMethod === 'sms' && (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">Code test : 123456</p>

          <Button
            variant="outline"
            onClick={handleSendCode}
            disabled={countdown > 0}
            iconName="Send"
            fullWidth
          >
            {countdown > 0 ? `Renvoyer dans ${countdown}s` : 'Envoyer le code'}
          </Button>
        </div>
      )}

      {/* AUTHENTICATOR APP CONTENT */}
      {verificationMethod === 'app' && (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">Code test : 789012</p>

          {!qrCodeData ? (
            <Button
              variant="outline"
              iconName="QrCode"
              loading={isSettingUp}
              onClick={generateQRCode}
              fullWidth
            >
              Générer QR Code
            </Button>
          ) : (
            <div className="text-center">
              <img src={qrCodeData.qrCode} alt="QR Code 2FA" className="w-40 mx-auto" />
              <p className="text-xs text-text-secondary mt-2">Scannez dans Google Authenticator</p>
            </div>
          )}
        </div>
      )}

      {/* CODE INPUT */}
      <form onSubmit={handleVerify} className="space-y-4">
        <Input
          label="Code de Vérification"
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          maxLength={6}
          className="text-center tracking-widest text-lg"
        />

        {error && (
          <div className="p-3 bg-error/10 text-error border border-error/20 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex space-x-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">Annuler</Button>
          <Button
            variant="default"
            loading={isLoading}
            disabled={verificationCode.length !== 6}
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
