import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const FilterToolbar = ({ onFiltersChange, activeFilters = {} }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    specialty: activeFilters?.specialty || '',
    department: activeFilters?.department || '',
    supervisor: activeFilters?.supervisor || '',
    priority: activeFilters?.priority || '',
    dateFrom: activeFilters?.dateFrom || '',
    dateTo: activeFilters?.dateTo || '',
    searchQuery: activeFilters?.searchQuery || ''
  });

  const specialtyOptions = [
    { value: '', label: 'Toutes les spécialités' },
    { value: 'informatique', label: 'Génie Informatique' },
    { value: 'electrique', label: 'Génie Électrique' },
    { value: 'mecanique', label: 'Génie Mécanique' },
    { value: 'civil', label: 'Génie Civil' },
    { value: 'industriel', label: 'Génie Industriel' }
  ];

  const departmentOptions = [
    { value: '', label: 'Tous les départements' },
    { value: 'informatique', label: 'Département Informatique' },
    { value: 'electrique', label: 'Département Électrique' },
    { value: 'mecanique', label: 'Département Mécanique' },
    { value: 'civil', label: 'Département Civil' },
    { value: 'industriel', label: 'Département Industriel' }
  ];

  const supervisorOptions = [
    { value: '', label: 'Tous les superviseurs' },
    { value: 'dr-ben-ahmed', label: 'Dr. Ben Ahmed' },
    { value: 'prof-gharbi', label: 'Prof. Gharbi' },
    { value: 'dr-mansouri', label: 'Dr. Mansouri' },
    { value: 'prof-trabelsi', label: 'Prof. Trabelsi' },
    { value: 'dr-khelifi', label: 'Dr. Khelifi' }
  ];

  const priorityOptions = [
    { value: '', label: 'Toutes les priorités' },
    { value: 'high', label: 'Urgent' },
    { value: 'medium', label: 'Normal' },
    { value: 'low', label: 'Faible' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      specialty: '',
      department: '',
      supervisor: '',
      priority: '',
      dateFrom: '',
      dateTo: '',
      searchQuery: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    return Object.values(filters)?.filter(value => value !== '')?.length;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="bg-card border border-border rounded-lg p-4 academic-shadow-sm">
      {/* Main Filter Row */}
      <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
        {/* Search */}
        <div className="flex-1 lg:max-w-md">
          <Input
            type="search"
            placeholder="Rechercher par nom, titre ou mots-clés..."
            value={filters?.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e?.target?.value)}
            className="w-full"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Select
            options={specialtyOptions}
            value={filters?.specialty}
            onChange={(value) => handleFilterChange('specialty', value)}
            placeholder="Spécialité"
            className="w-40"
          />
          
          <Select
            options={priorityOptions}
            value={filters?.priority}
            onChange={(value) => handleFilterChange('priority', value)}
            placeholder="Priorité"
            className="w-32"
          />

          {/* Expand/Collapse Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
          >
            {isExpanded ? 'Moins' : 'Plus'} de filtres
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              iconName="X"
              className="text-muted-foreground hover:text-foreground"
            >
              Effacer
            </Button>
          )}
        </div>
      </div>
      {/* Expanded Filters */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Département"
              options={departmentOptions}
              value={filters?.department}
              onChange={(value) => handleFilterChange('department', value)}
            />
            
            <Select
              label="Superviseur"
              options={supervisorOptions}
              value={filters?.supervisor}
              onChange={(value) => handleFilterChange('supervisor', value)}
              searchable
            />
            
            <Input
              label="Date de début"
              type="date"
              value={filters?.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e?.target?.value)}
            />
            
            <Input
              label="Date de fin"
              type="date"
              value={filters?.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e?.target?.value)}
            />
          </div>
        </div>
      )}
      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-muted-foreground">Filtres actifs:</span>
            <div className="flex flex-wrap gap-2">
              {filters?.specialty && (
                <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  Spécialité: {specialtyOptions?.find(opt => opt?.value === filters?.specialty)?.label}
                  <button
                    onClick={() => handleFilterChange('specialty', '')}
                    className="ml-1 hover:text-primary/70"
                  >
                    <Icon name="X" size={12} />
                  </button>
                </span>
              )}
              {filters?.department && (
                <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  Département: {departmentOptions?.find(opt => opt?.value === filters?.department)?.label}
                  <button
                    onClick={() => handleFilterChange('department', '')}
                    className="ml-1 hover:text-primary/70"
                  >
                    <Icon name="X" size={12} />
                  </button>
                </span>
              )}
              {filters?.priority && (
                <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  Priorité: {priorityOptions?.find(opt => opt?.value === filters?.priority)?.label}
                  <button
                    onClick={() => handleFilterChange('priority', '')}
                    className="ml-1 hover:text-primary/70"
                  >
                    <Icon name="X" size={12} />
                  </button>
                </span>
              )}
              {filters?.supervisor && (
                <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  Superviseur: {supervisorOptions?.find(opt => opt?.value === filters?.supervisor)?.label}
                  <button
                    onClick={() => handleFilterChange('supervisor', '')}
                    className="ml-1 hover:text-primary/70"
                  >
                    <Icon name="X" size={12} />
                  </button>
                </span>
              )}
              {(filters?.dateFrom || filters?.dateTo) && (
                <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  Période: {filters?.dateFrom || '...'} - {filters?.dateTo || '...'}
                  <button
                    onClick={() => {
                      handleFilterChange('dateFrom', '');
                      handleFilterChange('dateTo', '');
                    }}
                    className="ml-1 hover:text-primary/70"
                  >
                    <Icon name="X" size={12} />
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterToolbar;