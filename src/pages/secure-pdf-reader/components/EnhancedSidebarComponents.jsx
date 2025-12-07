// ═══════════════════════════════════════════════════════════════════
// 1. ENHANCED SESSION TIMER
// ═══════════════════════════════════════════════════════════════════
import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

export const EnhancedSessionTimer = ({ 
  maxDuration = 7200,
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
        if (newTime === 600) setShowWarning(true);
        if (newTime <= 0) {
          clearInterval(timer);
          onSessionExpired?.();
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
      return `${hours}h ${minutes.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${minutes}m ${secs.toString().padStart(2, '0')}s`;
  };

  const getProgressPercentage = () => {
    return ((maxDuration - timeRemaining) / maxDuration) * 100;
  };

  const getStatusColor = () => {
    if (timeRemaining <= 300) return { bg: 'bg-red-500', text: 'text-red-600', ring: 'ring-red-500' };
    if (timeRemaining <= 600) return { bg: 'bg-orange-500', text: 'text-orange-600', ring: 'ring-orange-500' };
    return { bg: 'bg-green-500', text: 'text-green-600', ring: 'ring-green-500' };
  };

  const colors = getStatusColor();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${colors.bg} bg-opacity-10 flex items-center justify-center`}>
            <Icon name="Clock" size={20} className={colors.text} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Session Active</h3>
            <p className="text-xs text-gray-500">Temps restant</p>
          </div>
        </div>
        <div className={`text-2xl font-bold font-mono ${colors.text}`}>
          {formatTime(timeRemaining)}
        </div>
      </div>

      {/* Circular Progress */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="transform -rotate-90 w-32 h-32">
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={`${2 * Math.PI * 56}`}
            strokeDashoffset={`${2 * Math.PI * 56 * (1 - timeRemaining / maxDuration)}`}
            className={colors.text}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-3xl font-bold ${colors.text}`}>
              {Math.floor((timeRemaining / maxDuration) * 100)}%
            </div>
            <div className="text-xs text-gray-500">temps restant</div>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      {showWarning && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <Icon name="AlertTriangle" size={20} className="text-orange-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-orange-900 text-sm">Session bientôt expirée</p>
              <p className="text-xs text-orange-700 mt-1">
                Votre session se terminera dans {formatTime(timeRemaining)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Durée max</div>
          <div className="text-sm font-bold text-gray-900">{formatTime(maxDuration)}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Temps écoulé</div>
          <div className="text-sm font-bold text-gray-900">{formatTime(maxDuration - timeRemaining)}</div>
        </div>
      </div>

      {/* Extend Button */}
      {canExtend && showWarning && (
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            setIsExtending(true);
            await onExtendSession?.();
            setTimeRemaining(maxDuration);
            setShowWarning(false);
            setIsExtending(false);
          }}
          loading={isExtending}
          iconName="Plus"
          fullWidth
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 hover:from-blue-600 hover:to-blue-700"
        >
          Prolonger la session (+1h)
        </Button>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// 2. ENHANCED SECURITY MONITOR
// ═══════════════════════════════════════════════════════════════════
export const EnhancedSecurityMonitor = ({ 
  sessionId,
  securityAlerts = [] // Real-time alerts from parent
}) => {
  const [isMonitoring, setIsMonitoring] = useState(true);

  // Count alerts by severity
  const alertCounts = {
    high: securityAlerts.filter(a => ['devtools', 'screenshot'].includes(a.type)).length,
    medium: securityAlerts.filter(a => ['copy', 'ctrl_c', 'save', 'print'].includes(a.type)).length,
    low: securityAlerts.filter(a => ['context_menu', 'tab_switch'].includes(a.type)).length
  };

  const totalAlerts = securityAlerts.length;

  const getAlertIcon = (type) => {
    const icons = {
      copy: 'Copy',
      ctrl_c: 'Copy',
      save: 'Save',
      print: 'Printer',
      devtools: 'Code',
      screenshot: 'Camera',
      context_menu: 'MousePointer',
      tab_switch: 'Eye'
    };
    return icons[type] || 'Shield';
  };

  const getAlertColor = (type) => {
    if (['devtools', 'screenshot'].includes(type)) {
      return 'bg-red-50 border-red-200 text-red-700';
    }
    if (['copy', 'ctrl_c', 'save', 'print'].includes(type)) {
      return 'bg-orange-50 border-orange-200 text-orange-700';
    }
    return 'bg-blue-50 border-blue-200 text-blue-700';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-300'} bg-opacity-10 flex items-center justify-center`}>
            <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Monitoring Sécurité</h3>
            <p className="text-xs text-gray-500">Session: {sessionId}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 text-center">
          <Icon name="AlertTriangle" size={20} className="text-red-600 mx-auto mb-1" />
          <div className="text-2xl font-bold text-red-700">{alertCounts.high}</div>
          <div className="text-xs text-red-600">Critique</div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 text-center">
          <Icon name="AlertCircle" size={20} className="text-orange-600 mx-auto mb-1" />
          <div className="text-2xl font-bold text-orange-700">{alertCounts.medium}</div>
          <div className="text-xs text-orange-600">Moyen</div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 text-center">
          <Icon name="Info" size={20} className="text-blue-600 mx-auto mb-1" />
          <div className="text-2xl font-bold text-blue-700">{alertCounts.low}</div>
          <div className="text-xs text-blue-600">Faible</div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-700">Alertes récentes</h4>
          <span className="text-xs text-gray-500">{totalAlerts} total</span>
        </div>
        
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {securityAlerts.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="ShieldCheck" size={32} className="text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Aucune violation détectée</p>
              <p className="text-xs text-gray-400">Le document est sécurisé</p>
            </div>
          ) : (
            securityAlerts.slice(-5).reverse().map((alert, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-lg border ${getAlertColor(alert.type)}`}
              >
                <Icon name={getAlertIcon(alert.type)} size={16} className="mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{alert.message}</p>
                  <p className="text-xs opacity-75">
                    {alert.timestamp?.toLocaleTimeString('fr-FR')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Status Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <Icon name="Shield" size={14} className="text-green-500" />
          <span className="text-xs font-medium text-green-700">Protection active</span>
        </div>
        <span className="text-xs text-gray-500">Temps réel</span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// 3. ENHANCED DOCUMENT INFO
// ═══════════════════════════════════════════════════════════════════
export const EnhancedDocumentInfo = ({ document }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullAbstract, setShowFullAbstract] = useState(false);

  const formatAbstract = (text) => {
    if (!text) return '';
    const paragraphs = text.split('\n\n');
    if (!showFullAbstract && paragraphs.length > 1) {
      return paragraphs[0] + '...';
    }
    return text;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <Icon name="FileText" size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Informations du document</h3>
              <p className="text-xs text-blue-100">Métadonnées complètes</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Title */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Titre</div>
          <h4 className="text-sm font-bold text-gray-900 leading-snug">
            {document?.title || 'Sans titre'}
          </h4>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="User" size={14} className="text-blue-600" />
              <span className="text-xs font-semibold text-gray-500">Auteur</span>
            </div>
            <p className="text-sm font-medium text-gray-900">{document?.author || 'N/A'}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Calendar" size={14} className="text-blue-600" />
              <span className="text-xs font-semibold text-gray-500">Année</span>
            </div>
            <p className="text-sm font-medium text-gray-900">{document?.year || 'N/A'}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Award" size={14} className="text-blue-600" />
              <span className="text-xs font-semibold text-gray-500">Spécialité</span>
            </div>
            <p className="text-sm font-medium text-gray-900 truncate">{document?.specialty || 'N/A'}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Building" size={14} className="text-blue-600" />
              <span className="text-xs font-semibold text-gray-500">Entreprise</span>
            </div>
            <p className="text-sm font-medium text-gray-900 truncate">{document?.company || 'N/A'}</p>
          </div>
        </div>

        {/* Keywords */}
        {document?.keywords && document.keywords.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Mots-clés</div>
            <div className="flex flex-wrap gap-2">
              {document.keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Expanded Content */}
        {isExpanded && (
          <>
            {/* Abstract */}
            {document?.abstract && (
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Résumé</div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {formatAbstract(document.abstract)}
                  </p>
                  {document.abstract.includes('\n\n') && (
                    <button
                      onClick={() => setShowFullAbstract(!showFullAbstract)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2"
                    >
                      {showFullAbstract ? 'Voir moins' : 'Voir plus'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Technical Stats */}
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center bg-blue-50 rounded-lg p-2">
                <Icon name="FileText" size={16} className="text-blue-600 mx-auto mb-1" />
                <div className="text-xs font-bold text-blue-700">{document?.pages || 0}</div>
                <div className="text-xs text-gray-500">Pages</div>
              </div>
              
              <div className="text-center bg-purple-50 rounded-lg p-2">
                <Icon name="HardDrive" size={16} className="text-purple-600 mx-auto mb-1" />
                <div className="text-xs font-bold text-purple-700">{document?.fileSize || 'N/A'}</div>
                <div className="text-xs text-gray-500">Taille</div>
              </div>
              
              <div className="text-center bg-green-50 rounded-lg p-2">
                <Icon name="Upload" size={16} className="text-green-600 mx-auto mb-1" />
                <div className="text-xs font-bold text-green-700">{document?.uploadDate || 'N/A'}</div>
                <div className="text-xs text-gray-500">Soumis</div>
              </div>
              
              <div className="text-center bg-teal-50 rounded-lg p-2">
                <Icon name="CheckCircle" size={16} className="text-teal-600 mx-auto mb-1" />
                <div className="text-xs font-bold text-teal-700">{document?.validationDate || 'N/A'}</div>
                <div className="text-xs text-gray-500">Validé</div>
              </div>
            </div>

            {/* Validation Badge */}
            {document?.validator && (
              <div className="bg-gradient-to-r from-green-50 to-teal-50 border-l-4 border-green-500 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Icon name="UserCheck" size={16} className="text-green-600" />
                  <span className="text-sm text-green-800">
                    Validé par <strong>{document.validator}</strong>
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};