import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import TwoFactorAuth from './components/TwoFactorAuth';
import SessionTimeoutWarning from './components/SessionTimeoutWarning';
import InstitutionalBranding from './components/InstitutionalBranding';
import Icon from '../../components/AppIcon';

const LoginAuthentication = () => {
  const navigate = useNavigate();
  const [authStep, setAuthStep] = useState('login'); // 'login', '2fa', 'success'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(300); // 5 minutes warning

  // Mock user credentials for different roles
  const mockCredentials = {
    'marie.dubois@Esprim.tn': { 
      password: 'teacher123', 
      role: 'teacher', 
      name: 'Marie Dubois',
      requires2FA: true 
    },
    'admin.system@Esprim.tn': { 
      password: 'admin123', 
      role: 'admin', 
      name: 'Administrateur Système',
      requires2FA: true 
    },
    'ahmed.ben.salem@Esprim.tn': { 
      password: 'student123', 
      role: 'student', 
      name: 'Ahmed Ben Salem',
      requires2FA: false 
    },
    'fatma.trabelsi@Esprim.tn': { 
      password: 'teacher456', 
      role: 'teacher', 
      name: 'Fatma Trabelsi',
      requires2FA: true 
    }
  };

  // Mock 2FA codes
  const mock2FACodes = {
    sms: '123456',
    app: '789012'
  };

  useEffect(() => {
    // Check for existing session
    const savedSession = localStorage.getItem('esprim_session');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      if (session?.expiresAt > Date.now()) {
        // Valid session exists, redirect to appropriate dashboard
        redirectToDashboard(session?.userRole);
      } else {
        // Session expired, clean up
        localStorage.removeItem('esprim_session');
      }
    }
  }, []);

  const redirectToDashboard = (role) => {
    const dashboardRoutes = {
      teacher: '/teacher-validation-dashboard',
      admin: '/user-management-panel',
      student: '/teacher-validation-dashboard' // Students also use teacher dashboard for viewing
    };
    
    navigate(dashboardRoutes?.[role] || '/teacher-validation-dashboard');
  };

  const handleLogin = async (formData) => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const user = mockCredentials?.[formData?.email];
      
      if (!user) {
        throw new Error("Adresse email non trouvée dans le système ESPRIM");
      }
      
      if (user?.password !== formData?.password) {
        throw new Error("Mot de passe incorrect. Vérifiez vos identifiants.");
      }

      setUserInfo({
        email: formData?.email,
        name: user?.name,
        role: user?.role,
        requires2FA: user?.requires2FA
      });

      if (user?.requires2FA) {
        setAuthStep('2fa');
      } else {
        // Direct login for students
        handleSuccessfulAuth(user?.role, formData?.email, user?.name);
      }

    } catch (err) {
      setError(err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAVerification = async (code, method) => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const expectedCode = mock2FACodes?.[method];
      
      if (code !== expectedCode) {
        throw new Error("Code de vérification incorrect. Veuillez réessayer.");
      }

      handleSuccessfulAuth(userInfo?.role, userInfo?.email, userInfo?.name);

    } catch (err) {
      setError(err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessfulAuth = (role, email, name) => {
    // Create session
    const session = {
      userEmail: email,
      userName: name,
      userRole: role,
      loginTime: Date.now(),
      expiresAt: Date.now() + (30 * 60 * 1000) // 30 minutes
    };

    localStorage.setItem('esprim_session', JSON.stringify(session));
    
    // Show success state briefly before redirect
    setAuthStep('success');
    
    setTimeout(() => {
      redirectToDashboard(role);
    }, 2000);
  };

  const handleCancel2FA = () => {
    setAuthStep('login');
    setUserInfo(null);
    setError('');
  };

  const handleExtendSession = () => {
    const session = JSON.parse(localStorage.getItem('esprim_session'));
    session.expiresAt = Date.now() + (30 * 60 * 1000);
    localStorage.setItem('esprim_session', JSON.stringify(session));
    setShowSessionWarning(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('esprim_session');
    setShowSessionWarning(false);
    setAuthStep('login');
    setUserInfo(null);
  };

  // Success State Component
  const SuccessState = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
        <Icon name="CheckCircle" size={40} className="text-success" />
      </div>
      <div>
        <h3 className="text-xl font-heading font-semibold text-text-primary mb-2">
          Connexion Réussie !
        </h3>
        <p className="text-sm font-caption text-text-secondary">
          Bienvenue {userInfo?.name}
        </p>
        <p className="text-xs font-caption text-text-secondary mt-1">
          Redirection vers votre tableau de bord...
        </p>
      </div>
      <div className="flex items-center justify-center space-x-2">
        <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Session Timeout Warning */}
      <SessionTimeoutWarning
        isVisible={showSessionWarning}
        timeRemaining={sessionTimeRemaining}
        onExtendSession={handleExtendSession}
        onLogout={handleLogout}
      />
      <div className="flex min-h-screen">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/5 to-accent/5 p-12 items-center justify-center">
          <div className="max-w-md w-full">
            <InstitutionalBranding />
          </div>
        </div>

        {/* Right Panel - Authentication */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="max-w-md w-full space-y-8">
            {/* Mobile Branding */}
            <div className="lg:hidden">
              <InstitutionalBranding />
            </div>

            {/* Authentication Card */}
            <div className="bg-surface border border-border rounded-xl shadow-academic-lg p-8">
              {authStep === 'login' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">
                      Connexion Sécurisée
                    </h2>
                    <p className="text-sm font-caption text-text-secondary">
                      Accédez à votre espace ESPRIM Virtual Library
                    </p>
                  </div>
                  
                  <LoginForm
                    onSubmit={handleLogin}
                    isLoading={isLoading}
                    error={error}
                  />
                </div>
              )}

              {authStep === '2fa' && userInfo && (
                <TwoFactorAuth
                  userRole={userInfo?.role}
                  userEmail={userInfo?.email}
                  onVerify={handle2FAVerification}
                  onCancel={handleCancel2FA}
                  isLoading={isLoading}
                  error={error}
                />
              )}

              {authStep === 'success' && (
                <SuccessState />
              )}
            </div>

            {/* Footer */}
            <div className="text-center space-y-4">
              <div className="text-xs font-caption text-text-secondary">
                <p>© {new Date()?.getFullYear()} ESPRIM - École Supérieure Privée d'Ingénierie et de Management</p>
                <p className="mt-1">Tous droits réservés • Version 2.1.0</p>
              </div>
              
              <div className="flex items-center justify-center space-x-4 text-xs font-caption text-text-secondary">
                <a href="#" className="hover:text-accent transition-academic">
                  Politique de Confidentialité
                </a>
                <span>•</span>
                <a href="#" className="hover:text-accent transition-academic">
                  Conditions d'Utilisation
                </a>
                <span>•</span>
                <a href="#" className="hover:text-accent transition-academic">
                  Support Technique
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginAuthentication;