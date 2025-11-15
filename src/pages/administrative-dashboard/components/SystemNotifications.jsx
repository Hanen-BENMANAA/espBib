import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SystemNotifications = () => {
  const [filter, setFilter] = useState('all');

  const notifications = [
    {
      id: 1,
      type: 'security',
      priority: 'high',
      title: 'Tentative d\'accès non autorisé détectée',
      message: 'Plusieurs tentatives de connexion échouées depuis l\'IP 192.168.1.100',
      timestamp: new Date(Date.now() - 300000),
      read: false,
      actions: ['Bloquer IP', 'Voir Détails']
    },
    {
      id: 2,
      type: 'system',
      priority: 'medium',
      title: 'Mise à jour système disponible',
      message: 'Version 2.1.3 disponible avec corrections de sécurité',
      timestamp: new Date(Date.now() - 1800000),
      read: false,
      actions: ['Planifier', 'Ignorer']
    },
    {
      id: 3,
      type: 'user',
      priority: 'low',
      title: 'Nouveau compte enseignant créé',
      message: 'Dr. Marie Dubois a été ajoutée au département Informatique',
      timestamp: new Date(Date.now() - 3600000),
      read: true,
      actions: ['Voir Profil']
    },
    {
      id: 4,
      type: 'storage',
      priority: 'medium',
      title: 'Espace de stockage à 85%',
      message: 'Le serveur principal approche de sa capacité maximale',
      timestamp: new Date(Date.now() - 7200000),
      read: false,
      actions: ['Nettoyer', 'Étendre']
    },
    {
      id: 5,
      type: 'backup',
      priority: 'high',
      title: 'Échec de sauvegarde automatique',
      message: 'La sauvegarde programmée de 03:00 a échoué',
      timestamp: new Date(Date.now() - 21600000),
      read: false,
      actions: ['Relancer', 'Diagnostiquer']
    }
  ];

  const filterOptions = [
    { value: 'all', label: 'Toutes', count: notifications?.length },
    { value: 'unread', label: 'Non lues', count: notifications?.filter(n => !n?.read)?.length },
    { value: 'high', label: 'Priorité haute', count: notifications?.filter(n => n?.priority === 'high')?.length },
    { value: 'security', label: 'Sécurité', count: notifications?.filter(n => n?.type === 'security')?.length }
  ];

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications?.filter(n => !n?.read);
      case 'high':
        return notifications?.filter(n => n?.priority === 'high');
      case 'security':
        return notifications?.filter(n => n?.type === 'security');
      default:
        return notifications;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'security': return 'Shield';
      case 'system': return 'Settings';
      case 'user': return 'User';
      case 'storage': return 'HardDrive';
      case 'backup': return 'Database';
      default: return 'Bell';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityBg = (priority) => {
    switch (priority) {
      case 'high': return 'bg-error/10';
      case 'medium': return 'bg-warning/10';
      case 'low': return 'bg-success/10';
      default: return 'bg-muted/10';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 60) {
      return `il y a ${minutes} min`;
    } else if (hours < 24) {
      return `il y a ${hours}h`;
    } else {
      return timestamp?.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 academic-shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Notifications Système
        </h3>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" iconName="Settings" iconSize={16}>
            Configurer
          </Button>
          <Button variant="ghost" size="sm" iconName="CheckCheck" iconSize={16}>
            Tout marquer lu
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {filterOptions?.map((option) => (
          <Button
            key={option?.value}
            variant={filter === option?.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(option?.value)}
            className="text-xs"
          >
            {option?.label} ({option?.count})
          </Button>
        ))}
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {getFilteredNotifications()?.map((notification) => (
          <div
            key={notification?.id}
            className={`border border-border rounded-lg p-4 academic-transition ${
              !notification?.read ? 'bg-primary/5' : 'bg-background'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getPriorityBg(notification?.priority)}`}>
                <Icon 
                  name={getNotificationIcon(notification?.type)} 
                  size={16} 
                  className={getPriorityColor(notification?.priority)}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h4 className={`text-sm font-medium ${!notification?.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {notification?.title}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityBg(notification?.priority)} ${getPriorityColor(notification?.priority)}`}>
                      {notification?.priority === 'high' ? 'Haute' : 
                       notification?.priority === 'medium' ? 'Moyenne' : 'Basse'}
                    </span>
                    {!notification?.read && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {notification?.message}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(notification?.timestamp)}
                  </span>
                  
                  <div className="flex space-x-2">
                    {notification?.actions?.map((action, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7"
                      >
                        {action}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {getFilteredNotifications()?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Bell" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Aucune notification pour ce filtre</p>
        </div>
      )}
    </div>
  );
};

export default SystemNotifications;