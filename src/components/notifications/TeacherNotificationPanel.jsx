import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, X, FileText } from 'lucide-react';

// Dropdown component
const TeacherNotificationDropdown = ({ isOpen, notifications, loading, onClose, onNotificationClick, onMarkAsRead, onDelete }) => {
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
<div className="p-4" style={{ backgroundColor: '#f7cdcd', color: 'black' }}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Bell size={20} />
            Nouveaux Rapports
            {unreadNotifications.length > 0 && (
<span className="px-2 py-0.5 rounded-full text-sm" style={{ backgroundColor: '#00000020', color: 'black' }}>
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            Chargement...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="font-semibold">Aucune notification</p>
            <p className="text-sm text-gray-400 mt-1">Les nouveaux rapports apparaîtront ici</p>
          </div>
        ) : (
          <div>
            {unreadNotifications.length > 0 && (
              <div className="p-4 space-y-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
                  Non lues
                </h4>
                {unreadNotifications.map(notif => (
                  <TeacherNotificationItem
                    key={notif.id}
                    notification={notif}
                    onClick={onNotificationClick}
                    onMarkAsRead={onMarkAsRead}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}

            {readNotifications.length > 0 && (
              <div className="p-4 space-y-2 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
                  Lues
                </h4>
                {readNotifications.map(notif => (
                  <TeacherNotificationItem
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

// Notification item component
const TeacherNotificationItem = ({ notification, onClick, onMarkAsRead, onDelete }) => {
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
          ? 'bg-green-50 border-green-200 hover:bg-green-100'
          : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
      onClick={() => onClick(notification)}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText size={20} className="text-blue-600" />
          </div>
        </div>

        <div className="flex-1 min-w-0 pr-20">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-sm text-gray-900 truncate">
              {notification.report_title}
            </h4>
            {!notification.read && (
              <span className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0 mt-1"></span>
            )}
          </div>

          <p className="text-xs text-gray-600 mb-2">
            👤 {notification.student_name}
          </p>
          
          <p className="text-xs text-gray-400">
            📅 {new Date(notification.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* Action buttons */}
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

// Main teacher notification panel component
const TeacherNotificationPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem('esprim_session'))?.token;
      
      if (!token) {
        console.error('❌ No token found');
        return;
      }

      const res = await fetch('http://localhost:5000/api/reports/my-teacher-notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log('✅ Teacher notifications received:', data);

      if (data.success && Array.isArray(data.data)) {
        const formatted = data.data.map(item => ({
          id: item.notification_id,
          type: item.type,
          student_name: item.student_name,
          student_email: item.student_email,
          report_title: item.report_title,
          message: item.message,
          created_at: item.created_at,
          report_id: item.report_id,
          read: item.is_read || false
        }));
        
        setNotifications(formatted);
        setUnreadCount(formatted.filter(n => !n.read).length);
        console.log(`✅ ${formatted.length} notifications, ${formatted.filter(n => !n.read).length} unread`);
      }
    } catch (err) {
      console.error('❌ Error fetching teacher notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = JSON.parse(localStorage.getItem('esprim_session'))?.token;
      
      const res = await fetch(`http://localhost:5000/api/reports/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setNotifications(prev => prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
        console.log(`✅ Notification ${notificationId} marked as read`);
      }
    } catch (err) {
      console.error('❌ Error marking as read:', err);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      const token = JSON.parse(localStorage.getItem('esprim_session'))?.token;
      
      const res = await fetch(`http://localhost:5000/api/reports/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setUnreadCount(prev => {
          const notif = notifications.find(n => n.id === notificationId);
          return notif && !notif.read ? Math.max(0, prev - 1) : prev;
        });
        console.log(`✅ Notification ${notificationId} deleted`);
      }
    } catch (err) {
      console.error('❌ Error deleting notification:', err);
    }
  };

  const handleNotificationClick = (notification) => {
    // Redirect to the report view
    window.location.href = `/teacher/reports/${notification.report_id}`;
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
          <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <TeacherNotificationDropdown
        isOpen={isOpen}
        notifications={notifications}
        loading={loading}
        onClose={() => setIsOpen(false)}
        onNotificationClick={handleNotificationClick}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default TeacherNotificationPanel;