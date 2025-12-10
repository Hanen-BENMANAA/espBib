// src/pages/student-dashboard/components/SubmissionHistoryTable.jsx
import React, { useState } from 'react';
import { Eye, Download, FileText } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const SubmissionHistoryTable = ({ submissions, onViewReport, onDownloadReport }) => {
  const [filterYear, setFilterYear] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const yearOptions = [
    { value: 'all', label: 'Toutes les années' },
    { value: '2025', label: '2025-2026' },
    { value: '2024', label: '2024-2025' },
    { value: '2023', label: '2023-2024' },
  ];

  const sortOptions = [
    { value: 'date', label: 'Date de soumission' },
    { value: 'title', label: 'Titre' },
    { value: 'status', label: 'Statut' },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusConfig = (status) => {
    const map = {
      validated: { label: 'Validé', color: 'bg-green-100 text-green-700' },
      rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-700' },
      pending: { label: 'En attente', color: 'bg-orange-100 text-orange-700' },
      pending_validation: { label: 'En attente', color: 'bg-orange-100 text-orange-700' },
      revision_requested: { label: 'Révision demandée', color: 'bg-purple-100 text-purple-700' },
      draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-700' },
    };
    return map[status] || map.pending;
  };

  const filteredSubmissions = (submissions || []).filter(sub => {
    if (filterYear === 'all') return true;
    const year = sub.academicYear || sub.academic_year || '';
    return year.includes(filterYear);
  });

  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return (a.title || '').localeCompare(b.title || '');
      case 'status':
        return (a.status || '').localeCompare(b.status || '');
      case 'date':
      default:
        const dateA = new Date(a.submission_date || a.created_at || 0);
        const dateB = new Date(b.submission_date || b.created_at || 0);
        return dateB - dateA;
    }
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* RED → PINK TOP BAR – EXACTLY LIKE TEACHER */}
      <div className="h-1 bg-gradient-to-r from-red-600 to-pink-600"></div>

      {/* HEADER WITH TITLE + FILTERS */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900">
            Historique des soumissions
          </h2>

          <div className="flex items-center gap-3">
            <Select
              options={yearOptions}
              value={filterYear}
              onChange={setFilterYear}
              placeholder="Année académique"
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

      {/* TABLE */}
      {sortedSubmissions.length === 0 ? (
        <div className="p-16 text-center text-gray-500">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Aucune soumission trouvée</p>
          <p className="text-sm mt-2">Modifiez les filtres ou soumettez votre premier rapport</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Titre du rapport
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Date de soumission
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Statut
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedSubmissions.map((report) => {
                const status = getStatusConfig(report.status || 'pending');

                return (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5">
                      <p className="font-medium text-gray-900 truncate max-w-md">
                        {report.title || 'Sans titre'}
                      </p>
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-600">
                      {formatDate(report.submission_date || report.created_at)}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-4">
                        {/* RED "Voir" BUTTON – EXACTLY LIKE TEACHER */}
                        <button
                          onClick={() => onViewReport?.(report.id)}
                          className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1 transition-colors"
                        >
                          <Eye size={18} />
                          Voir
                        </button>

                        {/* Download only for validated reports */}
                        {report.status === 'validated' && (
                          <button
                            onClick={() => onDownloadReport?.(report.id)}
                            className="text-gray-600 hover:text-gray-800 flex items-center gap-1 transition-colors"
                            title="Télécharger"
                          >
                            <Download size={18} />
                            Télécharger
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistoryTable;