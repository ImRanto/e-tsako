import { Zap, ArrowRight, BarChart3, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const app_name = import.meta.env.VITE_APP_NAME;

export default function Hero() {
  return (
    <section
      id="home"
      className="pt-24 pb-16 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-6">
              <Zap size={16} className="mr-2" />
              Nouveau : Rapports avancés disponibles
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Gérez bien le business avec {" "}
              <span className="text-amber-500">{app_name}</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Solution complète de gestion de vos ventes, gérez vos stocks et développez
              les clientèle avec ce plateforme intuitive.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login">
                <button className="bg-amber-500 text-white px-8 py-4 rounded-lg hover:bg-amber-600 transition-all duration-200 flex items-center justify-center group shadow-lg hover:shadow-xl">
                  Démarrer
                  <ArrowRight
                    size={20}
                    className="ml-2 group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg p-6 text-white mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 mb-1">
                      Votre Chiffre d'affaires
                    </p>
                    <p className="text-3xl font-bold">x xxx xxx Ar</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp size={16} className="mr-1" />
                      <span className="text-amber-100">+ xx.x %</span>
                    </div>
                  </div>
                  <BarChart3 size={40} className="text-amber-200" />
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { name: "Chips", growth: "+5%" },
                  { name: "Croquêtte", growth: "+8%" },
                  { name: "Arachide special", growth: "+10%" },
                ].map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-gray-600">{product.name}</span>
                    <span className="font-semibold text-green-600">
                      {product.growth}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
