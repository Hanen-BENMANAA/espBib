import React, { useState, useEffect } from 'react';
import Icon from "../AppIcon";
const NotificationItem = ({ notification, onClick, onMarkAsRead }) => {
  const getNotificationIcon = (type) => {
    const icons = {
      validated: 'CheckCircle2',
      rejected: 'XCircle',
      revision_requested: 'AlertCircle',
      comment_added: 'MessageSquare'
    };
    return icons?.[type] || 'Bell';
  };

  const getNotificationColor = (type) => {
    const colors = {
      validated: 'text-success',
      rejected: 'text-error',
      revision_requested: 'text-warning',
      comment_added: 'text-accent'
    };
    return colors?.[type] || 'text-muted-foreground';
  };

  const getNotificationBg = (type) => {
    const backgrounds = {
      validated: 'bg-success/10',
      rejected: 'bg-error/10',
      revision_requested: 'bg-warning/10',
      comment_added: 'bg-accent/10'
    };
    return backgrounds?.[type] || 'bg-muted/30';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return date?.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  const handleMarkAsRead = (e) => {
    e?.stopPropagation();
    onMarkAsRead(notification?.id);
  };

  return (
    <div
      onClick={() => onClick(notification)}
      className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
        notification?.isRead
          ? 'bg-card border-border hover:bg-muted/50' :'bg-primary/5 border-primary/20 hover:bg-primary/10'
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e?.key === 'Enter' || e?.key === ' ') {
          e?.preventDefault();
          onClick(notification);
        }
      }}
    >
      <div className="flex gap-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${getNotificationBg(notification?.type)} flex items-center justify-center`}>
          <Icon 
            name={getNotificationIcon(notification?.type)} 
            size={20} 
            color={`var(--color-${notification?.type === 'validated' ? 'success' : notification?.type === 'rejected' ? 'error' : notification?.type === 'revision_requested' ? 'warning' : 'accent'})`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-sm text-foreground truncate">
              {notification?.reportTitle}
            </h4>
            {!notification?.isRead && (
              <button
                onClick={handleMarkAsRead}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-muted transition-colors focus-ring"
                aria-label="Marquer comme lu"
              >
                <Icon name="Check" size={14} color="var(--color-primary)" />
              </button>
            )}
          </div>

          <p className="text-xs text-muted-foreground mb-2">
            {notification?.teacherName}
          </p>

          <p className="text-sm text-foreground line-clamp-2 mb-2">
            {notification?.message}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-mono">
              {formatTimestamp(notification?.timestamp)}
            </span>
            
            {!notification?.isRead && (
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" aria-label="Non lu" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;