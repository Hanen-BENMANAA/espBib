import React, { useState, useEffect } from 'react';

const SecurityWatermark = ({ 
  userInfo = {
    name: "Jean Dupont",
    email: "jean.dupont@esprim.tn",
    role: "Étudiant"
  },
  sessionId = "SEC-2025-001",
  documentTitle = "Rapport PFE - Système IoT"
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date?.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Top watermark */}
      <div className="absolute top-4 left-4 bg-black/5 text-gray-600 text-xs px-2 py-1 rounded transform -rotate-12">
        ESPRIM - Consultation Sécurisée
      </div>
      {/* Center diagonal watermark */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-black/3 text-gray-500 text-sm px-4 py-2 rounded">
        <div className="text-center">
          <div className="font-medium">{userInfo?.name}</div>
          <div className="text-xs">{userInfo?.email}</div>
          <div className="text-xs">{formatTime(currentTime)}</div>
        </div>
      </div>
      {/* Bottom right watermark */}
      <div className="absolute bottom-4 right-4 bg-black/5 text-gray-600 text-xs px-2 py-1 rounded transform rotate-12">
        Session: {sessionId}
      </div>
      {/* Multiple scattered watermarks for enhanced protection */}
      <div className="absolute top-1/4 right-1/4 bg-black/2 text-gray-400 text-xs px-2 py-1 rounded transform -rotate-6">
        ESPRIM Library
      </div>
      <div className="absolute bottom-1/3 left-1/4 bg-black/2 text-gray-400 text-xs px-2 py-1 rounded transform rotate-6">
        Accès Autorisé
      </div>
      <div className="absolute top-3/4 right-1/3 bg-black/2 text-gray-400 text-xs px-2 py-1 rounded transform -rotate-3">
        {userInfo?.role}
      </div>
    </div>
  );
};

export default SecurityWatermark;