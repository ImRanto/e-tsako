export default function Stats() {
  const stats = [
    { number: "100+", label: "Commandes", subLabel: "traitées avec succès" },
    { number: "20+", label: "Clients", subLabel: "partenaires fidèles" },
    { number: "99.9%", label: "Uptime", subLabel: "disponibilité cloud" },
    { number: "24/7", label: "Support", subLabel: "assistance dédiée" },
  ];

  return (
    <section className="relative py-20 bg-white overflow-hidden">
      {/* Ligne de séparation décorative subtile */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative group text-center lg:text-left"
            >
              {/* Conteneur de la stat */}
              <div className="space-y-1">
                <div className="text-4xl lg:text-5xl font-black tracking-tighter text-amber-500 transition-colors duration-300">
                  {stat.number}
                </div>

                <div className="flex flex-col">
                  <span className="text-sm font-bold uppercase tracking-[0.2em] text-slate-800">
                    {stat.label}
                  </span>
                  <span className="text-xs text-slate-400 font-medium mt-1">
                    {stat.subLabel}
                  </span>
                </div>
              </div>

              {/* Séparateur vertical (uniquement sur desktop et pas pour le dernier élément) */}
              {index !== stats.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 h-12 w-px bg-slate-200 -translate-y-1/2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ligne de séparation basse */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
    </section>
  );
}
