import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const FilterPanel = ({ onFiltersChange, resultCount = 0 }) => {
  const [filters, setFilters] = useState({
    search: '',
    specialty: '',
    department: '',
    dateFrom: '',
    dateTo: '',
    priority: '',
    status: 'pending'
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const specialtyOptions = [
    { value: '', label: 'Toutes les spécialités' },
    { value: 'informatique', label: 'Génie Informatique' },
    { value: 'industriel', label: 'Génie Industriel' },
    { value: 'civil', label: 'Génie Civil' },
    { value: 'electrique', label: 'Génie Électrique' },
    { value: 'mecanique', label: 'Génie Mécanique' }
  ];

  const departmentOptions = [
    { value: '', label: 'Tous les départements' },
    { value: 'sciences', label: 'Sciences & Technologies' },
    { value: 'ingenierie', label: 'Ingénierie' },
    { value: 'management', label: 'Management' }
  ];

  const priorityOptions = [
    { value: '', label: 'Toutes les priorités' },
    { value: 'high', label: 'Priorité Élevée (>7 jours)' },
    { value: 'medium', label: 'Priorité Moyenne (3-7 jours)' },
    { value: 'low', label: 'Priorité Normale (<3 jours)' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'En Attente' },
    { value: 'reviewing', label: 'En Révision' },
    { value: 'all', label: 'Tous les Statuts' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      specialty: '',
      department: '',
      dateFrom: '',
      dateTo: '',
      priority: '',
      status: 'pending'
    };
    setFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const hasActiveFilters = Object.values(filters)?.some(value => 
    value !== '' && value !== 'pending'
  );

  return (
    <div className="bg-surface border border-border rounded-lg shadow-academic">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <Icon name="Filter" size={20} className="text-text-secondary" />
          <h3 className="font-heading font-medium text-text-primary">
            Filtres de Recherche
          </h3>
          {resultCount > 0 && (
            <span className="px-2 py-1 bg-accent/10 text-accent text-sm font-caption rounded-full">
              {resultCount} résultat{resultCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              iconName="X"
              iconSize={14}
            >
              Réinitialiser
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
            iconSize={16}
          />
        </div>
      </div>
      {/* Search Bar - Always Visible */}
      <div className="p-4 border-b border-border">
        <Input
          type="search"
          placeholder="Rechercher par nom d'étudiant, titre de projet..."
          value={filters?.search}
          onChange={(e) => handleFilterChange('search', e?.target?.value)}
          className="w-full"
        />
      </div>
      {/* Advanced Filters - Collapsible */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select
              label="Spécialité"
              options={specialtyOptions}
              value={filters?.specialty}
              onChange={(value) => handleFilterChange('specialty', value)}
            />

            <Select
              label="Département"
              options={departmentOptions}
              value={filters?.department}
              onChange={(value) => handleFilterChange('department', value)}
            />

            <Select
              label="Priorité"
              options={priorityOptions}
              value={filters?.priority}
              onChange={(value) => handleFilterChange('priority', value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="date"
              label="Date de début"
              value={filters?.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e?.target?.value)}
            />

            <Input
              type="date"
              label="Date de fin"
              value={filters?.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e?.target?.value)}
            />

            <Select
              label="Statut"
              options={statusOptions}
              value={filters?.status}
              onChange={(value) => handleFilterChange('status', value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;