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

  const departmentOptions = [
    { value: '', label: 'Tous les départements' },
    { value: 'info', label: 'Département Informatique' },
    { value: 'elec', label: 'Département Électrique' },
    { value: 'meca', label: 'Département Mécanique' },
    { value: 'civil', label: 'Département Génie Civil' },
    { value: 'indus', label: 'Département Industriel' }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Pertinence' },
    { value: 'date_desc', label: 'Plus récent' },
    { value: 'date_asc', label: 'Plus ancien' },
    { value: 'title_asc', label: 'Titre A-Z' },
    { value: 'title_desc', label: 'Titre Z-A' },
    { value: 'popularity', label: 'Popularité' }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = Object.values(filters)?.some(value => value && value !== '');

  return (
    <div className="bg-card border border-border rounded-academic academic-shadow-sm">
      {/* Main Search Bar */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Rechercher par titre, mots-clés, auteur, résumé..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e?.target?.value)}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              iconName={isAdvancedOpen ? "ChevronUp" : "ChevronDown"}
              iconPosition="right"
            >
              Filtres avancés
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={onClearFilters}
                iconName="X"
                iconPosition="left"
                className="text-muted-foreground"
              >
                Effacer
              </Button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            {resultCount > 0 ? (
              <>
                <span className="font-medium text-foreground">{resultCount}</span> rapport{resultCount > 1 ? 's' : ''} trouvé{resultCount > 1 ? 's' : ''}
              </>
            ) : (
              'Aucun rapport trouvé'
            )}
          </p>
          <div className="flex items-center gap-2">
            <Icon name="Filter" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Trier par:
            </span>
            <Select
              options={sortOptions}
              value={filters?.sortBy || 'relevance'}
              onChange={(value) => handleFilterChange('sortBy', value)}
              className="w-40"
            />
          </div>
        </div>
      </div>
      {/* Advanced Filters */}
      {isAdvancedOpen && (
        <div className="p-6 bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Année académique"
              options={academicYearOptions}
              value={filters?.academicYear || ''}
              onChange={(value) => handleFilterChange('academicYear', value)}
            />
            
            <Select
              label="Spécialité"
              options={specialtyOptions}
              value={filters?.specialty || ''}
              onChange={(value) => handleFilterChange('specialty', value)}
            />
            
            <Select
              label="Département"
              options={departmentOptions}
              value={filters?.department || ''}
              onChange={(value) => handleFilterChange('department', value)}
            />
            
            <Input
              label="Encadrant"
              type="text"
              placeholder="Nom de l'encadrant"
              value={filters?.supervisor || ''}
              onChange={(e) => handleFilterChange('supervisor', e?.target?.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input
              label="Entreprise d'accueil"
              type="text"
              placeholder="Nom de l'entreprise"
              value={filters?.company || ''}
              onChange={(e) => handleFilterChange('company', e?.target?.value)}
            />
            
            <Input
              label="Mots-clés"
              type="text"
              placeholder="Séparer par des virgules"
              value={filters?.keywords || ''}
              onChange={(e) => handleFilterChange('keywords', e?.target?.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;