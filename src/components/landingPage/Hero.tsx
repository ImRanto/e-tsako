import {
  Zap,
  ArrowRight,
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Package,
} from "lucide-react";
import { Link } from "react-router-dom";

const app_name = import.meta.env.VITE_APP_NAME || "BusinessApp";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50"
    >
      {/* Décoration d'arrière-plan */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-amber-200/30 blur-3xl rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Côté Gauche : Texte */}
          <div>
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm border border-amber-200 text-amber-800 rounded-full text-sm font-medium mb-6 shadow-sm">
              <Zap size={16} className="mr-2 text-amber-500 fill-amber-500" />
              Nouveau : Rapports avancés disponibles
            </div>

            <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 mb-6 leading-[1.1]">
              Pilotez votre business avec{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                {app_name}
              </span>
            </h1>

            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl">
              L'écosystème complet pour <strong>vendre</strong> intelligemment,
              gérer vos <strong>achats</strong> et superviser votre activité en
              temps réel.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login" className="flex-1 sm:flex-none">
                <button className="w-full bg-slate-900 text-white px-8 py-4 rounded-xl hover:bg-slate-800 transition-all duration-300 flex items-center justify-center group shadow-xl hover:-translate-y-1">
                  Commencer maintenant
                  <ArrowRight
                    size={20}
                    className="ml-2 group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </Link>
              {/* <button className="px-8 py-4 rounded-xl border-2 border-slate-200 text-slate-600 font-medium hover:bg-white transition-colors">
                Voir la démo
              </button> */}
            </div>
          </div>

          {/* Côté Droit : Dashboard Interactif */}
          <div className="relative">
            {/* Badge Flottant 1 : Ventes */}
            <div className="absolute -top-6 -left-6 bg-white p-4 rounded-2xl shadow-xl z-10 animate-bounce-slow">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                  <ShoppingCart size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Vente réussie</p>
                  <p className="font-bold text-slate-800">+ 45 000 Ar</p>
                </div>
              </div>
            </div>

            {/* Carte Principale */}
            <div className="bg-white rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-8 border border-slate-100 relative z-0 overflow-hidden">
              <div className="bg-slate-900 rounded-2xl p-6 text-white mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-1 font-medium">
                      Chiffre d'affaires (Mensuel)
                    </p>
                    <p className="text-4xl font-bold tracking-tight">
                      1.250.000 Ar
                    </p>
                    <div className="flex items-center mt-3 text-emerald-400 text-sm font-bold">
                      <TrendingUp size={16} className="mr-1" />+ 12.4%{" "}
                      <span className="text-slate-500 font-normal ml-2">
                        vs mois dernier
                      </span>
                    </div>
                  </div>
                  <div className="h-16 w-16 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                    <BarChart3 size={32} className="text-amber-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Top Produits
                </p>
                {[
                  {
                    name: "Chips de Pomme de Terre",
                    growth: "+15%",
                    color: "bg-amber-500",
                  },
                  {
                    name: "Croquettes Maison",
                    growth: "+8%",
                    color: "bg-orange-500",
                  },
                ].map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-amber-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${product.color}`}
                      />
                      <span className="font-medium text-slate-700">
                        {product.name}
                      </span>
                    </div>
                    <span className="font-bold text-emerald-600">
                      {product.growth}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Badge Flottant 2 : Admin/Stock */}
            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <Package size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Stock Alerte</p>
                  <p className="font-bold text-red-500 font-sm">
                    5 articles restants
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
