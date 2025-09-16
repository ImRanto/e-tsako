const Loader = ({ size = "medium", className = "" }) => {
  const sizeClasses = {
    small: "w-10 h-10",
    medium: "w-16 h-16",
    large: "w-24 h-24",
  };

  return (
    <div
      className={`flex items-center justify-center min-h-screen bg-transparent ${className}`}
    >
      <svg
        className={`${sizeClasses[size]} animate-spin`}
        viewBox="0 0 50 50"
        aria-label="Chargement en cours"
      >
        {/* Cercle de fond discret */}
        <circle
          className="text-gray-200"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          r="22"
          cx="25"
          cy="25"
        />

        {/* Segment lumineux orange */}
        <circle
          stroke="url(#amber-gradient)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          r="22"
          cx="25"
          cy="25"
          strokeDasharray="90, 150"
          strokeDashoffset="0"
          style={{
            filter:
              "drop-shadow(0 0 6px rgba(245,158,11,0.6)) drop-shadow(0 0 12px rgba(245,158,11,0.4))",
          }}
        />

        {/* Dégradé lumineux amber */}
        <defs>
          <linearGradient
            id="amber-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default Loader;
