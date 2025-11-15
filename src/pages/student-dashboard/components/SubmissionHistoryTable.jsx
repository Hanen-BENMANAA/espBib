import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const SubmissionHistoryTable = ({ submissions, onViewReport, onDownloadReport }) => {
  const [filterYear, setFilterYear] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const yearOptions = [
    { value: 'all', label: 'Toutes les années' },
    { value: '2024', label: '2023-2024' },
    { value: '2023', label: '2022-2023' },
    { value: '2022', label: '2021-2022' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Date de soumission' },
    { value: 'title', label: 'Titre' },
    { value: 'status', label: 'Statut' }
  ];

  const getStatusBadge = (status) => {
    const configs = {
      validated: { color: 'text-success', bg: 'bg-success/10', label: 'Validé', icon: 'CheckCircle' },
      rejected: { color: 'text-error', bg: 'bg-error/10', label: 'Rejeté', icon: 'XCircle' },
      pending: { color: 'text-warning', bg: 'bg-warning/10', label: 'En attente', icon: 'Clock' },
      draft: { color: 'text-muted-foreground', bg: 'bg-muted/50', label: 'Brouillon', icon: 'Edit' }
    };
    
    const config = configs?.[status] || configs?.draft;
    
    return (
      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config?.bg} ${config?.color}`}>
        <Icon name={config?.icon} size={12} />
        <span>{config?.label}</span>
      </div>
    );
  };

  const filteredSubmissions = submissions?.filter(submission => {
    if (filterYear === 'all') return true;
    return submission?.academicYear?.includes(filterYear);
  });

  const sortedSubmissions = [...filteredSubmissions]?.sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a?.title?.localeCompare(b?.title);
      case 'status':
        return a?.status?.localeCompare(b?.status);
      case 'date':
      default:
        return new Date(b.submissionDate) - new Date(a.submissionDate);
    }
  });

  return (
    <div className="bg-card border border-border rounded-academic academic-shadow-sm">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-heading font-semibold text-foreground">
            Historique des soumissions
          </h3>
          <div className="flex items-center space-x-3">
            <Select
              options={yearOptions}
              value={filterYear}
              onChange={setFilterYear}
              placeholder="Filtrer par année"
              className="w-48"
            />
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
              placeholder="Trier par"
              className="w-48"
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">
                Titre du rapport
              </th>
              <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">
                Année académique
              </th>
              <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">
                Date de soumission
              </th>
              <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">
                Statut
              </th>
              <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedSubmissions?.map((submission) => (
              <tr key={submission?.id} className="hover:bg-muted/30 academic-transition">
                <td className="py-4 px-6">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {submission?.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {submission?.specialty}
                    </p>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-foreground">
                  {submission?.academicYear}
                </td>
                <td className="py-4 px-6 text-sm text-foreground">
                  {submission?.submissionDate}
                </td>
                <td className="py-4 px-6">
                  {getStatusBadge(submission?.status)}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewReport(submission?.id)}
                      iconName="Eye"
                      iconSize={14}
                    >
                      Voir
                    </Button>
                    {submission?.status === 'validated' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDownloadReport(submission?.id)}
                        iconName="Download"
                        iconSize={14}
                      >
                        Télécharger
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sortedSubmissions?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun rapport trouvé pour les critères sélectionnés</p>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistoryTable;