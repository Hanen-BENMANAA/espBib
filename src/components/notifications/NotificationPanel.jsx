import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';

// Simple dropdown component
const NotificationDropdown = ({ isOpen, notifications, loading, onClose, onNotificationClick, onMarkAsRead, onDelete }) => {
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-[420px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 text-white">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Bell size={20} />
            Notifications
            {unreadNotifications.length > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
                {unreadNotifications.length}
              </span>
            )}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded transition">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
            Chargement...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="font-semibold">Aucune notification</p>
            <p className="text-sm text-gray-400 mt-1">Vous êtes à jour !</p>
          </div>
        ) : (
          <div>
            {/* Unread notifications */}
            {unreadNotifications.length > 0 && (
              <div className="p-4 space-y-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
                  Non lues
                </h4>
                {unreadNotifications.map(notif => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    onClick={onNotificationClick}
                    onMarkAsRead={onMarkAsRead}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}

            {/* Read notifications */}
            {readNotifications.length > 0 && (
              <div className="p-4 space-y-2 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
                  Lues
                </h4>
                {readNotifications.map(notif => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    onClick={onNotificationClick}
                    onMarkAsRead={onMarkAsRead}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Individual notification item with actions
const NotificationItem = ({ notification, onClick, onMarkAsRead, onDelete }) => {
  const handleMarkAsRead = (e) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Supprimer cette notification ?')) {
      onDelete(notification.id);
    }
  };

  return (
    <div
      className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${
        !notification.read
          ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
          : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
      onClick={() => onClick(notification)}
    >
      <div className="flex gap-3">
        <div className="flex-1 min-w-0 pr-20">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-sm text-gray-900 truncate">
              {notification.report_title}
            </h4>
            {!notification.read && (
              <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></span>
            )}
          </div>

          <p className="text-xs text-gray-600 mb-2">{notification.teacher_name}</p>
          <p className="text-sm text-gray-700 line-clamp-2 mb-2">{notification.message}</p>
          
          <p className="text-xs text-gray-400">
            {new Date(notification.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* Action buttons - always visible on the right */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {!notification.read && (
            <button
              onClick={handleMarkAsRead}
              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all shadow-sm hover:shadow-md"
              title="Marquer comme lu"
            >
              <Check size={18} strokeWidth={3} />
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all shadow-sm hover:shadow-md"
            title="Supprimer"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal component
const NotificationModal = ({ notification, onClose, onMarkAsRead }) => {
  React.useEffect(() => {
    if (notification && !notification.read) {
      setTimeout(() => onMarkAsRead(notification.id), 1000);
    }
  }, [notification, onMarkAsRead]);

  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!notification) return null;

  const supervisorName = notification.teacher_name || 'Superviseur';

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]" onClick={onClose} />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-blue-600 text-white p-6 rounded-t-3xl relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition"
            >
              <X size={24} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <Bell size={28} />
              <span className="px-4 py-2 bg-white/20 rounded-full font-bold text-sm">
                Nouveau commentaire
              </span>
            </div>
            <h2 className="text-2xl font-bold">{notification.report_title}</h2>
            <p className="text-sm opacity-90 mt-2">
              Reçu le {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <div className="p-8">
            <div className="flex items-center gap-4 mb-8 p-5 bg-gray-50 rounded-2xl">
              <div className="w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                {supervisorName.split(' ').map(n => n[0]).join('').substring(0,2)}
              </div>
              <div>
                <h3 className="text-xl font-bold">{supervisorName}</h3>
                <p className="text-gray-600 font-medium">Superviseur</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                💬 Commentaire du superviseur
              </h3>
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <p className="text-gray-800 leading-relaxed whitespace-pre-line text-lg">
                  {notification.message}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => window.location.href = `/student/view-report/${notification.report_id}`}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-lg py-4 px-6 rounded-xl transition"
              >
                📄 Voir le rapport
              </button>
              <button
                onClick={() => window.location.href = `mailto:${notification.teacher_email}`}
                className="flex-1 border-2 border-gray-300 hover:border-gray-400 font-bold py-4 px-6 rounded-xl transition"
              >
                ✉️ Contacter
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Main component
const NotificationPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem('esprim_session'))?.token;
      
      if (!token) {
        console.error('❌ No token found');
        return;
      }

      const res = await fetch('http://localhost:5000/api/reports/my-comments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log('✅ Notifications received:', data);

      if (data.success && Array.isArray(data.data)) {
        const formatted = data.data.map(item => ({
          id: item.comment_id,
          type: 'comment_added',
          teacher_name: item.teacher_name,
          teacher_email: item.teacher_email,
          report_title: item.report_title,
          message: item.comment,
          created_at: item.comment_date,
          report_id: item.report_id,
          read: item.is_read || false
        }));
        
        setNotifications(formatted);
        setUnreadCount(formatted.filter(n => !n.read).length);
        console.log(`✅ ${formatted.length} notifications, ${formatted.filter(n => !n.read).length} unread`);
      }
    } catch (err) {
      console.error('❌ Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (commentId) => {
    try {
      const token = JSON.parse(localStorage.getItem('esprim_session'))?.token;
      
      const res = await fetch(`http://localhost:5000/api/reports/comments/${commentId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setNotifications(prev => prev.map(n => 
          n.id === commentId ? { ...n, read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
        console.log(`✅ Comment ${commentId} marked as read`);
      }
    } catch (err) {
      console.error('❌ Error marking as read:', err);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const token = JSON.parse(localStorage.getItem('esprim_session'))?.token;
      
      const res = await fetch(`http://localhost:5000/api/reports/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== commentId));
        setUnreadCount(prev => {
          const notif = notifications.find(n => n.id === commentId);
          return notif && !notif.read ? Math.max(0, prev - 1) : prev;
        });
        console.log(`✅ Comment ${commentId} deleted`);
      }
    } catch (err) {
      console.error('❌ Error deleting notification:', err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => { 
          setIsOpen(!isOpen); 
          if (!isOpen) fetchNotifications(); 
        }}
        className="relative p-3 rounded-full hover:bg-gray-100 transition-all group"
      >
        <Bell size={24} className="text-gray-700 group-hover:text-gray-900" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationDropdown
        isOpen={isOpen}
        notifications={notifications}
        loading={loading}
        onClose={() => setIsOpen(false)}
        onNotificationClick={(notif) => {
          setSelectedNotif(notif);
          setIsOpen(false);
        }}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDelete}
      />

      {selectedNotif && (
        <NotificationModal
          notification={selectedNotif}
          onClose={() => setSelectedNotif(null)}
          onMarkAsRead={handleMarkAsRead}
        />
      )}
    </div>
  );
};

export default NotificationPanel;