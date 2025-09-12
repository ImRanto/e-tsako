import React from 'react';

const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        {/* Loader type 1: Spinner circulaire */}
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-amber-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent rounded-full border-t-amber-600 animate-spin"></div>
        </div>
        
        {/* Loader type 2: Points animés */}
        <div className="flex justify-center space-x-2 mb-8">
          <div className="w-3 h-3 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        {/* Loader type 3: Barre de progression */}
        <div className="w-48 h-2 bg-amber-200 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-amber-600 rounded-full animate-progress"></div>
        </div>
        
        <p className="mt-4 text-gray-600 font-medium">Chargement...</p>
      </div>
      
      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Loader;
