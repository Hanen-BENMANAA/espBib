import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const MobileFilterDrawer = ({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange, 
  onClearFilters 
}) => {
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-300 lg:hidden"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-80 bg-card border-l border-border z-400 lg:hidden overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-heading font-semibold text-foreground">
              Filtres de recherche
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <Icon name="X" size={20} />
            </Button>
          </div>

          {/* Filters */}
          <div className="space-y-6">
            <Select
              label="Trier par"
              options={sortOptions}
              value={filters?.sortBy || 'relevance'}
              onChange={(value) => handleFilterChange('sortBy', value)}
            />

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

          {/* Actions */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-border">
            {hasActiveFilters && (
              <Button
                variant="outline"
                fullWidth
                onClick={onClearFilters}
                iconName="X"
                iconPosition="left"
              >
                Effacer tout
              </Button>
            )}
            <Button
              variant="default"
              fullWidth
              onClick={onClose}
              iconName="Check"
              iconPosition="left"
            >
              Appliquer
            </Button>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mt-6 pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-foreground mb-3">
                Filtres actifs
              </h4>
              <div className="space-y-2">
                {Object.entries(filters)?.map(([key, value]) => {
                  if (!value || value === '') return null;
                  
                  const labels = {
                    sortBy: 'Tri',
                    academicYear: 'Année',
                    specialty: 'Spécialité',
                    department: 'Département',
                    supervisor: 'Encadrant',
                    company: 'Entreprise',
                    keywords: 'Mots-clés'
                  };
                  
                  return (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{labels?.[key]}:</span>
                      <span className="text-foreground font-medium truncate ml-2">
                        {value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileFilterDrawer;