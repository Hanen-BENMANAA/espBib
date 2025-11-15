import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const StatusIndicatorBanner = ({ 
  type = 'info', 
  message, 
  isVisible = false, 
  onDismiss,
  autoHide = false,
  autoHideDelay = 5000,
  showProgress = false,
  actionLabel,
  onAction
}) => {
  const [isShowing, setIsShowing] = useState(isVisible);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    setIsShowing(isVisible);
    if (isVisible && autoHide) {
      setProgress(100);
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (autoHideDelay / 100));
          if (newProgress <= 0) {
            clearInterval(interval);
            handleDismiss();
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isVisible, autoHide, autoHideDelay]);

  const handleDismiss = () => {
    setIsShowing(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  const getStatusConfig = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-success/10',
          borderColor: 'border-success/20',
          textColor: 'text-success-foreground',
          iconColor: 'text-success',
          icon: 'CheckCircle'
        };
      case 'warning':
        return {
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/20',
          textColor: 'text-warning-foreground',
          iconColor: 'text-warning',
          icon: 'AlertTriangle'
        };
      case 'error':
        return {
          bgColor: 'bg-error/10',
          borderColor: 'border-error/20',
          textColor: 'text-error-foreground',
          iconColor: 'text-error',
          icon: 'AlertCircle'
        };
      case 'session':
        return {
          bgColor: 'bg-accent/10',
          borderColor: 'border-accent/20',
          textColor: 'text-accent-foreground',
          iconColor: 'text-accent',
          icon: 'Clock'
        };
      default:
        return {
          bgColor: 'bg-primary/10',
          borderColor: 'border-primary/20',
          textColor: 'text-primary-foreground',
          iconColor: 'text-primary',
          icon: 'Info'
        };
    }
  };

  const config = getStatusConfig();

  if (!isShowing || !message) {
    return null;
  }

  return (
    <div className={`relative border-l-4 ${config?.bgColor} ${config?.borderColor} academic-transition-layout`}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <Icon 
            name={config?.icon} 
            size={20} 
            className={config?.iconColor}
          />
          <div className="flex-1">
            <p className={`text-sm font-medium ${config?.textColor}`}>
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {actionLabel && onAction && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAction}
              className="text-xs"
            >
              {actionLabel}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-6 w-6"
          >
            <Icon name="X" size={14} />
          </Button>
        </div>
      </div>
      {showProgress && autoHide && (
        <div className="absolute bottom-0 left-0 h-1 bg-border">
          <div 
            className={`h-full ${config?.iconColor?.replace('text-', 'bg-')} academic-transition`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default StatusIndicatorBanner;