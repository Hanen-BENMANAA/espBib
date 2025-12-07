import React, { useState, useEffect } from 'react';

const EnhancedSecurityWatermark = ({ documentTitle }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <>
      {/* Top Corner Watermarks */}
      <div className="absolute top-4 left-4 bg-red-500/25 text-red-700 text-xs px-3 py-1.5 rounded -rotate-12 font-bold border-2 border-red-600/50 z-10 pointer-events-none select-none shadow-lg">
        🔒 ESPRIM - CONFIDENTIEL
      </div>
      
      <div className="absolute top-4 right-4 bg-red-500/25 text-red-700 text-xs px-3 py-1.5 rounded rotate-12 font-bold border-2 border-red-600/50 z-10 pointer-events-none select-none shadow-lg">
        ⚠️ USAGE ACADÉMIQUE UNIQUEMENT
      </div>

      {/* Large Center Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-black/15 text-gray-700 px-10 py-6 rounded-lg border-2 border-gray-600/50 z-10 pointer-events-none select-none shadow-2xl">
        <div className="text-center font-mono space-y-1">
          <div className="font-bold text-2xl">ESPRIM</div>
          <div className="text-base">BIBLIOTHÈQUE NUMÉRIQUE</div>
          <div className="text-base font-bold mt-2">{formatTime(time)}</div>
          <div className="text-xs bg-red-600/40 px-3 py-1 rounded mt-2 font-bold">
            DOCUMENT PROTÉGÉ
          </div>
        </div>
      </div>

      {/* Top Center Warning */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600/30 text-red-800 text-xs px-4 py-2 rounded font-bold border-2 border-red-700/60 z-10 pointer-events-none select-none shadow-lg">
        📋 ESPRIM LIBRARY - ACCÈS SURVEILLÉ
      </div>

      {/* Diagonal Pattern Watermarks */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-black/8 text-gray-700 text-xs px-3 py-1 rounded font-mono border border-gray-500/40 z-10 pointer-events-none select-none"
          style={{
            top: `${15 + (i % 4) * 25}%`,
            left: `${10 + Math.floor(i / 4) * 60}%`,
            transform: `rotate(${i % 2 === 0 ? -15 : 15}deg)`
          }}
        >
          ESPRIM • {formatTime(time).split(' ')[1]}
        </div>
      ))}

      {/* Bottom Corners */}
      <div className="absolute bottom-4 left-4 bg-black/15 text-gray-700 text-xs px-3 py-1.5 rounded rotate-6 font-mono border border-gray-500/40 z-10 pointer-events-none select-none shadow-md">
        SESSION: {formatTime(time)}
      </div>

      <div className="absolute bottom-4 right-4 bg-black/15 text-gray-700 text-xs px-3 py-1.5 rounded -rotate-6 font-mono border border-gray-500/40 z-10 pointer-events-none select-none shadow-md">
        ESPRIM LIBRARY
      </div>

      {/* Side Watermarks */}
      <div className="absolute top-1/3 left-2 bg-black/10 text-gray-600 text-xs px-2 py-8 rounded rotate-90 font-mono border border-gray-400/30 z-10 pointer-events-none select-none">
        ESPRIM • CONFIDENTIEL • USAGE ACADÉMIQUE
      </div>

      <div className="absolute top-1/3 right-2 bg-black/10 text-gray-600 text-xs px-2 py-8 rounded -rotate-90 font-mono border border-gray-400/30 z-10 pointer-events-none select-none">
        {formatTime(time)} • NE PAS DISTRIBUER
      </div>

      {/* Quarter Position Watermarks */}
      <div className="absolute top-1/4 left-1/4 bg-black/8 text-gray-600/80 text-xs px-3 py-1 rounded -rotate-12 font-mono border border-gray-400/30 z-10 pointer-events-none select-none">
        ESPRIM LIBRARY
      </div>

      <div className="absolute top-1/4 right-1/4 bg-black/8 text-gray-600/80 text-xs px-3 py-1 rounded rotate-12 font-mono border border-gray-400/30 z-10 pointer-events-none select-none">
        DOCUMENT PROTÉGÉ
      </div>

      <div className="absolute bottom-1/4 left-1/4 bg-black/8 text-gray-600/80 text-xs px-3 py-1 rounded rotate-6 font-mono border border-gray-400/30 z-10 pointer-events-none select-none">
        ESPRIM • {formatTime(time).split(' ')[1]}
      </div>

      <div className="absolute bottom-1/4 right-1/4 bg-black/8 text-gray-600/80 text-xs px-3 py-1 rounded -rotate-6 font-mono border border-gray-400/30 z-10 pointer-events-none select-none">
        CONFIDENTIEL
      </div>

      {/* Diagonal Cross Watermarks */}
      <div className="absolute top-1/3 left-1/6 bg-black/6 text-gray-600/70 text-xs px-2 py-1 rounded -rotate-45 font-mono border border-gray-400/30 z-10 pointer-events-none select-none">
        ESPRIM CONFIDENTIEL
      </div>

      <div className="absolute top-2/3 right-1/6 bg-black/6 text-gray-600/70 text-xs px-2 py-1 rounded rotate-45 font-mono border border-gray-400/30 z-10 pointer-events-none select-none">
        NE PAS COPIER
      </div>

      <div className="absolute top-1/3 right-1/3 bg-black/6 text-gray-600/70 text-xs px-2 py-1 rounded -rotate-12 font-mono border border-gray-400/30 z-10 pointer-events-none select-none">
        ACCÈS AUTORISÉ ESPRIM
      </div>

      <div className="absolute bottom-1/3 left-1/3 bg-black/6 text-gray-600/70 text-xs px-2 py-1 rounded rotate-12 font-mono border border-gray-400/30 z-10 pointer-events-none select-none">
        USAGE ACADÉMIQUE
      </div>

      {/* Nearly Invisible Forensic Layer */}
      <div className="absolute inset-0 opacity-[0.03] text-5xl font-bold text-black z-10 pointer-events-none select-none">
        <div className="h-full flex flex-col justify-around">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="text-center -rotate-45 whitespace-nowrap">
              ESPRIM LIBRARY • {formatTime(time)} • {documentTitle} • CONFIDENTIEL
            </div>
          ))}
        </div>
      </div>

      {/* Repeating Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.05] z-10 pointer-events-none select-none" 
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 70px,
            rgba(0,0,0,0.2) 70px,
            rgba(0,0,0,0.2) 71px
          )`,
          backgroundSize: '100px 100px'
        }}
      />

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.04] z-10 pointer-events-none select-none">
        <div className="grid grid-cols-4 grid-rows-6 h-full gap-4 p-8">
          {[...Array(24)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-center text-gray-600 text-[10px] font-mono -rotate-12"
            >
              ESPRIM
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/20 to-transparent h-16 z-10 pointer-events-none select-none">
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-700 font-mono text-center">
          🔐 Document protégé ESPRIM • {formatTime(time)} • Usage académique uniquement
        </div>
      </div>

      {/* Top Banner */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/20 to-transparent h-16 z-10 pointer-events-none select-none">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 text-xs text-gray-700 font-mono text-center">
          ⚠️ Copie et distribution interdites • Session surveillée ESPRIM
        </div>
      </div>
    </>
  );
};

export default EnhancedSecurityWatermark;