import React from 'react';
import { X, Check, Filter } from 'lucide-react';

const MobileFilterDrawer = ({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange, 
  onClearFilters 
}) => {
  const academicYearOptions = [
    { value: '', label: 'Toutes les années' },
    { value: '2024-2025', label: '2024-2025' },
    { value: '2023-2024', label: '2023-2024' },
    { value: '2022-2023', label: '2022-2023' },
    { value: '2021-2022', label: '2021-2022' },
    { value: '2020-2021', label: '2020-2021' },
    { value: '2019-2020', label: '2019-2020' }
  ];

  const specialtyOptions = [
    { value: '', label: 'Toutes les spécialités' },
    { value: 'informatique', label: 'Génie Informatique' },
    { value: 'electrique', label: 'Génie Électrique' },
    { value: 'mecanique', label: 'Génie Mécanique' },
    { value: 'civil', label: 'Génie Civil' },
    { value: 'industriel', label: 'Génie Industriel' },
    { value: 'telecom', label: 'Télécommunications' }
  ];

  const sortOptions = [
    { value: 'date_desc', label: 'Plus récent' },
    { value: 'date_asc', label: 'Plus ancien' },
    { value: 'title_asc', label: 'Titre A-Z' },
    { value: 'title_desc', label: 'Titre Z-A' },
    { value: 'relevance', label: 'Pertinence' },
    { value: 'popularity', label: 'Popularité' }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = () => {
    if (!filters) return false;
    
    return (
      (filters.academicYear && filters.academicYear !== '') ||
      (filters.specialty && filters.specialty !== '') ||
      (filters.supervisor && filters.supervisor !== '') ||
      (filters.company && filters.company !== '') ||
      (filters.keywords && filters.keywords !== '')
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters?.academicYear) count++;
    if (filters?.specialty) count++;
    if (filters?.supervisor) count++;
    if (filters?.company) count++;
    if (filters?.keywords) count++;
    return count;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 lg:hidden overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <Filter size={20} className="text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Filtres de recherche
                </h3>
                {hasActiveFilters() && (
                  <p className="text-sm text-gray-600">
                    {getActiveFiltersCount()} filtre{getActiveFiltersCount() > 1 ? 's' : ''} actif{getActiveFiltersCount() > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Filters */}
          <div className="flex-1 p-6 space-y-6">
            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trier par
              </label>
              <select
                value={filters?.sortBy || 'date_desc'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Année académique
              </label>
              <select
                value={filters?.academicYear || ''}
                onChange={(e) => handleFilterChange('academicYear', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {academicYearOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Specialty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spécialité
              </label>
              <select
                value={filters?.specialty || ''}
                onChange={(e) => handleFilterChange('specialty', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {specialtyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Supervisor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Encadrant
              </label>
              <input
                type="text"
                placeholder="Nom de l'encadrant"
                value={filters?.supervisor || ''}
                onChange={(e) => handleFilterChange('supervisor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entreprise d'accueil
              </label>
              <input
                type="text"
                placeholder="Nom de l'entreprise"
                value={filters?.company || ''}
                onChange={(e) => handleFilterChange('company', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mots-clés
              </label>
              <input
                type="text"
                placeholder="Séparer par des virgules"
                value={filters?.keywords || ''}
                onChange={(e) => handleFilterChange('keywords', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Séparez les mots-clés par des virgules
              </p>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters() && (
              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Filtres actifs ({getActiveFiltersCount()})
                </h4>
                <div className="space-y-2">
                  {filters?.academicYear && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Année:</span>
                      <span className="font-medium text-gray-900">{filters.academicYear}</span>
                    </div>
                  )}
                  {filters?.specialty && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Spécialité:</span>
                      <span className="font-medium text-gray-900">
                        {specialtyOptions.find(s => s.value === filters.specialty)?.label}
                      </span>
                    </div>
                  )}
                  {filters?.supervisor && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Encadrant:</span>
                      <span className="font-medium text-gray-900 truncate ml-2">
                        {filters.supervisor}
                      </span>
                    </div>
                  )}
                  {filters?.company && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Entreprise:</span>
                      <span className="font-medium text-gray-900 truncate ml-2">
                        {filters.company}
                      </span>
                    </div>
                  )}
                  {filters?.keywords && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Mots-clés:</span>
                      <span className="font-medium text-gray-900 truncate ml-2">
                        {filters.keywords}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
            {hasActiveFilters() && (
              <button
                onClick={() => {
                  onClearFilters();
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                <X size={16} />
                Effacer tout
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition-colors"
            >
              <Check size={16} />
              Appliquer
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileFilterDrawer;