import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import NavigationBreadcrumbs from '../../components/ui/NavigationBreadcrumbs';
import StatusIndicatorBanner from '../../components/ui/StatusIndicatorBanner';
import QuickActionPanel from '../../components/ui/QuickActionPanel';
import MetricsCard from './components/MetricsCard';
import ActivityChart from './components/ActivityChart';
import ManagementPanel from './components/ManagementPanel';
import SystemNotifications from './components/SystemNotifications';
import QuickStats from './components/QuickStats';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const AdministrativeDashboard = () => {
  const [systemStatus, setSystemStatus] = useState('operational');
  const [showBanner, setShowBanner] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const keyMetrics = [
    {
      title: 'Total des Rapports',
      value: '2,847',
      change: '+12%',
      changeType: 'positive',
      icon: 'FileText',
      description: 'Rapports soumis depuis le début de l\'année',
      trend: 78
    },
    {
      title: 'Utilisateurs Actifs',
      value: '1,247',
      change: '+8%',
      changeType: 'positive',
      icon: 'Users',
      description: 'Utilisateurs connectés dans les dernières 24h',
      trend: 65
    },
    {
      title: 'Consultations Récentes',
      value: '5,432',
      change: '+15%',
      changeType: 'positive',
      icon: 'Eye',
      description: 'Documents consultés cette semaine',
      trend: 82
    },
    {
      title: 'Santé du Système',
      value: '98.7%',
      change: '-0.2%',
      changeType: 'negative',
      icon: 'Activity',
      description: 'Disponibilité système sur 30 jours',
      trend: 98
    }
  ];

  const getBannerMessage = () => {
    switch (systemStatus) {
      case 'maintenance':
        return 'Maintenance programmée prévue le 20/10/2025 de 02:00 à 04:00';
      case 'warning':
        return 'Espace de stockage à 85% - Nettoyage recommandé';
      case 'error':
        return 'Problème de connectivité détecté sur le serveur de sauvegarde';
      default:
        return 'Tous les systèmes fonctionnent normalement';
    }
  };

  const formatLastUpdate = () => {
    return lastUpdate?.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Tableau de Bord Administratif - ESPRIM Virtual Library</title>
        <meta name="description" content="Interface d'administration pour la gestion du système ESPRIM Virtual Library avec statistiques en temps réel et contrôles système." />
      </Helmet>
      <Header />
      <main className="flex-1">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <NavigationBreadcrumbs />
          
          {/* Status Banner */}
          {showBanner && (
            <div className="mb-6">
              <StatusIndicatorBanner
                type={systemStatus === 'operational' ? 'success' : 
                      systemStatus === 'warning' ? 'warning' : 
                      systemStatus === 'maintenance' ? 'info' : 'error'}
                message={getBannerMessage()}
                isVisible={showBanner}
                onDismiss={() => setShowBanner(false)}
                autoHide={systemStatus === 'operational'}
                autoHideDelay={5000}
                showProgress={systemStatus === 'operational'}
                actionLabel={systemStatus !== 'operational' ? 'Voir Détails' : null}
                onAction={() => console.log('Action clicked')}
              />
            </div>
          )}

          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Tableau de Bord Administratif
              </h1>
              <p className="text-muted-foreground">
                Vue d'ensemble du système ESPRIM Virtual Library
              </p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Icon name="Clock" size={16} />
                  <span>Dernière mise à jour: {formatLastUpdate()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    systemStatus === 'operational' ? 'bg-success' :
                    systemStatus === 'warning' ? 'bg-warning' :
                    systemStatus === 'maintenance' ? 'bg-primary' : 'bg-error'
                  }`}></div>
                  <span className="capitalize">{
                    systemStatus === 'operational' ? 'Opérationnel' :
                    systemStatus === 'warning' ? 'Attention' :
                    systemStatus === 'maintenance' ? 'Maintenance' : 'Problème'
                  }</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-4 lg:mt-0">
              <Button 
                variant="outline" 
                iconName="RefreshCw" 
                iconPosition="left"
                onClick={() => setLastUpdate(new Date())}
              >
                Actualiser
              </Button>
              <Button 
                variant="outline" 
                iconName="Download" 
                iconPosition="left"
              >
                Export Rapport
              </Button>
              <Button 
                variant="default" 
                iconName="Settings" 
                iconPosition="left"
              >
                Configuration
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mb-8">
            <QuickStats />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {keyMetrics?.map((metric, index) => (
              <MetricsCard
                key={index}
                title={metric?.title}
                value={metric?.value}
                change={metric?.change}
                changeType={metric?.changeType}
                icon={metric?.icon}
                description={metric?.description}
                trend={metric?.trend}
              />
            ))}
          </div>

          {/* Activity Chart */}
          <div className="mb-8">
            <ActivityChart />
          </div>

          {/* Management Panel and Notifications */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            <div className="xl:col-span-2">
              <ManagementPanel />
            </div>
            <div className="xl:col-span-1">
              <SystemNotifications />
            </div>
          </div>

          {/* System Health Footer */}
          <div className="bg-card border border-border rounded-lg p-6 academic-shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  État du Système
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-muted-foreground">API: Opérationnelle</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-muted-foreground">Base de données: OK</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    <span className="text-muted-foreground">Stockage: 85%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-muted-foreground">Sauvegardes: OK</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-0">
                <Button variant="outline" size="sm" iconName="ExternalLink" iconPosition="right">
                  Monitoring Détaillé
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <QuickActionPanel userRole="admin" />
    </div>
  );
};

export default AdministrativeDashboard;