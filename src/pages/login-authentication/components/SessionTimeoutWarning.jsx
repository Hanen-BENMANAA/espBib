import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const SessionTimeoutWarning = ({ 
  isVisible, 
  timeRemaining, 
  onExtendSession, 
  onLogout 
}) => {
  const [countdown, setCountdown] = useState(timeRemaining);

  useEffect(() => {
    setCountdown(timeRemaining);
  }, [timeRemaining]);

  useEffect(() => {
    if (!isVisible || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, countdown, onLogout]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds?.toString()?.padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-200">
      <div className="bg-surface border border-border rounded-lg shadow-academic-xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Clock" size={32} className="text-warning" />
            </div>
            <h3 className="text-xl font-heading font-semibold text-text-primary mb-2">
              Session Expirée Bientôt
            </h3>
            <p className="text-sm font-caption text-text-secondary">
              Votre session va expirer dans
            </p>
          </div>

          {/* Countdown Display */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-warning/10 rounded-full border-4 border-warning/20 mb-4">
              <span className="text-2xl font-mono font-bold text-warning">
                {formatTime(countdown)}
              </span>
            </div>
            <p className="text-sm font-caption text-text-secondary">
              Temps restant avant déconnexion automatique
            </p>
          </div>

          {/* Warning Message */}
          <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg mb-6">
            <div className="flex items-start space-x-3">
              <Icon name="AlertTriangle" size={20} className="text-warning flex-shrink-0 mt-0.5" />
              <div className="text-sm font-caption text-text-primary">
                <p className="font-medium mb-1">Sécurité de Session</p>
                <p className="text-text-secondary">
                  Pour votre sécurité, les sessions sont limitées à 30 minutes d'inactivité. 
                  Vos données non sauvegardées seront perdues.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onLogout}
              iconName="LogOut"
              iconPosition="left"
              className="flex-1"
            >
              Déconnexion
            </Button>
            <Button
              variant="default"
              onClick={onExtendSession}
              iconName="RefreshCw"
              iconPosition="left"
              className="flex-1"
            >
              Prolonger
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-4 text-center">
            <p className="text-xs font-caption text-text-secondary">
              La prolongation ajoutera 30 minutes supplémentaires
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;