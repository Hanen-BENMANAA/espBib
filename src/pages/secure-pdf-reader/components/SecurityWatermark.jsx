import React, { useState, useEffect } from 'react';

const SecurityWatermark = ({ 
  userInfo = {
    name: "Jean Dupont",
    email: "jean.dupont@esprim.tn",
    role: "Étudiant",
    id: "STU-2024-001"
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

  // Generate watermark text with all security info
  const getWatermarkText = () => {
    return `${userInfo?.name} • ${userInfo?.email} • ${userInfo?.id} • ${formatTime(currentTime)} • Session: ${sessionId}`;
  };

  const getShortWatermark = () => {
    return `${userInfo?.name} • ${userInfo?.email} • ${formatTime(currentTime)}`;
  };

  return (
    <>
      {/* Multiple overlapping watermarks in different positions and angles */}
      
      {/* Top-left corner watermark */}
      <div className="absolute top-8 left-8 bg-black/10 text-gray-600 text-xs px-3 py-1.5 rounded transform -rotate-12 font-mono border border-gray-400/30">
        ESPRIM - ACCÈS SÉCURISÉ
      </div>

      {/* Top-right corner watermark */}
      <div className="absolute top-8 right-8 bg-black/10 text-gray-600 text-xs px-3 py-1.5 rounded transform rotate-12 font-mono border border-gray-400/30">
        {userInfo?.role?.toUpperCase()}
      </div>

      {/* Center large diagonal watermark - MAIN */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-black/5 text-gray-500/80 text-base px-6 py-3 rounded border border-gray-400/20">
        <div className="text-center font-mono whitespace-nowrap">
          <div className="font-bold text-sm">{userInfo?.name}</div>
          <div className="text-xs mt-1">{userInfo?.email}</div>
          <div className="text-xs mt-1">{userInfo?.id}</div>
          <div className="text-xs mt-1 font-semibold">{formatTime(currentTime)}</div>
          <div className="text-xs mt-1">Session: {sessionId}</div>
        </div>
      </div>

      {/* Secondary diagonal watermark (opposite angle) */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 bg-black/3 text-gray-500/60 text-sm px-4 py-2 rounded font-mono">
        <div className="text-center whitespace-nowrap">
          <div className="font-semibold">{documentTitle}</div>
          <div className="text-xs mt-1">COPIE NON AUTORISÉE</div>
        </div>
      </div>

      {/* Bottom-left corner watermark */}
      <div className="absolute bottom-8 left-8 bg-black/10 text-gray-600 text-xs px-3 py-1.5 rounded transform rotate-6 font-mono border border-gray-400/30">
        ID: {userInfo?.id}
      </div>

      {/* Bottom-right corner watermark */}
      <div className="absolute bottom-8 right-8 bg-black/10 text-gray-600 text-xs px-3 py-1.5 rounded transform -rotate-6 font-mono border border-gray-400/30">
        Session: {sessionId}
      </div>

      {/* Top center watermark */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500/15 text-red-700 text-xs px-3 py-1 rounded font-bold border border-red-500/40">
        ⚠️ DOCUMENT PROTÉGÉ - ESPRIM LIBRARY
      </div>

      {/* Bottom center watermark */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/8 text-gray-600 text-xs px-3 py-1 rounded font-mono border border-gray-400/30">
        {formatTime(currentTime)}
      </div>

      {/* Scattered watermarks for additional protection - Grid pattern */}
      <div className="absolute top-1/4 left-1/4 bg-black/4 text-gray-400/70 text-xs px-2 py-1 rounded transform -rotate-12 font-mono">
        {userInfo?.email}
      </div>

      <div className="absolute top-1/4 right-1/4 bg-black/4 text-gray-400/70 text-xs px-2 py-1 rounded transform rotate-12 font-mono">
        {userInfo?.name}
      </div>

      <div className="absolute bottom-1/4 left-1/4 bg-black/4 text-gray-400/70 text-xs px-2 py-1 rounded transform rotate-6 font-mono">
        ESPRIM • {formatTime(currentTime).split(' ')[1]}
      </div>

      <div className="absolute bottom-1/4 right-1/4 bg-black/4 text-gray-400/70 text-xs px-2 py-1 rounded transform -rotate-6 font-mono">
        Session: {sessionId}
      </div>

      {/* Diagonal repeating watermarks */}
      <div className="absolute top-1/3 left-1/6 bg-black/3 text-gray-400/60 text-xs px-2 py-1 rounded transform -rotate-45 font-mono">
        CONFIDENTIEL
      </div>

      <div className="absolute top-2/3 right-1/6 bg-black/3 text-gray-400/60 text-xs px-2 py-1 rounded transform rotate-45 font-mono">
        NE PAS COPIER
      </div>

      <div className="absolute top-1/3 right-1/3 bg-black/3 text-gray-400/60 text-xs px-2 py-1 rounded transform -rotate-12 font-mono">
        ACCÈS AUTORISÉ
      </div>

      <div className="absolute bottom-1/3 left-1/3 bg-black/3 text-gray-400/60 text-xs px-2 py-1 rounded transform rotate-12 font-mono">
        USAGE ACADÉMIQUE
      </div>

      {/* Invisible forensic watermark (will show up in screenshots) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none text-6xl font-bold text-black select-none">
        <div className="transform -rotate-45 whitespace-pre-line text-center leading-relaxed">
          {`${userInfo?.name}\n${userInfo?.email}\n${userInfo?.id}\n${formatTime(currentTime)}\nSession: ${sessionId}\n${documentTitle}`}
        </div>
      </div>

      {/* Additional layer - very subtle repeating pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none" style={{
        backgroundImage: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 100px,
          rgba(0,0,0,0.1) 100px,
          rgba(0,0,0,0.1) 101px
        )`,
        backgroundSize: '150px 150px'
      }}>
        <div className="absolute inset-0 flex flex-wrap">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="text-gray-400/40 text-[10px] p-4 font-mono whitespace-nowrap"
              style={{
                transform: `rotate(${(i % 4) * 15 - 30}deg)`
              }}
            >
              {userInfo?.email} • {sessionId}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SecurityWatermark;