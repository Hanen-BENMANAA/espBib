import React, { useState, useEffect } from 'react';
import { Shield, Smartphone, Scan, Key, CheckCircle, AlertCircle, X, ChevronRight } from 'lucide-react';

const TwoFactorSettings = () => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  const [setupMethod, setSetupMethod] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/2fa/status', {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStatus(data.status);
      }
    } catch (err) {
      console.error('Error fetching 2FA status:', err);
    } finally {
      setLoading(false);
    }
  };

  const getToken = () => {
    const session = JSON.parse(localStorage.getItem('esprim_session') || '{}');
    return session.token;
  };

  const handleSetupStart = (method) => {
    setSetupMethod(method);
    setShowSetup(true);
    setError('');
    setSuccess('');
    
    if (method === 'app') {
      generateQRCode();
    }
  };

  const generateQRCode = async () => {
    try {
      const session = JSON.parse(localStorage.getItem('esprim_session') || '{}');
      const response = await fetch('http://localhost:5000/api/auth/2fa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          userId: session.userEmail,
          method: 'app'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setQrCode(data.qrCode);
      } else {
        setError(data.error || 'Failed to generate QR code');
      }
    } catch (err) {
      setError('Error generating QR code');
    }
  };

  const handleVerifyApp = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    try {
      const session = JSON.parse(localStorage.getItem('esprim_session') || '{}');
      const response = await fetch('http://localhost:5000/api/auth/2fa/verify-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          userId: session.userEmail,
          code: verificationCode,
          method: 'app'
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Authenticator app successfully configured!');
        setShowSetup(false);
        fetchStatus();
        setVerificationCode('');
      } else {
        setError(data.error || 'Invalid verification code');
      }
    } catch (err) {
      setError('Error verifying code');
    }
  };

  const handleSetupPhone = async () => {
    if (!phoneNumber.match(/^\+?[1-9]\d{1,14}$/)) {
      setError('Invalid phone number format. Use international format (e.g., +21612345678)');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/2fa/update-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ phoneNumber })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Phone number successfully configured!');
        setShowSetup(false);
        fetchStatus();
        setPhoneNumber('');
      } else {
        setError(data.error || 'Failed to update phone number');
      }
    } catch (err) {
      setError('Error updating phone number');
    }
  };

  const handleDisable = async (method) => {
    if (!confirm(`Are you sure you want to disable ${method === 'app' ? 'Authenticator App' : 'SMS'} 2FA?`)) {
      return;
    }

    const password = prompt('Enter your password to confirm:');
    if (!password) return;

    try {
      const response = await fetch('http://localhost:5000/api/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ method, password })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(`${method === 'app' ? 'Authenticator App' : 'SMS'} 2FA disabled successfully`);
        fetchStatus();
      } else {
        setError(data.error || 'Failed to disable 2FA');
      }
    } catch (err) {
      setError('Error disabling 2FA');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="text-blue-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h2>
        </div>
        <p className="text-gray-600">
          Add an extra layer of security to your account. When enabled, you'll need to provide a verification code in addition to your password.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
            <X size={20} />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm text-green-800">{success}</p>
          </div>
          <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">
            <X size={20} />
          </button>
        </div>
      )}

      {/* Authenticator App Method */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Scan className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Authenticator App
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Use an authenticator app like Google Authenticator or Authy
                </p>
                {status?.app?.enabled && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle size={16} />
                    <span className="font-medium">Active</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              {status?.app?.enabled ? (
                <button
                  onClick={() => handleDisable('app')}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Disable
                </button>
              ) : (
                <button
                  onClick={() => handleSetupStart('app')}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  Set up
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SMS Method */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Smartphone className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  SMS Verification
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Receive verification codes via text message
                </p>
                {status?.sms?.enabled && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle size={16} />
                      <span className="font-medium">Active</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Phone: {status.sms.phoneNumber}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div>
              {status?.sms?.enabled ? (
                <button
                  onClick={() => handleDisable('sms')}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Disable
                </button>
              ) : (
                <button
                  onClick={() => handleSetupStart('sms')}
                  className="px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  Set up
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Setup Modal */}
      {showSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Set up {setupMethod === 'app' ? 'Authenticator App' : 'SMS Verification'}
                </h3>
                <button
                  onClick={() => {
                    setShowSetup(false);
                    setQrCode(null);
                    setVerificationCode('');
                    setPhoneNumber('');
                    setError('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {setupMethod === 'app' ? (
                <>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Step 1: Download an app</h4>
                      <p className="text-sm text-blue-800">
                        Install Google Authenticator, Authy, or any compatible authenticator app on your phone.
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-3">Step 2: Scan QR code</h4>
                      {qrCode ? (
                        <div className="flex justify-center">
                          <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-3">Step 3: Enter verification code</h4>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleVerifyApp}
                    disabled={verificationCode.length !== 6}
                    className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Verify and Enable
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-2">Enter your phone number</h4>
                      <p className="text-sm text-green-800 mb-3">
                        We'll send verification codes to this number when you sign in.
                      </p>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+216 12 345 678"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-600 mt-2">
                        Use international format (e.g., +216XXXXXXXX)
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleSetupPhone}
                    disabled={!phoneNumber}
                    className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Save Phone Number
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Key className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Security Recommendation</p>
            <p>
              We recommend enabling at least one 2FA method to protect your account. 
              Authenticator apps are more secure than SMS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorSettings;