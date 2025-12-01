import React, { useState, useEffect } from 'react';
import Icon from "../AppIcon";
const NotificationBell = ({ unreadCount, onClick, isOpen }) => {
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (unreadCount > 0) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  return (
    <button
      onClick={onClick}
      className={`relative p-3 rounded-xl transition-all duration-200 focus-ring ${
        isOpen 
          ? 'bg-primary text-primary-foreground shadow-lg' 
          : 'bg-card hover:bg-muted text-foreground'
      }`}
      aria-label={`Notifications. ${unreadCount} non lues`}
      aria-expanded={isOpen}
      aria-haspopup="true"
    >
      <Icon 
        name="Bell" 
        size={24} 
        color="currentColor"
        className={isPulsing ? 'animate-pulse' : ''}
      />
      
      {unreadCount > 0 && (
        <span 
          className={`absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full text-xs font-bold ${
            isPulsing ? 'animate-pulse' : ''
          } ${
            isOpen 
              ? 'bg-accent text-accent-foreground' 
              : 'bg-error text-error-foreground'
          }`}
          aria-label={`${unreadCount} notifications non lues`}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;