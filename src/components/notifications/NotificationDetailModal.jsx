// src/components/notifications/NotificationDetailModal.jsx
// VERSION FINALE — NOM RÉEL DU PROF + TITRE + COMMENTAIRE COMPLET

import React from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';

const NotificationDetailModal = ({ notification, onClose }) => {
  if (!notification) return null;

  // Récupère les bonnes données de la BDD
  const supervisorName = notification.teacher_name || notification.supervisor_name || 'Superviseur';
  const supervisorRole = notification.supervisor_role === 'co_supervisor' ? 'Co-superviseur' : 'Superviseur';
  const fullComment = notification.comment || notification.message || 'Aucun commentaire.';

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getHeaderColor = () => {
    switch (notification.type) {
      case 'rejected': return 'bg-red-600';
      case 'revision_requested': return 'bg-orange-600';
      case 'validated': return 'bg-green-600';
      case 'comment_added': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusText = () => {
    switch (notification.type) {
      case 'rejected': return 'Rejeté';
      case 'revision_requested': return 'Révision demandée';
      case 'validated': return 'Validé';
      case 'comment_added': return 'Nouveau commentaire';
      default: return 'Notification';
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]" onClick={onClose} />

      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`${getHeaderColor()} text-white p-6 rounded-t-3xl relative`}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition"
            >
              <Icon name="X" size={24} color="white" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <Icon name="Bell" size={28} />
              <span className="px-4 py-2 bg-white/20 rounded-full font-bold text-sm">
                {getStatusText()}
              </span>
            </div>

            <h2 className="text-2xl font-bold">
              {notification.report_title || 'Rapport'}
            </h2>
            <p className="text-sm opacity-90 mt-2">
              Reçu le {formatDate(notification.created_at)}
            </p>
          </div>

          {/* Corps */}
          <div className="p-8">
            {/* Superviseur */}
            <div className="flex items-center gap-4 mb-8 p-5 bg-gray-50 rounded-2xl">
              <div className="w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                {supervisorName.split(' ').map(n => n[0]).join('').substring(0,2)}
              </div>
              <div>
                <h3 className="text-xl font-bold">{supervisorName}</h3>
                <p className="text-gray-600 font-medium">{supervisorRole}</p>
              </div>
            </div>

            {/* Commentaire complet */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Icon name="MessageSquare" size={22} />
                Commentaire du {supervisorRole.toLowerCase()}
              </h3>
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <p className="text-gray-800 leading-relaxed whitespace-pre-line text-lg">
                  {fullComment}
                </p>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="default"
                iconName="FileText"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-lg py-4"
                onClick={() => {
                  window.location.href = `/student/view-report/${notification.related_report_id}`;
                }}
              >
                Voir le rapport
              </Button>

              <Button
                variant="outline"
                iconName="Mail"
                className="flex-1"
                onClick={() => {
                  window.location.href = `mailto:${notification.teacher_email || 'supervisor@university.com'}`;
                }}
              >
                Contacter le {supervisorRole.toLowerCase()}
              </Button>

              <Button
                variant="secondary"
                iconName="Edit"
                className="flex-1"
                onClick={() => alert('Révision en cours...')}
              >
                Commencer la révision
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationDetailModal;