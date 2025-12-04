import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const SearchFilters = ({ 
  searchQuery, 
  onSearchChange, 
  filters, 
  onFiltersChange, 
  resultCount,
  onClearFilters 
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

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

  const handleSearchInputChange = (e) => {
    onSearchChange(e.target.value);
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
    if (searchQuery) count++;
    if (filters?.academicYear) count++;
    if (filters?.specialty) count++;
    if (filters?.supervisor) count++;
    if (filters?.company) count++;
    if (filters?.keywords) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm">
      {/* Main Search Bar */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="relative">
              <Icon 
                name="Search" 
                size={20} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                placeholder="Rechercher par titre, mots-clés, auteur, résumé..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
                isAdvancedOpen 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon name="Filter" size={16} />
              <span className="font-medium">Filtres avancés</span>
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
              <Icon name={isAdvancedOpen ? "ChevronUp" : "ChevronDown"} size={16} />
            </button>

            {(hasActiveFilters() || searchQuery) && (
              <button
                onClick={onClearFilters}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Icon name="X" size={16} />
                <span className="font-medium">Effacer</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Count & Sort */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            {resultCount > 0 ? (
              <>
                <span className="font-semibold text-gray-900">{resultCount}</span> rapport{resultCount > 1 ? 's' : ''} trouvé{resultCount > 1 ? 's' : ''}
              </>
            ) : (
              'Aucun rapport trouvé'
            )}
          </p>

          <div className="flex items-center gap-2">
            <Icon name="ArrowUpDown" size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600">Trier par:</span>
            <select
              value={filters?.sortBy || 'date_desc'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {isAdvancedOpen && (
        <div className="p-6 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Filtres avancés
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <div className="relative">
                <Icon 
                  name="User" 
                  size={16} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Nom de l'encadrant"
                  value={filters?.supervisor || ''}
                  onChange={(e) => handleFilterChange('supervisor', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entreprise d'accueil
              </label>
              <div className="relative">
                <Icon 
                  name="Building2" 
                  size={16} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Nom de l'entreprise"
                  value={filters?.company || ''}
                  onChange={(e) => handleFilterChange('company', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Keywords - Full Width */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mots-clés
            </label>
            <div className="relative">
              <Icon 
                name="Tag" 
                size={16} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Séparer par des virgules (ex: IA, Machine Learning, Python)"
                value={filters?.keywords || ''}
                onChange={(e) => handleFilterChange('keywords', e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Entrez plusieurs mots-clés séparés par des virgules
            </p>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters() && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Filtres actifs ({activeFiltersCount})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        <Icon name="Search" size={12} />
                        Recherche: "{searchQuery.substring(0, 30)}{searchQuery.length > 30 ? '...' : ''}"
                      </span>
                    )}
                    {filters?.academicYear && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        <Icon name="Calendar" size={12} />
                        {filters.academicYear}
                      </span>
                    )}
                    {filters?.specialty && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        <Icon name="GraduationCap" size={12} />
                        {specialtyOptions.find(s => s.value === filters.specialty)?.label}
                      </span>
                    )}
                    {filters?.supervisor && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                        <Icon name="User" size={12} />
                        Encadrant: {filters.supervisor}
                      </span>
                    )}
                    {filters?.company && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
                        <Icon name="Building2" size={12} />
                        {filters.company}
                      </span>
                    )}
                    {filters?.keywords && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        <Icon name="Tag" size={12} />
                        Mots-clés: {filters.keywords}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={onClearFilters}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Icon name="X" size={14} />
                  Tout effacer
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilters;