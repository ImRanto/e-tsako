import React, { useState, useEffect } from 'react';

const Loader = () => {
  const [isVisible, setIsVisible] = useState(true);

  // Simuler un chargement
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Loader circulaire avec segments séparés */}
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-amber-200 rounded-full opacity-30"></div>
          <div className="absolute inset-0 border-4 border-transparent rounded-full border-t-amber-600 animate-spin"></div>
          <div className="absolute inset-0 border-4 border-transparent rounded-full border-r-amber-600 animate-spin" style={{ animationDelay: '0.1s' }}></div>
          <div className="absolute inset-0 border-4 border-transparent rounded-full border-b-amber-600 animate-spin" style={{ animationDelay: '0.2s' }}></div>
          <div className="absolute inset-0 border-4 border-transparent rounded-full border-l-amber-600 animate-spin" style={{ animationDelay: '0.3s' }}></div>
        </div>

        {/* Texte de chargement avec points animés */}
        <div className="text-amber-600 font-semibold text-lg">
          Chargement
          <span className="inline-block animate-bounce" style={{ animationDelay: '0s' }}>.</span>
          <span className="inline-block animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
          <span className="inline-block animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
        </div>

        {/* Barre de progression */}
        <div className="w-48 h-1.5 bg-amber-200 rounded-full mx-auto mt-4 overflow-hidden">
          <div className="h-full bg-amber-600 rounded-full animate-progress"></div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Loader;
