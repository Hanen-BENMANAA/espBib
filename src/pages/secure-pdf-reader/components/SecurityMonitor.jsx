import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SecurityMonitor = ({ 
  onSecurityAlert,
  sessionId = "SEC-2025-001"
}) => {
  const [securityEvents, setSecurityEvents] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [suspiciousActivity, setSuspiciousActivity] = useState(0);

  // Mock security events for demonstration
  const mockEvents = [
    {
      id: 1,
      type: 'session_start',
      message: 'Session de consultation démarrée',
      timestamp: new Date(Date.now() - 300000),
      severity: 'info',
      icon: 'Play'
    },
    {
      id: 2,
      type: 'right_click_blocked',
      message: 'Tentative de clic droit bloquée',
      timestamp: new Date(Date.now() - 240000),
      severity: 'warning',
      icon: 'Shield'
    },
    {
      id: 3,
      type: 'keyboard_shortcut_blocked',
      message: 'Raccourci clavier Ctrl+C bloqué',
      timestamp: new Date(Date.now() - 180000),
      severity: 'warning',
      icon: 'Keyboard'
    },
    {
      id: 4,
      type: 'tab_switch_detected',
      message: 'Changement d\'onglet détecté',
      timestamp: new Date(Date.now() - 120000),
      severity: 'medium',
      icon: 'Eye'
    },
    {
      id: 5,
      type: 'devtools_attempt',
      message: 'Tentative d\'ouverture des outils développeur',
      timestamp: new Date(Date.now() - 60000),
      severity: 'high',
      icon: 'AlertTriangle'
    }
  ];

  useEffect(() => {
    // Initialize with mock events
    setSecurityEvents(mockEvents);
    
    // Count suspicious activities
    const suspicious = mockEvents?.filter(event => 
      ['warning', 'medium', 'high']?.includes(event?.severity)
    )?.length;
    setSuspiciousActivity(suspicious);
  }, []);

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'high':
        return {
          bgColor: 'bg-error/10',
          textColor: 'text-error',
          borderColor: 'border-error/20'
        };
      case 'medium':
        return {
          bgColor: 'bg-warning/10',
          textColor: 'text-warning',
          borderColor: 'border-warning/20'
        };
      case 'warning':
        return {
          bgColor: 'bg-accent/10',
          textColor: 'text-accent',
          borderColor: 'border-accent/20'
        };
      default:
        return {
          bgColor: 'bg-primary/10',
          textColor: 'text-primary',
          borderColor: 'border-primary/20'
        };
    }
  };

  const formatTimestamp = (timestamp) => {
    return timestamp?.toLocaleString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const clearEvents = () => {
    setSecurityEvents([]);
    setSuspiciousActivity(0);
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  return (
    <div className="bg-card border border-border rounded-academic academic-shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-success animate-pulse' : 'bg-muted'}`} />
            <div>
              <h3 className="font-heading font-semibold text-foreground">
                Monitoring de Sécurité
              </h3>
              <p className="text-sm text-muted-foreground">
                Session: {sessionId}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMonitoring}
              iconName={isMonitoring ? "Pause" : "Play"}
              iconSize={16}
            >
              {isMonitoring ? 'Pause' : 'Reprendre'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={clearEvents}
              iconName="Trash2"
              iconSize={16}
            >
              Effacer
            </Button>
          </div>
        </div>
      </div>
      {/* Security Statistics */}
      <div className="p-4 border-b border-border">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full mx-auto mb-2">
              <Icon name="Shield" size={20} className="text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">{securityEvents?.length}</p>
            <p className="text-xs text-muted-foreground">Événements</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-warning/10 rounded-full mx-auto mb-2">
              <Icon name="AlertTriangle" size={20} className="text-warning" />
            </div>
            <p className="text-sm font-medium text-foreground">{suspiciousActivity}</p>
            <p className="text-xs text-muted-foreground">Suspects</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-success/10 rounded-full mx-auto mb-2">
              <Icon name="CheckCircle" size={20} className="text-success" />
            </div>
            <p className="text-sm font-medium text-foreground">Actif</p>
            <p className="text-xs text-muted-foreground">Statut</p>
          </div>
        </div>
      </div>
      {/* Security Events Log */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-foreground">
            Journal des événements
          </h4>
          <span className="text-xs text-muted-foreground">
            Temps réel
          </span>
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {securityEvents?.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="Shield" size={32} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Aucun événement de sécurité
              </p>
            </div>
          ) : (
            securityEvents?.map((event) => {
              const config = getSeverityConfig(event?.severity);
              return (
                <div
                  key={event?.id}
                  className={`flex items-start space-x-3 p-3 rounded-academic border ${config?.bgColor} ${config?.borderColor}`}
                >
                  <Icon 
                    name={event?.icon} 
                    size={16} 
                    className={`${config?.textColor} mt-0.5`} 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-medium">
                      {event?.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(event?.timestamp)}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${config?.bgColor} ${config?.textColor}`}>
                    {event?.severity}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
      {/* Security Status */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="Lock" size={16} className="text-success" />
            <span className="text-sm text-success-foreground">
              Document sécurisé
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Icon name="Clock" size={14} />
            <span>Mis à jour il y a {Math.floor(Math.random() * 30) + 1}s</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityMonitor;