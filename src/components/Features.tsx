import {
  Package,
  Users,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
} from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: Package,
      title: "Gestion des Produits",
      description:
        "Gérez facilement votre catalogue de chips et snacks avec suivi des stocks en temps réel.",
    },
    {
      icon: Users,
      title: "Clients & Commandes",
      description:
        "Suivez vos clients épiceries et particuliers avec un système de commandes intuitif.",
    },
    {
      icon: TrendingUp,
      title: "Analyses Avancées",
      description:
        "Rapports détaillés hebdomadaires, mensuels et annuels pour optimiser vos ventes.",
    },
    {
      icon: BarChart3,
      title: "Tableau de Bord",
      description:
        "Vue d'ensemble complète de votre activité avec métriques en temps réel.",
    },
    {
      icon: Shield,
      title: "Sécurisé & Fiable",
      description:
        "Données protégées avec sauvegarde automatique et accès sécurisé.",
    },
    {
      icon: Zap,
      title: "Interface Moderne",
      description: "Design responsive et intuitif adapté à tous vos appareils.",
    },
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Tout ce dont vous avez besoin pour réussir
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Notre plateforme offre tous les outils nécessaires pour gérer
            efficacement tous concerne sur la vente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-amber-200 group"
              >
                <div className="bg-amber-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-amber-200 transition-colors">
                  <Icon size={24} className="text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
