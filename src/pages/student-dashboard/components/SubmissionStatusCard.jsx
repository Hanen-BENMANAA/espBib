import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SubmissionStatusCard = ({ submission, onViewDetails, onContinueDraft }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'validated':
        return {
          color: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/20',
          icon: 'CheckCircle',
          label: 'Validé'
        };
      case 'rejected':
        return {
          color: 'text-error',
          bgColor: 'bg-error/10',
          borderColor: 'border-error/20',
          icon: 'XCircle',
          label: 'Rejeté'
        };
      case 'pending':
        return {
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/20',
          icon: 'Clock',
          label: 'En attente'
        };
      case 'draft':
        return {
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/50',
          borderColor: 'border-muted',
          icon: 'Edit',
          label: 'Brouillon'
        };
      default:
        return {
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/50',
          borderColor: 'border-muted',
          icon: 'FileText',
          label: 'Inconnu'
        };
    }
  };

  const config = getStatusConfig(submission?.status);

  return (
    <div className="bg-card border border-border rounded-academic p-6 academic-shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
            {submission?.title}
          </h3>
          <div className="flex items-center space-x-2 mb-3">
            <Icon name={config?.icon} size={16} className={config?.color} />
            <span className={`text-sm font-medium ${config?.color}`}>
              {config?.label}
            </span>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${config?.bgColor} ${config?.color} ${config?.borderColor} border`}>
          {config?.label}
        </div>
      </div>
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Date de soumission:</span>
          <span className="text-foreground font-medium">{submission?.submissionDate}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Spécialité:</span>
          <span className="text-foreground font-medium">{submission?.specialty}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Encadrant:</span>
          <span className="text-foreground font-medium">{submission?.supervisor}</span>
        </div>
        {submission?.lastModified && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Dernière modification:</span>
            <span className="text-foreground font-medium">{submission?.lastModified}</span>
          </div>
        )}
      </div>
      {submission?.progress && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progression</span>
            <span className="text-foreground font-medium">{submission?.progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full academic-transition ${
                submission?.status === 'validated' ? 'bg-success' :
                submission?.status === 'rejected' ? 'bg-error' :
                submission?.status === 'pending' ? 'bg-warning' : 'bg-primary'
              }`}
              style={{ width: `${submission?.progress}%` }}
            />
          </div>
        </div>
      )}
      <div className="flex items-center space-x-3">
        {submission?.status === 'draft' ? (
          <Button 
            variant="default" 
            onClick={() => onContinueDraft(submission?.id)}
            iconName="Edit"
            iconPosition="left"
          >
            Continuer
          </Button>
        ) : (
          <Button 
            variant="outline" 
            onClick={() => onViewDetails(submission?.id)}
            iconName="Eye"
            iconPosition="left"
          >
            Voir détails
          </Button>
        )}
        
        {submission?.feedback && (
          <Button 
            variant="ghost" 
            size="sm"
            iconName="MessageSquare"
            iconPosition="left"
          >
            Commentaires
          </Button>
        )}
      </div>
    </div>
  );
};

export default SubmissionStatusCard;