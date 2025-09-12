import { useState, useEffect } from "react";
import { Sparkles, LucideCuboid } from "lucide-react";

export default function Loader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <div className="relative">
        {/* Loader principal avec animation améliorée */}
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-amber-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-amber-600 border-t-transparent animate-spin"></div>

          {/* Icône au centre avec légère animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <LucideCuboid className="w-8 h-8 text-amber-600 animate-pulse" />
          </div>
        </div>

        {/* Barre de progression optionnelle */}
        <div className="w-48 bg-amber-100 rounded-full h-2 mb-4 overflow-hidden">
          <div
            className="bg-amber-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Texte avec animation subtile */}
        <p className="text-gray-700 font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
          Chargement en cours...
        </p>
      </div>
    </div>
  );
}
