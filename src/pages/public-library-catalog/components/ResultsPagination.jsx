import React from 'react';

import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const ResultsPagination = ({ 
  currentPage, 
  totalPages, 
  totalResults, 
  resultsPerPage, 
  onPageChange, 
  onResultsPerPageChange 
}) => {
  const resultsPerPageOptions = [
    { value: '12', label: '12 par page' },
    { value: '24', label: '24 par page' },
    { value: '48', label: '48 par page' },
    { value: '96', label: '96 par page' }
  ];

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range?.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots?.push(1, '...');
    } else {
      rangeWithDots?.push(1);
    }

    rangeWithDots?.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots?.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots?.push(totalPages);
    }

    return rangeWithDots;
  };

  const startResult = (currentPage - 1) * resultsPerPage + 1;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-academic academic-shadow-sm">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-6">
        {/* Results Info */}
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Affichage de <span className="font-medium text-foreground">{startResult}</span> à{' '}
            <span className="font-medium text-foreground">{endResult}</span> sur{' '}
            <span className="font-medium text-foreground">{totalResults}</span> résultats
          </p>
          
          <Select
            options={resultsPerPageOptions}
            value={resultsPerPage?.toString()}
            onChange={(value) => onResultsPerPageChange(parseInt(value))}
            className="w-32"
          />
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            iconName="ChevronLeft"
            iconSize={16}
          >
            Précédent
          </Button>

          {/* Page Numbers */}
          <div className="hidden md:flex items-center gap-1">
            {getVisiblePages()?.map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-3 py-2 text-muted-foreground">...</span>
                ) : (
                  <Button
                    variant={currentPage === page ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className="w-10 h-10"
                  >
                    {page}
                  </Button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Mobile Page Info */}
          <div className="md:hidden flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} sur {totalPages}
            </span>
          </div>

          {/* Next Button */}
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            iconName="ChevronRight"
            iconSize={16}
          >
            Suivant
          </Button>
        </div>

        {/* Quick Jump */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Aller à:</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => onPageChange(1)}
              iconName="ChevronsLeft"
              iconSize={14}
            >
              Début
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(totalPages)}
              iconName="ChevronsRight"
              iconSize={14}
            >
              Fin
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPagination;