// components/Stats.jsx
export default function Stats() {
  const stats = [
    { number: "100+", label: "Commandes traitées" },
    { number: "20+", label: "Clients satisfaits" },
    { number: "99.9%", label: "Disponibilité" },
    { number: "24/7", label: "Support technique" },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-amber-500 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
