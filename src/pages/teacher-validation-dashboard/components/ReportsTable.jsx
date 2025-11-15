import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import StatusIndicator from '../../../components/ui/StatusIndicator';

const ReportsTable = ({ reports, onBulkAction, onViewReport, onAddNote }) => {
  const [selectedReports, setSelectedReports] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: 'submissionDate',
    direction: 'desc'
  });

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedReports(reports?.map(report => report?.id));
    } else {
      setSelectedReports([]);
    }
  };

  const handleSelectReport = (reportId, checked) => {
    if (checked) {
      setSelectedReports(prev => [...prev, reportId]);
    } else {
      setSelectedReports(prev => prev?.filter(id => id !== reportId));
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig?.key !== key) return 'ArrowUpDown';
    return sortConfig?.direction === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  const getPriorityLevel = (daysWaiting) => {
    if (daysWaiting > 7) return 'high';
    if (daysWaiting > 3) return 'medium';
    return 'low';
  };

  const getPriorityColor = (level) => {
    const colors = {
      high: 'text-error',
      medium: 'text-warning',
      low: 'text-success'
    };
    return colors?.[level] || colors?.low;
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const sortedReports = [...reports]?.sort((a, b) => {
    const aValue = a?.[sortConfig?.key];
    const bValue = b?.[sortConfig?.key];
    
    if (sortConfig?.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const isAllSelected = selectedReports?.length === reports?.length && reports?.length > 0;
  const isIndeterminate = selectedReports?.length > 0 && selectedReports?.length < reports?.length;

  return (
    <div className="bg-surface border border-border rounded-lg shadow-academic overflow-hidden">
      {/* Bulk Actions Bar */}
      {selectedReports?.length > 0 && (
        <div className="bg-accent/5 border-b border-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-caption text-text-primary">
              {selectedReports?.length} rapport{selectedReports?.length > 1 ? 's' : ''} sélectionné{selectedReports?.length > 1 ? 's' : ''}
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction('validate', selectedReports)}
                iconName="CheckCircle"
                iconSize={14}
              >
                Valider
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction('reject', selectedReports)}
                iconName="XCircle"
                iconSize={14}
              >
                Rejeter
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedReports([])}
                iconName="X"
                iconSize={14}
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="w-12 p-4">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={(e) => handleSelectAll(e?.target?.checked)}
                />
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('studentName')}
                  className="flex items-center space-x-2 font-heading font-medium text-text-primary hover:text-accent transition-academic"
                >
                  <span>Étudiant</span>
                  <Icon name={getSortIcon('studentName')} size={14} />
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('projectTitle')}
                  className="flex items-center space-x-2 font-heading font-medium text-text-primary hover:text-accent transition-academic"
                >
                  <span>Titre du Projet</span>
                  <Icon name={getSortIcon('projectTitle')} size={14} />
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('specialty')}
                  className="flex items-center space-x-2 font-heading font-medium text-text-primary hover:text-accent transition-academic"
                >
                  <span>Spécialité</span>
                  <Icon name={getSortIcon('specialty')} size={14} />
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('submissionDate')}
                  className="flex items-center space-x-2 font-heading font-medium text-text-primary hover:text-accent transition-academic"
                >
                  <span>Date de Soumission</span>
                  <Icon name={getSortIcon('submissionDate')} size={14} />
                </button>
              </th>
              <th className="text-left p-4">
                <span className="font-heading font-medium text-text-primary">Priorité</span>
              </th>
              <th className="text-left p-4">
                <span className="font-heading font-medium text-text-primary">Statut</span>
              </th>
              <th className="text-right p-4">
                <span className="font-heading font-medium text-text-primary">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedReports?.map((report) => {
              const priorityLevel = getPriorityLevel(report?.daysWaiting);
              const isSelected = selectedReports?.includes(report?.id);
              
              return (
                <tr
                  key={report?.id}
                  className={`border-b border-border hover:bg-muted/30 transition-academic ${
                    isSelected ? 'bg-accent/5' : ''
                  }`}
                >
                  <td className="p-4">
                    <Checkbox
                      checked={isSelected}
                      onChange={(e) => handleSelectReport(report?.id, e?.target?.checked)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-primary-foreground">
                          {report?.studentName?.split(' ')?.map(n => n?.[0])?.join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-text-primary">{report?.studentName}</div>
                        <div className="text-sm font-caption text-text-secondary">{report?.studentEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="max-w-xs">
                      <div className="font-medium text-text-primary truncate" title={report?.projectTitle}>
                        {report?.projectTitle}
                      </div>
                      <div className="text-sm font-caption text-text-secondary">
                        {report?.company}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-muted text-text-secondary text-sm font-caption rounded-full">
                      {report?.specialty}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-caption text-text-primary">
                      {formatDate(report?.submissionDate)}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        priorityLevel === 'high' ? 'bg-error' :
                        priorityLevel === 'medium' ? 'bg-warning' : 'bg-success'
                      }`} />
                      <span className={`text-sm font-caption ${getPriorityColor(priorityLevel)}`}>
                        {report?.daysWaiting} jour{report?.daysWaiting > 1 ? 's' : ''}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <StatusIndicator status={report?.status} size="sm" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewReport(report?.id)}
                        iconName="Eye"
                        iconSize={14}
                      >
                        Voir
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAddNote(report?.id)}
                        iconName="MessageSquare"
                        iconSize={14}
                      >
                        Note
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4 p-4">
        {sortedReports?.map((report) => {
          const priorityLevel = getPriorityLevel(report?.daysWaiting);
          const isSelected = selectedReports?.includes(report?.id);
          
          return (
            <div
              key={report?.id}
              className={`border border-border rounded-lg p-4 ${
                isSelected ? 'bg-accent/5 border-accent/30' : 'bg-surface'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <Checkbox
                  checked={isSelected}
                  onChange={(e) => handleSelectReport(report?.id, e?.target?.checked)}
                />
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    priorityLevel === 'high' ? 'bg-error' :
                    priorityLevel === 'medium' ? 'bg-warning' : 'bg-success'
                  }`} />
                  <span className={`text-xs font-caption ${getPriorityColor(priorityLevel)}`}>
                    {report?.daysWaiting}j
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-text-primary">{report?.studentName}</div>
                <div className="text-sm text-text-primary font-medium">{report?.projectTitle}</div>
                <div className="flex items-center justify-between text-sm font-caption text-text-secondary">
                  <span>{report?.specialty}</span>
                  <span>{formatDate(report?.submissionDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <StatusIndicator status={report?.status} size="sm" />
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewReport(report?.id)}
                      iconName="Eye"
                      iconSize={14}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAddNote(report?.id)}
                      iconName="MessageSquare"
                      iconSize={14}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Empty State */}
      {reports?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="FileText" size={48} className="text-text-secondary mx-auto mb-4" />
          <h3 className="font-heading font-medium text-text-primary mb-2">
            Aucun rapport trouvé
          </h3>
          <p className="text-sm font-caption text-text-secondary">
            Aucun rapport ne correspond aux critères de recherche actuels.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportsTable;