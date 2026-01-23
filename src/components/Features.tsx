import {
  Package,
  Users,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  ChevronRight,
} from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: Package,
      title: "Gestion des Produits",
      description: "Optimisez votre catalogue et suivez vos stocks de snacks en temps réel avec une précision chirurgicale.",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Users,
      title: "Clients & Commandes",
      description: "Centralisez vos relations B2B et particuliers. Un flux de commande fluide pour une satisfaction maximale.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: TrendingUp,
      title: "Analyses Avancées",
      description: "Transformez vos données en décisions grâce à des rapports prédictifs hebdomadaires et annuels.",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: BarChart3,
      title: "Tableau de Bord",
      description: "Une tour de contrôle intuitive pour piloter chaque aspect de votre business en un coup d'œil.",
      color: "from-purple-500 to-indigo-500",
    },
    {
      icon: Shield,
      title: "Sécurité",
      description: "Vos données sont cryptées et sauvegardées automatiquement sur nos serveurs haute disponibilité.",
      color: "from-slate-700 to-slate-900",
    },
    {
      icon: Zap,
      title: "Performance Cloud",
      description: "Une interface ultra-rapide, pensée pour la mobilité et une réactivité sans compromis sur tout support.",
      color: "from-rose-500 to-orange-500",
    },
  ];

  return (
    <section id="features" className="py-24 bg-[#fafafa] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none">
        <div className="absolute top-24 left-[10%] w-64 h-64 bg-amber-200/30 blur-[100px] rounded-full" />
        <div className="absolute bottom-24 right-[10%] w-64 h-64 bg-blue-200/20 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-amber-600 mb-4">
            Puissance & Simplicité
          </h2>
          <h3 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Tout pour piloter votre <span className="text-slate-400 font-light italic">croissance.</span>
          </h3>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Plus qu'un simple logiciel, une solution complète conçue pour automatiser 
            vos flux de vente et libérer votre potentiel commercial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-white rounded-[32px] p-8 transition-all duration-500 border border-slate-100 hover:border-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.1)] hover:-translate-y-2 overflow-hidden"
              >
                {/* Hover Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-8 shadow-lg shadow-amber-500/20 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                    <Icon size={28} className="text-white" />
                  </div>

                  <h4 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-amber-600 transition-colors">
                    {feature.title}
                  </h4>
                  
                  <p className="text-slate-500 leading-relaxed text-sm mb-6">
                    {feature.description}
                  </p>

                  <div className="flex items-center text-xs font-bold text-slate-400 group-hover:text-slate-900 transition-colors cursor-pointer">
                    EN SAVOIR PLUS 
                    <ChevronRight size={14} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}