const Loader = ({ size = "medium", className = "" }) => {
  const sizeClasses = {
    small: "w-12 h-12",
    medium: "w-20 h-20",
    large: "w-28 h-28",
  };

  return (
    <div
      className={`flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}
    >
      <div className="relative">
        <svg
          className={`${sizeClasses[size]} animate-rotate`}
          viewBox="0 0 50 50"
          aria-label="Chargement en cours"
        >
          {/* Cercle de fond avec effet de flou */}
          <circle
            className="text-gray-200/60"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            r="22"
            cx="25"
            cy="25"
          />

          {/* Cercle animé avec dégradé */}
          <circle
            className="animate-dash"
            stroke="url(#gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            r="22"
            cx="25"
            cy="25"
            style={{ filter: "drop-shadow(0 0 2px rgba(245, 158, 11, 0.5))" }}
          />

          {/* Dégradé linéaire amélioré */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
              <stop offset="50%" stopColor="#d97706" stopOpacity="1" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default Loader;
