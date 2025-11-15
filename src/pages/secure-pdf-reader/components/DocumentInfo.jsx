import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DocumentInfo = ({ 
  document = {
    title: "Développement d'un Système IoT pour la Gestion Énergétique",
    author: "Ahmed Ben Salem",
    supervisor: "Dr. Fatma Gharbi",
    year: "2024",
    specialty: "Génie Informatique",
    department: "Informatique et Télécommunications",
    keywords: ["IoT", "Gestion énergétique", "Capteurs intelligents", "Machine Learning"],
    abstract: `Ce projet présente le développement d'un système IoT innovant pour la gestion énergétique intelligente dans les bâtiments industriels. L'objectif principal est de créer une solution complète permettant la surveillance en temps réel de la consommation énergétique et l'optimisation automatique des équipements.

Le système développé intègre des capteurs IoT avancés, des algorithmes d'apprentissage automatique et une interface utilisateur intuitive. Les résultats montrent une réduction de 25% de la consommation énergétique et une amélioration significative de l'efficacité opérationnelle.

Cette solution contribue aux objectifs de développement durable et offre des perspectives prometteuses pour l'industrie 4.0.`,
    defenseDate: "15/06/2024",
    company: "TechnoSmart Solutions",
    pages: 156,
    fileSize: "12.5 MB",
    uploadDate: "10/06/2024",
    validationDate: "12/06/2024",
    validator: "Prof. Mohamed Trabelsi"
  },
  onAddBookmark,
  onRemoveBookmark,
  isBookmarked = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullAbstract, setShowFullAbstract] = useState(false);

  const handleBookmarkToggle = () => {
    if (isBookmarked) {
      onRemoveBookmark?.(document?.id);
    } else {
      onAddBookmark?.(document);
    }
  };

  const formatAbstract = (text) => {
    const paragraphs = text?.split('\n\n');
    if (!showFullAbstract && paragraphs?.length > 1) {
      return paragraphs?.[0] + '...';
    }
    return text;
  };

  return (
    <div className="bg-card border border-border rounded-academic academic-shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-semibold text-foreground mb-1">
              Informations du document
            </h3>
            <p className="text-sm text-muted-foreground">
              Métadonnées et détails du rapport
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBookmarkToggle}
              className={isBookmarked ? 'text-accent' : 'text-muted-foreground'}
            >
              <Icon name={isBookmarked ? "Bookmark" : "BookmarkPlus"} size={20} />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={20} />
            </Button>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className={`overflow-hidden academic-transition-layout ${isExpanded ? 'max-h-none' : 'max-h-96'}`}>
        <div className="p-4 space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Titre
                </label>
                <p className="text-sm text-foreground font-medium mt-1">
                  {document?.title}
                </p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Auteur
                </label>
                <p className="text-sm text-foreground mt-1">
                  {document?.author}
                </p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Encadrant
                </label>
                <p className="text-sm text-foreground mt-1">
                  {document?.supervisor}
                </p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Entreprise d'accueil
                </label>
                <p className="text-sm text-foreground mt-1">
                  {document?.company}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Année académique
                </label>
                <p className="text-sm text-foreground mt-1">
                  {document?.year}
                </p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Spécialité
                </label>
                <p className="text-sm text-foreground mt-1">
                  {document?.specialty}
                </p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Département
                </label>
                <p className="text-sm text-foreground mt-1">
                  {document?.department}
                </p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Date de soutenance
                </label>
                <p className="text-sm text-foreground mt-1">
                  {document?.defenseDate}
                </p>
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
              Mots-clés
            </label>
            <div className="flex flex-wrap gap-2">
              {document?.keywords?.map((keyword, index) => (
                <span
                  key={index}
                  className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Abstract */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
              Résumé
            </label>
            <div className="bg-muted rounded-academic p-3">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                {formatAbstract(document?.abstract)}
              </p>
              {document?.abstract?.includes('\n\n') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullAbstract(!showFullAbstract)}
                  className="mt-2 text-xs"
                >
                  {showFullAbstract ? 'Voir moins' : 'Voir plus'}
                </Button>
              )}
            </div>
          </div>

          {/* Technical Details */}
          {isExpanded && (
            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-foreground mb-3">
                Détails techniques
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded-academic">
                  <Icon name="FileText" size={20} className="text-primary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Pages</p>
                  <p className="text-sm font-medium text-foreground">{document?.pages}</p>
                </div>
                
                <div className="text-center p-3 bg-muted rounded-academic">
                  <Icon name="HardDrive" size={20} className="text-primary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Taille</p>
                  <p className="text-sm font-medium text-foreground">{document?.fileSize}</p>
                </div>
                
                <div className="text-center p-3 bg-muted rounded-academic">
                  <Icon name="Upload" size={20} className="text-primary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Soumis le</p>
                  <p className="text-sm font-medium text-foreground">{document?.uploadDate}</p>
                </div>
                
                <div className="text-center p-3 bg-muted rounded-academic">
                  <Icon name="CheckCircle" size={20} className="text-success mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Validé le</p>
                  <p className="text-sm font-medium text-foreground">{document?.validationDate}</p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-academic">
                <div className="flex items-center space-x-2">
                  <Icon name="UserCheck" size={16} className="text-success" />
                  <span className="text-sm text-success-foreground">
                    Document validé par {document?.validator}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentInfo;