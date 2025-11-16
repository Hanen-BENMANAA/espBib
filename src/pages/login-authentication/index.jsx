import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import TwoFactorAuth from './components/TwoFactorAuth';

import InstitutionalBranding from './components/InstitutionalBranding';
import Icon from '../../components/AppIcon';
import { login, verify2FA } from '../../lib/auth';

const LoginAuthentication = () => {
  const navigate = useNavigate();

  const [authStep, setAuthStep] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(null);



  // ----------------------------
  // CHECK EXISTING SESSION
  // ----------------------------
  useEffect(() => {
    const savedSession = localStorage.getItem('esprim_session');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      if (session?.expiresAt > Date.now()) {
        redirectToDashboard(session?.userRole);
      } else {
        localStorage.removeItem('esprim_session');
      }
    }
  }, []);



  // ----------------------------
  // ROUTE REDIRECTION
  // ----------------------------
  const redirectToDashboard = (role) => {
    const routes = {
      student: '/student/dashboard',
      teacher: '/teacher-validation-dashboard',
      admin: '/admin/dashboard'
    };

    navigate(routes[role] || '/login');
  };

  // ----------------------------
  // LOGIN HANDLER
  // ----------------------------
  const handleLogin = async (formData) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await login(formData);

      if (result.requiresTwoFactor) {
        setUserInfo({
          id: result.user.id,
          email: result.user.email,
          name: result.user.name || result.user.email.split('@')[0],
          role: result.user.role,
          method: result.method
        });

        setAuthStep('2fa');
      } else {
        setAuthStep('success');
        setTimeout(() => redirectToDashboard(result.user.role), 2000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------
  // VERIFY 2FA
  // ----------------------------
  const handle2FAVerification = async (code, method) => {
    setIsLoading(true);
    setError('');
    try {
      await verify2FA(userInfo.id, code, method);
      setAuthStep('success');

      setTimeout(() => redirectToDashboard(userInfo.role), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel2FA = () => {
    setAuthStep('login');
    setUserInfo(null);
    setError('');
  };



  // ----------------------------
  // SUCCESS STATE COMPONENT
  // ----------------------------
  const SuccessState = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
        <Icon name="CheckCircle" size={40} className="text-success" />
      </div>

      <h3 className="text-xl font-heading font-semibold text-text-primary">Connexion Réussie !</h3>
      <p className="text-sm font-caption text-text-secondary">
        Bienvenue {userInfo?.name}
      </p>
      <p className="text-xs font-caption text-text-secondary">
        Redirection vers votre tableau de bord...
      </p>

      <div className="flex items-center justify-center space-x-2">
        <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* LEFT SIDE (Branding) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/5 to-accent/5 p-12 items-center justify-center">
          <div className="max-w-md w-full">
            <InstitutionalBranding />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="max-w-md w-full space-y-8">

            <div className="lg:hidden">
              <InstitutionalBranding />
            </div>

            <div className="bg-surface border border-border rounded-xl shadow-academic-lg p-8">
              {authStep === 'login' && (
                <LoginForm
                  onSubmit={handleLogin}
                  isLoading={isLoading}
                  error={error}
                />
              )}

              {authStep === '2fa' && userInfo && (
                <TwoFactorAuth
                  userRole={userInfo.role}
                  userEmail={userInfo.email}
                  userId={userInfo.id}
                  onVerify={handle2FAVerification}
                  onCancel={handleCancel2FA}
                  isLoading={isLoading}
                  error={error}
                />
              )}

              {authStep === 'success' && <SuccessState />}
            </div>

            <div className="text-center text-xs font-caption text-text-secondary">
              <p>© {new Date().getFullYear()} ESPRIM - Virtual Library</p>
              <p>Version 2.1.0</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginAuthentication;
