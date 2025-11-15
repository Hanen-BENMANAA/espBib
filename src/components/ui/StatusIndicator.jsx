import React from 'react';
import Icon from '../AppIcon';

const StatusIndicator = ({
  status,
  size = 'md',
  showLabel = false,
  className = ''
}) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'en_attente':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200',
          icon: 'Clock',
          label: 'En attente'
        };
      case 'approved':
      case 'approuve':
      case 'validated':
      case 'valide':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          icon: 'CheckCircle',
          label: 'Validé'
        };
      case 'rejected':
      case 'rejete':
      case 'refused':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          icon: 'XCircle',
          label: 'Rejeté'
        };
      case 'in_progress':
      case 'en_cours':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-200',
          icon: 'Loader',
          label: 'En cours'
        };
      case 'draft':
      case 'brouillon':
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
          icon: 'FileText',
          label: 'Brouillon'
        };
      case 'submitted':
      case 'soumis':
        return {
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          borderColor: 'border-purple-200',
          icon: 'Send',
          label: 'Soumis'
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
          icon: 'Minus',
          label: 'Inconnu'
        };
    }
  };

  const config = getStatusConfig(status);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`
          inline-flex items-center gap-1.5 rounded-full border
          ${config.bgColor} ${config.borderColor} ${config.color}
          ${sizeClasses[size]}
          font-medium
        `}
      >
        <Icon name={config.icon} size={iconSizes[size]} />
        {showLabel && config.label}
      </span>
    </div>
  );
};

export default StatusIndicator;
