import React, { useRef, useEffect } from 'react';
import Icon from "../AppIcon";
import Button from "../ui/Button";
import NotificationItem from './NotificationItem';

const NotificationDropdown = ({ 
  isOpen, 
  notifications, 
  onClose, 
  onNotificationClick, 
  onMarkAsRead,
  onMarkAllAsRead,
  isLoading 
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event?.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadNotifications = notifications?.filter(n => !n?.isRead);
  const readNotifications = notifications?.filter(n => n?.isRead);

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-[420px] max-w-[calc(100vw-2rem)] bg-card rounded-2xl shadow-2xl border border-border z-50 overflow-hidden"
      role="dialog"
      aria-label="Panneau de notifications"
    >
      <div className="sticky top-0 bg-gradient-to-r from-primary to-secondary p-4 z-10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-heading font-bold text-lg text-primary-foreground flex items-center gap-2">
            <Icon name="Bell" size={20} color="currentColor" />
            Notifications
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors focus-ring"
            aria-label="Fermer le panneau"
          >
            <Icon name="X" size={18} color="currentColor" />
          </button>
        </div>
        
        {unreadNotifications?.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-primary-foreground/90">
              {unreadNotifications?.length} non {unreadNotifications?.length > 1 ? 'lues' : 'lue'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="text-primary-foreground hover:bg-white/10 h-8 px-3"
            >
              Tout marquer comme lu
            </Button>
          </div>
        )}
      </div>
      <div className="max-h-[500px] overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="spinner mb-3" />
            <p className="text-sm text-muted-foreground">Chargement des notifications...</p>
          </div>
        ) : notifications?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Icon name="Bell" size={32} color="var(--color-muted-foreground)" />
            </div>
            <h4 className="font-heading font-semibold text-foreground mb-2">
              Aucune notification
            </h4>
            <p className="text-sm text-muted-foreground text-center">
              Vous êtes à jour ! Les nouvelles notifications apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {unreadNotifications?.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                  Non lues
                </h4>
                {unreadNotifications?.map(notification => (
                  <NotificationItem
                    key={notification?.id}
                    notification={notification}
                    onClick={onNotificationClick}
                    
                    onMarkAsRead={onMarkAsRead}
                  />
                ))}
              </div>
            )}

            {readNotifications?.length > 0 && (
              <div className="space-y-3">
                {unreadNotifications?.length > 0 && (
                  <div className="border-t border-border my-4" />
                )}
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                  Lues
                </h4>
                {readNotifications?.map(notification => (
                  <NotificationItem
                    key={notification?.id}
                    notification={notification}
                    onClick={onNotificationClick}
                    onMarkAsRead={onMarkAsRead}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {notifications?.length > 0 && (
        <div className="sticky bottom-0 p-4 bg-muted/30 border-t border-border">
          <Button
            variant="outline"
            fullWidth
            iconName="Archive"
            iconPosition="left"
            onClick={() => {
              console.log('Voir toutes les notifications');
              onClose();
            }}
          >
            Voir toutes les notifications
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;