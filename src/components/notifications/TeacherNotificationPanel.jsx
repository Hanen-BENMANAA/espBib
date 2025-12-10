// src/components/notifications/TeacherNotificationPanel.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, X, FileText, AlertCircle } from 'lucide-react';
import Icon from '../AppIcon';
import Button from '../ui/Button';

const API_BASE = 'http://localhost:5000/api';

const TeacherNotificationPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  // Fetch teacher alerts
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem('esprim_session') || '{}')?.token;
      console.log('🔍 Fetching notifications, token exists:', !!token);
      if (!token) return;

      console.log('📡 Making request to:', `${API_BASE}/teacher-alerts`);
      const res = await fetch(`${API_BASE}/teacher-alerts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 Response status:', res.status);
      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      console.log('📦 Response data:', data);
      if (data.success) {
        setNotifications(data.data.alerts || []);
        setUnreadCount(data.data.unread_count || 0);
        console.log('✅ Setting notifications:', data.data.alerts?.length || 0, 'Unread count:', data.data.unread_count || 0);
      }
    } catch (err) {
      console.error('❌ Failed to load teacher alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mark as read
  const handleMarkAsRead = async (alertId) => {
    try {
      const token = JSON.parse(localStorage.getItem('esprim_session') || '{}')?.token;
      await fetch(`${API_BASE}/teacher-alerts/${alertId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setNotifications(prev => prev.map(n =>
        n.id === alertId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  // Delete alert
  const handleDelete = async (alertId) => {
    try {
      const token = JSON.parse(localStorage.getItem('esprim_session') || '{}')?.token;
      await fetch(`${API_BASE}/teacher-alerts/${alertId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const notif = notifications.find(n => n.id === alertId);
      setNotifications(prev => prev.filter(n => n.id !== alertId));
      if (notif && !notif.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to delete alert:', err);
    }
  };

  // Open report
  const handleNotificationClick = (notification) => {
    if (notification.related_report_id) {
      window.location.href = `/report-validation-interface/${notification.related_report_id}`;
    }
    setIsOpen(false);
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Load on mount + poll every 10s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-3 rounded-full hover:bg-gray-100 transition-all group"
        aria-label={`Notifications enseignant. ${unreadCount} non lues`}
      >
        <Bell size={24} className="text-gray-700 group-hover:text-gray-900" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FileText size={20} />
                Nouveaux Rapports à Valider
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm">
                    {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </h3>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded transition">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3"></div>
                <p className="text-sm text-gray-500">Chargement...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="font-semibold">Aucun nouveau rapport</p>
                <p className="text-sm mt-1">Vous êtes à jour !</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {unreadNotifications.map(notif => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    onClick={handleNotificationClick}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                    isUnread
                  />
                ))}
                {readNotifications.map(notif => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    onClick={handleNotificationClick}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={() => {
                  window.location.href = '/teacher/dashboard';
                  setIsOpen(false);
                }}
              >
                Voir tous les rapports en attente
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Single Notification Item
const NotificationItem = ({ notification, onClick, onMarkAsRead, onDelete, isUnread = false }) => {
  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 60) return `Il y a ${mins} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return d.toLocaleDateString('fr-FR');
  };

  return (
    <div
      onClick={() => onClick(notification)}
      className={`p-4 hover:bg-gray-50 cursor-pointer transition-all ${isUnread ? 'bg-green-50' : 'bg-white'}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <FileText size={20} className="text-green-600" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-900">
                {notification.student_name || 'Étudiant'}
              </p>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                a soumis : <strong>"{notification.report_title || 'Nouveau rapport'}"</strong>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {formatDate(notification.created_at)}
              </p>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {isUnread && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                  className="p-1.5 hover:bg-gray-200 rounded transition"
                  title="Marquer comme lu"
                >
                  <Check size={16} className="text-green-600" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                className="p-1.5 hover:bg-red-100 rounded transition"
                title="Supprimer"
              >
                <Trash2 size={16} className="text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherNotificationPanel;