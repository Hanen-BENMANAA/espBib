// src/components/notifications/NotificationDetailModalWrapper.jsx

import React, { useEffect } from 'react';
import NotificationDetailModal from './NotificationDetailModal';

const NotificationDetailModalWrapper = ({ notification, isOpen, onClose, onMarkAsRead }) => {
  // Marque comme lu après 1 seconde
  useEffect(() => {
    if (isOpen && notification && !notification.read) {
      const timer = setTimeout(() => {
        onMarkAsRead(notification.id);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, notification, onMarkAsRead]);

  // Ferme avec Échap
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !notification) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}  // ← CLIC DEHORS = FERME
    >
      <div 
        className="max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}  // ← EMPÊCHE LA FERMETURE SI ON CLIQUE DEDANS
      >
        <NotificationDetailModal 
          notification={notification} 
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default NotificationDetailModalWrapper;