import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const BulkOperationsToolbar = ({
  selectedUsers,
  onBulkDelete,
  onBulkActivate,
  onBulkDeactivate,
  onBulkExport,
  onClearSelection
}) => {
  if (selectedUsers.length === 0) return null;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Icon name="Users" size={20} className="text-primary" />
            <span className="text-sm font-medium text-text-primary">
              {selectedUsers.length} utilisateur{selectedUsers.length > 1 ? 's' : ''} sélectionné{selectedUsers.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkActivate}
              iconName="UserCheck"
              iconSize={14}
            >
              Activer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkDeactivate}
              iconName="UserX"
              iconSize={14}
            >
              Désactiver
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkExport}
              iconName="Download"
              iconSize={14}
            >
              Exporter
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onBulkDelete}
              iconName="Trash2"
              iconSize={14}
            >
              Supprimer
            </Button>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          iconName="X"
          iconSize={14}
        >
          Effacer la sélection
        </Button>
      </div>
    </div>
  );
};

export default BulkOperationsToolbar;
