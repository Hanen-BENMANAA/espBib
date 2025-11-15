import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SessionTimer = ({ 
  maxDuration = 7200, // 2 hours in seconds
  onSessionExpired,
  onExtendSession,
  canExtend = true
}) => {
  const [timeRemaining, setTimeRemaining] = useState(maxDuration);
  const [showWarning, setShowWarning] = useState(false);
  const [isExtending, setIsExtending] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        
        // Show warning at 10 minutes remaining
        if (newTime === 600) {
          setShowWarning(true);
        }
        
        // Session expired
        if (newTime <= 0) {
          clearInterval(timer);
          if (onSessionExpired) {
            onSessionExpired();
          }
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onSessionExpired]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes?.toString()?.padStart(2, '0')}m ${secs?.toString()?.padStart(2, '0')}s`;
    }
    return `${minutes}m ${secs?.toString()?.padStart(2, '0')}s`;
  };

  const getProgressPercentage = () => {
    return ((maxDuration - timeRemaining) / maxDuration) * 100;
  };

  const getStatusColor = () => {
    if (timeRemaining <= 300) return 'text-error'; // 5 minutes
    if (timeRemaining <= 600) return 'text-warning'; // 10 minutes
    return 'text-success';
  };

  const handleExtendSession = async () => {
    setIsExtending(true);
    try {
      if (onExtendSession) {
        await onExtendSession();
        setTimeRemaining(maxDuration);
        setShowWarning(false);
      }
    } catch (error) {
      console.error('Failed to extend session:', error);
    } finally {
      setIsExtending(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-academic p-4 academic-shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon name="Clock" size={16} className={getStatusColor()} />
          <span className="text-sm font-medium text-foreground">
            Session Active
          </span>
        </div>
        <span className={`text-sm font-mono ${getStatusColor()}`}>
          {formatTime(timeRemaining)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-2 mb-3">
        <div 
          className={`h-2 rounded-full transition-all duration-1000 ${
            timeRemaining <= 300 ? 'bg-error' :
            timeRemaining <= 600 ? 'bg-warning' : 'bg-success'
          }`}
          style={{ width: `${100 - getProgressPercentage()}%` }}
        />
      </div>

      {/* Warning message */}
      {showWarning && (
        <div className="bg-warning/10 border border-warning/20 rounded-academic p-3 mb-3">
          <div className="flex items-start space-x-2">
            <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-warning-foreground">
                Session bientôt expirée
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Votre session se terminera dans {formatTime(timeRemaining)}. 
                Sauvegardez votre progression.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Session info */}
      <div className="text-xs text-muted-foreground space-y-1">
        <div className="flex justify-between">
          <span>Durée maximale:</span>
          <span>{formatTime(maxDuration)}</span>
        </div>
        <div className="flex justify-between">
          <span>Temps écoulé:</span>
          <span>{formatTime(maxDuration - timeRemaining)}</span>
        </div>
      </div>

      {/* Extend session button */}
      {canExtend && showWarning && (
        <div className="mt-3 pt-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExtendSession}
            loading={isExtending}
            iconName="Plus"
            iconPosition="left"
            fullWidth
          >
            Prolonger la session (+1h)
          </Button>
        </div>
      )}
    </div>
  );
};

export default SessionTimer;