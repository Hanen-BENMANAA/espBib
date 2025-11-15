import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const NotificationsPanel = ({ notifications, onMarkAsRead, onMarkAllAsRead }) => {
  const [showAll, setShowAll] = useState(false);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'validation':
        return { icon: 'CheckCircle', color: 'text-success' };
      case 'rejection':
        return { icon: 'XCircle', color: 'text-error' };
      case 'feedback':
        return { icon: 'MessageSquare', color: 'text-primary' };
      case 'deadline':
        return { icon: 'Clock', color: 'text-warning' };
      case 'system':
        return { icon: 'Bell', color: 'text-muted-foreground' };
      default:
        return { icon: 'Info', color: 'text-muted-foreground' };
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-error/10 text-error border-error/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'low':
        return 'bg-muted/50 text-muted-foreground border-muted';
      default:
        return 'bg-muted/50 text-muted-foreground border-muted';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'une heure';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  };

  const displayedNotifications = showAll ? notifications : notifications?.slice(0, 5);
  const unreadCount = notifications?.filter(n => !n?.read)?.length;

  return (
    <div className="bg-card border border-border rounded-academic academic-shadow-sm">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-heading font-semibold text-foreground">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              iconName="CheckCheck"
              iconSize={14}
            >
              Tout marquer lu
            </Button>
          )}
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {displayedNotifications?.length > 0 ? (
          <div className="divide-y divide-border">
            {displayedNotifications?.map((notification) => {
              const iconConfig = getNotificationIcon(notification?.type);
              
              return (
                <div
                  key={notification?.id}
                  className={`p-4 hover:bg-muted/30 academic-transition ${
                    !notification?.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-1 rounded-full ${iconConfig?.color}`}>
                      <Icon name={iconConfig?.icon} size={16} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm ${!notification?.read ? 'font-medium' : ''} text-foreground`}>
                            {notification?.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification?.message}
                          </p>
                        </div>
                        
                        {notification?.priority && notification?.priority !== 'low' && (
                          <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityBadge(notification?.priority)}`}>
                            {notification?.priority === 'high' ? 'Urgent' : 'Important'}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification?.timestamp)}
                        </span>
                        
                        {!notification?.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMarkAsRead(notification?.id)}
                            className="text-xs"
                          >
                            Marquer lu
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="Bell" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucune notification</p>
          </div>
        )}
      </div>
      {notifications?.length > 5 && (
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="w-full"
            iconName={showAll ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
          >
            {showAll ? 'Voir moins' : `Voir toutes (${notifications?.length})`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;