import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ReportsTable = ({ reports, onViewReport, onValidateReport, onRejectReport, onRequestModification }) => {
  const [selectedReports, setSelectedReports] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'submissionDate', direction: 'desc' });

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedReports(reports?.map(report => report?.id));
    } else {
      setSelectedReports([]);
    }
  };

  const handleSelectReport = (reportId, checked) => {
    if (checked) {
      setSelectedReports([...selectedReports, reportId]);
    } else {
      setSelectedReports(selectedReports?.filter(id => id !== reportId));
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedReports = [...reports]?.sort((a, b) => {
    if (sortConfig?.key) {
      const aValue = a?.[sortConfig?.key];
      const bValue = b?.[sortConfig?.key];

      if (sortConfig?.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    }
    return 0;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-error bg-error/10';
      case 'medium':
        return 'text-warning bg-warning/10';
      case 'low':
        return 'text-success bg-success/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high':
        return 'Urgent';
      case 'medium':
        return 'Normal';
      case 'low':
        return 'Faible';
      default:
        return 'Non défini';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const SortButton = ({ column, children }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center space-x-1 hover:text-primary academic-transition"
    >
      <span>{children}</span>
      <Icon
        name={sortConfig?.key === column
          ? (sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown')
          : 'ChevronsUpDown'
        }
        size={14}
      />
    </button>
  );

  return (
    <div className="bg-card border border-border rounded-lg academic-shadow-sm">
      {/* Table Header with Bulk Actions */}
      {selectedReports?.length > 0 && (
        <div className="p-4 border-b border-border bg-primary/5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {selectedReports?.length} rapport(s) sélectionné(s)
            </span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" iconName="CheckCircle">
                Valider la Sélection
              </Button>
              <Button variant="outline" size="sm" iconName="Edit">
                Demander Modifications
              </Button>
              <Button variant="outline" size="sm" iconName="X">
                Rejeter la Sélection
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-12 p-4">
                <input
                  type="checkbox"
                  checked={selectedReports?.length === reports?.length && reports?.length > 0}
                  onChange={(e) => handleSelectAll(e?.target?.checked)}
                  className="rounded border-border"
                />
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                <SortButton column="studentName">Étudiant</SortButton>
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                <SortButton column="title">Titre du Rapport</SortButton>
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                <SortButton column="submissionDate">Date de Soumission</SortButton>
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                <SortButton column="specialty">Spécialité</SortButton>
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                <SortButton column="priority">Priorité</SortButton>
              </th>
              <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedReports?.map((report) => (
              <tr key={report?.id} className="border-b border-border hover:bg-muted/30 academic-transition">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedReports?.includes(report?.id)}
                    onChange={(e) => handleSelectReport(report?.id, e?.target?.checked)}
                    className="rounded border-border"
                  />
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon name="User" size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{report?.studentName}</p>
                      <p className="text-xs text-muted-foreground">{report?.studentEmail}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground line-clamp-2">{report?.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Superviseur: {report?.supervisor}
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <p className="text-sm text-foreground">{formatDate(report?.submissionDate)}</p>
                    <p className="text-xs text-muted-foreground">
                      {report?.daysWaiting} jour(s) d'attente
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <p className="text-sm text-foreground">{report?.specialty}</p>
                    <p className="text-xs text-muted-foreground">{report?.department}</p>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${report?.status === 'pending_validation' ? 'bg-orange-100 text-orange-700' :
                      report?.status === 'validated' ? 'bg-green-100 text-green-700' :
                        report?.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          report?.status === 'revision_requested' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                    }`}>
                    {report?.status === 'pending_validation' ? 'En attente' :
                      report?.status === 'validated' ? 'Validé' :
                        report?.status === 'rejected' ? 'Rejeté' :
                          report?.status === 'revision_requested' ? 'Révision demandée' :
                            'Inconnu'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewReport(report)}
                      className="h-8 w-8"
                    >
                      <Icon name="Eye" size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onValidateReport(report)}
                      className="h-8 w-8 text-success hover:text-success"
                    >
                      <Icon name="CheckCircle" size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRequestModification(report)}
                      className="h-8 w-8 text-warning hover:text-warning"
                    >
                      <Icon name="Edit" size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRejectReport(report)}
                      className="h-8 w-8 text-error hover:text-error"
                    >
                      <Icon name="X" size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4 p-4">
        {sortedReports?.map((report) => (
          <div key={report?.id} className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedReports?.includes(report?.id)}
                  onChange={(e) => handleSelectReport(report?.id, e?.target?.checked)}
                  className="rounded border-border mt-1"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{report?.studentName}</p>
                  <p className="text-xs text-muted-foreground">{report?.studentEmail}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report?.priority)}`}>
                {getPriorityLabel(report?.priority)}
              </span>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground line-clamp-2">{report?.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {report?.specialty} • {report?.department}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Soumis le {formatDate(report?.submissionDate)}</span>
              <span>{report?.daysWaiting} jour(s) d'attente</span>
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewReport(report)}
                iconName="Eye"
                className="flex-1"
              >
                Voir
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onValidateReport(report)}
                iconName="CheckCircle"
                className="flex-1"
              >
                Valider
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRequestModification(report)}
                className="text-warning hover:text-warning"
              >
                <Icon name="Edit" size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRejectReport(report)}
                className="text-error hover:text-error"
              >
                <Icon name="X" size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>
      {/* Empty State */}
      {reports?.length === 0 && (
        <div className="p-12 text-center">
          <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Aucun rapport en attente</h3>
          <p className="text-muted-foreground">
            Tous les rapports ont été traités ou aucun nouveau rapport n'a été soumis.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportsTable;