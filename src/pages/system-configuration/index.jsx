import React, { useState } from 'react';
import NavigationHeader from '../../components/ui/NavigationHeader';
import RoleBasedSidebar from '../../components/ui/RoleBasedSidebar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

// Import all configuration sections
import SecurityParametersSection from './components/SecurityParametersSection';
import EmailTemplatesSection from './components/EmailTemplatesSection';
import WatermarkCustomizationSection from './components/WatermarkCustomizationSection';
import AcademicYearSection from './components/AcademicYearSection';
import StorageQuotaSection from './components/StorageQuotaSection';
import SystemAlertsSection from './components/SystemAlertsSection';

const SystemConfiguration = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('security');
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const configurationTabs = [
    {
      id: 'security',
      label: 'Sécurité',
      icon: 'Shield',
      description: 'Paramètres de sécurité et authentification'
    },
    {
      id: 'email',
      label: 'Emails',
      icon: 'Mail',
      description: 'Modèles de notifications et emails'
    },
    {
      id: 'watermark',
      label: 'Filigrane',
      icon: 'Image',
      description: 'Configuration du filigrane des documents'
    },
    {
      id: 'academic',
      label: 'Académique',
      icon: 'GraduationCap',
      description: 'Années académiques et spécialités'
    },
    {
      id: 'storage',
      label: 'Stockage',
      icon: 'HardDrive',
      description: 'Quotas et gestion de l\'espace'
    },
    {
      id: 'alerts',
      label: 'Alertes',
      icon: 'Bell',
      description: 'Système d\'alertes et notifications'
    }
  ];

  const handleToggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const handleSaveConfiguration = (section, data) => {
    // Mock save operation
    console.log(`Saving ${section} configuration:`, data);
    
    setShowSaveConfirmation(true);
    setLastSaved(new Date()?.toLocaleString('fr-FR'));
    
    setTimeout(() => {
      setShowSaveConfirmation(false);
    }, 3000);
  };

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'security':
        return <SecurityParametersSection onSave={handleSaveConfiguration} />;
      case 'email':
        return <EmailTemplatesSection onSave={handleSaveConfiguration} />;
      case 'watermark':
        return <WatermarkCustomizationSection onSave={handleSaveConfiguration} />;
      case 'academic':
        return <AcademicYearSection onSave={handleSaveConfiguration} />;
      case 'storage':
        return <StorageQuotaSection onSave={handleSaveConfiguration} />;
      case 'alerts':
        return <SystemAlertsSection onSave={handleSaveConfiguration} />;
      default:
        return <SecurityParametersSection onSave={handleSaveConfiguration} />;
    }
  };

  const activeTabInfo = configurationTabs?.find(tab => tab?.id === activeTab);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <RoleBasedSidebar
        isCollapsed={sidebarCollapsed}
        isOpen={sidebarOpen}
        onToggle={handleToggleSidebar}
        userRole="admin"
      />
      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        {/* Header */}
        <NavigationHeader
          isCollapsed={sidebarCollapsed}
          onToggleSidebar={handleToggleSidebar}
          userRole="admin"
          userName="Admin ESPRIM"
          institutionName="ESPRIM Virtual Library"
        />

        {/* Page Content */}
        <main className="pt-16 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <BreadcrumbTrail />

            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-heading font-semibold text-text-primary mb-2">
                  Configuration Système
                </h1>
                <p className="text-text-secondary font-caption">
                  Gérez les paramètres globaux et la configuration de la plateforme ESPRIM
                </p>
              </div>

              <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                {lastSaved && (
                  <div className="flex items-center space-x-2 text-sm font-caption text-text-secondary">
                    <Icon name="Clock" size={16} />
                    <span>Dernière sauvegarde: {lastSaved}</span>
                  </div>
                )}
                
                <Button
                  variant="outline"
                  iconName="Download"
                  iconPosition="left"
                >
                  Exporter Config
                </Button>
              </div>
            </div>

            {/* Success Message */}
            {showSaveConfirmation && (
              <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg flex items-center space-x-3">
                <Icon name="CheckCircle" size={20} className="text-success" />
                <div>
                  <p className="font-medium text-success">Configuration sauvegardée</p>
                  <p className="text-sm font-caption text-success/80">
                    Les modifications ont été appliquées avec succès
                  </p>
                </div>
              </div>
            )}

            {/* Configuration Tabs */}
            <div className="bg-card border border-border rounded-lg shadow-academic mb-6">
              {/* Tab Navigation */}
              <div className="border-b border-border">
                <div className="flex overflow-x-auto">
                  {configurationTabs?.map(tab => (
                    <button
                      key={tab?.id}
                      onClick={() => setActiveTab(tab?.id)}
                      className={`flex items-center space-x-3 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-academic ${
                        activeTab === tab?.id
                          ? 'border-primary text-primary bg-primary/5' :'border-transparent text-text-secondary hover:text-text-primary hover:bg-muted/50'
                      }`}
                    >
                      <Icon name={tab?.icon} size={18} />
                      <span>{tab?.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content Header */}
              <div className="p-6 border-b border-border bg-muted/30">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name={activeTabInfo?.icon} size={20} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-heading font-medium text-text-primary">
                      {activeTabInfo?.label}
                    </h2>
                    <p className="text-sm font-caption text-text-secondary">
                      {activeTabInfo?.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {renderActiveSection()}
              </div>
            </div>

            {/* System Status Footer */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
                    <span className="text-sm font-caption text-text-secondary">
                      Système opérationnel
                    </span>
                  </div>
                  
                  <div className="h-4 w-px bg-border" />
                  
                  <div className="flex items-center space-x-2">
                    <Icon name="Users" size={16} className="text-text-secondary" />
                    <span className="text-sm font-caption text-text-secondary">
                      245 utilisateurs connectés
                    </span>
                  </div>
                  
                  <div className="h-4 w-px bg-border" />
                  
                  <div className="flex items-center space-x-2">
                    <Icon name="Server" size={16} className="text-text-secondary" />
                    <span className="text-sm font-caption text-text-secondary">
                      Version 2.1.0
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    variant="ghost"
                    iconName="HelpCircle"
                    iconPosition="left"
                  >
                    Documentation
                  </Button>
                  
                  <Button
                    variant="outline"
                    iconName="RotateCcw"
                    iconPosition="left"
                  >
                    Redémarrer Services
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SystemConfiguration;